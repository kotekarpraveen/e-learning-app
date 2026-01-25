
import React from 'react';
import { Globe, Award, Star } from 'lucide-react';

interface CertificateTemplateProps {
  studentName: string;
  courseTitle: string;
  instructor: string;
  date: string;
  verificationId: string;
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({ 
  studentName, courseTitle, instructor, date, verificationId 
}) => {
  return (
    <div className="printable-content w-full bg-[#fdfbf7] text-[#1a1a1a] shadow-2xl relative overflow-hidden select-none">
        
        {/* Aspect Ratio Container for Display (Screen Mode) - Print mode ignores this via CSS overrides */}
        <div className="w-full aspect-[1.414/1] relative flex flex-col h-full">
            
            {/* --- Ornamental Border --- */}
            <div className="absolute inset-0 p-4 pointer-events-none">
                <div className="w-full h-full border-[8px] border-[#2c3e50] relative">
                    {/* Inner Gold Line */}
                    <div className="absolute inset-1 border-[2px] border-[#c5a059]"></div>
                    
                    {/* Corner Ornaments */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-[8px] border-l-[8px] border-[#c5a059] -mt-2 -ml-2"></div>
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-[8px] border-r-[8px] border-[#c5a059] -mt-2 -mr-2"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[8px] border-l-[8px] border-[#c5a059] -mb-2 -ml-2"></div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[8px] border-r-[8px] border-[#c5a059] -mb-2 -mr-2"></div>
                </div>
            </div>

            {/* --- Background Pattern --- */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-[#c5a059]/10 pointer-events-none"></div>

            {/* --- Content Layer --- */}
            <div className="relative flex-1 flex flex-col items-center justify-between py-12 px-12 md:py-16 md:px-24 z-10">
                
                {/* Header */}
                <div className="text-center w-full">
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 bg-[#2c3e50] rounded-full flex items-center justify-center text-[#c5a059] shadow-lg print:shadow-none">
                            <Globe size={28} />
                        </div>
                    </div>
                    <h1 
                        className="text-4xl md:text-6xl font-bold uppercase tracking-[0.2em] text-[#2c3e50] mb-3" 
                        style={{ fontFamily: '"Playfair Display", serif' }}
                    >
                        Certificate
                    </h1>
                    <p className="text-lg md:text-xl uppercase tracking-[0.4em] text-[#c5a059] font-medium">
                        of Completion
                    </p>
                </div>

                {/* Main Body */}
                <div className="text-center w-full space-y-4 md:space-y-8 flex-1 flex flex-col justify-center my-4">
                    <p className="text-gray-500 font-serif italic text-lg md:text-xl">This is to certify that</p>
                    
                    <div className="relative inline-block px-8 pb-4 mx-auto">
                        <h2 
                            className="text-5xl md:text-7xl text-[#2c3e50] whitespace-nowrap leading-relaxed" 
                            style={{ fontFamily: '"Great Vibes", cursive' }}
                        >
                            {studentName}
                        </h2>
                        {/* Underline decoration */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[#c5a059] to-transparent"></div>
                    </div>

                    <p className="text-gray-500 font-serif italic text-lg md:text-xl">
                        has successfully completed the comprehensive course
                    </p>
                    
                    <h3 
                        className="text-2xl md:text-4xl font-bold text-[#2c3e50] max-w-4xl mx-auto leading-snug px-4"
                        style={{ fontFamily: '"Playfair Display", serif' }}
                    >
                        {courseTitle}
                    </h3>
                </div>

                {/* Footer */}
                <div className="w-full grid grid-cols-3 gap-8 items-end mt-4">
                    
                    {/* Date */}
                    <div className="text-center">
                        <div className="border-b border-[#2c3e50]/30 pb-2 px-4 mb-2">
                            <p className="font-bold text-lg text-[#2c3e50]" style={{ fontFamily: '"Playfair Display", serif' }}>
                                {date}
                            </p>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Date Completed</p>
                    </div>

                    {/* Gold Seal */}
                    <div className="flex justify-center -mb-6 relative z-20">
                        <div className="relative w-32 h-32 md:w-40 md:h-40">
                            {/* Sunburst/Ribbon effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#fcd34d] to-[#d97706] rounded-full shadow-xl flex items-center justify-center p-1.5 ring-4 ring-white print:shadow-none print:ring-0">
                                <div className="w-full h-full border-2 border-[#fffbeb] border-dashed rounded-full flex flex-col items-center justify-center text-white text-center drop-shadow-md bg-[#b45309]/10">
                                    <Award size={48} className="mb-1 opacity-90" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest">Aelgo World</span>
                                    <span className="text-[6px] font-medium uppercase tracking-wider mt-0.5">Verified</span>
                                </div>
                            </div>
                            {/* Hanging Ribbon */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1 -z-10">
                                <div className="w-6 h-12 bg-[#d97706] skew-y-12 origin-top-right rounded-b-sm shadow-md print:shadow-none"></div>
                                <div className="w-6 h-12 bg-[#b45309] -skew-y-12 origin-top-left rounded-b-sm shadow-md print:shadow-none"></div>
                            </div>
                        </div>
                    </div>

                    {/* Signature */}
                    <div className="text-center">
                        <div className="border-b border-[#2c3e50]/30 pb-2 px-4 mb-2">
                            <p 
                                className="text-3xl text-[#2c3e50] leading-none transform -rotate-2" 
                                style={{ fontFamily: '"Great Vibes", cursive' }}
                            >
                                {instructor}
                            </p>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Instructor Signature</p>
                    </div>
                </div>

                {/* Verification ID */}
                <div className="absolute bottom-6 text-[9px] text-[#2c3e50]/40 font-mono uppercase tracking-widest">
                    Certificate ID: {verificationId}
                </div>
            </div>
        </div>
    </div>
  );
};
