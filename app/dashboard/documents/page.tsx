'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FileUpload } from '@/components/file-upload'
import { Upload, FileText, Trash2, Info, Calendar, HardDrive, Target, Loader2 } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Files01Icon, CloudUploadIcon, Delete02Icon, Loading03Icon } from '@hugeicons/core-free-icons'

interface UploadedFile {
  id: string
  name: string
  size: number
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  progress: number
  uploadedAt: Date
  vectorStoreId?: string
  purpose?: string
  fileId?: string
}

export default function DocumentsPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [vectorStoreId, setVectorStoreId] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null)

  // Load files from vector store on component mount
  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    setIsLoading(true)
    try {
      // First, try to get the vector store ID from environment or create one
      let currentVectorStoreId = process.env.NEXT_PUBLIC_VECTOR_STORE_ID
      
      if (!currentVectorStoreId) {
        // Create a new vector store if none exists
        const createResponse = await fetch('/api/vector-store/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'AI Knowledge Base'
          })
        })
        
        if (createResponse.ok) {
          const vectorStore = await createResponse.json()
          currentVectorStoreId = vectorStore.id
          if (currentVectorStoreId) {
            setVectorStoreId(currentVectorStoreId)
            console.log('Created new vector store:', currentVectorStoreId)
          }
        } else {
          console.error('Failed to create vector store')
          setFiles([])
          return
        }
      } else {
        setVectorStoreId(currentVectorStoreId)
      }
      
      const response = await fetch(`/api/vector-store/list-files?vectorStoreId=${currentVectorStoreId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Loaded files from vector store:', data)
        
        // Get stored file names from localStorage
        const storedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
        console.log('Stored files from localStorage:', storedFiles)
        console.log('Vector store files:', data.data)
        console.log('First file attributes:', data.data[0]?.attributes)
        
        // For each file, we need to get the original file details to get the filename
        const formattedFiles = await Promise.all(data.data.map(async (file: any) => {
          // Try to find the stored file info by vector store ID
          const storedFile = storedFiles.find((f: any) => f.vectorStoreId === file.id)
          console.log(`Looking for vector store ID ${file.id}, found:`, storedFile)
          
          // Use filename from vector store attributes, then localStorage, then fallback
          let filename = file.attributes?.filename || storedFile?.name || `file-${file.id.slice(-8)}`
          
          // If we don't have the filename, try to get it from the original file
          if (filename.startsWith('file-')) {
            try {
              // The vector store file ID is the same as the original file ID
              // So we can use it directly to fetch the original file details
              console.log('Fetching file details for:', file.id)
              
              const fileResponse = await fetch(`/api/get-file-details?fileId=${file.id}`)
              if (fileResponse.ok) {
                const fileDetails = await fileResponse.json()
                filename = fileDetails.filename || filename
                console.log('Got filename:', filename)
              } else {
                console.log('Failed to fetch file details:', fileResponse.status)
              }
            } catch (error) {
              console.log('Could not fetch file details for', file.id, error)
            }
          }
          
          return {
            id: storedFile?.id || file.id, // Use stored ID if available, otherwise vector store ID
            name: filename,
            size: storedFile?.size || file.usage_bytes || 0,
            status: file.status === 'completed' ? 'completed' : 'processing',
            progress: file.status === 'completed' ? 100 : 50,
            uploadedAt: storedFile?.uploadedAt ? new Date(storedFile.uploadedAt) : new Date(file.created_at * 1000),
            vectorStoreId: file.id,
            fileId: file.file_id || storedFile?.fileId || file.id,
            purpose: 'assistants'
          }
        }))
        setFiles(formattedFiles)
        if (formattedFiles.length > 0 && !selectedFile) {
          setSelectedFile(formattedFiles[0])
        }
      } else {
        console.error('Failed to load files:', response.status, await response.text())
        setFiles([])
      }
    } catch (error) {
      console.error('Error loading files:', error)
      setFiles([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (uploadedFiles: File[]) => {
    setIsUploading(true)
    setUploadProgress({ current: 0, total: uploadedFiles.length })
    // Don't close the popup immediately - keep it open to show progress
    
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i]
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Add file to state with uploading status
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        status: 'uploading',
        progress: 0,
        uploadedAt: new Date(),
        purpose: 'assistants'
      }
      
      setFiles(prev => [...prev, newFile])
      
      try {
        // Update progress to show current file being processed
        setUploadProgress(prev => ({ ...prev, current: i }))
        
        // Upload file to OpenAI
        const formData = new FormData()
        formData.append('file', file)
        formData.append('purpose', 'assistants')
        
        const uploadResponse = await fetch('/api/upload-file', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadResponse.ok) {
          throw new Error('Upload failed')
        }
        
        const uploadResult = await uploadResponse.json()
        
        // Update file status to processing
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'processing', progress: 50, fileId: uploadResult.id }
            : f
        ))
        
        // Add file to vector store
        const vectorStoreResponse = await fetch('/api/vector-store/add-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileId: uploadResult.id,
            vectorStoreId: vectorStoreId
          })
        })
        
        if (!vectorStoreResponse.ok) {
          throw new Error('Vector store upload failed')
        }
        
        const vectorStoreResult = await vectorStoreResponse.json()
        
        // Update file status to completed
        const updatedFile = {
          id: fileId,
          name: file.name,
          size: file.size,
          status: 'completed' as const,
          progress: 100,
          uploadedAt: new Date(),
          vectorStoreId: vectorStoreResult.id,
          fileId: uploadResult.id,
          purpose: 'assistants'
        }
        
        setFiles(prev => prev.map(f => 
          f.id === fileId ? updatedFile : f
        ))
        
        // Store file info in localStorage for persistence
        const storedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
        const existingIndex = storedFiles.findIndex((f: any) => f.id === fileId)
        if (existingIndex >= 0) {
          storedFiles[existingIndex] = updatedFile
        } else {
          storedFiles.push(updatedFile)
        }
        localStorage.setItem('uploadedFiles', JSON.stringify(storedFiles))
        
        // Select the newly uploaded file
        setSelectedFile(updatedFile)
        
      } catch (error) {
        console.error('Upload error:', error)
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'failed', progress: 0 }
            : f
        ))
      }
      
      // Update progress after each file completes
      setUploadProgress(prev => ({ ...prev, current: i + 1 }))
    }
    
    // Wait a moment to show completion, then close
    setTimeout(() => {
      setIsUploading(false)
      setShowUpload(false)
    }, 1000)
  }

  const handleDeleteClick = (file: UploadedFile) => {
    setFileToDelete(file)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return
    
    try {
      if (fileToDelete.vectorStoreId) {
        await fetch('/api/vector-store/remove-file', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileId: fileToDelete.vectorStoreId,
            vectorStoreId: vectorStoreId
          })
        })
      }
      
      // Update UI immediately
      setFiles(prev => prev.filter(f => f.id !== fileToDelete.id))
      
      // If the deleted file was selected, clear selection
      if (selectedFile?.id === fileToDelete.id) {
        setSelectedFile(null)
      }
      
      // Remove from localStorage
      const storedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
      const updatedStoredFiles = storedFiles.filter((f: any) => f.id !== fileToDelete.id)
      localStorage.setItem('uploadedFiles', JSON.stringify(updatedStoredFiles))
      
    } catch (error) {
      console.error('Remove file error:', error)
    } finally {
      setShowDeleteConfirm(false)
      setFileToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setFileToDelete(null)
  }


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
        <HugeiconsIcon icon={Files01Icon} />
          <h1 className="text-md font-semibold">DOCUMENTS</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowUpload(true)}
            className="bg-black text-white hover:bg-black/90"
          >
            <HugeiconsIcon icon={CloudUploadIcon} />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex p-0">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center gap-4">
              <HugeiconsIcon icon={Loading03Icon} className="h-10 w-10 animate-spin"/>
            </div>
          </div>
        ) : (
          <>
            {/* Left Panel - File List */}
            <div className="w-1/2 border-r flex justify-center items-start">
              <div className="p-4">
                <div className="space-y-1">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`bg-sidebar p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedFile?.id === file.id 
                          ? 'bg-sidebar' 
                          : 'hover:bg-sidebar/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} - {file.purpose}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground ml-2">
                          {formatDate(file.uploadedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {files.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center gap-2">
                      <HugeiconsIcon icon={Files01Icon} />
                      <p className="text-sm font-medium">No files uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - File Details */}
            <div className="w-1/2 flex justify-center items-start">
              {selectedFile ? (
              <div className="flex flex-col justify-between items-start h-full">
                <div className="w-full p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold mt-1">{selectedFile.name}</h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Status */}
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-green-600 font-medium">Ready</span>
                    </div>

                    {/* File ID */}
                    <div className="flex items-center gap-3">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-mono">{selectedFile.fileId}</span>
                    </div>

                    {/* Purpose */}
                    <div className="flex items-center gap-3">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedFile.purpose}</span>
                    </div>

                    {/* Size */}
                    <div className="flex items-center gap-3">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatFileSize(selectedFile.size)}</span>
                    </div>

                    {/* Created at */}
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(selectedFile.uploadedAt)}</span>
                    </div>
                  </div>
                  </div>
                  <div className="border-t w-full p-6">
                  <Button
                      variant="outline"
                      onClick={() => handleDeleteClick(selectedFile)}
                      className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 cursor-pointer"
                    >
                      <HugeiconsIcon icon={Delete02Icon} />
                      Delete File
                    </Button>
                    </div>
                </div>
              ) : (
                <div className="p-6 flex justify-center items-center">
                  <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <p className="text-sm font-medium">Select a file to view details</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Upload Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileUpload={handleFileUpload}
                disabled={isUploading}
                accept=".pdf,.txt,.md,.docx"
                maxSize={10 * 1024 * 1024} // 10MB
              />
              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading files...</span>
                    <span>{uploadProgress.current} of {uploadProgress.total}</span>
                  </div>
                  <Progress 
                    value={(uploadProgress.current / uploadProgress.total) * 100} 
                    className="h-2"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpload(false)}
                  disabled={isUploading}
                  className='bg-sidebar text-sidebar-foreground hover:bg-sidebar/90 cursor-pointer'
                >
                  {isUploading ? 'Uploading...' : 'Cancel'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && fileToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-bold">
                Confirm Deletion of File
              </CardTitle>
              <CardDescription>
                Are you sure you want to delete the file <span className="font-bold">{fileToDelete.name}</span>? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancelDelete}
                  className='bg-sidebar text-sidebar-foreground hover:bg-sidebar/90 cursor-pointer'
                >
                  Cancel
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleConfirmDelete}
                  className='bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 cursor-pointer'
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
