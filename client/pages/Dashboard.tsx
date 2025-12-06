import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, Eye, Trash2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { DocStatus, DocumentItem } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

// Mock Data for offline/demo mode
const MOCK_DOCS: DocumentItem[] = [
  { id: '1', name: 'History_Essay_Draft_v2.pdf', status: 'Ready', created_at: '2023-10-25' },
  { id: '2', name: 'Physics_Notes_Chapter_4.docx', status: 'Pending', created_at: '2023-10-26' },
  { id: '3', name: 'Lease_Agreement_2024.pdf', status: 'Needs Review', created_at: '2023-10-27' },
];

const Dashboard: React.FC = () => {
  const { highContrast } = useAccessibility();
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!isSupabaseConfigured() || !user) {
        setDocs(MOCK_DOCS);
        setLoadingDocs(false);
        return;
      }

      try {
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
    };

    fetchDocuments();
    
    // Optional: Realtime subscription could go here
  }, [user]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    
    try {
      if (!isSupabaseConfigured() || !user) {
        // Mock Flow
        await new Promise(resolve => setTimeout(resolve, 1500));
        const newDoc: DocumentItem = {
          id: Date.now().toString(),
          name: file.name,
          status: 'Pending',
          created_at: new Date().toISOString().split('T')[0]
        };
        setDocs([newDoc, ...docs]);
        setTimeout(() => {
          setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'Ready' } : d));
        }, 3000);
        return;
      }

      // Real Flow: Insert into 'documents' table
      // Note: We are mocking the file storage/flask backend part by just creating the DB record
      // In a real scenario, you'd upload to storage, then trigger a function.
      
      const { data, error } = await supabase
        .from('documents')
        .insert([
          { 
            name: file.name, 
            status: 'Pending', 
            user_id: user.id, // Assuming RLS requires this or it's part of the table
            original: "Processing original text...", // Placeholder until backend processes it
            translated: "Processing translation..." 
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setDocs([data, ...docs]);

      // Simulate the "Backend Processing" updating the record after a few seconds
      // This is just to make the UI feel alive since we don't have the Flask backend connected
      setTimeout(async () => {
         const { error: updateError } = await supabase
            .from('documents')
            .update({ 
                status: 'Ready',
                original: `(Simulated content for ${file.name})\n\nThis is the original text extracted from the uploaded file. In a production environment, the Flask backend would process the file buffer and update this column.`,
                translated: `(Simulated Simplification)\n\nThis is the simplified version of the text. The AI has processed the original content and generated this easier-to-read summary based on your preferences.`
            })
            .eq('id', data.id);
         
         if (!updateError) {
             setDocs(prev => prev.map(d => d.id === data.id ? { ...d, status: 'Ready' } : d));
         }
      }, 4000);

    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. See console for details.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if button is inside link (it isn't here, but good practice)
    if (!confirm('Are you sure you want to delete this document?')) return;

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from('documents').delete().eq('id', id);
        if (error) {
            alert('Error deleting document');
            return;
        }
    }
    setDocs(docs.filter(d => d.id !== id));
  };

  const getStatusColor = (status: DocStatus) => {
    switch (status) {
      case 'Ready': return highContrast ? 'text-green-400' : 'text-green-600 bg-green-50';
      case 'Pending': return highContrast ? 'text-yellow-400' : 'text-yellow-600 bg-yellow-50';
      case 'Needs Review': return highContrast ? 'text-red-400' : 'text-red-600 bg-red-50';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Documents</h1>
          <p className="opacity-70">Manage and simplify your reading materials.</p>
        </div>
      </div>

      {/* Upload Area */}
      <div 
        className={`mb-12 border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
          dragActive 
            ? 'border-brand-500 bg-brand-50' 
            : (highContrast ? 'border-gray-600 hover:border-yellow-400' : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50')
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${highContrast ? 'bg-gray-800' : 'bg-brand-100 text-brand-600'}`}>
            <Upload size={32} />
          </div>
          <div>
            <p className="text-xl font-medium mb-1">
              {uploading ? 'Uploading & Processing...' : 'Click or Drag file to upload'}
            </p>
            <p className="opacity-60 text-sm">PDF, DOCX, TXT up to 10MB</p>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className={`rounded-xl overflow-hidden shadow-sm border ${highContrast ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        {loadingDocs ? (
          <div className="p-8 text-center opacity-60">Loading documents...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className={`border-b ${highContrast ? 'border-gray-700 bg-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <tr>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/20">
                {docs.map(doc => (
                  <tr key={doc.id} className={`group ${highContrast ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="opacity-50" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </td>
                    <td className="p-4 opacity-70">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${getStatusColor(doc.status)}`}>
                        {doc.status === 'Ready' && <CheckCircle size={12} />}
                        {doc.status === 'Pending' && <Clock size={12} />}
                        {doc.status === 'Needs Review' && <AlertCircle size={12} />}
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {doc.status === 'Ready' && (
                          <Link 
                            to={`/document/${doc.id}`}
                            className={`inline-flex items-center gap-1 text-sm font-semibold hover:underline ${highContrast ? 'text-yellow-400' : 'text-brand-600'}`}
                          >
                            <Eye size={16} /> View
                          </Link>
                        )}
                        <button 
                            onClick={(e) => handleDelete(doc.id, e)}
                            className="p-1 opacity-20 hover:opacity-100 hover:text-red-500 transition-opacity"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {docs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center opacity-60">No documents uploaded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
