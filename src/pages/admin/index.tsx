import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  GamepadIcon, 
  ShoppingCart, 
  Star,
  Loader2
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    accounts: 0,
    games: 0,
    orders: 0,
    reviews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch counts
      const [
        { count: accountsCount },
        { count: gamesCount },
        { count: ordersCount },
        { count: reviewsCount }
      ] = await Promise.all([
        supabase.from('accounts').select('*', { count: 'exact', head: true }),
        supabase.from('games').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        accounts: accountsCount || 0,
        games: gamesCount || 0,
        orders: ordersCount || 0,
        reviews: reviewsCount || 0,
      });

      // Fetch recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          account:accounts(title)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentOrders(orders || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Аккаунты"
            value={stats.accounts}
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Игры"
            value={stats.games}
            icon={GamepadIcon}
            color="blue"
          />
          <StatCard
            title="Заказы"
            value={stats.orders}
            icon={ShoppingCart}
            color="green"
          />
          <StatCard
            title="Отзывы"
            value={stats.reviews}
            icon={Star}
            color="yellow"
          />
        </div>

        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">
            Последние заказы
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Аккаунт</TableHead>
                <TableHead className="text-gray-300">Статус</TableHead>
                <TableHead className="text-gray-300">Цена</TableHead>
                <TableHead className="text-gray-300">Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="text-gray-300">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {order.account?.title || 'Удален'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {order.price} ₽
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" className="text-gray-300 border-gray-600">
              Все заказы
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors = {
    purple: 'bg-purple-500/20 text-purple-400',
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
  };

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  const labels = {
    pending: 'Ожидает',
    completed: 'Завершен',
    cancelled: 'Отменен',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  );
}