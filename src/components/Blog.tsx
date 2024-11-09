import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const blogPosts = [
  {
    id: '1',
    title: 'Топ 5 персонажей для старта игры',
    excerpt: 'Разбираем лучших персонажей для новичков и их комбинации...',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&h=300&fit=crop',
    author: 'Геншин Гуру',
    date: '2024-03-15',
  },
  {
    id: '2',
    title: 'Гайд по реролу аккаунта',
    excerpt: 'Пошаговая инструкция по созданию идеального стартового аккаунта...',
    image: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=500&h=300&fit=crop',
    author: 'ПРО Игрок',
    date: '2024-03-14',
  },
  // Add more blog posts
];

export default function Blog() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden bg-white/5 border-white/10 hover:border-purple-400/50 transition-colors">
              <div className="relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              
              <div className="p-4 space-y-4">
                <h3 className="text-xl font-semibold text-white">{post.title}</h3>
                <p className="text-white/70">{post.excerpt}</p>
                
                <div className="flex items-center justify-between text-sm text-white/50">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button variant="ghost" className="w-full justify-between text-white hover:text-purple-400">
                  Читать далее
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}