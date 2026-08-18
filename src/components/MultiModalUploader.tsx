import React, { useRef, useState } from 'react';
import { Camera, FileText, Music, Video, Monitor, Upload, Trash2, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';

interface MultiModalUploaderProps {
  onAttachmentLoaded: (attachment: { data: string; mimeType: string; name: string } | null) => void;
}

export const MultiModalUploader: React.FC<MultiModalUploaderProps> = ({
  onAttachmentLoaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<{
    name: string;
    type: string;
    size: string;
    base64: string;
    category: 'image' | 'pdf' | 'doc' | 'audio' | 'video' | 'screen';
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert File to Base64 helper
  const processFile = (file: File) => {
    setError(null);
    const maxSize = 12 * 1024 * 1024; // 12MB Limit for Gemini Flash
    if (file.size > maxSize) {
      setError("File exceeds 12MB limit. Please upload a optimized cellular or biomedical asset.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      let category: 'image' | 'pdf' | 'doc' | 'audio' | 'video' | 'screen' = 'doc';

      if (file.type.startsWith('image/')) category = 'image';
      else if (file.type === 'application/pdf') category = 'pdf';
      else if (file.type.startsWith('audio/')) category = 'audio';
      else if (file.type.startsWith('video/')) category = 'video';
      else if (file.type.includes('word') || file.type.includes('text') || file.type.includes('sheet') || file.type.includes('excel')) category = 'doc';

      const fileObj = {
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        base64: base64Data,
        category,
      };

      setSelectedAttachment(fileObj);
      onAttachmentLoaded({
        data: base64Data,
        mimeType: file.type || 'application/octet-stream',
        name: file.name
      });
    };
    reader.onerror = () => {
      setError("Error converting file to binary representation.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAttachment(null);
    onAttachmentLoaded(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Simulated screen share / screen capture uploader
  const handleSimulateScreenCapture = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    // Standard blank grid/screenshot representation base64
    const simulatedBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const fileObj = {
      name: "Simulated_Screen_Capture_" + Date.now().toString().slice(-4) + ".png",
      type: "image/png",
      size: "0.25 MB",
      base64: simulatedBase64,
      category: 'screen' as const,
    };
    setSelectedAttachment(fileObj);
    onAttachmentLoaded({
      data: simulatedBase64,
      mimeType: "image/png",
      name: fileObj.name
    });
  };

  // Helper icons mapper
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'image': return <Camera size={18} className="text-teal-400" />;
      case 'pdf': return <FileText size={18} className="text-rose-400" />;
      case 'doc': return <FileText size={18} className="text-sky-400" />;
      case 'audio': return <Music size={18} className="text-amber-400" />;
      case 'video': return <Video size={18} className="text-indigo-400" />;
      case 'screen': return <Monitor size={18} className="text-pink-400" />;
      default: return <Upload size={18} className="text-slate-400" />;
    }
  };

  return (
    <div id="multimodal_uploader" className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf,audio/*,video/*,.txt,.doc,.docx,.xls,.xlsx"
      />

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition relative overflow-hidden ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-500/10' 
            : selectedAttachment 
              ? 'border-emerald-500/30 bg-emerald-500/5' 
              : 'border-slate-800 bg-slate-950/40 hover:bg-slate-950/75 hover:border-slate-700'
        }`}
      >
        {selectedAttachment ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
                {getCategoryIcon(selectedAttachment.category)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white max-w-[180px] truncate leading-tight">
                  {selectedAttachment.name}
                </h4>
                <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                  {selectedAttachment.size} • {selectedAttachment.category.toUpperCase()} Loaded
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle size={10} /> Attached
              </span>
              <button
                onClick={handleClear}
                className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition"
                title="Remove attachment"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800/80 px-2 py-1 rounded-xl">
              <Camera size={13} className="text-teal-400" />
              <FileText size={13} className="text-rose-400" />
              <Music size={13} className="text-amber-400" />
              <Video size={13} className="text-indigo-400" />
            </div>
            
            <p className="text-xs text-slate-300 font-sans">
              Drag & drop health assets or <span className="text-indigo-400 font-semibold">browse</span> files
            </p>
            <p className="text-[9px] text-slate-500 font-mono">
              Supports: Images, PDFs, Fitness Reports, Audio clips, Videos (Max 12MB)
            </p>
          </div>
        )}
      </div>

      {/* Auxiliary capture simulator and error feedback */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleSimulateScreenCapture}
          className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-[10px] px-3 py-1.5 rounded-xl font-mono flex items-center gap-1 transition"
        >
          <Monitor size={12} className="text-pink-400 animate-pulse" />
          <span>Simulate Screen Capture</span>
        </button>
        <span className="text-[8px] font-mono text-slate-500 flex items-center gap-1">
          <Sparkles size={10} className="text-indigo-400" /> Multimodal Core Active
        </span>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2 rounded-xl text-[10px] flex items-center gap-1.5">
          <AlertTriangle size={12} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
