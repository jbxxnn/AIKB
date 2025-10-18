'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HugeiconsIcon } from '@hugeicons/react'
import { CloudUploadIcon } from '@hugeicons/core-free-icons'

interface FileUploadProps {
  onFileUpload: (files: File[]) => void
  disabled?: boolean
  accept?: string
  maxSize?: number
  maxFiles?: number
}

export function FileUpload({
  onFileUpload,
  disabled = false,
  accept = '.pdf,.txt,.md,.docx',
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (disabled) return
    
    const newFiles = acceptedFiles.slice(0, maxFiles - selectedFiles.length)
    setSelectedFiles(prev => [...prev, ...newFiles])
  }, [disabled, maxFiles, selectedFiles.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize,
    maxFiles,
    disabled
  })

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFileUpload(selectedFiles)
      setSelectedFiles([])
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        {...getRootProps()}
        className={cn(
          'cursor-pointer transition-colors bg-sidebar border-none shadow-none py-0 rounded-sm',
          isDragActive && 'border-primary bg-sidebar',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <CardContent className="p-8">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full">
              <HugeiconsIcon icon={CloudUploadIcon} />
            </div>
            <div className="text-center">
              <p className="text-sm">
                Click to upload a file or drag and drop a file here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={disabled || selectedFiles.length === 0}
            className="min-w-24"
          >
            {disabled ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
    </div>
  )
}

