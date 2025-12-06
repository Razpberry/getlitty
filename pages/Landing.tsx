import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Zap, Accessibility, ShieldCheck } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

const Landing: React.FC = () => {
  const { highContrast } = useAccessibility();
  
  const cardClass = `p-6 rounded-lg border ${
    highContrast 
      ? 'border-yellow-600 bg-gray-900 text-yellow-300' 
      : 'border-gray-200 bg-white text-gray-800 shadow-sm'
  }`;

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <section className="text-center mb-24">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
          Read Smarter, <br className="hidden md:block"/>
          <span className={highContrast ? 'text-yellow-400' : 'text-brand-600'}>Not Harder.</span>
        </h1>
        <p className={`text-xl md:text-2xl mb-10 max-w-2xl mx-auto ${highContrast ? 'text-yellow-200' : 'text-gray-600'}`}>
          AI-powered document simplification tailored to your reading level and needs.
        </p>
        <Link 
          to="/signup" 
          className={`inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full transition-all transform hover:scale-105 ${
            highContrast 
              ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
              : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg hover:shadow-xl'
          }`}
        >
          Get Started for Free
        </Link>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        <FeatureCard 
          icon={<FileText className="w-10 h-10 mb-4" />} 
          title="Any Document" 
          desc="Upload PDFs, Docs, or Text files. We handle the formatting."
          className={cardClass}
        />
        <FeatureCard 
          icon={<Zap className="w-10 h-10 mb-4" />} 
          title="Instant Simplify" 
          desc="Get a summary and simplified version in seconds using advanced AI."
          className={cardClass}
        />
        <FeatureCard 
          icon={<Accessibility className="w-10 h-10 mb-4" />} 
          title="Accessible First" 
          desc="Built for everyone with high contrast, dyslexia fonts, and more."
          className={cardClass}
        />
        <FeatureCard 
          icon={<ShieldCheck className="w-10 h-10 mb-4" />} 
          title="Secure & Private" 
          desc="Your documents are encrypted and safe with enterprise-grade security."
          className={cardClass}
        />
      </section>

      <section className={`rounded-2xl p-12 text-center ${highContrast ? 'bg-gray-800 border border-yellow-600' : 'bg-brand-50'}`}>
        <h2 className="text-3xl font-bold mb-6">Ready to transform your reading experience?</h2>
        <Link to="/signup" className={`underline font-semibold ${highContrast ? 'text-yellow-400' : 'text-brand-700'}`}>Create an account now &rarr;</Link>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, className }: { icon: React.ReactNode, title: string, desc: string, className: string }) => (
  <div className={className}>
    <div className="text-brand-500">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="opacity-80">{desc}</p>
  </div>
);

export default Landing;