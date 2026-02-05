import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api';

interface VideoUploadProps {
  onUploadComplete: (camera: any) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('File size too large (Max 100MB)');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await api.uploadVideo(file);
      onUploadComplete(response);
    } catch (err) {
      console.error(err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/x-msvideo': ['.avi'],
      'video/quicktime': ['.mov']
    },
    maxFiles: 1
  });

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <Loader2 className="animate-spin text-emerald-500" size={48} />
          ) : (
            <Upload className={isDragActive ? 'text-emerald-500' : 'text-slate-400'} size={48} />
          )}
          
          <div>
            <p className="text-lg font-medium text-slate-200">
              {uploading ? 'Uploading...' : 'Drag & drop video here, or click to select'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Supports MP4, AVI, MOV (Max 100MB)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2 text-red-400">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
