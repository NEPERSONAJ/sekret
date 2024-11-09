import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export default function Contact() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-white">Свяжитесь с нами</h2>
        <p className="text-white/70">
          У вас есть вопросы? Мы всегда готовы помочь! Используйте любой удобный способ связи.
        </p>

        <div className="space-y-4">
          <Card className="p-4 bg-white/5 border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Phone className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Телефон</p>
                <p className="text-white">+7 (999) 123-45-67</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/5 border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Mail className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Email</p>
                <p className="text-white">support@accounts.com</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/5 border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Telegram</p>
                <p className="text-white">@accounts_support</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/5 border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Адрес</p>
                <p className="text-white">г. Москва, ул. Примерная, д. 123</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">Написать сообщение</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Имя</label>
                <Input className="bg-white/10 border-white/20 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Email</label>
                <Input className="bg-white/10 border-white/20 text-white" type="email" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Тема</label>
              <Input className="bg-white/10 border-white/20 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Сообщение</label>
              <Textarea 
                className="bg-white/10 border-white/20 text-white min-h-[150px]" 
                placeholder="Введите ваше сообщение..."
              />
            </div>
            <Button className="w-full bg-purple-500 hover:bg-purple-600">
              <Send className="h-4 w-4 mr-2" />
              Отправить сообщение
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}