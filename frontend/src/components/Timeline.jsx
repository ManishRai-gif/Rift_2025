import React from 'react';
import { motion } from 'framer-motion';

const primary = '#E10600';

export default function Timeline({ timeline, retryLimit }) {
  if (!timeline || timeline.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">CI/CD Timeline</h2>
        <p className="text-gray-500 text-sm">No timeline entries.</p>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6 mb-8"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">CI/CD Timeline</h2>
      <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
        {timeline.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 + i * 0.05 }}
            className="relative"
          >
            <span
              className="absolute -left-[29px] w-4 h-4 rounded-full border-2 border-white shadow"
              style={{
                backgroundColor: entry.pass ? '#22c55e' : primary,
              }}
            />
            <div className="bg-gray-50/80 rounded-xl p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-gray-800">Iteration {entry.iteration}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    entry.pass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {entry.pass ? 'Pass' : 'Fail'}
                </span>
                <span className="text-gray-500 text-xs">
                  {entry.retryCounter ?? `${entry.iteration}/${retryLimit ?? 5}`}
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                {new Date(entry.timestamp).toLocaleString()}
              </p>
              {entry.error && (
                <p className="text-red-600 text-xs mt-1">{entry.error}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
