import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { ArrowLeft, SplitSquareHorizontal, FileText, Maximize2 } from 'lucide-react';

const MOCK_CONTENT = {
  original: `The concept of quantum entanglement posits that particles can become correlated in such a way that the quantum state of each particle cannot be described independently of the state of the others, even when the particles are separated by a large distance. This phenomenon, which Einstein famously referred to as "spooky action at a distance," has been experimentally verified numerous times and forms the basis for emerging technologies such as quantum cryptography and quantum computing.`,
  simplified: `Quantum entanglement is a special connection between tiny particles. Even if these particles are far apart, what happens to one instantly affects the other. Einstein called this "spooky action at a distance." Scientists have proved this is real. We use this idea to build super-fast computers and safe ways to send secret messages.`
};

const DocumentView: React.FC = () => {
  const { id } = useParams();
  const { highContrast, fontSize } = useAccessibility();
  const [activeTab, setActiveTab] = useState<'split' | 'original' | 'simplified'>('split');

  // Adjust text size class based on context
  const contentTextSize = fontSize === 'xlarge' ? 'text-2xl leading-relaxed' : (fontSize === 'large' ? 'text-xl leading-relaxed' : 'text-lg leading-relaxed');

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Toolbar */}
      <div className={`border-b p-4 flex items-center justify-between ${highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 rounded-full hover:bg-gray-500/10">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold truncate max-w-[200px] sm:max-w-md">Document Viewer {id}</h1>
        </div>

        <div className="flex bg-gray-500/10 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('original')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${activeTab === 'original' ? 'bg-white text-brand-600 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
          >
            Original Only
          </button>
          <button 
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${activeTab === 'split' ? 'bg-white text-brand-600 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
          >
            Split View
          </button>
          <button 
            onClick={() => setActiveTab('simplified')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${activeTab === 'simplified' ? 'bg-white text-brand-600 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
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
            <div className={`flex flex-col h-full overflow-hidden ${highContrast ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="p-3 border-b border-gray-200/10 text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                <FileText size={14} /> Original
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <p className={`${contentTextSize} font-serif whitespace-pre-wrap`}>
                  {MOCK_CONTENT.original}
                  {/* Repeat content to show scrolling */}
                  {'\n\n'}{MOCK_CONTENT.original}
                  {'\n\n'}{MOCK_CONTENT.original}
                </p>
              </div>
            </div>
          )}

          {/* Simplified Panel */}
          {(activeTab === 'split' || activeTab === 'simplified') && (
            <div className={`flex flex-col h-full overflow-hidden ${highContrast ? 'bg-black' : 'bg-white'}`}>
              <div className={`p-3 border-b border-gray-200/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${highContrast ? 'text-yellow-400' : 'text-brand-600'}`}>
                <Maximize2 size={14} /> Simplified
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <p className={`${contentTextSize} font-sans whitespace-pre-wrap`}>
                  {MOCK_CONTENT.simplified}
                  {'\n\n'}{MOCK_CONTENT.simplified}
                  {'\n\n'}{MOCK_CONTENT.simplified}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DocumentView;