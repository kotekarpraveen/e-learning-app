
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center mr-2 text-white shadow-sm">
               <Globe size={14} />
            </div>
            <span className="text-sm font-bold text-gray-900">Aelgo World</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-xs">
            <ArrowLeft size={12} className="mr-1" /> Back
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <FileText size={16} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          
          <p className="text-gray-400 mb-6 text-xs">Last updated: May 15, 2025</p>

          <div className="space-y-6 text-gray-600 text-xs leading-relaxed">
            <section>
              <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">1. Agreement to Terms</h2>
              <p>
                By accessing our website at Aelgo World, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on Aelgo World's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-4 space-y-1 mt-2">
                <li>modify or copy the materials;</li>
                <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                <li>attempt to decompile or reverse engineer any software contained on Aelgo World's website;</li>
                <li>remove any copyright or other proprietary notations from the materials; or</li>
                <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">3. User Accounts</h2>
              <p>
                When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">4. Content Liability</h2>
              <p>
                We shall not be hold responsible for any content that appears on your Website. You agree to protect and defend us against all claims that is rising on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">5. Disclaimer</h2>
              <p>
                The materials on Aelgo World's website are provided on an 'as is' basis. Aelgo World makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
