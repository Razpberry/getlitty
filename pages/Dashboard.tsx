import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { DocStatus, DocumentItem } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

// Mock Data
const MOCK_DOCS: DocumentItem[] = [
  { id: '1', title: 'History_Essay_Draft_v2.pdf', status: 'Ready', uploadDate: '2023-10-25' },
  { id: '2', title: 'Physics_Notes_Chapter_4.docx', status: 'Pending', uploadDate: '2023-10-26' },
  { id: '3', title: 'Lease_Agreement_2024.pdf', status: 'Needs Review', uploadDate: '2023-10-27' },
];

const Dashboard: React.FC = () => {
  const { highContrast } = useAccessibility();
  const [docs, setDocs] = useState<DocumentItem[]>(MOCK_DOCS);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    // Simulate upload process
    try {
      // 1. In a real app, we might get a signed URL from Supabase here
      // const { data, error } = await supabase.storage.from('docs').createSignedUploadUrl(file.name);
      
      // 2. Upload to backend
      const formData = new FormData();
      formData.append('file', file);
      
      // Mocking the fetch to Flask backend
      // await fetch('/api/upload', { method: 'POST', body: formData });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newDoc: DocumentItem = {
        id: Date.now().toString(),
        title: file.name,
        status: 'Pending',
        uploadDate: new Date().toISOString().split('T')[0]
      };

      setDocs([newDoc, ...docs]);
      
      // Simulate processing finishing
      setTimeout(() => {
        setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'Ready' } : d));
      }, 3000);

    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed (Mock)");
    } finally {
      setUploading(false);
    }
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
              {uploading ? 'Uploading...' : 'Click or Drag file to upload'}
            </p>
            <p className="opacity-60 text-sm">PDF, DOCX, TXT up to 10MB</p>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className={`rounded-xl overflow-hidden shadow-sm border ${highContrast ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
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
                      <span className="font-medium">{doc.title}</span>
                    </div>
                  </td>
                  <td className="p-4 opacity-70">{doc.uploadDate}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${getStatusColor(doc.status)}`}>
                      {doc.status === 'Ready' && <CheckCircle size={12} />}
                      {doc.status === 'Pending' && <Clock size={12} />}
                      {doc.status === 'Needs Review' && <AlertCircle size={12} />}
                      {doc.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {doc.status === 'Ready' && (
                      <Link 
                        to={`/document/${doc.id}`}
                        className={`inline-flex items-center gap-1 text-sm font-semibold hover:underline ${highContrast ? 'text-yellow-400' : 'text-brand-600'}`}
                      >
                        <Eye size={16} /> View
                      </Link>
                    )}
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
      </div>
    </div>
  );
};

export default Dashboard;