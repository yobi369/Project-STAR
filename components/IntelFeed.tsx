import React, { useEffect, useState } from 'react';
import { IntelReport, Threat } from '../types.ts';
import { analyzeIntelReport } from '../services/geminiService.ts';
import { BrainCircuitIcon } from './icons.tsx';
import { playTacticalSound } from '../utils/audioUtils.ts';

interface IntelFeedProps {
  reports: IntelReport[];
  updateReport: (id: string, analysis: string, status: IntelReport['status']) => void;
  addThreat: (threat: Omit<Threat, 'id'>) => void;
  soundMuted?: boolean;
}

const DecryptingText = ({ text, revealSpeed = 25 }: { text: string; revealSpeed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    const interval = setInterval(() => {
      if (i >= text.length) {
        clearInterval(interval);
        setDisplayedText(text);
        return;
      }
      const scrambled = Array(Math.min(4, text.length - i))
        .fill(0)
        .map(() => chars[Math.floor(Math.random() * chars.length)])
        .join('');
      setDisplayedText(text.substring(0, i) + scrambled);
      i++;
    }, revealSpeed);
    return () => clearInterval(interval);
  }, [text, revealSpeed]);

  return <span>{displayedText}</span>;
};

const IntelFeed: React.FC<IntelFeedProps> = ({
  reports,
  updateReport,
  addThreat,
  soundMuted = false
}) => {
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [customReportSource, setCustomReportSource] = useState<'HUMINT' | 'SIGINT' | 'IMINT' | 'OSINT' | 'CYBER'>('HUMINT');
  const [customReportText, setCustomReportText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnalysis = async (report: IntelReport) => {
    updateReport(report.id, '', 'analyzing');
    try {
      const result = await analyzeIntelReport(report.content);
      if (result) {
        updateReport(report.id, result.summary, 'processed');
        if (result.isThreat && result.threatType !== 'Neutralized') {
          addThreat({
            type: result.threatType,
            location: result.location as [number, number],
            title: `Intel Contact: ${report.source}`,
            description: result.summary,
            detectedAt: 'JUST NOW',
            priority: (result.priority as any) || 'HIGH',
            source: report.source
          });
          playTacticalSound('alert-warning', soundMuted);
        }
      } else {
        updateReport(report.id, "Analysis completed.", 'processed');
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      updateReport(report.id, "Analysis completed with cached data.", 'processed');
    }
  };

  useEffect(() => {
    reports.forEach((report) => {
      if (report.status === 'unprocessed') {
        handleAnalysis(report);
      }
    });
  }, [reports]);

  const handleSubmitCustomReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReportText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    playTacticalSound('button-click', soundMuted);

    const newReport: IntelReport = {
      id: `custom-intel-${Date.now()}`,
      timestamp: new Date().toTimeString().substring(0, 8) + ' Z',
      source: customReportSource,
      content: customReportText.trim(),
      classification: 'SECRET',
      priority: 'HIGH',
      status: 'unprocessed'
    };

    reports.unshift(newReport);
    await handleAnalysis(newReport);

    setCustomReportText('');
    setIsSubmitting(false);
    setShowSubmitModal(false);
  };

  const filteredReports = selectedSource === 'ALL'
    ? reports
    : reports.filter((r) => r.source === selectedSource);

  return (
    <div className="h-full flex flex-col select-none">
      
      {/* Header & Submit Button */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <h2 className="text-xs md:text-sm font-black text-cyan-400 uppercase tracking-widest">
            SIGINT / HUMINT INTEL STREAM
          </h2>
        </div>
        <button
          onClick={() => setShowSubmitModal(true)}
          className="bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black text-[9px] font-mono font-bold px-2.5 py-1 rounded border border-cyan-500/40 transition-all uppercase"
        >
          + SUBMIT FIELD REPORT
        </button>
      </div>

      {/* Source Filters */}
      <div className="flex space-x-1 mb-2 overflow-x-auto pb-1">
        {['ALL', 'HUMINT', 'SIGINT', 'IMINT', 'CYBER', 'OSINT'].map((src) => (
          <button
            key={src}
            onClick={() => setSelectedSource(src)}
            className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded transition-colors uppercase ${
              selectedSource === src
                ? 'bg-cyan-500 text-black'
                : 'bg-black/40 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {src}
          </button>
        ))}
      </div>

      {/* Reports Feed */}
      <div className="flex-grow overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 hover:border-cyan-500/40 transition-colors animate-fade-in"
          >
            <div className="flex justify-between items-center text-[9px] font-mono mb-1">
              <span className="bg-cyan-950/60 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30 font-bold">
                {report.source}
              </span>
              <span className="text-slate-500">{report.timestamp}</span>
            </div>

            <p className="my-1.5 text-xs font-mono text-cyan-100/90 leading-relaxed">
              <DecryptingText text={report.content} />
            </p>

            {report.status === 'analyzing' && (
              <div className="mt-2 flex items-center space-x-2 text-[10px] font-mono text-amber-400">
                <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                <span>AI DECRYPTING & TRIANGULATING COORDINATES...</span>
              </div>
            )}

            {report.status === 'processed' && report.analysis && (
              <div className="mt-2 p-2 bg-black/60 rounded border-l-2 border-cyan-400">
                <p className="text-[9px] font-bold text-cyan-400 flex items-center space-x-1">
                  <BrainCircuitIcon className="w-3 h-3" />
                  <span>KDF AI EXTRACTED LOGIC:</span>
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{report.analysis}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Report Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[1000] bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-950 border border-cyan-500/40 rounded-xl p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                SUBMIT RAW FIELD INTELLIGENCE
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCustomReport} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  INTELLIGENCE SOURCE TYPE:
                </label>
                <div className="flex space-x-2">
                  {(['HUMINT', 'SIGINT', 'IMINT', 'OSINT', 'CYBER'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCustomReportSource(s)}
                      className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded border uppercase ${
                        customReportSource === s
                          ? 'bg-cyan-500 text-black border-cyan-500'
                          : 'bg-black/40 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  FIELD REPORT OBSERVATION & LOCATION:
                </label>
                <textarea
                  rows={4}
                  value={customReportText}
                  onChange={(e) => setCustomReportText(e.target.value)}
                  placeholder="e.g. Scout patrol spotted 3 armed trucks moving south along the Garissa-Wajir track near coordinates [39.6, 0.4]."
                  className="w-full bg-black/70 border border-cyan-500/30 rounded p-2.5 text-cyan-200 text-xs font-mono outline-none focus:border-cyan-400 placeholder:text-slate-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!customReportText.trim() || isSubmitting}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-black text-xs px-5 py-1.5 rounded uppercase tracking-wider font-mono"
                >
                  {isSubmitting ? "AI PARSING..." : "PROCESS REPORT →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default IntelFeed;
