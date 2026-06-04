import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Plus,
  Upload,
  LogOut,
  FileText,
  Users,
  Search,
  Trash2,
  Calendar,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';

export const Dashboard = () => {
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  const fileInputRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.getDocuments();
      setOwnedDocs(data.owned || []);
      setSharedDocs(data.shared || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleCreateDocument = async () => {
    try {
      const newDoc = await api.createDocument('Untitled Document', '');
      navigate(`/documents/${newDoc._id}`);
    } catch (err) {
      setError(err.message || 'Failed to create document');
    }
  };

  const handleDeleteDocument = async (id, e) => {
    e.stopPropagation(); // Prevent clicking row/card from opening document
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    try {
      await api.deleteDocument(id);
      // Remove from owned lists locally
      setOwnedDocs(ownedDocs.filter(doc => doc._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete document');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setValidationError('');
    setError('');

    // Check client-side validation
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (fileExtension !== '.txt' && fileExtension !== '.md') {
      setValidationError('Unsupported file format. Only .txt and .md files are supported.');
      e.target.value = ''; // Reset input
      return;
    }

    setUploading(true);
    try {
      const newDoc = await api.uploadDocument(file);
      navigate(`/documents/${newDoc._id}`);
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter documents by search query
  const filteredOwnedDocs = ownedDocs.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSharedDocs = sharedDocs.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-12">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">MiniDocs</h1>
            <p className="text-xs text-slate-400">Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="text-sm font-semibold text-slate-200">{user?.name}</span>
            <span className="text-xs text-slate-400">{user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Area */}
      <main className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Banner Action Section */}
        <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/30 border border-indigo-500/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.name || 'User'}!</h2>
            <p className="text-slate-300 max-w-lg text-sm md:text-base leading-relaxed">
              Create a document, upload text or markdown documents, and share them instantly with other accounts.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCreateDocument}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus className="h-5 w-5" />
              <span>Create New Document</span>
            </button>
            <button
              onClick={triggerFileSelect}
              disabled={uploading}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-5 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
              <span>{uploading ? 'Uploading...' : 'Upload File (.txt, .md)'}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md"
              className="hidden"
            />
          </div>
        </div>

        {/* Validation Errors & API Errors */}
        {(error || validationError) && (
          <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              {validationError && <p className="font-semibold">{validationError}</p>}
              {error && <p>{error}</p>}
            </div>
            <button 
              onClick={() => { setError(''); setValidationError(''); }}
              className="text-xs font-semibold text-red-400 hover:text-red-300 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search controls */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search documents by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
          />
        </div>

        {/* Lists Container */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            
            {/* My Documents Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  <span>My Documents</span>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-normal">
                    {filteredOwnedDocs.length}
                  </span>
                </h3>
              </div>

              {filteredOwnedDocs.length === 0 ? (
                <div className="border-2 border-dashed border-slate-850 rounded-2xl p-12 text-center text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-slate-650" />
                  <p className="font-semibold text-slate-400">No documents owned</p>
                  <p className="text-xs mt-1 text-slate-500 max-w-xs mx-auto">
                    Create a new document or upload a file using the actions above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOwnedDocs.map((doc) => (
                    <div
                      key={doc._id}
                      onClick={() => navigate(`/documents/${doc._id}`)}
                      className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between h-40 cursor-pointer transition-all shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white text-base truncate group-hover:text-indigo-400 transition-colors">
                            {doc.title}
                          </h4>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                            Owner
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed" 
                           dangerouslySetInnerHTML={{ __html: doc.content ? doc.content.replace(/<[^>]*>/g, '') : 'Empty document' }}>
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-850 pt-3 text-slate-500 text-xs">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(doc.updatedAt)}</span>
                        </span>
                        
                        <button
                          onClick={(e) => handleDeleteDocument(doc._id, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                          title="Delete Document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Shared With Me Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                <span>Shared With Me</span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-normal">
                  {filteredSharedDocs.length}
                </span>
              </h3>

              {filteredSharedDocs.length === 0 ? (
                <div className="border-2 border-dashed border-slate-850 rounded-2xl p-12 text-center text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-slate-650" />
                  <p className="font-semibold text-slate-400">No shared documents</p>
                  <p className="text-xs mt-1 text-slate-500 max-w-xs mx-auto">
                    When another user shares a document with you, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSharedDocs.map((doc) => (
                    <div
                      key={doc._id}
                      onClick={() => navigate(`/documents/${doc._id}`)}
                      className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between h-40 cursor-pointer transition-all shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white text-base truncate group-hover:text-emerald-450 transition-colors">
                            {doc.title}
                          </h4>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                            Shared
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed"
                           dangerouslySetInnerHTML={{ __html: doc.content ? doc.content.replace(/<[^>]*>/g, '') : 'Empty document' }}>
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-850 pt-3 text-slate-500 text-xs">
                        <span className="flex items-center gap-1.5 truncate max-w-[70%]">
                          <span className="shrink-0 text-slate-400 font-medium">From:</span>
                          <span className="truncate text-slate-350" title={doc.owner?.email}>{doc.owner?.email}</span>
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(doc.updatedAt)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  );
};
export default Dashboard;
