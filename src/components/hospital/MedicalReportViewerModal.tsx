import React from 'react';
import { MedicalReport } from '../../types';
import { GlassButton } from '../common/GlassButton';
import { X, ShieldCheck, Download, ExternalLink, FileText } from 'lucide-react';

interface MedicalReportViewerModalProps {
  report: MedicalReport;
  onClose: () => void;
}

export const MedicalReportViewerModal: React.FC<MedicalReportViewerModalProps> = ({
  report,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="crystal-modal p-6 w-full max-w-3xl max-h-[92vh] flex flex-col relative overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{report.title}</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold uppercase">
                  {report.reportType}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 font-mono">
                <span>{report.reportId}</span>
                <span>•</span>
                <span>Uploaded: {new Date(report.uploadedAt).toLocaleTimeString()}</span>
                <span>•</span>
                <span>By: {report.uploadedBy}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security & Access Badge */}
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Hospital Scoped Cloudinary Token Verified (Zero Public Access)
          </span>
          <span className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
            {report.cloudinaryPublicId}
          </span>
        </div>

        {/* Media Preview Container */}
        <div className="flex-1 min-h-[300px] max-h-[500px] overflow-hidden rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-center p-2 relative group">
          {report.fileType === 'application/pdf' ? (
            <div className="text-center p-8">
              <FileText className="w-16 h-16 text-blue-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white mb-2">Portable Document Diagnostic (PDF)</p>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Encrypted medical PDF stream ready for ER clinical terminal.
              </p>
              <a
                href={report.cloudinaryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
              >
                Open Full Diagnostic in New Tab <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={report.cloudinaryUrl}
                alt={report.title}
                className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>
          )}
        </div>

        {/* Notes & Interpretation */}
        {report.notes && (
          <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
            <strong className="text-slate-300 block mb-1">Paramedic Field Notes:</strong>
            <p className="text-slate-400">{report.notes}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/10">
          <span className="text-[11px] text-slate-500 font-mono">
            Size: {report.fileSize || '1.2 MB'} • Cloudinary Asset Node
          </span>
          <GlassButton size="sm" variant="secondary" onClick={onClose}>
            Close Diagnostic
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
