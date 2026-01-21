
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const PrivacyPolicy: React.FC = () => {
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
            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
              <Shield size={16} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          
          <p className="text-gray-400 mb-6 text-xs">Last updated: May 15, 2025</p>

          <div className="space-y-6 text-gray-600 text-xs leading-relaxed">
            <section>
              <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">1. Introduction</h2>
              <p>
                Welcome to Aelgo World. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you as to how we look after your personal data when you visit our website 
                (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">2. The Data We Collect</h2>
              <p className="mb-2">
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
                <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">3. How We Use Your Personal Data</h2>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-4 space-y-1 mt-2">
                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                <li>Where we need to comply with a legal or regulatory obligation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">4. Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">5. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at: 
                <a href="mailto:privacy@aelgo.com" className="text-primary-600 hover:underline ml-1">privacy@aelgo.com</a>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
