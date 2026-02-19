import React from 'react';
import { motion } from 'framer-motion';

const primary = '#E10600';

export default function RunSummaryCard({ results }) {
  const passed = results.status === 'PASSED';

  const cols = [
    { label: 'Repo URL', value: results.repoUrl, link: true },
    { label: 'Team', value: results.teamName },
    { label: 'Leader', value: results.leaderName },
    { label: 'Branch', value: results.branch, mono: true },
    { label: 'Failures', value: results.totalFailures, highlight: true },
    { label: 'Fixes', value: results.totalFixes, highlight: true },
    { label: 'Time', value: results.timeTaken },
    { label: 'Status', value: results.status, badge: true, passed },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Run Summary</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {cols.map((c, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">{c.label}</span>
            {c.link ? (
              <a
                href={results.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate font-medium mt-0.5"
              >
                {c.value}
              </a>
            ) : c.badge ? (
              <span
                className={`inline-flex w-fit mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  c.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {c.value}
              </span>
            ) : (
              <span className={`font-medium mt-0.5 ${c.mono ? 'font-mono text-gray-800' : ''} ${c.highlight ? 'text-primary' : 'text-gray-900'}`}>
                {c.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
