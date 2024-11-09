import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export default function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle review submission
    console.log({ rating, review });
    // Reset form
    setRating(0);
    setReview('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="p-6 bg-white/5 border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Оставить отзыв</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Ваша оценка</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-white/20'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Ваш отзыв</label>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="bg-white/10 border-white/20 text-white min-h-[100px]"
              placeholder="Расскажите о вашем опыте..."
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600"
            disabled={!rating || !review.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            Отправить отзыв
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}
