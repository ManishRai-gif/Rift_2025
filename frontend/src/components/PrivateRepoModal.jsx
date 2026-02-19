import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const primary = '#E10600';

export default function PrivateRepoModal({ open, onClose, onSubmit }) {
  const [token, setToken] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(token);
    setToken('');
  };

  return (
    <AnimatePresence>
      {open && (
        <div key="modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Private repository</h3>
            <p className="text-gray-600 text-sm mb-4">
              This repo is private. Enter a GitHub personal access token to continue.
            </p>
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GitHub token (not stored)
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_..."
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none mb-4"
                required
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white transition"
                  style={{ backgroundColor: primary }}
                >
                  Retry with token
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
