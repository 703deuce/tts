import axios from 'axios';
import { firebaseService } from './firebaseService';

// API Configuration
const RUNPOD_ENDPOINT = 'https://api.runpod.ai/v2/7u304yobo6ytm9/run';
const API_KEY = 'rpa_C55TBQG7H6FM7G3Q7A6JM7ZJCDKA3I2J3EO0TAH8fxyddo';
const HF_TOKEN = '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';

export interface TranscriptionRequest {
  audio_url?: string;
  audio_data?: string;
  audio_format?: string;
  include_timestamps?: boolean;
  use_diarization?: boolean;
  num_speakers?: number | null;
}

export interface TranscriptionJob {
  id: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
}

export interface DiarizedSegment {
  speaker: string;
  start_time: number;
  end_time: number;
  text: string;
}

export interface TranscriptionResult {
  merged_text?: string;
  text?: string;
  diarized_transcript?: DiarizedSegment[];
  timestamps?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  speaker_count?: number;
  duration?: number;
  processing_time?: number;
  workflow_type?: string;
  metadata?: {
    total_characters: number;
    speaker_segments?: number;
    whole_file_processed: boolean;
    no_chunking_used: boolean;
  };
}

export interface TranscriptionJobResult {
  id: string;
  status: string;
  output?: TranscriptionResult;
  error?: string;
}

class TranscriptionService {
  private headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  };

  /**
   * Submit a transcription job using Firebase URL
   */
  async submitTranscriptionJob(request: TranscriptionRequest): Promise<TranscriptionJob> {
    try {
      const payload = {
        input: {
          ...request,
          hf_token: request.use_diarization ? HF_TOKEN : undefined
        }
      };

      console.log('🚀 Submitting transcription job...', payload);

      const response = await axios.post(RUNPOD_ENDPOINT, payload, {
        headers: this.headers
      });

      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const jobData = response.data;
      console.log('✅ Job submitted:', jobData.id);

      return {
        id: jobData.id,
        status: jobData.status || 'IN_QUEUE'
      };
    } catch (error) {
      console.error('❌ Error submitting job:', error);
      throw new Error(`Failed to submit transcription job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check the status of a transcription job
   */
  async checkJobStatus(jobId: string): Promise<TranscriptionJobResult> {
    try {
      const statusUrl = `https://api.runpod.ai/v2/7u304yobo6ytm9/status/${jobId}`;
      
      const response = await axios.get(statusUrl, {
        headers: this.headers
      });

      if (response.status !== 200) {
        throw new Error(`Status check failed with status ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error checking job status:', error);
      throw new Error(`Failed to check job status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Poll for job completion with timeout
   */
  async pollForCompletion(
    jobId: string, 
    maxWaitTime: number = 600000, // 10 minutes
    checkInterval: number = 30000, // 30 seconds
    onStatusUpdate?: (status: string) => void
  ): Promise<TranscriptionResult> {
    const maxAttempts = Math.floor(maxWaitTime / checkInterval);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`⏳ Checking status (attempt ${attempt + 1}/${maxAttempts})...`);
        
        const jobResult = await this.checkJobStatus(jobId);
        const status = jobResult.status;

        if (onStatusUpdate) {
          onStatusUpdate(status);
        }

        if (status === 'COMPLETED') {
          console.log('✅ Job completed!');
          if (!jobResult.output) {
            throw new Error('Job completed but no output received');
          }
          return jobResult.output;
        } else if (status === 'FAILED') {
          console.log('❌ Job failed:', jobResult.error);
          throw new Error(`Transcription failed: ${jobResult.error || 'Unknown error'}`);
        } else if (status === 'CANCELLED') {
          throw new Error('Job was cancelled');
        } else {
          console.log(`🔄 Status: ${status}`);
        }

        // Wait before next check (except on last attempt)
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
      } catch (error) {
        if (error instanceof Error && (error.message.includes('failed') || error.message.includes('cancelled'))) {
          throw error; // Re-throw terminal errors
        }
        console.warn(`⚠️ Status check attempt ${attempt + 1} failed:`, error);
        
        // If this was the last attempt, throw the error
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        
        // Otherwise, wait and try again
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
    }

    throw new Error(`Timeout waiting for transcription to complete after ${maxWaitTime / 1000} seconds`);
  }

  /**
   * Complete transcription workflow: submit + poll
   */
  async transcribeAudio(
    request: TranscriptionRequest,
    onStatusUpdate?: (status: string, jobId?: string) => void
  ): Promise<TranscriptionResult> {
    try {
      // Submit job
      onStatusUpdate?.('SUBMITTING');
      const job = await this.submitTranscriptionJob(request);
      
      onStatusUpdate?.('IN_QUEUE', job.id);
      
      // Poll for completion
      const result = await this.pollForCompletion(
        job.id,
        600000, // 10 minutes
        30000,  // 30 seconds
        (status) => onStatusUpdate?.(status, job.id)
      );

      return result;
    } catch (error) {
      console.error('❌ Transcription workflow failed:', error);
      throw error;
    }
  }

  /**
   * Upload file to Firebase and get URL (replaces base64 method)
   * This is now the preferred method as per the Firebase Pipeline Guide
   */
  async uploadFileToFirebase(file: File): Promise<string> {
    console.log('🔄 Using Firebase upload method as required by API...');
    
    const result = await firebaseService.uploadAudioFile(file);
    
    if (!result.success || !result.url) {
      throw new Error(`Firebase upload failed: ${result.error}`);
    }
    
    console.log('✅ Firebase upload successful:', result.url);
    return result.url;
  }

  /**
   * Convert file to base64 for direct upload (DEPRECATED - Legacy mode disabled)
   * @deprecated Use uploadFileToFirebase instead
   */
  async fileToBase64(file: File): Promise<string> {
    console.warn('⚠️ Base64 upload is deprecated. API requires Firebase URLs now.');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove data URL prefix to get just the base64
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get supported audio formats
   */
  getSupportedFormats(): string[] {
    return ['wav', 'mp3', 'flac', 'ogg', 'm4a', 'aac'];
  }

  /**
   * Validate audio file for Firebase upload (no size limits)
   */
  validateAudioFile(file: File): { valid: boolean; error?: string } {
    // Use Firebase service validation (no size limits)
    return firebaseService.validateAudioFile(file);
  }
}

// Export singleton instance
export const transcriptionService = new TranscriptionService();
export default transcriptionService;
