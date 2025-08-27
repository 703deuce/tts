import axios from 'axios';
import { ALL_VOICES, Voice } from '@/data/voices';
import { voiceCloningService, ClonedVoice } from './voiceCloningService';

// Higgs Audio V2 API Configuration
const HIGGS_ENDPOINT = 'https://api.runpod.ai/v2/zeqk8y61qusvji/run';
const API_KEY = 'rpa_C55TBQG7H6FM7G3Q7A6JM7ZJCDKA3I2J3EO0TAH8fxyddo';

export interface TTSRequest {
  text: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_new_tokens?: number;
  seed?: number;
  ref_audio_name?: string;
  ref_audio_in_system_message?: boolean;
  chunk_method?: 'word' | 'speaker';
  chunk_max_word_num?: number;
  chunk_max_num_turns?: number;
  generation_chunk_buffer_size?: number;
  scene_description?: string;
  ras_win_len?: number;
  output_format?: string;
}

export interface TTSJob {
  id: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
}

export interface TTSResult {
  audio_base64: string;
  sampling_rate: number;
  duration: number;
  format: string;
  content_type: string;
  volume_path: string;
  generated_text: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  method: string;
  cache_status: {
    cache_exists: boolean;
    models_cached: number;
    total_cache_size_mb: number;
  };
}

export interface TTSJobResult {
  id: string;
  status: string;
  output?: TTSResult;
  error?: string;
}



