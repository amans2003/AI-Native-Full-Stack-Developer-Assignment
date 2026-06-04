import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ShareModal from '../components/ShareModal';
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Save,
  Share2,
  Trash2,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';

export const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saved', 'Saving...', 'Save failed'
  const [isShareOpen, setIsShareOpen] = useState(false);

  const saveTimeoutRef = useRef(null);
  const titleRef = useRef('');
  const hasSetContent = useRef(false);

  // Sync title ref to avoid stale closure in TipTap callbacks
  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  // Initialize document
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const data = await api.getDocumentById(id);
        setDocument(data);
        setTitle(data.title);
      } catch (err) {
        setError(err.message || 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Underline.configure(),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // Content has changed -> trigger autosave
      triggerAutosave(titleRef.current, editor.getHTML());
    },
  }, []); // Run exactly once

  // Set editor content once document loads
  useEffect(() => {
    if (editor && document && !editor.isDestroyed && !hasSetContent.current) {
      editor.commands.setContent(document.content || '');
      hasSetContent.current = true;
    }
  }, [editor, document]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Autosave execution
  const saveDocumentDetails = async (currentTitle, currentContent) => {
    try {
      setSaveStatus('Saving...');
      await api.updateDocument(id, {
        title: currentTitle,
        content: currentContent,
      });
      setSaveStatus('Saved');
    } catch (err) {
      console.error('Autosave failed:', err.message);
      setSaveStatus('Save failed');
    }
  };

  const triggerAutosave = (updatedTitle, updatedContent) => {
    setSaveStatus('Saving...');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveDocumentDetails(updatedTitle, updatedContent);
    }, 3000); // Save after 3 seconds of inactivity
  };

  // Immediate manual save
  const handleManualSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const currentContent = editor ? editor.getHTML() : (document?.content || '');
    await saveDocumentDetails(title, currentContent);
  };

  // Handle title rename
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Trigger save
    const currentContent = editor ? editor.getHTML() : (document?.content || '');
    triggerAutosave(newTitle, currentContent);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    try {
      await api.deleteDocument(id);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to delete document');
    }
  };

  const handleShareSuccess = (updatedDoc) => {
    setDocument(updatedDoc);
  };

  // Error view
  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 px-4 text-slate-100">
        <div className="max-w-md w-full text-center space-y-4 bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Access Denied / Error</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-md shadow-indigo-600/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  // Loading view
  if (loading || !document) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center space-y-4 text-slate-200">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
          <p className="text-sm font-semibold">Loading document...</p>
        </div>
      </div>
    );
  }

  const isOwner = document.owner._id === user?.id;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Editor Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <button
            onClick={() => {
              // Ensure immediate save before exiting
              handleManualSave();
              navigate('/');
            }}
            className="p-2 rounded-lg text-slate-450 hover:bg-slate-800 hover:text-white transition-all shrink-0 border border-slate-800"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="bg-transparent text-white font-bold text-lg md:text-xl border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none w-full py-0.5 px-1 rounded transition-colors"
              placeholder="Untitled Document"
            />
          </div>
        </div>

        {/* Action controls & Autosave statuses */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 border border-slate-700/50">
            {saveStatus === 'Saving...' && (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                <span className="text-amber-400">Saving...</span>
              </>
            )}
            {saveStatus === 'Saved' && (
              <>
                <Check className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-400">Saved</span>
              </>
            )}
            {saveStatus === 'Save failed' && (
              <>
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span className="text-red-400">Save failed</span>
              </>
            )}
          </div>

          <button
            onClick={handleManualSave}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
            title="Save Now"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {isOwner ? (
            <>
              <button
                onClick={() => setIsShareOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-md shadow-indigo-600/10"
                title="Share Document"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 border border-slate-700 hover:border-red-500/20 transition-all"
                title="Delete Document"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </>
          ) : (
            <div className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-lg border border-slate-750 bg-slate-800/40 text-slate-400">
              Read & Edit Access
            </div>
          )}
        </div>
      </header>

      {/* Editor Formatting Toolbar */}
      {editor && (
        <div className="border-b border-slate-800 bg-slate-900/50 py-2 px-6 flex flex-wrap items-center gap-1 shadow-sm sticky top-[61px] z-10">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-slate-800 transition-all ${
              editor.isActive('bold') ? 'bg-indigo-600 text-white hover:bg-indigo-600' : 'text-slate-400'
            }`}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-slate-800 transition-all ${
              editor.isActive('italic') ? 'bg-indigo-600 text-white hover:bg-indigo-600' : 'text-slate-400'
            }`}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-slate-800 transition-all ${
              editor.isActive('underline') ? 'bg-indigo-600 text-white hover:bg-indigo-600' : 'text-slate-400'
            }`}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1"></div>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-slate-800 transition-all ${
              editor.isActive('heading', { level: 1 }) ? 'bg-indigo-600 text-white hover:bg-indigo-600' : 'text-slate-400'
            }`}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-slate-800 transition-all ${
              editor.isActive('heading', { level: 2 }) ? 'bg-indigo-600 text-white hover:bg-indigo-600' : 'text-slate-400'
            }`}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1"></div>

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-slate-800 transition-all ${
              editor.isActive('bulletList') ? 'bg-indigo-600 text-white hover:bg-indigo-600' : 'text-slate-400'
            }`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-slate-800 transition-all ${
              editor.isActive('orderedList') ? 'bg-indigo-600 text-white hover:bg-indigo-600' : 'text-slate-400'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Editor Body Canvas */}
      <div className="flex-1 overflow-y-auto px-6 py-8 flex justify-center bg-slate-950/60">
        <div className="w-full max-w-4xl bg-white text-gray-900 rounded-2xl paper-shadow min-h-[700px] border border-slate-200">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Sharing Dialogue Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        docId={id}
        owner={document.owner}
        sharedWith={document.sharedWith}
        onShareSuccess={handleShareSuccess}
      />
    </div>
  );
};
export default Editor;
