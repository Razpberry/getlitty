import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Settings,
  Zap,
  Users,
  Shield,
  Sparkles,
  Layout,
  Globe,
  ArrowDown,
} from 'lucide-react';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import FeatureCard from '../components/FeatureCard';
import Step from '../components/Step';

const AnimatedSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [setElement, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div
      ref={setElement as any}
      className={`animate-fade-in-up ${isVisible ? 'animated' : ''}`}
    >
      {children}
    </div>
  );
};

const HowItWorksVisual = () => (
  <div className="p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
    <div className="space-y-6">
      {/* Step 1: Upload */}
      <div className="p-4 bg-white rounded-lg shadow-md flex items-center gap-4 animate-fade-in-up">
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl">1</div>
        <p className="font-semibold text-gray-700">Upload Your Document.pdf</p>
      </div>
      {/* Arrow */}
      <div className="flex justify-center">
        <ArrowDown className="w-6 h-6 text-gray-400" />
      </div>
      {/* Step 2: Customize */}
      <div className="p-4 bg-white rounded-lg shadow-md flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl">2</div>
        <div className="flex-1">
          <p className="font-semibold text-gray-700">Choose Simplification Level</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
      {/* Arrow */}
      <div className="flex justify-center">
        <ArrowDown className="w-6 h-6 text-gray-400" />
      </div>
      {/* Step 3: Read */}
      <div className="p-4 bg-white rounded-lg shadow-md animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl">3</div>
          <p className="font-semibold text-gray-700">Get Simplified Text</p>
        </div>
        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          The original complex text is now much easier to read and understand. Key points are highlighted...
        </p>
      </div>
    </div>
  </div>
);

const Landing: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-6 bg-green-100 text-green-700">
                <Sparkles size={16} />
                <span>AI-Powered Reading Assistant</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-gray-900">
                Understand Any Document <br/>
                <span className="text-green-600">In Seconds.</span>
              </h1>
              <p className="text-lg lg:text-xl mb-8 max-w-2xl mx-auto lg:mx-0 text-gray-600">
                Upload complex PDFs, articles, or contracts. We tailor the simplification to your reading level and interests using advanced AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/signup" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl">
                  Get Started Free <ArrowRight size={20} />
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center transition-all bg-white text-green-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50">
                  Existing User?
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm opacity-80">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Free tier available</span>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full max-w-xl lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                <img
                  src="https://placehold.co/800x600/e0e7ff/4b5563?text=Simplified+Documents+Dashboard"
                  alt="App Screenshot"
                  className="w-full h-auto object-cover"
                />
                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 p-4 rounded-xl flex items-center gap-3 bg-white shadow-lg">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
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
      <section className="py-12 border-y border-gray-100 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider mb-8 opacity-60 text-gray-900">Trusted by readers worldwide</p>
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
      <section className="py-20 lg:py-32 bg-brand-50 text-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">Built for how you read</h2>
            <p className="text-lg text-gray-600">
              Whether you're a student, professional, or just curious, getlitty adapts to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedSection>
              <FeatureCard
                icon={<Settings className="w-8 h-8" />}
                title="Personalized Onboarding"
                desc="We ask about your reading level and goals to tailor every summary specifically for you."
              />
            </AnimatedSection>
            <AnimatedSection>
              <FeatureCard
                icon={<Zap className="w-8 h-8" />}
                title="Instant Simplification"
                desc="Turn 50-page PDFs into concise summaries or simplified text in seconds."
              />
            </AnimatedSection>
            <AnimatedSection>
              <FeatureCard
                icon={<Layout className="w-8 h-8" />}
                title="Side-by-Side View"
                desc="Compare the original text with the simplified version to ensure you never miss a detail."
              />
            </AnimatedSection>
            <AnimatedSection>
              <FeatureCard
                icon={<Users className="w-8 h-8" />}
                title="Dyslexia Friendly"
                desc="Specialized fonts and high-contrast modes designed for neurodiverse readers."
              />
            </AnimatedSection>
            <AnimatedSection>
              <FeatureCard
                icon={<Shield className="w-8 h-8" />}
                title="Private & Secure"
                desc="Your documents are encrypted. We value your privacy and data security above all."
              />
            </AnimatedSection>
            <AnimatedSection>
              <FeatureCard
                icon={<Globe className="w-8 h-8" />}
                title="Multi-Language"
                desc="Upload in English, get summaries in Spanish, French, or German."
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How It Works (Visual) */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">From confused to confident in 3 steps.</h2>
              <div className="space-y-8">
                <Step
                  number="1"
                  title="Upload your file"
                  desc="Drag and drop your PDF, DOCX, or TXT file into the dashboard."
                />
                <Step
                  number="2"
                  title="Customize your view"
                  desc="Choose your reading level or focus area (e.g., summarize key points)."
                />
                <Step
                  number="3"
                  title="Read & Understand"
                  desc="Get a simplified version instantly. Toggle fonts or contrast for comfort."
                />
              </div>
            </div>
            <div className="lg:w-1/2">
              <AnimatedSection>
                <HowItWorksVisual />
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brand-600 text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl lg:text-5xl font-bold mb-8">Ready to read smarter?</h2>
          <p className="text-xl mb-10 opacity-90">Join thousands of users who are saving time and understanding more with getlitty.</p>
          <Link
            to="/signup"
            className="inline-block px-10 py-5 rounded-full font-bold text-xl shadow-xl transition-transform hover:scale-105 bg-white text-brand-600"
          >
            Start Your Free Trial
          </Link>
          <p className="mt-6 text-sm opacity-70">No credit card required • Cancel anytime</p>
        </div>
      </section>

    </div>
  );
};

export default Landing;