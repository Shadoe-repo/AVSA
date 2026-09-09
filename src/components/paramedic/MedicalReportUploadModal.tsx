import React, { useState } from 'react';
import { ReportType, MedicalReport } from '../../types';
import { GlassButton } from '../common/GlassButton';
import { uploadMedicalReportToCloudinary } from '../../services/cloudinaryService';
import { UploadCloud, X, FileText, Image, CheckCircle, RefreshCw, FileUp } from 'lucide-react';

interface MedicalReportUploadModalProps {
  emergencyId: string;
  ambulanceId: string;
  onUploadSuccess: (report: MedicalReport) => void;
  onClose: () => void;
}

const REPORT_CATEGORIES: { type: ReportType; label: string; icon: string }[] = [
  { type: 'ECG', label: '12-Lead ECG', icon: '📈' },
  { type: 'BLOOD_TEST', label: 'Blood Test / ABG', icon: '🩸' },
  { type: 'XRAY', label: 'Chest X-Ray', icon: '🩻' },
  { type: 'CT_MRI', label: 'CT / Trauma Scan', icon: '🧠' },
  { type: 'PRESCRIPTION', label: 'Prescription / History', icon: '📋' }
];

export const MedicalReportUploadModal: React.FC<MedicalReportUploadModalProps> = ({
  emergencyId,
  ambulanceId,
  onUploadSuccess,
  onClose
}) => {
  const [selectedType, setSelectedType] = useState<ReportType>('ECG');
  const [title, setTitle] = useState<string>('Pre-Hospital 12-Lead ECG');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
    }
  };

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSimulateQuickCapture = (category: ReportType) => {
    setSelectedType(category);
    setUploadError(null);
    const mockBlob = new Blob(["SAMPLE_MEDICAL_DATA_STREAM"], { type: "image/jpeg" });
    const mockFile = new File([mockBlob], `${category}_FIELD_CAPTURE.jpg`, { type: "image/jpeg" });
    setFile(mockFile);
    setTitle(category === 'ECG' ? 'Field 12-Lead Diagnostic Rhythm Strip' : category === 'XRAY' ? 'Portable Field Chest Radiograph' : `Field ${category} Scan`);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(10);

    try {
      const report = await uploadMedicalReportToCloudinary(
        file,
        emergencyId,
        ambulanceId,
        selectedType,
        title,
        (progress) => setUploadProgress(progress)
      );
      setIsUploading(false);
      onUploadSuccess(report);
      onClose();
    } catch (error: any) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(null);
      setUploadError(error?.message || 'Upload encountered an error. Please retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="crystal-modal p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-150 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
            <FileUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Upload Medical Diagnostic</h3>
            <p className="text-xs text-slate-400">Direct Cloudinary upload to Emergency ER queue</p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Select Diagnostic Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {REPORT_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.type}
                onClick={() => {
                  setSelectedType(cat.type);
                  setTitle(`Pre-Hospital ${cat.label}`);
                }}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  selectedType === cat.type
                    ? 'bg-blue-600/30 border-blue-400 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="text-xs font-semibold">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Diagnostic Title */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Diagnostic Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-blue-400"
            placeholder="e.g. 12-Lead Rhythm Strip (V1-V4 Elevation)"
          />
        </div>

        {/* File Dropzone / Select */}
        <div className="mb-5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Attach Document / Capture
          </label>
          <label className="border-2 border-dashed border-white/20 hover:border-blue-400/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/[0.02] hover:bg-white/[0.05]">
            <UploadCloud className="w-8 h-8 text-blue-400 mb-2" />
            <span className="text-xs text-slate-300 font-medium text-center">
              {file ? file.name : 'Click to browse files (JPEG, PNG, PDF)'}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">
              {file ? `${(file.size / 1024).toFixed(0)} KB` : 'Or use quick clinical simulator below'}
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Quick simulator buttons */}
          {!file && (
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleSimulateQuickCapture('ECG')}
                className="flex-1 py-1.5 px-2 rounded-xl bg-purple-500/15 border border-purple-400/30 text-[11px] font-medium text-purple-300 hover:bg-purple-500/25"
              >
                + Quick ECG Sample
              </button>
              <button
                type="button"
                onClick={() => handleSimulateQuickCapture('XRAY')}
                className="flex-1 py-1.5 px-2 rounded-xl bg-teal-500/15 border border-teal-400/30 text-[11px] font-medium text-teal-300 hover:bg-teal-500/25"
              >
                + Quick X-Ray Sample
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar if uploading */}
        {isUploading && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                Encrypting & streaming to Cloudinary...
              </span>
              <span className="font-bold">{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {uploadError && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300">
            {uploadError}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <GlassButton variant="secondary" onClick={onClose} disabled={isUploading} className="flex-1">
            Cancel
          </GlassButton>
          <GlassButton
            variant="primary"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="flex-1"
          >
            {isUploading ? 'Uploading...' : 'Upload & Notify ER'}
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
