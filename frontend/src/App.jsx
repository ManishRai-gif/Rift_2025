import React, { useState } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { runAgent, isPrivateRepoError } from './api';
import AnimatedBackground from './components/AnimatedBackground';
import InputSection from './components/InputSection';
import PrivateRepoModal from './components/PrivateRepoModal';
import RunSummaryCard from './components/RunSummaryCard';
import ScoreBreakdown from './components/ScoreBreakdown';
import FixesTable from './components/FixesTable';
import Timeline from './components/Timeline';

function Dashboard() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [privateRepoModal, setPrivateRepoModal] = useState({ open: false, payload: null });
  const [results, setResults] = useState(null);
  const [form, setForm] = useState({ repoUrl: '', teamName: '', leaderName: '', retryLimit: undefined });

  const handleRun = async (payload) => {
    setLoading(true);
    setResults(null);
    try {
      const data = await runAgent(payload);
      setResults(data);
      addToast('Run completed successfully', 'success');
    } catch (err) {
      if (isPrivateRepoError(err)) {
        setPrivateRepoModal({
          open: true,
          payload: {
            repoUrl: payload.repoUrl,
            teamName: payload.teamName,
            leaderName: payload.leaderName,
            retryLimit: payload.retryLimit,
          },
        });
        addToast('Private repo detected. Enter GitHub token.', 'info');
      } else {
        let msg = err.response?.data?.error || err.message || 'Request failed';
        if (err.code === 'ECONNABORTED' || msg.includes('timeout')) {
          msg = 'Request timed out. The run may still be in progress on the server.';
        }
        addToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrivateSubmit = async (githubToken) => {
    if (!privateRepoModal.payload) return;
    setPrivateRepoModal((p) => ({ ...p, open: false }));
    await handleRun({ ...privateRepoModal.payload, githubToken });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 relative">
      <AnimatedBackground />
      <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">Ripple DevOps</h1>
          <p className="text-gray-600 text-sm mt-0.5">Autonomous test fix pipeline</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <InputSection
          form={form}
          setForm={setForm}
          onRun={handleRun}
          loading={loading}
        />

        {results && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left column: Summary + Fixes */}
            <div className="xl:col-span-7 space-y-6">
              <RunSummaryCard results={results} />
              <FixesTable fixes={results.fixes || []} />
            </div>

            {/* Right column: Score + Timeline */}
            <div className="xl:col-span-5 space-y-6">
              <ScoreBreakdown score={results.score} />
              <Timeline timeline={results.timeline || []} retryLimit={results.retryLimit} />
            </div>
          </div>
        )}
      </main>

      <PrivateRepoModal
        open={privateRepoModal.open}
        onClose={() => setPrivateRepoModal((p) => ({ ...p, open: false }))}
        onSubmit={handlePrivateSubmit}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}
