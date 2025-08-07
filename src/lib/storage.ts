import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata,
  updateMetadata
} from 'firebase/storage'
import { storage } from './firebase'
import { FileService } from './database'
import { StoredFile } from '@/types/database'

export class StorageService {
  // Upload file to Firebase Storage
  static async uploadFile(
    file: File, 
    userId: string, 
    jobId?: string, 
    isOriginal = true
  ): Promise<{ url: string; path: string; fileId: string }> {
    if (!storage) throw new Error('Firebase Storage not initialized')
    
    // Generate unique file path
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const folder = isOriginal ? 'originals' : 'translated'
    const filePath = `users/${userId}/${folder}/${timestamp}_${sanitizedFileName}`
    
    // Create storage reference
    const storageRef = ref(storage, filePath)
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file, {
      customMetadata: {
        userId,
        jobId: jobId || '',
        isOriginal: isOriginal.toString(),
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    })
    
    // Get download URL
    const downloadUrl = await getDownloadURL(snapshot.ref)
    
    // Save file record to Firestore
    const fileId = await FileService.createFile({
      userId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      storagePath: filePath,
      downloadUrl,
      jobId,
      jobType: jobId ? 'single' : undefined,
      isOriginal
    })
    
    return {
      url: downloadUrl,
      path: filePath,
      fileId
    }
  }
  
  // Upload translated file content
  static async uploadTranslatedFile(
    content: string,
    originalFileName: string,
    userId: string,
    jobId: string,
    targetLanguage: string
  ): Promise<{ url: string; path: string; fileId: string }> {
    if (!storage) throw new Error('Firebase Storage not initialized')
    
    // Generate translated file name
    const baseName = originalFileName.replace(/\.[^/.]+$/, '')
    const extension = originalFileName.split('.').pop()
    const translatedFileName = `${baseName}_${targetLanguage}.${extension}`
    
    // Create blob from content
    const blob = new Blob([content], { type: 'text/plain' })
    
    // Generate file path
    const timestamp = Date.now()
    const sanitizedFileName = translatedFileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `users/${userId}/translated/${timestamp}_${sanitizedFileName}`
    
    // Create storage reference
    const storageRef = ref(storage, filePath)
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, blob, {
      customMetadata: {
        userId,
        jobId,
        isOriginal: 'false',
        originalName: translatedFileName,
        sourceFile: originalFileName,
        targetLanguage,
        uploadedAt: new Date().toISOString()
      }
    })
    
    // Get download URL
    const downloadUrl = await getDownloadURL(snapshot.ref)
    
    // Save file record to Firestore
    const fileId = await FileService.createFile({
      userId,
      fileName: translatedFileName,
      fileSize: blob.size,
      fileType: 'text/plain',
      storagePath: filePath,
      downloadUrl,
      jobId,
      jobType: 'single',
      isOriginal: false
    })
    
    return {
      url: downloadUrl,
      path: filePath,
      fileId
    }
  }
  
  // Create ZIP file for batch download
  static async uploadBatchZip(
    zipBlob: Blob,
    userId: string,
    batchJobId: string,
    fileName: string
  ): Promise<{ url: string; path: string; fileId: string }> {
    if (!storage) throw new Error('Firebase Storage not initialized')
    
    // Generate file path
    const timestamp = Date.now()
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `users/${userId}/batch/${timestamp}_${sanitizedFileName}`
    
    // Create storage reference
    const storageRef = ref(storage, filePath)
    
    // Upload ZIP file
    const snapshot = await uploadBytes(storageRef, zipBlob, {
      customMetadata: {
        userId,
        jobId: batchJobId,
        isOriginal: 'false',
        originalName: fileName,
        jobType: 'batch',
        uploadedAt: new Date().toISOString()
      }
    })
    
    // Get download URL
    const downloadUrl = await getDownloadURL(snapshot.ref)
    
    // Save file record to Firestore
    const fileId = await FileService.createFile({
      userId,
      fileName,
      fileSize: zipBlob.size,
      fileType: 'application/zip',
      storagePath: filePath,
      downloadUrl,
      jobId: batchJobId,
      jobType: 'batch',
      isOriginal: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) as any // 7 days
    })
    
    return {
      url: downloadUrl,
      path: filePath,
      fileId
    }
  }
  
  // Delete file from storage
  static async deleteFile(filePath: string): Promise<void> {
    if (!storage) throw new Error('Firebase Storage not initialized')
    
    const storageRef = ref(storage, filePath)
    await deleteObject(storageRef)
  }
  
  // Get file metadata
  static async getFileMetadata(filePath: string) {
    if (!storage) throw new Error('Firebase Storage not initialized')
    
    const storageRef = ref(storage, filePath)
    return await getMetadata(storageRef)
  }
  
  // List user files
  static async listUserFiles(userId: string, folder?: 'originals' | 'translated' | 'batch') {
    if (!storage) throw new Error('Firebase Storage not initialized')
    
    const basePath = folder ? `users/${userId}/${folder}` : `users/${userId}`
    const storageRef = ref(storage, basePath)
    
    const result = await listAll(storageRef)
    return result.items
  }
  
  // Clean up expired files
  static async cleanupExpiredFiles(userId: string): Promise<number> {
    if (!storage) throw new Error('Firebase Storage not initialized')
    
    // Get expired files from Firestore
    const userFiles = await FileService.getUserFiles(userId)
    const now = new Date()
    let deletedCount = 0
    
    for (const file of userFiles) {
      if (file.expiresAt && file.expiresAt.toDate() < now) {
        try {
          // Delete from storage
          await this.deleteFile(file.storagePath)
          
          // Delete from Firestore (would need to add this method to FileService)
          // await FileService.deleteFile(file.id)
          
          deletedCount++
        } catch (error) {
          console.error(`Failed to delete expired file ${file.id}:`, error)
        }
      }
    }
    
    return deletedCount
  }
  
  // Get storage usage for user
  static async getUserStorageUsage(userId: string): Promise<number> {
    const userFiles = await FileService.getUserFiles(userId)
    return userFiles.reduce((total, file) => total + file.fileSize, 0)
  }
  
  // Validate file before upload
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' }
    }
    
    // Check file type
    const allowedTypes = ['text/plain', 'application/x-subrip']
    const allowedExtensions = ['.srt', '.txt']
    
    const hasValidType = allowedTypes.includes(file.type)
    const hasValidExtension = allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    )
    
    if (!hasValidType && !hasValidExtension) {
      return { valid: false, error: 'Only SRT and TXT files are allowed' }
    }
    
    return { valid: true }
  }
}
