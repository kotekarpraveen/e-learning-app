import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Landmark, CheckCircle, X, Lock, Loader2, AlertCircle, 
  Smartphone, Globe, ShieldCheck, QrCode
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface PaymentModalProps {
  amount: number;
  courseTitle: string;
  onSuccess: (method: 'online' | 'offline', reference?: string) => void;
  onClose: () => void;
}

// Simulated Gateway Types
type Gateway = 'stripe' | 'razorpay' | 'bank_transfer';

export const PaymentModal: React.FC<PaymentModalProps> = ({ amount, courseTitle, onSuccess, onClose }) => {
  const [activeGateway, setActiveGateway] = useState<Gateway>('stripe');
  const [processingState, setProcessingState] = useState<'idle' | 'processing' | 'verifying' | 'success'>('idle');
  
  // Card Form State (Stripe)
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardError, setCardError] = useState('');

  // UPI State (Razorpay)
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);

  // Bank Transfer State
  const [referenceId, setReferenceId] = useState('');

  // --- Helpers ---
  const formatCardNumber = (val: string) => {
    return val.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19);
  };

  const formatExpiry = (val: string) => {
    return val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);
  };

  // --- Handlers ---

  const handleStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 15 || cardCvc.length < 3) {
        setCardError('Invalid card details.');
        return;
    }
    setCardError('');
    setProcessingState('processing');
    
    // Simulate Network Request
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProcessingState('verifying');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setProcessingState('success');
    setTimeout(() => onSuccess('online'), 800);
  };

  const handleRazorpayPayment = async () => {
    if (!upiId && !upiVerified) return;
    setProcessingState('processing');
    
    // Simulate waiting for user to approve on mobile
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setProcessingState('success');
    setTimeout(() => onSuccess('online', `UPI-${Date.now()}`), 800);
  };

  const handleBankTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingState('processing');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProcessingState('success');
    setTimeout(() => onSuccess('offline', referenceId), 800);
  };

  // Verify UPI ID Mock
  const verifyUpi = () => {
      if(!upiId.includes('@')) return;
      setProcessingState('verifying');
      setTimeout(() => {
          setProcessingState('idle');
          setUpiVerified(true);
      }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[600px] md:h-auto"
      >
        {/* LEFT SIDE: Order Summary */}
        <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-100 p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            
            <div className="relative z-10">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Order Summary</h3>
                
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{courseTitle}</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Lifetime Access
                    </span>
                </div>

                <div className="border-t border-gray-200 py-6 mt-auto">
                    <div className="flex justify-between mb-2 text-gray-600">
                        <span>Course Price</span>
                        <span>${amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-4 text-gray-600">
                        <span>Tax (0%)</span>
                        <span>$0.00</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">
                        <span>Total</span>
                        <span>${amount.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center text-xs text-gray-400 gap-2">
                    <ShieldCheck size={14} />
                    <span>Secure SSL Encryption</span>
                </div>
            </div>
        </div>

        {/* RIGHT SIDE: Payment Methods */}
        <div className="w-full md:w-2/3 p-8 flex flex-col bg-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            {/* Gateway Tabs */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                    onClick={() => setActiveGateway('stripe')}
                    className={`flex items-center px-4 py-3 rounded-xl border transition-all whitespace-nowrap ${
                        activeGateway === 'stripe' 
                        ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                >
                    <CreditCard size={18} className="mr-2" />
                    <span className="font-bold text-sm">Credit Card</span>
                </button>
                <button 
                    onClick={() => setActiveGateway('razorpay')}
                    className={`flex items-center px-4 py-3 rounded-xl border transition-all whitespace-nowrap ${
                        activeGateway === 'razorpay' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                >
                    <Smartphone size={18} className="mr-2" />
                    <span className="font-bold text-sm">UPI / Local</span>
                </button>
                <button 
                    onClick={() => setActiveGateway('bank_transfer')}
                    className={`flex items-center px-4 py-3 rounded-xl border transition-all whitespace-nowrap ${
                        activeGateway === 'bank_transfer' 
                        ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                >
                    <Landmark size={18} className="mr-2" />
                    <span className="font-bold text-sm">Bank Transfer</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative">
                {/* Overlay Loader */}
                <AnimatePresence>
                    {processingState !== 'idle' && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl"
                        >
                            {processingState === 'success' ? (
                                <>
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4"
                                    >
                                        <CheckCircle size={32} />
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-gray-900">Payment Successful!</h3>
                                    <p className="text-gray-500 mt-2">Redirecting to course...</p>
                                </>
                            ) : (
                                <>
                                    <Loader2 size={40} className="text-primary-600 animate-spin mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {processingState === 'verifying' ? 'Verifying Transaction...' : 'Processing Payment...'}
                                    </h3>
                                    <p className="text-gray-500 mt-2 text-sm">Please do not close this window</p>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* STRIPE FORM */}
                {activeGateway === 'stripe' && (
                    <form onSubmit={handleStripePayment} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                        <Input 
                            label="Cardholder Name" 
                            placeholder="e.g. John Doe"
                            value={cardName}
                            onChange={e => setCardName(e.target.value)}
                            required
                        />
                        <div className="relative">
                            <Input 
                                label="Card Number" 
                                placeholder="0000 0000 0000 0000"
                                value={cardNumber}
                                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                maxLength={19}
                                required
                            />
                            <div className="absolute right-3 top-9 flex gap-1">
                                {/* Mock Card Icons */}
                                <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-[8px] text-white font-bold italic">VISA</div>
                                <div className="w-8 h-5 bg-red-500 rounded flex items-center justify-center text-[8px] text-white font-bold">MC</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <Input 
                                label="Expiry (MM/YY)" 
                                placeholder="MM/YY"
                                value={cardExpiry}
                                onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                                maxLength={5}
                                required
                            />
                            <Input 
                                label="CVC" 
                                placeholder="123"
                                value={cardCvc}
                                onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                                maxLength={4}
                                required
                                icon={<Lock size={16} className="text-gray-400" />}
                            />
                        </div>
                        
                        {cardError && (
                            <div className="text-sm text-red-600 flex items-center bg-red-50 p-3 rounded-lg">
                                <AlertCircle size={16} className="mr-2" /> {cardError}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-12 text-lg shadow-xl shadow-primary-500/20 mt-4">
                            Pay ${amount.toFixed(2)}
                        </Button>
                        <div className="flex justify-center items-center text-xs text-gray-400 mt-2">
                            <Lock size={10} className="mr-1" /> Powered by Stripe (Simulated)
                        </div>
                    </form>
                )}

                {/* RAZORPAY / UPI FORM */}
                {activeGateway === 'razorpay' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 items-center">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-600">
                                <QrCode size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-900">Scan QR Code</h4>
                                <p className="text-xs text-blue-700">Open any UPI app (GPay, PhonePe, Paytm) to pay</p>
                            </div>
                        </div>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">Or enter UPI ID</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input 
                                    placeholder="username@bank"
                                    value={upiId}
                                    onChange={e => { setUpiId(e.target.value); setUpiVerified(false); }}
                                    className={upiVerified ? 'border-green-500 ring-green-500' : ''}
                                />
                            </div>
                            <Button variant="secondary" onClick={verifyUpi} disabled={upiVerified || !upiId}>
                                {upiVerified ? <CheckCircle size={18} className="text-green-600" /> : 'Verify'}
                            </Button>
                        </div>

                        {upiVerified && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-sm text-green-600 flex items-center">
                                <CheckCircle size={14} className="mr-1" /> Verified Name: John Doe
                            </motion.div>
                        )}

                        <Button 
                            className="w-full h-12 text-lg shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 border-transparent mt-4" 
                            onClick={handleRazorpayPayment}
                            disabled={!upiVerified}
                        >
                            Pay Now
                        </Button>
                    </div>
                )}

                {/* BANK TRANSFER FORM */}
                {activeGateway === 'bank_transfer' && (
                    <form onSubmit={handleBankTransfer} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-900 space-y-2">
                            <p><strong>Bank:</strong> Global Tech Bank</p>
                            <p><strong>Account:</strong> 1234 5678 9012</p>
                            <p><strong>Swift:</strong> GTBUS33</p>
                        </div>
                        
                        <div className="pt-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Transaction Reference ID</label>
                            <Input 
                                placeholder="Enter transaction ID from your bank"
                                value={referenceId}
                                onChange={e => setReferenceId(e.target.value)}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                * Your enrollment will be pending admin approval (approx. 24h).
                            </p>
                        </div>

                        <Button variant="secondary" type="submit" className="w-full h-12 mt-4" disabled={!referenceId}>
                            Submit Proof
                        </Button>
                    </form>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
};