// Firebase Storage service for uploading audio files
// Based on FIREBASE_PIPELINE_GUIDE.txt

export interface FirebaseUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  filename?: string;
}

class FirebaseService {
  // Firebase configuration from your guide
  private readonly bucketName = 'aitts-d4c6d.firebasestorage.app';
  private readonly uploadPath = 'transcription_uploads';

  /**
   * Upload audio file to Firebase Storage and return public URL
   * This replaces the need for base64 encoding and removes size limits
   */
  async uploadAudioFile(file: File): Promise<FirebaseUploadResult> {
    try {
      console.log('🚀 Starting Firebase upload...', {
        name: file.name,
        size: this.formatFileSize(file.size),
        type: file.type
      });

      // Generate unique filename with timestamp
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15);
      const randomId = Math.random().toString(36).substring(2, 10);
      const extension = file.name.split('.').pop()?.toLowerCase() || 'wav';
      const filename = `upload_${timestamp}_${randomId}.${extension}`;
      const fullPath = `${this.uploadPath}/${filename}`;

      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Firebase Storage REST API upload
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${this.bucketName}/o?name=${encodeURIComponent(fullPath)}`;
      
      console.log('📤 Uploading to Firebase Storage...', {
        filename,
        uploadUrl,
        size: this.formatFileSize(file.size)
      });

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': file.type || 'audio/wav'
        }
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Firebase upload failed:', errorText);
        throw new Error(`Firebase upload failed: ${uploadResponse.status} ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('✅ Firebase upload successful:', uploadResult);

      // Generate public download URL
      const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${this.bucketName}/o/${encodeURIComponent(fullPath)}?alt=media`;
      
      console.log('🔗 Generated download URL:', downloadUrl);

      // Verify file is accessible (as per your guide, this can take time for large files)
      const isAccessible = await this.verifyFileAccess(downloadUrl);
      
      if (!isAccessible) {
        console.warn('⚠️ File uploaded but not immediately accessible. This is normal for large files.');
        // Don't fail - the file should become accessible soon
      }

      return {
        success: true,
        url: downloadUrl,
        filename
      };

    } catch (error) {
      console.error('❌ Firebase upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  }

  /**
   * Verify that the uploaded file is accessible via the download URL
   * As per your guide, large files can take 10+ minutes to propagate
   */
  private async verifyFileAccess(url: string, maxRetries: number = 3): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`🔍 Verifying file access (attempt ${i + 1}/${maxRetries})...`);
        
        const response = await fetch(url, { method: 'HEAD' });
        
        if (response.ok) {
          console.log('✅ File is accessible');
          return true;
        } else {
          console.log(`⏳ File not yet accessible (${response.status}), retrying...`);
        }
      } catch (error) {
        console.log(`⏳ Access check failed (attempt ${i + 1}), retrying...`);
      }

      // Wait 2 seconds between retries
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.warn('⚠️ Could not verify file access, but proceeding anyway');
    return false;
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get supported audio formats
   */
  getSupportedFormats(): string[] {
    return ['wav', 'mp3', 'flac', 'ogg', 'm4a', 'aac'];
  }

  /**
   * Validate audio file for Firebase upload
   */
  validateAudioFile(file: File): { valid: boolean; error?: string } {
    const supportedFormats = this.getSupportedFormats();
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      return {
        valid: false,
        error: `Unsupported file format. Supported formats: ${supportedFormats.join(', ')}`
      };
    }

    // No size limit for Firebase uploads (as per your guide)
    if (file.size > 1024 * 1024 * 1024) { // 1GB sanity check
      return {
        valid: false,
        error: 'File size exceeds reasonable limits (1GB). Please check your file.'
      };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService;
