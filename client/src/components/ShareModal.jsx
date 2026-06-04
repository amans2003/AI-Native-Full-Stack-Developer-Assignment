import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, UserPlus, Check, AlertCircle, Loader2 } from 'lucide-react';

export const ShareModal = ({ isOpen, onClose, docId, owner, sharedWith = [], onShareSuccess }) => {
  const [users, setUsers] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess(false);
      setSelectedEmail('');
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await api.getUsersList();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch user list:', err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!selectedEmail) return;

    setError('');
    setSuccess(false);
    setSharing(true);

    try {
      const updatedDoc = await api.shareDocument(docId, selectedEmail);
      setSuccess(true);
      setSelectedEmail('');
      if (onShareSuccess) {
        onShareSuccess(updatedDoc);
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to share document');
    } finally {
      setSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-400" />
            <span>Share Document</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status alerts */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 p-4 text-sm text-emerald-400">
              <Check className="h-5 w-5 shrink-0" />
              <span>Document shared successfully!</span>
            </div>
          )}

          {/* Share form */}
          <form onSubmit={handleShare} className="space-y-2">
            <label className="block text-sm font-semibold text-slate-350">
              Select user to share with
            </label>
            <div className="flex gap-2">
              <select
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
                required
                className="block flex-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-2.5"
              >
                <option value="">-- Choose User --</option>
                {loadingUsers ? (
                  <option disabled>Loading users...</option>
                ) : (
                  users
                    .filter(u => u.email !== owner?.email) // exclude owner
                    .map(u => (
                      <option key={u._id} value={u.email}>
                        {u.name ? `${u.name} (${u.email})` : u.email}
                      </option>
                    ))
                )}
              </select>

              <button
                type="submit"
                disabled={sharing || !selectedEmail}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                {sharing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Share</span>
                )}
              </button>
            </div>
          </form>

          {/* Members list */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Who has access
            </h4>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {/* Owner */}
              <div className="flex items-center justify-between rounded-lg bg-slate-900/40 border border-slate-800 px-3.5 py-2 text-sm">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200">{owner?.name || 'Owner'}</span>
                  <span className="text-xs text-slate-500">{owner?.email}</span>
                </div>
                <span className="text-xs font-medium text-slate-550 border border-slate-800 bg-slate-900 px-2 py-0.5 rounded">
                  Owner
                </span>
              </div>

              {/* Shared users */}
              {sharedWith.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  Not shared with any other users yet.
                </p>
              ) : (
                sharedWith.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between rounded-lg bg-slate-900/40 border border-slate-800 px-3.5 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-200">{user.name || user.email.split('@')[0]}</span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400 border border-slate-800 bg-slate-900 px-2 py-0.5 rounded">
                      Can Edit
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default ShareModal;
