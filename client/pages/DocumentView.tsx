import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { ArrowLeft, FileText, Maximize2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import { DocumentItem } from '../types';

const MOCK_CONTENT = {
  original: `The concept of quantum entanglement posits that particles can become correlated in such a way that the quantum state of each particle cannot be described independently of the state of the others, even when the particles are separated by a large distance. This phenomenon, which Einstein famously referred to as "spooky action at a distance," has been experimentally verified numerous times and forms the basis for emerging technologies such as quantum cryptography and quantum computing.`,
  simplified: `Quantum entanglement is a special connection between tiny particles. Even if these particles are far apart, what happens to one instantly affects the other. Einstein called this "spooky action at a distance." Scientists have proved this is real. We use this idea to build super-fast computers and safe ways to send secret messages.`
};

const DocumentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fontSize } = useAccessibility();
  const [activeTab, setActiveTab] = useState<'split' | 'original' | 'simplified'>('split');
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;
      setLoading(true);

      if (!isSupabaseConfigured()) {
        // Return mock data
        setDoc({
            id,
            name: 'Mock Document',
            status: 'Ready',
            created_at: new Date().toISOString(),
            original: MOCK_CONTENT.original,
            translated: MOCK_CONTENT.simplified
        });
        setLoading(false);
        return;
      }

      try {
        // Explicitly select columns matching the schema provided: original, translated, created_at, name, status
        const { data, error } = await supabase
          .from('documents')
          .select('id, name, status, created_at, original, translated')
          .eq('id', id)
          .single();

        if (error) throw error;
        setDoc(data);
      } catch (err: any) {
        console.error('Error fetching document:', err);
        setError('Could not load document.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  // Adjust text size class based on context
  const contentTextSize = fontSize === 'xlarge' ? 'text-2xl leading-relaxed' : (fontSize === 'large' ? 'text-xl leading-relaxed' : 'text-lg leading-relaxed');

  if (loading) {
      return (
          <div className="flex h-[calc(100vh-64px)] items-center justify-center">
              <div className="text-lg font-medium opacity-60">Loading content...</div>
          </div>
      );
  }

  if (error || !doc) {
      return (
        <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
            <div className="text-red-500 font-bold">{error || 'Document not found'}</div>
            <Link to="/dashboard" className="text-brand-600 hover:underline">Return to Dashboard</Link>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Toolbar */}
      <div className="border-b p-4 flex items-center justify-between bg-white border-gray-200">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 rounded-full hover:bg-gray-500/10">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold truncate max-w-[200px] sm:max-w-md text-lg leading-tight">{doc.name}</h1>
            <div className="flex items-center gap-3 text-xs opacity-70 mt-1">
               <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                  doc.status === 'Ready' ? 'bg-green-100 text-green-700' : 
                  doc.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-red-100 text-red-700'
               }`}>
                 {doc.status === 'Ready' && <CheckCircle size={10} />}
                 {doc.status === 'Pending' && <Clock size={10} />}
                 {doc.status === 'Needs Review' && <AlertCircle size={10} />}
                 {doc.status}
               </span>
               <span>{new Date(doc.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex bg-gray-500/10 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('original')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${activeTab === 'original' ? 'bg-white text-green-600 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
          >
            Original Only
          </button>
          <button 
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${activeTab === 'split' ? 'bg-white text-green-600 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
          >
            Split View
          </button>
          <button 
            onClick={() => setActiveTab('simplified')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${activeTab === 'simplified' ? 'bg-white text-green-600 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
          >
            Simplified
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <div className={`h-full grid ${activeTab === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} divide-x divide-gray-200/20`}>
          
          {/* Original Panel */}
          {(activeTab === 'split' || activeTab === 'original') && (
            <div className="flex flex-col h-full overflow-hidden bg-gray-50">
              <div className="p-3 border-b border-gray-200/10 text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                <FileText size={14} /> Original
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <p className={`${contentTextSize} font-serif whitespace-pre-wrap`}>
                  {doc.original || '(No original content available)'}
                </p>
              </div>
            </div>
          )}

          {/* Simplified Panel */}
          {(activeTab === 'split' || activeTab === 'simplified') && (
            <div className="flex flex-col h-full overflow-hidden bg-white">
              <div className="p-3 border-b border-gray-200/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-brand-600">
                <Maximize2 size={14} /> Simplified
              </div>
              <div className="flex-1 overflow-y-auto p-6 prose prose-lg max-w-none">
                <ReactMarkdown className={`${contentTextSize} font-sans`} rehypePlugins={[rehypeRaw]}>
                  {doc.translated || '(Simplification pending...)'}
                </ReactMarkdown>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DocumentView;