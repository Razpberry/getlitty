import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, Eye, Trash2, Search, CheckSquare, Square } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';
// Assuming these are defined in your project, otherwise replace with local types
import { DocStatus, DocumentItem } from '../types'; 
import NoDocuments from '../components/illustrations/NoDocuments';

// Mock Data for offline/demo mode
const MOCK_DOCS: DocumentItem[] = [
  { id: '1', name: 'History_Essay_Draft_v2.pdf', status: 'Ready', created_at: '2023-10-25', original: '', translated: '' },
  { id: '2', name: 'Physics_Notes_Chapter_4.docx', status: 'Pending', created_at: '2023-10-26', original: '', translated: '' },
  { id: '3', name: 'Lease_Agreement_2024.pdf', status: 'Needs Review', created_at: '2023-10-27', original: '', translated: '' },
  { id: '4', name: 'Philosophy_Reading.txt', status: 'Ready', created_at: '2023-10-28', original: '', translated: '' },
  { id: '5', name: 'Lab_Report_Final.docx', status: 'Ready', created_at: '2023-10-29', original: '', translated: '' },
];

const Dashboard: React.FC = () => {
  // 1. Fixed: Destructure session to use access_token later
  const { user, session } = useAuth();
  
  // 2. Fixed: Added missing state variables
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | DocStatus>('All');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  
  // Store the prompt fetched from profiles table
  const [userPrompt, setUserPrompt] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Documents Logic
  const fetchDocuments = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) {
      setDocs(MOCK_DOCS);
      setLoadingDocs(false);
      return;
    }
    try {
      setLoadingDocs(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDocs(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  }, [user]);

  // Fetch User Profile Details (Prompt)
  useEffect(() => {
    const fetchUserPrompt = async () => {
      if (!user || !isSupabaseConfigured()) return;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('details')
          .eq('id', user.id)
          .single();
        
        if (data && data.details) {
          setUserPrompt(data.details);
        }
      } catch (error) {
        console.error('Error fetching user profile prompt:', error);
      }
    };
    
    fetchUserPrompt();
  }, [user]);

  // Initial Fetch
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleFileUpload = async (file: File) => {
    const tempId = `temp-${Date.now()}`;
    const tempDoc: DocumentItem = {
      id: tempId,
      name: file.name,
      status: 'Pending',
      created_at: new Date().toISOString(),
      original: '',
      translated: ''
    };
    setDocs(prev => [tempDoc, ...prev]);
    
    try {
      if (!isSupabaseConfigured() || !user) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setDocs(prev => prev.map(d => d.id === tempId ? { ...d, id: Date.now().toString(), status: 'Ready' } : d));
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', userPrompt);

      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        // 3. Fixed: Uses session from useAuth destructuring
        headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {},
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      
      // Refresh list to get new document from db
      await fetchDocuments();
    } catch (err) {
      console.error("Upload failed", err);
      setDocs(prev => prev.map(d => d.id === tempId ? { ...d, status: 'Needs Review', name: `${file.name} (Failed)` } : d));
    }
  };
  
  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} document(s)?`)) return;

    // Optimistic UI update
    setDocs(prev => prev.filter(d => !ids.includes(d.id)));

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('documents').delete().in('id', ids);
      if (error) {
        alert('Error deleting document(s)');
        fetchDocuments(); // Revert
      }
    }
    
    if (selectMode) {
        setSelectedDocs(new Set());
        setSelectMode(false);
    }
  };

  const filteredDocs = useMemo(() => {
    return docs.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || doc.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [docs, searchTerm, filterStatus]);

  const handleSelectDoc = (id: string) => {
    if (!selectMode) return;
    const newSelection = new Set(selectedDocs);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedDocs(newSelection);
  };
  
  const toggleSelectAll = () => {
    if (selectedDocs.size === filteredDocs.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(filteredDocs.map(d => d.id)));
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
          <p className="text-gray-500 mt-1">Manage and simplify your reading materials.</p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`relative mb-12 border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 cursor-pointer group ${
          dragActive
            ? 'border-brand-500 bg-brand-50'
            : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
        <div className="flex flex-col items-center gap-4 text-gray-600">
          <div className="p-4 rounded-full bg-gray-100 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
            <Upload size={32} />
          </div>
          <div>
            <p className="font-semibold text-lg mb-1">Click or Drag file to upload</p>
            <p className="text-gray-500 text-sm">PDF, DOCX, TXT up to 10MB</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <FilterButton status="All" current={filterStatus} onClick={setFilterStatus} />
            <FilterButton status="Ready" current={filterStatus} onClick={setFilterStatus} />
            <FilterButton status="Pending" current={filterStatus} onClick={setFilterStatus} />
            <FilterButton status="Needs Review" current={filterStatus} onClick={setFilterStatus} />
        </div>
        <div className="flex items-center gap-2">
            {/* 4. Fixed: Added toggle logic for Select All */}
            {selectMode && (
              <button
                onClick={toggleSelectAll}
                className="p-2 rounded-lg hover:bg-gray-200 text-gray-600"
                title="Select All"
              >
                {selectedDocs.size === filteredDocs.length && filteredDocs.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
            )}
            <button
              onClick={() => {
                setSelectMode(!selectMode);
                setSelectedDocs(new Set());
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors ${
                selectMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {selectMode ? 'Cancel' : 'Select'}
            </button>
            {selectMode && selectedDocs.size > 0 && (
              <button
                onClick={() => handleDelete(Array.from(selectedDocs))}
                className="px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 bg-red-500 text-white hover:bg-red-600"
              >
                <Trash2 size={16} /> Delete ({selectedDocs.size})
              </button>
            )}
        </div>
      </div>
      
      {/* Document Grid */}
      {loadingDocs ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocs.map((doc, i) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onDelete={() => handleDelete([doc.id])}
              onSelect={() => handleSelectDoc(doc.id)}
              isSelected={selectedDocs.has(doc.id)}
              selectMode={selectMode}
              style={{ animationDelay: `${i * 50}ms` }}
              className="card-fade-in"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 sm:py-20 border-2 border-dashed border-gray-300 rounded-xl">
            {/* Ensure NoDocuments component exists or remove */}
            <NoDocuments className="w-48 h-48 mx-auto text-gray-400" />
            <h3 className="mt-6 text-xl font-semibold text-gray-800">No documents here yet.</h3>
            <p className="mt-2 text-base text-gray-500">
                {searchTerm ? `Try adjusting your search or filter.` : `Upload a document to get started!`}
            </p>
            {!searchTerm && (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-brand-600 rounded-lg shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                >
                    <Upload size={20} />
                    Upload Document
                </button>
            )}
        </div>
      )}
    </div>
  );
};

// -- Components --

// 5. Fixed: Explicit type definition for FilterButton props
interface FilterButtonProps {
    status: 'All' | DocStatus;
    current: string;
    onClick: (status: 'All' | DocStatus) => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ status, current, onClick }) => {
    const isActive = status === current;
    const colors: Record<string, string> = {
        'All': 'hover:bg-gray-200 text-gray-600',
        'Ready': 'hover:bg-green-100 text-green-700',
        'Pending': 'hover:bg-yellow-100 text-yellow-700',
        'Needs Review': 'hover:bg-red-100 text-red-700',
    };
    const activeColors: Record<string, string> = {
        'All': 'bg-gray-800 text-white',
        'Ready': 'bg-green-100 text-green-800 border border-green-200',
        'Pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        'Needs Review': 'bg-red-100 text-red-800 border border-red-200',
    };
    return (
        <button
            onClick={() => onClick(status)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${isActive ? activeColors[status] : colors[status]}`}
        >
            {status}
        </button>
    );
}

const DocumentCard: React.FC<{
  doc: DocumentItem;
  onDelete: () => void;
  onSelect: () => void;
  isSelected: boolean;
  selectMode: boolean;
  style?: React.CSSProperties;
  className?: string;
}> = ({ doc, onDelete, onSelect, isSelected, selectMode, style, className }) => {
  const getStatusInfo = (status: DocStatus): { color: string; icon: React.ReactNode } => {
    switch (status) {
      case 'Ready': return { color: 'border-green-500', icon: <CheckCircle className="text-green-500" size={18} /> };
      case 'Pending': return { color: 'border-yellow-500', icon: <Clock className="text-yellow-500" size={18} /> };
      case 'Needs Review': return { color: 'border-red-500', icon: <AlertCircle className="text-red-500" size={18} /> };
      default: return { color: 'border-gray-300', icon: <FileText className="text-gray-400" size={18} /> };
    }
  };

  const { color, icon } = getStatusInfo(doc.status);

  return (
    <div
      onClick={onSelect}
      style={style}
      className={`relative group bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden ${
        selectMode ? 'border-gray-300' : 'hover:-translate-y-1'
      } ${isSelected ? 'ring-2 ring-brand-500 border-transparent' : ''} ${className}`}
    >
      {selectMode && (
         <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all z-10 ${isSelected ? 'bg-brand-600 border-brand-600' : 'bg-white border-gray-400'}`}>
            {isSelected && <CheckCircle className="text-white" size={14} />}
        </div>
      )}
      <div className={`p-4 border-l-4 ${color} h-full flex flex-col`}>
        <div className="flex justify-between items-start mb-2">
            <div className='flex items-start gap-3 w-full'>
                 <div className="mt-0.5 flex-shrink-0">{icon}</div>
                 <h3 className="font-semibold text-gray-800 line-clamp-2 pr-6 leading-tight break-all">{doc.name}</h3>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!selectMode && (
                     <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1.5 rounded-full hover:bg-red-100 hover:text-red-600 text-gray-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                )}
            </div>
        </div>

        <div className="mt-auto pt-4 flex justify-between items-center text-xs text-gray-500">
            <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Just now'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border bg-gray-50`}>
                {doc.status}
            </span>
        </div>
        {doc.status === 'Ready' && (
            <Link
                to={`/document/${doc.id}`}
                onClick={(e) => { if (selectMode) e.preventDefault(); }} 
                className={`mt-3 w-full text-center py-1.5 rounded text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors ${selectMode ? 'opacity-50 pointer-events-none' : ''}`}
              >
                View Document
            </Link>
        )}
      </div>
    </div>
  );
};

const SkeletonCard: React.FC = () => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-48">
            <div className="animate-pulse flex flex-col h-full">
                <div className="flex space-x-3 mb-4">
                    <div className="rounded-full bg-gray-200 h-6 w-6"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="space-y-3 flex-grow">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="flex justify-between mt-4">
                     <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                     <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;