import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const Auth: React.FC = () => {
  const { signIn } = useAuth(); // Context helper
  const navigate = useNavigate();
  const location = useLocation();
  
  const isSignup = location.pathname === '/signup';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        // Mock behavior for demo
        await new Promise(resolve => setTimeout(resolve, 800));
        await signIn(email); // Updates context mock user
        navigate(isSignup ? '/questionnaire' : '/dashboard');
        return;
      }

      if (isSignup) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        // Typically check for email confirmation, but we'll assume auto-confirm or redirect
        // For UX flow, let's auto-login or ask to check email. 
        // For this demo, let's assume we can proceed to login immediately if auto-confirm is on,
        // or show a message.
        navigate('/questionnaire');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded border focus:ring-2 focus:outline-none transition-colors bg-white border-gray-300 focus:ring-green-500 focus:border-green-500';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-white">
        <h2 className="text-3xl font-bold mb-6 text-center">{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2" htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              required 
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded font-bold transition-transform active:scale-95 bg-green-600 text-white hover:bg-green-700 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm opacity-80">
          {isSignup ? (
            <p>Already have an account? <Link to="/login" className="font-bold underline">Log in</Link></p>
          ) : (
            <p>Don't have an account? <Link to="/signup" className="font-bold underline">Sign up</Link></p>
          )}
        </div>
        
        {!isSupabaseConfigured() && (
          <div className="mt-4 text-xs text-center text-gray-400">
            Demo Mode: No backend configured. Enter any credentials.
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;