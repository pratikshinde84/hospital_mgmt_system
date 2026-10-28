import { useState } from 'react';
import { ChatBot } from '../../components/chatbot/ChatBot';
import { Bot, Shield, AlertTriangle, Zap, Star } from 'lucide-react';
import { PaymentModal } from '../../components/common/PaymentModal';

const AI_PLANS = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    period: '7 days',
    features: ['Basic health queries', 'App navigation help', 'General health info', '50 messages/day'],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 299,
    period: 'month',
    features: ['Advanced health queries', 'Appointment guidance', '500 messages/day', 'Priority support'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 999,
    period: 'month',
    popular: true,
    features: ['Unlimited messages', 'Hospital recommendations', 'Specialist info', '24/7 priority access'],
  },
];

export default function AIAssistantPage() {
  const [showPlans, setShowPlans] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Bot size={24} className="text-blue-600" />
            AI Health Assistant
          </h1>
          <p className="page-subtitle">Get general health information and app guidance</p>
        </div>
        <button
          onClick={() => setShowPlans(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-all shadow-sm"
        >
          <Zap size={15} />
          Advanced AI Assistant
          <span className="badge bg-white/20 text-white text-xs border-0">Upgrade</span>
        </button>
      </div>

      {/* Current Plan Badge */}
      <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-xs font-medium text-green-700 dark:text-green-400">
        <Star size={11} />
        Free Trial Active - 7 Days
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-start gap-3">
          <Shield size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-300 text-sm">General Information Only</p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              Not a substitute for professional medical advice.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-300 text-sm">Emergency?</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              For medical emergencies, call <strong>112</strong> immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Full-page chat */}
      <div className="card overflow-hidden h-[600px]">
        <ChatBot fullPage />
      </div>

      {/* Plans Modal */}
      <PaymentModal
        isOpen={showPlans}
        onClose={() => setShowPlans(false)}
        title="Advanced AI Assistant Plans"
        plans={AI_PLANS}
        onSuccess={() => setShowPlans(false)}
      />
    </div>
  );
}
