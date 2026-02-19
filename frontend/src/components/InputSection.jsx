import React from 'react';
import { motion } from 'framer-motion';

const primary = '#E10600';

export default function InputSection({ form, setForm, onRun, loading }) {

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    onRun({
      repoUrl: form.repoUrl,
      teamName: form.teamName,
      leaderName: form.leaderName,
      retryLimit: form.retryLimit,
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-8"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Run Agent</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Repo URL</label>
            <input
              type="url"
              value={form.repoUrl}
              onChange={(e) => setForm((f) => ({ ...f, repoUrl: e.target.value }))}
              placeholder="https://github.com/org/repo"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
            <input
              type="text"
              value={form.teamName}
              onChange={(e) => setForm((f) => ({ ...f, teamName: e.target.value }))}
              placeholder="Team Name"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leader Name</label>
            <input
              type="text"
              value={form.leaderName}
              onChange={(e) => setForm((f) => ({ ...f, leaderName: e.target.value }))}
              placeholder="Leader Name"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Retry Limit</label>
            <select
              value={form.retryLimit ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, retryLimit: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
              disabled={loading}
            >
              <option value="">Default (5)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          className="mt-4 px-6 py-3 rounded-xl font-medium text-white transition shadow-md hover:shadow-glass-hover disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: primary }}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full loading-pulse animate-spin" />
              Running agent…
            </span>
          ) : (
            'Run Agent'
          )}
        </motion.button>
      </form>
    </motion.section>
  );
}