class TTSService {
  private headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  };

  /**
   * Get all available voices (regular + custom cloned)
   */
  async getAvailableVoices(): Promise<Voice[]> {
    try {
      // Get regular voices
      const regularVoices = ALL_VOICES;
      
      // Get custom cloned voices directly from Firebase Storage
      const customVoices = await voiceCloningService.getUserVoices();
      
      // Convert custom voices to Voice format
      const customVoiceList: Voice[] = customVoices.map((clonedVoice: ClonedVoice) => ({
        id: clonedVoice.id, // This is the full Firebase filename (e.g., "cloned_1756205093378_bzbfy4n4x_Maya_Pop_Culture_Queen")
        name: clonedVoice.name, // Human-readable name (e.g., "Maya Pop Culture Queen")
        gender: 'Custom', // Mark as custom
        language: 'Custom',
        category: 'Custom Voices',
        description: clonedVoice.description || `Custom cloned voice: ${clonedVoice.name}`,
        isPremium: false,
        isNew: true,
        downloadURL: clonedVoice.downloadURL // Include Firebase download URL for preview
      }));
      
      // Combine both voice lists
      const allVoices = [...regularVoices, ...customVoiceList];
      
      console.log(`🎤 Total voices available: ${regularVoices.length} regular + ${customVoices.length} custom = ${allVoices.length} total`);
      
      return allVoices;
    } catch (error) {
      console.error('Error fetching available voices:', error);
      // Fallback to just regular voices if there's an error
      return ALL_VOICES;
    }
  }

  /**
   * Get available voices synchronously (for backward compatibility)
   */
  getAvailableVoicesSync(): Voice[] {
    return ALL_VOICES;
  }

  /**
   * Get multi-speaker voice combinations using your custom voices
   */
  getMultiSpeakerCombinations(): Array<{name: string; voices: string; description: string}> {
    return [
      {
        name: 'Podcast Duo (Blake + Luna)',
        voices: 'Blake_Sports_Podcast_Host,Luna_Music_Review_Host',
        description: 'Energetic sports host and laid-back music reviewer - perfect for dynamic podcasts'
      },
      {
        name: 'Gaming Show (Zack + Maya)',
        voices: 'Zack_Gaming_Enthusiast,Maya_Pop_Culture_Queen',
        description: 'Gaming enthusiast and pop culture expert for entertainment content'
      },
      {
        name: 'Professional News (Rachel + David)',
        voices: 'Rachel_News_Reporter,David_Documentary_Voice',
        description: 'News reporter and documentary voice for professional broadcasting'
      },
      {
        name: 'Educational Pair (Emma + James)',
        voices: 'Emma_Educational_Coach,James_Corporate_Executive',
        description: 'Educational coach and corporate executive for business training content'
      },
      {
        name: 'Custom Voice Mix',
        voices: 'en_man,cloned_1756205093378_bzbfy4n4x_Maya_Pop_Culture_Queen',
        description: 'Mix regular and custom voices for unique combinations'
      }
    ];
  }

  /**
   * Get voices by category (including custom voices)
   */
  async getVoicesByCategory(category: string): Promise<Voice[]> {
    const allVoices = await this.getAvailableVoices();
    
    if (category === 'All Voices') {
      return allVoices;
    }
    
    if (category === 'Custom Voices') {
      return allVoices.filter(voice => voice.category === 'Custom Voices');
    }
    
    return allVoices.filter(voice => voice.category === category);
  }

  /**
   * Get all available categories (including custom voices)
   */
  async getAvailableCategories(): Promise<string[]> {
    // Get all voices directly from Firebase Storage
    const allVoices = await this.getAvailableVoices();
    const categories = [...new Set(allVoices.map(voice => voice.category))];
    return ['All Voices', ...categories.sort()];
  }

  /**
   * Search voices by name (including custom voices)
   */
  async searchVoices(query: string): Promise<Voice[]> {
    const allVoices = await this.getAvailableVoices();
    const lowercaseQuery = query.toLowerCase();
    
    return allVoices.filter(voice => 
      voice.name.toLowerCase().includes(lowercaseQuery) ||
      voice.description.toLowerCase().includes(lowercaseQuery) ||
      voice.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get voice by ID (works for both regular and custom voices)
   */
  async getVoiceById(voiceId: string): Promise<Voice | null> {
    const allVoices = await this.getAvailableVoices();
    return allVoices.find(voice => voice.id === voiceId) || null;
  }

  /**
   * Check if a voice is custom/cloned
   */
  isCustomVoice(voiceId: string): boolean {
    return voiceId.startsWith('cloned_');
  }

  /**
   * Get voice display name (human-readable name for custom voices)
   */
  async getVoiceDisplayName(voiceId: string): Promise<string> {
    if (this.isCustomVoice(voiceId)) {
      const voice = await this.getVoiceById(voiceId);
      return voice?.name || voiceId;
    }
    return voiceId;
  }

  /**
   * Submit a TTS generation job
   */
  async submitTTSJob(request: TTSRequest): Promise<TTSJob> {
    try {
      const payload = {
        input: {
          ...request,
          output_format: request.output_format || 'wav'
        }
      };

      console.log('🚀 Submitting TTS job...', payload);

      const response = await axios.post(HIGGS_ENDPOINT, payload, {
        headers: this.headers
      });

      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const jobData = response.data;
      console.log('✅ TTS job submitted:', jobData.id);

      return {
        id: jobData.id,
        status: jobData.status || 'IN_QUEUE'
      };
    } catch (error) {
      console.error('❌ Error submitting TTS job:', error);
      throw new Error(`Failed to submit TTS job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check the status of a TTS job
   */
  async checkJobStatus(jobId: string): Promise<TTSJobResult> {
    try {
      const statusUrl = `https://api.runpod.ai/v2/zeqk8y61qusvji/status/${jobId}`;
      
      const response = await axios.get(statusUrl, {
        headers: this.headers
      });

      if (response.status !== 200) {
        throw new Error(`Status check failed with status ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error checking TTS job status:', error);
      throw new Error(`Failed to check job status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Poll for job completion with timeout
   */
  async pollForCompletion(
    jobId: string,
    maxWaitTime: number = 300000, // 5 minutes
    checkInterval: number = 3000, // 3 seconds
    onStatusUpdate?: (status: string) => void
  ): Promise<TTSResult> {
    const maxAttempts = Math.floor(maxWaitTime / checkInterval);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`⏳ Checking TTS status (attempt ${attempt + 1}/${maxAttempts})...`);
        
        const jobResult = await this.checkJobStatus(jobId);
        const status = jobResult.status;

        if (onStatusUpdate) {
          onStatusUpdate(status);
        }

        if (status === 'COMPLETED') {
          console.log('✅ TTS job completed!');
          if (!jobResult.output) {
            throw new Error('Job completed but no output received');
          }
          return jobResult.output;
        } else if (status === 'FAILED') {
          console.log('❌ TTS job failed:', jobResult.error);
          throw new Error(`TTS generation failed: ${jobResult.error || 'Unknown error'}`);
        } else if (status === 'CANCELLED') {
          throw new Error('TTS job was cancelled');
        } else {
          console.log(`🔄 TTS Status: ${status}`);
        }

        // Wait before next check (except on last attempt)
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
      } catch (error) {
        if (error instanceof Error && (error.message.includes('failed') || error.message.includes('cancelled'))) {
          throw error; // Re-throw terminal errors
        }
        console.warn(`⚠️ TTS status check attempt ${attempt + 1} failed:`, error);
        
        // If this was the last attempt, throw the error
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        
        // Otherwise, wait and try again
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
    }

    throw new Error(`Timeout waiting for TTS generation to complete after ${maxWaitTime / 1000} seconds`);
  }

  /**
   * Complete TTS workflow: submit + poll
   */
  async generateSpeech(
    request: TTSRequest,
    onStatusUpdate?: (status: string, jobId?: string) => void
  ): Promise<TTSResult> {
    try {
      // Submit job
      onStatusUpdate?.('SUBMITTING');
      const job = await this.submitTTSJob(request);
      
      onStatusUpdate?.('IN_QUEUE', job.id);
      
      // Poll for completion
      const result = await this.pollForCompletion(
        job.id,
        300000, // 5 minutes
        3000,   // 3 seconds
        (status) => onStatusUpdate?.(status, job.id)
      );

      return result;
    } catch (error) {
      console.error('❌ TTS workflow failed:', error);
      throw error;
    }
  }

  /**
   * Convert base64 audio to blob for playback
   */
  base64ToBlob(base64Data: string, contentType: string = 'audio/wav'): Blob {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  /**
   * Create audio URL from base64 data
   */
  createAudioURL(base64Data: string, contentType: string = 'audio/wav'): string {
    const blob = this.base64ToBlob(base64Data, contentType);
    return URL.createObjectURL(blob);
  }

  /**
   * Download audio file from base64 data
   */
  downloadAudio(base64Data: string, filename: string = 'generated_audio.wav', contentType: string = 'audio/wav'): void {
    const blob = this.base64ToBlob(base64Data, contentType);
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Get preset configurations for different use cases
   */
  getPresetConfigurations() {
    return {
      podcast: {
        name: 'Professional Podcast',
        description: 'High energy, expressive podcast conversation',
        config: {
          temperature: 0.6,
          top_p: 0.99,
          top_k: 100,
          chunk_method: 'speaker' as const,
          chunk_max_num_turns: 2,
          ref_audio_in_system_message: true,
          scene_description: 'Dynamic podcast studio with energetic, emotionally engaged hosts'
        }
      },
      narration: {
        name: 'Long-Form Narration',
        description: 'Calm, engaging narrative with natural pacing',
        config: {
          temperature: 0.35,
          top_p: 0.96,
          top_k: 50,
          chunk_method: 'word' as const,
          chunk_max_word_num: 50,
          generation_chunk_buffer_size: 2,
          scene_description: 'Calm, engaging narration with natural pacing'
        }
      },
      news: {
        name: 'News Broadcast',
        description: 'Professional news delivery with authority',
        config: {
          temperature: 0.4,
          top_p: 0.95,
          top_k: 60,
          scene_description: 'Professional news broadcast with clear, authoritative delivery'
        }
      },
      audiobook: {
        name: 'Audiobook/Educational',
        description: 'Clear educational content with steady pace',
        config: {
          temperature: 0.3,
          top_p: 0.95,
          top_k: 50,
          chunk_method: 'word' as const,
          chunk_max_word_num: 60,
          scene_description: 'Clear educational narration with steady pace'
        }
      }
    };
  }

  /**
   * Format text for multi-speaker content
   */
  formatMultiSpeakerText(text: string): string {
    // Simple formatting helper - users can enhance this
    return text.replace(/Speaker (\d+):/gi, '[SPEAKER$1]');
  }

  /**
   * Validate text input
   */
  validateText(text: string): { valid: boolean; error?: string; warning?: string } {
    if (!text.trim()) {
      return { valid: false, error: 'Text cannot be empty' };
    }

    if (text.length > 5000) {
      return { 
        valid: true, 
        warning: 'Text is quite long. Consider using chunking parameters for optimal results.' 
      };
    }

    if (text.length > 1000) {
      return {
        valid: true,
        warning: 'For texts longer than 200 words, chunking is recommended for best quality.'
      };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const ttsService = new TTSService();
export default ttsService;
