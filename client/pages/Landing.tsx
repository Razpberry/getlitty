import React from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Settings, 
  Zap, 
  Users, 
  Shield, 
  Sparkles,
  Layout,
  Globe
} from 'lucide-react';

const Landing: React.FC = () => {
  const { highContrast } = useAccessibility();

  // Dynamic classes based on contrast mode
  const bgBase = highContrast ? 'bg-black text-yellow-300' : 'bg-white text-gray-900';
  const bgAlt = highContrast ? 'bg-gray-900 text-yellow-300' : 'bg-brand-50 text-gray-900';
  const textHead = highContrast ? 'text-yellow-400' : 'text-gray-900';
  const textSub = highContrast ? 'text-yellow-100' : 'text-gray-600';
  const primaryBtn = highContrast 
    ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
    : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg hover:shadow-xl';
  const secondaryBtn = highContrast
    ? 'border border-yellow-400 text-yellow-400 hover:bg-gray-800'
    : 'bg-white text-brand-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50';
  const cardBg = highContrast ? 'bg-gray-800 border-yellow-600' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50';

  return (
    <div className={`flex flex-col min-h-screen ${bgBase}`}>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-6 ${highContrast ? 'bg-yellow-900 text-yellow-300' : 'bg-brand-100 text-brand-700'}`}>
                <Sparkles size={16} />
                <span>AI-Powered Reading Assistant</span>
              </div>
              <h1 className={`text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight ${textHead}`}>
                Understand Any Document <br/>
                <span className={highContrast ? 'text-yellow-200' : 'text-brand-600'}>In Seconds.</span>
              </h1>
              <p className={`text-lg lg:text-xl mb-8 max-w-2xl mx-auto lg:mx-0 ${textSub}`}>
                Upload complex PDFs, articles, or contracts. We tailor the simplification to your reading level and interests using advanced AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/signup" className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 ${primaryBtn}`}>
                  Get Started Free <ArrowRight size={20} />
                </Link>
                <Link to="/login" className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center transition-all ${secondaryBtn}`}>
                  Existing User?
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm opacity-80">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className={highContrast ? 'text-yellow-400' : 'text-green-500'} />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className={highContrast ? 'text-yellow-400' : 'text-green-500'} />
                  <span>Free tier available</span>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full max-w-xl lg:max-w-none">
              <div className={`relative rounded-2xl overflow-hidden border-4 ${highContrast ? 'border-yellow-600' : 'border-white shadow-2xl'}`}>
                <img 
                  src="https://placehold.co/800x600/0ea5e9/ffffff?text=Dashboard+Preview" 
                  alt="App Screenshot" 
                  className="w-full h-auto object-cover"
                />
                {/* Floating Badge */}
                <div className={`absolute bottom-6 left-6 p-4 rounded-xl flex items-center gap-3 ${highContrast ? 'bg-gray-900 border border-yellow-500' : 'bg-white shadow-lg'}`}>
                  <div className={`p-2 rounded-full ${highContrast ? 'bg-yellow-400 text-black' : 'bg-green-100 text-green-600'}`}>
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Simplification Complete</p>
                    <p className="text-xs opacity-70">Saved 45 mins of reading</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className={`py-12 border-y ${highContrast ? 'border-yellow-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
        <div className="container mx-auto px-4 text-center">
          <p className={`text-sm font-semibold uppercase tracking-wider mb-8 opacity-60 ${textHead}`}>Trusted by readers worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all">
             {/* Mock Logos */}
             {['University', 'TechCorp', 'LawFirm', 'DailyReader'].map(name => (
               <div key={name} className="flex items-center gap-2 font-bold text-xl">
                 <div className="w-8 h-8 rounded bg-current opacity-30"></div>
                 {name}
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={`py-20 lg:py-32 ${bgAlt}`}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className={`text-3xl lg:text-4xl font-bold mb-6 ${textHead}`}>Built for how you read</h2>
            <p className={`text-lg ${textSub}`}>
              Whether you're a student, professional, or just curious, getlitty adapts to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Settings className="w-8 h-8" />}
              title="Personalized Onboarding"
              desc="We ask about your reading level and goals to tailor every summary specifically for you."
              highContrast={highContrast}
              cardBg={cardBg}
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="Instant Simplification"
              desc="Turn 50-page PDFs into concise summaries or simplified text in seconds."
              highContrast={highContrast}
              cardBg={cardBg}
            />
            <FeatureCard 
              icon={<Layout className="w-8 h-8" />}
              title="Side-by-Side View"
              desc="Compare the original text with the simplified version to ensure you never miss a detail."
              highContrast={highContrast}
              cardBg={cardBg}
            />
             <FeatureCard 
              icon={<Users className="w-8 h-8" />}
              title="Dyslexia Friendly"
              desc="Specialized fonts and high-contrast modes designed for neurodiverse readers."
              highContrast={highContrast}
              cardBg={cardBg}
            />
             <FeatureCard 
              icon={<Shield className="w-8 h-8" />}
              title="Private & Secure"
              desc="Your documents are encrypted. We value your privacy and data security above all."
              highContrast={highContrast}
              cardBg={cardBg}
            />
             <FeatureCard 
              icon={<Globe className="w-8 h-8" />}
              title="Multi-Language"
              desc="Upload in English, get summaries in Spanish, French, or German."
              highContrast={highContrast}
              cardBg={cardBg}
            />
          </div>
        </div>
      </section>

      {/* How It Works (Visual) */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className={`text-3xl lg:text-4xl font-bold mb-6 ${textHead}`}>From confused to confident in 3 steps.</h2>
              <div className="space-y-8">
                <Step 
                  number="1" 
                  title="Upload your file" 
                  desc="Drag and drop your PDF, DOCX, or TXT file into the dashboard."
                  highContrast={highContrast}
                />
                <Step 
                  number="2" 
                  title="Customize your view" 
                  desc="Choose your reading level or focus area (e.g., summarize key points)."
                  highContrast={highContrast}
                />
                <Step 
                  number="3" 
                  title="Read & Understand" 
                  desc="Get a simplified version instantly. Toggle fonts or contrast for comfort."
                  highContrast={highContrast}
                />
              </div>
            </div>
            <div className="lg:w-1/2">
               <div className={`p-4 rounded-2xl border-2 border-dashed ${highContrast ? 'border-yellow-600 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                 <img src="https://placehold.co/600x500/f1f5f9/64748b?text=Simplification+Flow" className="rounded-xl w-full shadow-lg" alt="Workflow" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 ${highContrast ? 'bg-yellow-600 text-black' : 'bg-brand-600 text-white'}`}>
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl lg:text-5xl font-bold mb-8">Ready to read smarter?</h2>
          <p className="text-xl mb-10 opacity-90">Join thousands of users who are saving time and understanding more with getlitty.</p>
          <Link 
            to="/signup" 
            className={`inline-block px-10 py-5 rounded-full font-bold text-xl shadow-xl transition-transform hover:scale-105 ${highContrast ? 'bg-black text-yellow-400' : 'bg-white text-brand-600'}`}
          >
            Start Your Free Trial
          </Link>
          <p className="mt-6 text-sm opacity-70">No credit card required • Cancel anytime</p>
        </div>
      </section>

    </div>
  );
};

const FeatureCard = ({ icon, title, desc, highContrast, cardBg }: any) => (
  <div className={`p-8 rounded-xl border transition-all hover:-translate-y-1 ${cardBg}`}>
    <div className={`mb-6 p-3 rounded-lg inline-block ${highContrast ? 'bg-yellow-400 text-black' : 'bg-brand-100 text-brand-600'}`}>
      {icon}
    </div>
    <h3 className={`text-xl font-bold mb-3 ${highContrast ? 'text-yellow-400' : 'text-gray-900'}`}>{title}</h3>
    <p className={highContrast ? 'text-yellow-100' : 'text-gray-600'}>{desc}</p>
  </div>
);

const Step = ({ number, title, desc, highContrast }: any) => (
  <div className="flex gap-4">
    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${highContrast ? 'bg-yellow-400 text-black' : 'bg-brand-600 text-white'}`}>
      {number}
    </div>
    <div>
      <h4 className={`text-xl font-bold mb-1 ${highContrast ? 'text-yellow-400' : 'text-gray-900'}`}>{title}</h4>
      <p className={highContrast ? 'text-yellow-100' : 'text-gray-600'}>{desc}</p>
    </div>
  </div>
);

export default Landing;