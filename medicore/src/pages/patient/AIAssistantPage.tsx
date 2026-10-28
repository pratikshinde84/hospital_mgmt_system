import { ChatBot } from '../../components/chatbot/ChatBot';
import { Bot, Shield, AlertTriangle } from 'lucide-react';

export default function AIAssistantPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Bot size={24} className="text-blue-600" />
          AI Health Assistant
        </h1>
        <p className="page-subtitle">Get general health information and app guidance</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-start gap-3">
          <Shield size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-300 text-sm">General Information Only</p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              MediCore AI provides general health education and app navigation help. Not a substitute for professional medical advice.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-300 text-sm">Emergency?</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              For medical emergencies, call <strong>112</strong> immediately. Do not rely on AI for urgent symptoms.
            </p>
          </div>
        </div>
      </div>

      {/* Full-page chat */}
      <div className="card overflow-hidden h-[600px]">
        <ChatBot fullPage />
      </div>
    </div>
  );
}
