
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, TrendingUp, CreditCard, Download, 
  Calendar, CheckCircle, Clock, AlertCircle, ArrowUpRight,
  MoreVertical, Filter, Search
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// --- Mock Data ---

const REVENUE_STATS = [
  { 
    label: 'Total Revenue', 
    value: '$124,592.00', 
    change: '+14.2%', 
    trend: 'up',
    description: 'Lifetime earnings'
  },
  { 
    label: 'Monthly Recurring (MRR)', 
    value: '$12,450.00', 
    change: '+5.4%', 
    trend: 'up',
    description: 'Based on active subscriptions'
  },
  { 
    label: 'Pending Payouts', 
    value: '$3,240.50', 
    change: 'Due Feb 28', 
    trend: 'neutral',
    description: 'Processing funds'
  },
  { 
    label: 'Avg. Order Value', 
    value: '$85.00', 
    change: '-1.2%', 
    trend: 'down',
    description: 'Per transaction'
  }
];

const TRANSACTIONS = [
  { id: 'tx_1', user: 'Alex Johnson', course: 'Fullstack React Mastery', amount: 89.99, date: 'Oct 24, 2023', status: 'succeeded', method: 'Visa •••• 4242' },
  { id: 'tx_2', user: 'Sarah Connor', course: 'UI/UX Fundamentals', amount: 49.99, date: 'Oct 24, 2023', status: 'succeeded', method: 'Mastercard •••• 8822' },
  { id: 'tx_3', user: 'Michael Chen', course: 'Data Science Bootcamp', amount: 129.00, date: 'Oct 23, 2023', status: 'processing', method: 'PayPal' },
  { id: 'tx_4', user: 'Emily Davis', course: 'Advanced Node.js', amount: 89.99, date: 'Oct 22, 2023', status: 'failed', method: 'Visa •••• 1234' },
  { id: 'tx_5', user: 'David Kim', course: 'Python for Beginners', amount: 39.99, date: 'Oct 21, 2023', status: 'succeeded', method: 'Amex •••• 0099' },
  { id: 'tx_6', user: 'Lisa Wang', course: 'UI/UX Fundamentals', amount: 49.99, date: 'Oct 20, 2023', status: 'succeeded', method: 'Visa •••• 4242' },
  { id: 'tx_7', user: 'James Wilson', course: 'Fullstack React Mastery', amount: 89.99, date: 'Oct 19, 2023', status: 'refunded', method: 'PayPal' },
];

const MONTHLY_DATA = [
    { month: 'Jan', value: 45 },
    { month: 'Feb', value: 52 },
    { month: 'Mar', value: 49 },
    { month: 'Apr', value: 62 },
    { month: 'May', value: 58 },
    { month: 'Jun', value: 75 },
    { month: 'Jul', value: 85 },
    { month: 'Aug', value: 82 },
    { month: 'Sep', value: 90 },
    { month: 'Oct', value: 100 },
];

export const Billing: React.FC = () => {
  const [filter, setFilter] = useState('All');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'refunded': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
         <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Billing & Revenue</h1>
            <p className="text-gray-500">Manage earnings, payouts, and view transaction history.</p>
         </div>
         <div className="flex gap-3">
             <Button variant="secondary" icon={<Download size={18} />}>
                Export Report
             </Button>
             <Button variant="primary" icon={<CreditCard size={18} />}>
                Payout Settings
             </Button>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {REVENUE_STATS.map((stat, i) => (
            <motion.div 
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
            </motion.div>
        ))}
      </div>

      {/* Revenue Chart Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
         <div className="flex justify-between items-center mb-8">
            <div>
               <h3 className="text-lg font-bold text-gray-900">Revenue Overview</h3>
               <p className="text-sm text-gray-500">Gross earnings over the last 12 months</p>
            </div>
            <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>This Year (2025)</option>
                <option>Last Year (2024)</option>
            </select>
         </div>
         
         {/* CSS-only Bar Chart */}
         <div className="h-64 flex items-end justify-between gap-4 px-2">
            {MONTHLY_DATA.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 group cursor-pointer">
                    <div className="w-full relative h-full flex items-end">
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${item.value}%` }}
                            transition={{ duration: 1, delay: idx * 0.05 }}
                            className="w-full bg-primary-100 rounded-t-lg group-hover:bg-primary-600 transition-colors relative"
                        >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                ${item.value * 125}
                            </div>
                        </motion.div>
                    </div>
                    <span className="text-xs text-gray-400 mt-3 font-medium">{item.month}</span>
                </div>
            ))}
         </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
              <p className="text-sm text-gray-500">Latest payments from students</p>
           </div>
           
           <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input 
                    type="text" 
                    placeholder="Search transactions..." 
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                 />
              </div>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
                 <Filter size={18} />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Course</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Invoice</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {TRANSACTIONS.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4 font-medium text-gray-900">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-bold text-xs">
                                        {tx.user.charAt(0)}
                                    </div>
                                    <div>
                                        <div>{tx.user}</div>
                                        <div className="text-xs text-gray-400 font-normal">{tx.method}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{tx.course}</td>
                            <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">${tx.amount.toFixed(2)}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(tx.status)}`}>
                                    {tx.status === 'succeeded' && <CheckCircle size={12} className="mr-1" />}
                                    {tx.status === 'processing' && <Clock size={12} className="mr-1" />}
                                    {tx.status === 'failed' && <AlertCircle size={12} className="mr-1" />}
                                    {tx.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-gray-400 hover:text-primary-600 transition-colors">
                                    <Download size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                View All Transactions
            </button>
        </div>
      </div>
    </div>
  );
};
