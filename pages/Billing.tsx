
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, TrendingUp, CreditCard, Download, 
  Calendar, CheckCircle, Clock, AlertCircle, ArrowUpRight,
  MoreVertical, Filter, Search, Plus, Send, Copy, ExternalLink,
  Check, X
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../lib/api';
import { Transaction, PaymentRequest } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPrice } from '../lib/currency';

// Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  const MotionDiv = motion.div as any;
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border ${
        type === 'success' ? 'bg-white border-green-100' : 'bg-white border-red-100'
      }`}
    >
      <div className={`p-2 rounded-full ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      </div>
      <div>
        <h4 className={`font-bold text-sm ${type === 'success' ? 'text-gray-900' : 'text-gray-900'}`}>
          {type === 'success' ? 'Success' : 'Error'}
        </h4>
        <p className="text-gray-500 text-xs">{message}</p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4">
        <X size={16} />
      </button>
    </MotionDiv>
  );
};

export const Billing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'requests'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Create Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newRequest, setNewRequest] = useState({ email: '', amount: '', description: '' });

  const MotionDiv = motion.div as any;

  useEffect(() => {
      fetchData();
  }, []);

  const fetchData = async () => {
      setIsLoading(true);
      const [txs, reqs] = await Promise.all([
          api.getTransactions(),
          api.getPaymentRequests()
      ]);
      setTransactions(txs);
      setPaymentRequests(reqs);
      setIsLoading(false);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
      e.preventDefault();
      await api.createPaymentRequest(newRequest.email, parseFloat(newRequest.amount), newRequest.description);
      setShowRequestModal(false);
      setNewRequest({ email: '', amount: '', description: '' });
      setToast({ message: 'Payment request created successfully.', type: 'success' });
      fetchData(); 
  };

  const handleApprove = async (txId: string) => {
      const success = await api.approveTransaction(txId);
      if (success) {
          setToast({ message: 'Transaction approved. Student enrolled.', type: 'success' });
          fetchData();
      } else {
          setToast({ message: 'Failed to approve transaction. Please check your connection.', type: 'error' });
      }
  };

  const handleCopyLink = (link: string) => {
      navigator.clipboard.writeText(link);
      setToast({ message: 'Payment link copied to clipboard.', type: 'success' });
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      setToast({ message: 'No transactions to export.', type: 'error' });
      return;
    }

    // CSV Headers
    const headers = ['Transaction ID', 'Student', 'Course', 'Date', 'Amount', 'Method', 'Status', 'Type', 'Reference ID'];
    
    // CSV Rows
    const rows = transactions.map(tx => [
      tx.id,
      `"${tx.userName}"`, // Quote strings with potential commas
      `"${tx.courseTitle}"`,
      tx.date,
      formatPrice(tx.amount).replace(/[^0-9.,]/g, ''), // Export raw number in formatted locale for CSV but typically CSV likes numbers
      tx.method,
      tx.status,
      tx.type,
      tx.referenceId || ''
    ]);

    // Combine
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    // Create Blob and Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({ message: 'Report exported successfully.', type: 'success' });
  };

  const handleDownloadInvoice = (tx: Transaction) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Brand Color: #88d8b0 (RGB: 136, 216, 176)
      const primaryColor = '#88d8b0'; 
      // Secondary Color: #2c3e50 (RGB: 44, 62, 80)
      const secondaryColor = '#2c3e50';

      const formattedAmount = formatPrice(tx.amount);

      // --- HEADER ---
      // Logo Placeholder (Circle)
      doc.setFillColor(secondaryColor);
      doc.circle(20, 20, 6, 'F');
      doc.setTextColor(primaryColor);
      doc.setFontSize(10);
      doc.text('A', 18.5, 21.5); // A for Aelgo inside the circle

      doc.setFontSize(22);
      doc.setTextColor(secondaryColor);
      doc.text('INVOICE', 14, 40);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`#${tx.id}`, 14, 46);

      // Company Info (Right Aligned)
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text('Aelgo World Inc.', pageWidth - 14, 20, { align: 'right' });
      doc.text('123 Learning Lane', pageWidth - 14, 25, { align: 'right' });
      doc.text('EdTech City, CA 94000', pageWidth - 14, 30, { align: 'right' });
      doc.text('billing@aelgo.com', pageWidth - 14, 35, { align: 'right' });

      // Line Separator
      doc.setDrawColor(230);
      doc.line(14, 55, pageWidth - 14, 55);

      // --- BILLING INFO ---
      // Left Side: Bill To
      doc.setFontSize(11);
      doc.setTextColor(secondaryColor);
      doc.text('Bill To:', 14, 70);
      
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(tx.userName, 14, 76);
      doc.setTextColor(100);
      doc.text(`User ID: ${tx.userId}`, 14, 81);

      // Right Side: Payment Details
      const rightColX = pageWidth / 2 + 10;
      doc.setFontSize(11);
      doc.setTextColor(secondaryColor);
      doc.text('Payment Details:', rightColX, 70);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Date: ${tx.date}`, rightColX, 76);
      doc.text(`Method: ${tx.method} (${tx.type})`, rightColX, 81);
      doc.text(`Status: ${tx.status.toUpperCase()}`, rightColX, 86);
      if(tx.referenceId) doc.text(`Ref ID: ${tx.referenceId}`, rightColX, 91);

      // --- TABLE ---
      autoTable(doc, {
        startY: 105,
        head: [['Description', 'Amount']],
        body: [
          [tx.courseTitle, formattedAmount],
          ['Lifetime Access & Updates', 'Included'],
        ],
        theme: 'grid',
        headStyles: { 
          fillColor: [44, 62, 80], // secondaryColor
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 10, 
          cellPadding: 6,
          textColor: [50, 50, 50]
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 40, halign: 'right' },
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        }
      });

      // --- TOTAL ---
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Total Paid: ${formattedAmount}`, pageWidth - 14, finalY, { align: 'right' });

      // --- FOOTER ---
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Thank you for choosing Aelgo World. Keep learning!', pageWidth / 2, pageHeight - 20, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

      doc.save(`Invoice_${tx.id}.pdf`);
      setToast({ message: 'Invoice PDF downloaded successfully.', type: 'success' });
    } catch (err) {
      console.error("PDF Generation Error", err);
      setToast({ message: 'Failed to generate PDF.', type: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': case 'paid': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'pending_approval': return 'bg-orange-100 text-orange-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'refunded': case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const pendingApprovals = transactions.filter(t => t.status === 'pending_approval');

  // Dynamic Stats Calculation
  const totalRevenue = transactions
    .filter(t => t.status === 'succeeded')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  
  const successCount = transactions.filter(t => t.status === 'succeeded').length;
  const avgOrder = successCount > 0 ? totalRevenue / successCount : 0;

  const revenueStats = [
    { 
      label: 'Total Revenue', 
      value: formatPrice(totalRevenue), 
      change: '+14.2%', 
      trend: 'up',
      description: 'Lifetime earnings'
    },
    { 
      label: 'Monthly Recurring', 
      value: formatPrice(12450), 
      change: '+5.4%', 
      trend: 'up',
      description: 'Based on active subscriptions'
    },
    { 
      label: 'Pending Approvals', 
      value: `${pendingApprovals.length} Items`, 
      change: pendingApprovals.length > 0 ? 'Action Needed' : 'All Clear', 
      trend: pendingApprovals.length > 0 ? 'neutral' : 'up',
      description: 'Offline payments waiting'
    },
    { 
      label: 'Avg. Order Value', 
      value: formatPrice(avgOrder), 
      change: '-1.2%', 
      trend: 'down',
      description: 'Per transaction'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
         <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Billing & Revenue</h1>
            <p className="text-gray-500">Manage earnings, payouts, and payment requests.</p>
         </div>
         <div className="flex gap-3">
             <Button variant="secondary" icon={<Download size={18} />} onClick={handleExport}>
                Export Report
             </Button>
             <Button variant="primary" icon={<Plus size={18} />} onClick={() => setShowRequestModal(true)}>
                Create Request
             </Button>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueStats.map((stat, i) => (
            <MotionDiv 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                        stat.trend === 'up' ? 'bg-green-100 text-green-700' : 
                        stat.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {stat.trend === 'up' && <ArrowUpRight size={12} className="mr-1" />}
                        {stat.change}
                    </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-xs text-gray-400">{stat.description}</p>
            </MotionDiv>
        ))}
      </div>

      {/* Pending Approvals Section */}
      {pendingApprovals.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
                  <AlertCircle size={20} className="mr-2" /> Pending Offline Payments
              </h3>
              <div className="bg-white rounded-xl overflow-hidden border border-orange-100 shadow-sm">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500 font-medium">
                          <tr>
                              <th className="px-6 py-3">Student</th>
                              <th className="px-6 py-3">Course</th>
                              <th className="px-6 py-3">Reference ID</th>
                              <th className="px-6 py-3 text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {pendingApprovals.map(tx => (
                              <tr key={tx.id}>
                                  <td className="px-6 py-4 font-medium">{tx.userName}</td>
                                  <td className="px-6 py-4 text-gray-600">{tx.courseTitle}</td>
                                  <td className="px-6 py-4 font-mono text-gray-500">{tx.referenceId}</td>
                                  <td className="px-6 py-4 text-right">
                                      <button 
                                        onClick={() => handleApprove(tx.id)}
                                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                                      >
                                          <Check size={14} className="mr-1" /> Approve
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`px-8 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'transactions' 
                        ? 'border-primary-500 text-primary-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Transactions
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-8 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'requests' 
                        ? 'border-primary-500 text-primary-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Payment Requests
                </button>
            </nav>
        </div>

        {/* Tab Content */}
        <div>
            {activeTab === 'transactions' ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Course</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.length > 0 ? transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{tx.userName}</td>
                                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{tx.courseTitle}</td>
                                    <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{formatPrice(tx.amount)}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                        <div className="flex items-center">
                                            {tx.type === 'online' ? <CreditCard size={14} className="mr-1.5" /> : <DollarSign size={14} className="mr-1.5" />}
                                            {tx.method}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(tx.status)}`}>
                                            {tx.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDownloadInvoice(tx)}
                                            className="text-gray-400 hover:text-primary-600 transition-colors"
                                            title="Download Invoice"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No transactions found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Recipient</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paymentRequests.length > 0 ? paymentRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{req.studentEmail}</td>
                                    <td className="px-6 py-4 text-gray-600">{req.description}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{formatPrice(req.amount)}</td>
                                    <td className="px-6 py-4 text-gray-500">{req.createdAt}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleCopyLink(req.paymentLink)} className="text-gray-400 hover:text-primary-600 transition-colors mr-2" title="Copy Link">
                                            <Copy size={18} />
                                        </button>
                                        <button className="text-gray-400 hover:text-red-500 transition-colors" title="Cancel">
                                            <X size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No active payment requests.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>

      {/* Create Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
               <MotionDiv 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
               >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                     <h2 className="text-xl font-bold text-gray-900">New Payment Request</h2>
                     <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                     </button>
                  </div>
                  
                  <div className="p-6">
                     <form onSubmit={handleCreateRequest} className="space-y-4">
                        <Input 
                            label="Student Email" 
                            type="email"
                            placeholder="student@example.com"
                            value={newRequest.email} 
                            onChange={e => setNewRequest({...newRequest, email: e.target.value})}
                            required
                        />
                        <Input 
                            label="Amount (USD)" 
                            type="number"
                            placeholder="0.00"
                            value={newRequest.amount} 
                            onChange={e => setNewRequest({...newRequest, amount: e.target.value})}
                            required
                        />
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                           <textarea 
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none resize-none min-h-[80px]"
                              placeholder="e.g. 1-on-1 Mentorship Session"
                              value={newRequest.description}
                              onChange={e => setNewRequest({...newRequest, description: e.target.value})}
                              required
                           />
                        </div>
                        
                        <div className="pt-2">
                            <Button type="submit" className="w-full" icon={<Send size={16} />}>
                                Send Request
                            </Button>
                        </div>
                     </form>
                  </div>
               </MotionDiv>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};
