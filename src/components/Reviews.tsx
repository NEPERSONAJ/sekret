import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ReviewForm from './ReviewForm';

const reviews = [
  {
    id: '1',
    author: 'Александр М.',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    date: '2024-03-15',
    text: 'Отличный сервис! Купил аккаунт с Райден, все работает идеально. Поддержка помогла с активацией.',
    likes: 24,
    replies: 3,
    verified: true,
  },
  {
    id: '2',
    author: 'Елена К.',
    avatar: 'https://i.pravatar.cc/150?img=2',
    rating: 4,
    date: '2024-03-14',
    text: 'Быстрая доставка, аккаунт соответствует описанию. Единственное, хотелось бы больше информации о прогрессе на аккаунте.',
    likes: 15,
    replies: 1,
    verified: true,
  },
  {
    id: '3',
    author: 'Дмитрий В.',
    avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    date: '2024-03-13',
    text: 'Уже второй раз покупаю здесь аккаунт. Всё честно и надёжно. Рекомендую!',
    likes: 32,
    replies: 5,
    verified: true,
  },
];

export default function Reviews() {
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Отзывы покупателей</h2>
          <p className="text-white/70">Более 1000+ довольных клиентов</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'recent' ? 'secondary' : 'ghost'}
            onClick={() => setSortBy('recent')}
            className="bg-white/10 hover:bg-white/20 text-white"
          >
            Новые
          </Button>
          <Button
            variant={sortBy === 'rating' ? 'secondary' : 'ghost'}
            onClick={() => setSortBy('rating')}
            className="bg-white/10 hover:bg-white/20 text-white"
          >
            По рейтингу
          </Button>
        </div>
      </div>

      <Button
        onClick={() => setShowReviewForm(!showReviewForm)}
        className="w-full bg-purple-500 hover:bg-purple-600 mb-6"
      >
        {showReviewForm ? 'Скрыть форму' : 'Написать отзыв'}
      </Button>

      {showReviewForm && <ReviewForm />}

      <div className="grid gap-6">
        {sortedReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 bg-white/5 border-white/10">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12">
                    <img src={review.avatar} alt={review.author} />
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{review.author}</h3>
                      {review.verified && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          Проверено
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-400' : 'text-white/20'
                            }`}
                            fill={i < review.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-white/50">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-white/80">{review.text}</p>

              <div className="flex items-center gap-4 mt-4">
                <Button variant="ghost" className="text-white/50 hover:text-white">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {review.likes}
                </Button>
                <Button variant="ghost" className="text-white/50 hover:text-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {review.replies} ответа
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button className="bg-purple-500 hover:bg-purple-600">
          Загрузить еще отзывы
        </Button>
      </div>
    </div>
  );
}