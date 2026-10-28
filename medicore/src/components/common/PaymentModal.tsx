import { useState } from 'react';
import { motion, AnimatePresence } from '../../lib/motion';
import { CheckCircle, CreditCard, QrCode, X, Shield, Zap } from 'lucide-react';
import { Modal } from './Modal';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  plans?: Plan[];
  fixedAmount?: number;
  fixedLabel?: string;
  onSuccess?: () => void;
}

// Real static UPI QR for demo - points to a test UPI ID
const DEMO_QR_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=medicore-demo@upi&pn=MediCore&am=';

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    period: '7 days',
    features: ['Basic AI Health Queries', 'App Navigation Help', 'General Health Info', '50 messages/day'],
    popular: false,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 299,
    period: 'month',
    features: ['All Free features', 'Advanced Health Queries', 'Appointment Guidance', '500 messages/day', 'Priority Support'],
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 999,
    period: 'month',
    features: ['All Basic features', 'Unlimited Messages', 'Hospital Recommendations', 'Specialist Consultations Info', '24/7 Priority Access'],
    popular: true,
  },
];

export function PaymentModal({ isOpen, onClose, title, plans, fixedAmount, fixedLabel, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<'plans' | 'method' | 'qr' | 'card' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [payMethod, setPayMethod] = useState<'upi' | 'card'>('upi');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [processing, setProcessing] = useState(false);

  const displayPlans = plans ?? DEFAULT_PLANS;
  const amount = fixedAmount ?? selectedPlan?.price ?? 0;
  const label = fixedLabel ?? selectedPlan?.name ?? '';

  const handleSelectPlan = (plan: Plan) => {
    if (plan.price === 0) { handleFree(); return; }
    setSelectedPlan(plan);
    setStep('method');
  };

  const handleFree = () => {
    setStep('success');
    setTimeout(() => { toast.success('Free trial activated!'); onSuccess?.(); }, 500);
  };

  const handlePay = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    setStep('success');
    toast.success('Payment successful! (Demo)');
    onSuccess?.();
  };

  const handleClose = () => {
    setStep('plans');
    setSelectedPlan(null);
    setCard({ number: '', name: '', expiry: '', cvv: '' });
    onClose();
  };

  const qrAmount = fixedAmount ?? selectedPlan?.price ?? 50;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title ?? 'Choose Your Plan'} size="md">
      <AnimatePresence mode="wait">
        {/* PLANS */}
        {step === 'plans' && !fixedAmount && (
          <motion.div key="plans" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Select a plan to continue. Demo payments only - no real charges.</p>
            <div className="space-y-3">
              {displayPlans.map((plan) => (
                <button key={plan.id} onClick={() => handleSelectPlan(plan)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all hover:shadow-md ${plan.popular ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{plan.name}</span>
                      {plan.popular && <span className="badge bg-blue-600 text-white text-xs">Popular</span>}
                      {plan.id === 'free' && <span className="badge bg-green-100 text-green-700 text-xs">Current</span>}
                    </div>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {plan.price === 0 ? 'Free' : `Rs. ${plan.price}/${plan.period}`}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <CheckCircle size={11} className="text-green-500 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* FIXED AMOUNT (e.g. booking fee) */}
        {step === 'plans' && fixedAmount && (
          <motion.div key="fixed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 mb-5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{fixedLabel}</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">Rs. {fixedAmount}</p>
              <p className="text-xs text-slate-400 mt-1">Demo payment - no real charges</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep('method'); }} className="btn-primary flex-1 justify-center">Proceed to Pay</button>
              <button onClick={handleClose} className="btn-secondary">Cancel</button>
            </div>
          </motion.div>
        )}

        {/* PAYMENT METHOD */}
        {step === 'method' && (
          <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount: <span className="text-blue-600 font-bold">Rs. {amount}</span></p>
            <p className="text-xs text-slate-400 mb-5">Choose payment method (Demo - no real charges)</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button onClick={() => setPayMethod('upi')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === 'upi' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                <QrCode size={24} className="text-blue-600" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">UPI / QR</span>
              </button>
              <button onClick={() => setPayMethod('card')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === 'card' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                <CreditCard size={24} className="text-blue-600" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">Card</span>
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(payMethod === 'upi' ? 'qr' : 'card')} className="btn-primary flex-1 justify-center">Continue</button>
              <button onClick={() => setStep('plans')} className="btn-secondary">Back</button>
            </div>
          </motion.div>
        )}

        {/* QR CODE */}
        {step === 'qr' && (
          <motion.div key="qr" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 text-center">
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Scan QR to Pay</p>
            <p className="text-xs text-slate-400 mb-4">Rs. {qrAmount} - {label} (Demo UPI QR)</p>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm inline-block">
                <img
                  src={`${DEMO_QR_URL}${qrAmount}&tn=MediCore+Payment`}
                  alt="UPI QR Code"
                  className="w-44 h-44"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-1">UPI ID: <strong>medicore-demo@upi</strong></p>
            <p className="text-xs text-amber-600 mb-5">This is a demo QR. No real payment will be processed.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handlePay} disabled={processing} className="btn-primary">
                {processing ? 'Verifying...' : 'I have paid'}
              </button>
              <button onClick={() => setStep('method')} className="btn-secondary">Back</button>
            </div>
          </motion.div>
        )}

        {/* CARD */}
        {step === 'card' && (
          <motion.div key="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6">
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Card Payment</p>
            <p className="text-xs text-slate-400 mb-4">Rs. {qrAmount} - Demo only, enter any values</p>
            <div className="space-y-3">
              <div>
                <label className="label">Card Number</label>
                <input value={card.number} onChange={e => setCard(c => ({ ...c, number: e.target.value }))}
                  className="input-field" placeholder="1234 5678 9012 3456" maxLength={19} />
              </div>
              <div>
                <label className="label">Cardholder Name</label>
                <input value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                  className="input-field" placeholder="Your Name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Expiry</label>
                  <input value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))}
                    className="input-field" placeholder="MM/YY" maxLength={5} />
                </div>
                <div>
                  <label className="label">CVV</label>
                  <input value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value }))}
                    className="input-field" placeholder="123" maxLength={3} type="password" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <Shield size={13} className="text-green-500" />
              <p className="text-xs text-slate-500">Demo only - no real card data is stored or charged</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handlePay} disabled={processing || !card.number || !card.name} className="btn-primary flex-1 justify-center">
                {processing ? 'Processing...' : `Pay Rs. ${qrAmount}`}
              </button>
              <button onClick={() => setStep('method')} className="btn-secondary">Back</button>
            </div>
          </motion.div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={36} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading mb-2">Payment Successful!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {selectedPlan ? `${selectedPlan.name} plan activated` : fixedLabel ? fixedLabel + ' confirmed' : 'Payment confirmed'}
            </p>
            <p className="text-xs text-amber-600 mb-6">Demo payment - no real transaction occurred</p>
            <button onClick={handleClose} className="btn-primary">Done</button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
