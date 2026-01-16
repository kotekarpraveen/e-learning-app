
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Landmark, CheckCircle, X, Lock, Loader2, AlertCircle, Copy } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface PaymentModalProps {
  amount: number;
  courseTitle: string;
  onSuccess: (method: 'online' | 'offline', reference?: string) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ amount, courseTitle, onSuccess, onClose }) => {
  const [activeTab, setActiveTab] = useState<'online' | 'offline'>('online');
  const [isLoading, setIsLoading] = useState(false);
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  // Offline Form State
  const [referenceId, setReferenceId] = useState('');

  const handleOnlinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    onSuccess('online');
  };

  const handleOfflinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceId) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onSuccess('offline', referenceId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
           <div>
             <h3 className="text-lg font-bold text-gray-900">Secure Checkout</h3>
             <p className="text-xs text-gray-500">Enrolling in: {courseTitle}</p>
           </div>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition-colors">
             <X size={20} />
           </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
           <button 
             onClick={() => setActiveTab('online')}
             className={`flex-1 py-4 text-sm font-medium text-center transition-colors flex items-center justify-center ${
                activeTab === 'online' ? 'text-primary-600 border-b-2 border-primary-600 bg-white' : 'text-gray-500 hover:bg-gray-50'
             }`}
           >
             <CreditCard size={16} className="mr-2" /> Pay Online
           </button>
           <button 
             onClick={() => setActiveTab('offline')}
             className={`flex-1 py-4 text-sm font-medium text-center transition-colors flex items-center justify-center ${
                activeTab === 'offline' ? 'text-primary-600 border-b-2 border-primary-600 bg-white' : 'text-gray-500 hover:bg-gray-50'
             }`}
           >
             <Landmark size={16} className="mr-2" /> Bank Transfer
           </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
           <div className="text-center mb-6">
              <span className="text-3xl font-bold text-gray-900">${amount.toFixed(2)}</span>
              <span className="text-sm text-gray-500 block mt-1">One-time payment</span>
           </div>

           {activeTab === 'online' ? (
             <form onSubmit={handleOnlinePayment} className="space-y-4">
                <Input 
                   label="Cardholder Name" 
                   placeholder="John Doe" 
                   value={name}
                   onChange={e => setName(e.target.value)}
                   required
                />
                <Input 
                   label="Card Number" 
                   placeholder="0000 0000 0000 0000" 
                   value={cardNumber}
                   onChange={e => setCardNumber(e.target.value)}
                   maxLength={19}
                   required
                />
                <div className="grid grid-cols-2 gap-4">
                   <Input 
                      label="Expiry Date" 
                      placeholder="MM/YY" 
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      maxLength={5}
                      required
                   />
                   <Input 
                      label="CVC" 
                      placeholder="123" 
                      value={cvc}
                      onChange={e => setCvc(e.target.value)}
                      maxLength={3}
                      required
                   />
                </div>
                
                <div className="pt-4">
                   <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-primary-500/20" isLoading={isLoading}>
                      <Lock size={16} className="mr-2" /> Pay ${amount}
                   </Button>
                   <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center">
                      <Lock size={10} className="mr-1" /> Payments are secure and encrypted.
                   </p>
                </div>
             </form>
           ) : (
             <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                   <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center">
                      <Landmark size={16} className="mr-2" /> Bank Account Details
                   </h4>
                   <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex justify-between">
                         <span className="text-blue-600">Bank Name:</span>
                         <span className="font-mono font-medium">Global Tech Bank</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-blue-600">Account Name:</span>
                         <span className="font-mono font-medium">Aelgo Inc.</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-blue-600">Account Number:</span>
                         <span className="font-mono font-bold">1234 5678 9012</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-blue-600">Routing / Swift:</span>
                         <span className="font-mono font-medium">GTBUS33</span>
                      </div>
                   </div>
                </div>

                <div className="relative">
                   <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-200"></div>
                   </div>
                   <div className="relative flex justify-center">
                      <span className="bg-white px-2 text-xs text-gray-500">After transfer, enter reference below</span>
                   </div>
                </div>

                <form onSubmit={handleOfflinePayment} className="space-y-4">
                   <Input 
                      label="Transaction Reference ID" 
                      placeholder="e.g. TXN-12345678" 
                      value={referenceId}
                      onChange={e => setReferenceId(e.target.value)}
                      required
                   />
                   <div className="bg-yellow-50 p-3 rounded-lg flex items-start border border-yellow-100">
                      <AlertCircle size={16} className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-xs text-yellow-700">Offline payments require admin approval. Your enrollment will be pending until verified (approx. 24 hours).</p>
                   </div>
                   <Button type="submit" variant="secondary" className="w-full h-12" isLoading={isLoading} disabled={!referenceId}>
                      Submit Payment Proof
                   </Button>
                </form>
             </div>
           )}
        </div>
      </motion.div>
    </div>
  );
};
