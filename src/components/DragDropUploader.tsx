import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface DragDropUploaderProps {
  id?: string;
  accept?: string; // e.g. "image/*,application/pdf"
  maxSizeMB?: number;
  label?: string;
  subLabel?: string;
  onUploadSuccess: (fileName: string, fileType: string, fileSize: number, dataUrl: string) => void;
  onUploadStart?: () => void;
  category?: "photo" | "certificate" | "cv" | "other";
}

export default function DragDropUploader({
  id = "drag-drop-uploader",
  accept = "image/*,application/pdf",
  maxSizeMB = 5,
  label = "Drag and drop your file here",
  subLabel = "or click to select file from directory",
  onUploadSuccess,
  onUploadStart,
  category = "other"
}: DragDropUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File exceeds the limit of ${maxSizeMB}MB.`);
      return;
    }

    // Validate type (basic check)
    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";
    
    if (accept.includes("image/*") && !isImage && accept.includes("pdf") && !isPDF) {
      setErrorMessage("Unsupported file type. Please upload an image or PDF.");
      return;
    } else if (accept.includes("image/*") && !accept.includes("pdf") && !isImage) {
      setErrorMessage("Please upload an image file (PNG, JPG, etc.).");
      return;
    } else if (accept.includes("pdf") && !accept.includes("image") && !isPDF) {
      setErrorMessage("Please upload a PDF document.");
      return;
    }

    if (onUploadStart) onUploadStart();

    // Simulate upload progress
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) {
          clearInterval(progressInterval);
          return null;
        }
        if (prev >= 100) {
          clearInterval(progressInterval);
          
          // Complete processing - read file as Base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const resultBase64 = reader.result as string;
            onUploadSuccess(file.name, file.type, file.size, resultBase64);
            setSuccessMessage(`"${file.name}" uploaded successfully!`);
            setUploadProgress(null);
          };
          reader.readAsDataURL(file);
          return 100;
        }
        return prev + 20; // Staged progress steps
      });
    }, 100);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      processFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      processFile(selectedFile);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full space-y-2" id={`${id}-container`}>
      <div
        id={id}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative cursor-pointer py-8 px-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[160px] ${
          isDragging
            ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-[1.01]"
            : "border-white/10 bg-[#070d1e] hover:border-white/20 hover:bg-[#0b132a]"
        }`}
      >
        {/* Hidden Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id={`${id}-input`}
        />

        {uploadProgress !== null ? (
          <div className="w-full max-w-xs space-y-3 flex flex-col items-center">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-400">Processing payload: {uploadProgress}%</p>
          </div>
        ) : (
          <div className="space-y-3 flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-colors ${
              isDragging ? "bg-blue-500/20 border-blue-400 text-blue-400" : "bg-white/5 border-white/10 text-slate-400"
            }`}>
              <Upload className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white tracking-wide">{label}</p>
              <p className="text-[10px] text-slate-400">{subLabel}</p>
            </div>
            <p className="text-[9px] text-slate-500 font-mono">
              Accepted formats: {accept.split(",").join(" or ")} (Max {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>

      {/* Upload Feedback */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-semibold">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
