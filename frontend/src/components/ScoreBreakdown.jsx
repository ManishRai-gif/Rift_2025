import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const primary = '#E10600';
const COLORS = [primary, '#22c55e', '#f59e0b', '#6b7280'];

export default function ScoreBreakdown({ score }) {
  if (!score) return null;

  const { base, speedBonus, penalty, final } = score;
  const data = [
    { name: 'Base', value: base, fill: COLORS[0] },
    ...(speedBonus ? [{ name: 'Speed bonus', value: speedBonus, fill: COLORS[1] }] : []),
    ...(penalty !== 0 ? [{ name: 'Penalty', value: Math.abs(penalty), fill: COLORS[2] }] : []),
  ].filter(Boolean);

  const pct = Math.min(100, (final / 120) * 100);

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6 overflow-hidden"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Score</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero score display */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <motion.div
              className="w-40 h-40 rounded-full flex items-center justify-center border-4"
              style={{
                borderColor: primary,
                background: `linear-gradient(135deg, rgba(225,6,0,0.08) 0%, rgba(225,6,0,0.02) 100%)`,
                boxShadow: `0 0 40px rgba(225,6,0,0.2), inset 0 0 20px rgba(225,6,0,0.05)`,
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <motion.span
                className="text-5xl font-bold tabular-nums"
                style={{ color: primary }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {final}
              </motion.span>
            </motion.div>
            <motion.div
              className="absolute -left-2 -right-2 -top-2 -bottom-2 rounded-full border-2 border-dashed opacity-30"
              style={{ borderColor: primary }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <p className="text-gray-500 font-medium mt-3 text-sm uppercase tracking-wider">Final Score</p>
          <div className="w-full max-w-md mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>0</span>
              <span>120</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${primary} 0%, #ff6b6b 100%)`,
                  boxShadow: '0 0 12px rgba(225,6,0,0.4)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, delay: 0.4 }}
              />
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-4">
          <div className="min-h-[180px]">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={data[i].fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-100">
              <span className="text-gray-500 text-xs block">Base</span>
              <span className="text-gray-900 font-bold text-lg">{base}</span>
            </div>
            <div className="rounded-xl bg-green-50 px-4 py-3 border border-green-100">
              <span className="text-green-600 text-xs block">Speed bonus</span>
              <span className="text-green-800 font-bold text-lg">+{speedBonus}</span>
            </div>
            <div className="rounded-xl bg-amber-50 px-4 py-3 border border-amber-100">
              <span className="text-amber-600 text-xs block">Penalty</span>
              <span className="text-amber-800 font-bold text-lg">{penalty}</span>
            </div>
            <div className="rounded-xl px-4 py-3 border-2"
              style={{ borderColor: primary, backgroundColor: 'rgba(225,6,0,0.05)' }}
            >
              <span className="text-gray-500 text-xs block">Final</span>
              <span className="font-bold text-xl" style={{ color: primary }}>{final}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
