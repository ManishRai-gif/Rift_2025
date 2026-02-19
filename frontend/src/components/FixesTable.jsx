import React from 'react';
import { motion } from 'framer-motion';

export default function FixesTable({ fixes }) {
  if (!fixes || fixes.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fixes</h2>
        <p className="text-gray-500 text-sm">No fixes recorded for this run.</p>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6 mb-8 overflow-hidden"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Fixes</h2>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-600">
              <th className="pb-2 pr-4">File</th>
              <th className="pb-2 pr-4">Bug Type</th>
              <th className="pb-2 pr-4">Line</th>
              <th className="pb-2 pr-4">Commit Message</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {fixes.map((fix, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition"
              >
                <td className="py-3 pr-4 font-mono text-gray-800">{fix.file}</td>
                <td className="py-3 pr-4 text-gray-700">{fix.bugType}</td>
                <td className="py-3 pr-4 text-gray-600">{fix.line ?? '—'}</td>
                <td className="py-3 pr-4 text-gray-600 max-w-xs truncate" title={fix.commitMessage}>
                  {fix.commitMessage}
                </td>
                <td className="py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      fix.status === 'Fixed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {fix.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
