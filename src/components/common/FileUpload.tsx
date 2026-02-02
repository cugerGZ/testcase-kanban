import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  accept?: string;
  onFileSelect: (file: File) => void;
  placeholder?: string;
}

export function FileUpload({
  accept = '.md',
  onFileSelect,
  placeholder = '点击或拖拽文件到此处',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  }, []);

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-200
        ${isDragging
          ? 'border-blue-500 bg-blue-50'
          : selectedFile
          ? 'border-green-500 bg-green-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex flex-col items-center">
          <FileText size={48} className="text-green-500 mb-3" />
          <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </p>
          <button
            onClick={handleClear}
            className="mt-3 inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
          >
            <X size={14} />
            清除选择
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Upload
            size={48}
            className={`mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
          />
          <p className="text-sm font-medium text-gray-700">{placeholder}</p>
          <p className="text-xs text-gray-500 mt-1">支持 {accept} 格式</p>
        </div>
      )}
    </div>
  );
}
