import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AdminConfig } from '@/types';
import { defaultConfig } from '@/lib/config';

export default function SettingsAdmin() {
  const [config, setConfig] = useState<AdminConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const { data, error } = await supabase
        .from('configuration')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setConfig({
          telegram: {
            botToken: data.telegram_bot_token || '',
            chatId: data.telegram_chat_id || '',
          },
          ai: {
            apiKey: data.ai_api_key || '',
            apiUrl: data.ai_api_url || '',
            model: data.ai_model || '',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast({
        title: 'Error',
        description: 'Failed to load configuration',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const configData = {
      telegram_bot_token: config.telegram.botToken,
      telegram_chat_id: config.telegram.chatId,
      ai_api_key: config.ai.apiKey,
      ai_api_url: config.ai.apiUrl,
      ai_model: config.ai.model,
    };

    try {
      const { data, error: selectError } = await supabase
        .from('configuration')
        .select('id')
        .limit(1)
        .single();

      if (selectError && selectError.code !== 'PGRST116') throw selectError;

      if (data) {
        const { error: updateError } = await supabase
          .from('configuration')
          .update(configData)
          .eq('id', data.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('configuration')
          .insert([configData]);

        if (insertError) throw insertError;
      }
      
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <Button
            onClick={handleSubmit}
            className="bg-purple-500 hover:bg-purple-600"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <div className="grid gap-6">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Telegram Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Bot Token</label>
                <Input
                  value={config.telegram.botToken}
                  onChange={(e) => setConfig({
                    ...config,
                    telegram: { ...config.telegram, botToken: e.target.value }
                  })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter your Telegram bot token"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Chat ID</label>
                <Input
                  value={config.telegram.chatId}
                  onChange={(e) => setConfig({
                    ...config,
                    telegram: { ...config.telegram, chatId: e.target.value }
                  })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter your Telegram chat ID"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">AI Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">API Key</label>
                <Input
                  value={config.ai.apiKey}
                  onChange={(e) => setConfig({
                    ...config,
                    ai: { ...config.ai, apiKey: e.target.value }
                  })}
                  className="bg-gray-700 border-gray-600 text-white"
                  type="password"
                  placeholder="Enter your AI API key"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">API URL</label>
                <Input
                  value={config.ai.apiUrl}
                  onChange={(e) => setConfig({
                    ...config,
                    ai: { ...config.ai, apiUrl: e.target.value }
                  })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter the AI API URL"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Model</label>
                <Input
                  value={config.ai.model}
                  onChange={(e) => setConfig({
                    ...config,
                    ai: { ...config.ai, model: e.target.value }
                  })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter the AI model name"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}