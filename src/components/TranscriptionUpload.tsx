'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useTranscription } from '@/hooks/useTranscription';
import { transcriptionService } from '@/services/transcriptionService';
import { 
  Upload, 
  Mic, 
  FileAudio, 
  Play, 
  Download, 
  Copy, 
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Volume2,
  Users
} from 'lucide-react';

interface TranscriptionUploadProps {
  onTranscriptionComplete?: (result: any) => void;
}

export default function TranscriptionUpload({ onTranscriptionComplete }: TranscriptionUploadProps) {
  const { state, transcribe, reset } = useTranscription();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState({
    use_diarization: true,
    num_speakers: null as number | null,
    include_timestamps: true,
    audio_format: 'wav'
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('📁 File selected:', file);
    if (file) {
      console.log('✅ File validation starting...');
      const validation = transcriptionService.validateAudioFile(file);
      console.log('🔍 Validation result:', validation);
      if (!validation.valid) {
        console.log('❌ File validation failed:', validation.error);
        alert(validation.error);
        return;
      }
      console.log('✅ File validation passed, setting file in state...');
      setSelectedFile(file);
      console.log('✅ File set to state:', file.name);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const validation = transcriptionService.validateAudioFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleTranscribe = async () => {
    console.log('🔄 handleTranscribe called');
    console.log('📁 Selected file:', selectedFile);
    console.log('⚙️ Settings:', settings);
    
    try {
      if (selectedFile) {
        // Set local loading state immediately
        setIsProcessing(true);
        
        // Reset any previous state first
        reset();
        
        // Upload to Firebase first (required by new API)
        console.log('🔄 Uploading file to Firebase Storage...');
        console.log('⏱️ Starting upload at:', new Date().toLocaleTimeString());
        
        try {
          const firebaseUrl = await transcriptionService.uploadFileToFirebase(selectedFile);
          console.log('✅ Firebase upload successful at:', new Date().toLocaleTimeString());
          console.log('🔗 Firebase URL:', firebaseUrl);
          
          const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || 'wav';
          console.log('📄 File extension:', fileExtension);
          
          console.log('🎯 Calling transcribe function...');
          console.log('⏱️ Starting transcription at:', new Date().toLocaleTimeString());
          
          await transcribe({
            audio_url: firebaseUrl,  // Use Firebase URL
            audio_format: fileExtension,
            ...settings
          });
          console.log('✅ Transcribe function completed at:', new Date().toLocaleTimeString());
        } catch (uploadError) {
          console.error('❌ Firebase upload failed:', uploadError);
          throw uploadError;
        }
      } else {
        console.log('❌ No file selected');
        alert('Please select a file to transcribe');
        return;
      }

      if (onTranscriptionComplete && state.result) {
        onTranscriptionComplete(state.result);
      }
    } catch (error) {
      console.error('❌ Transcription failed:', error);
    } finally {
      // Always clear the local loading state
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadTranscript = (text: string, filename: string = 'transcript.txt') => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (state.status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'SUBMITTING':
      case 'IN_QUEUE':
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Audio File</h3>
          <p className="text-sm text-gray-600">Your file will be automatically uploaded to Firebase Storage for transcription</p>
        </div>

        {/* File Upload */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".wav,.mp3,.flac,.ogg,.m4a,.aac"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {selectedFile ? (
            <div className="flex items-center justify-center space-x-3">
              <FileAudio className="w-8 h-8 text-green-500" />
              <div>
                <div className="font-medium text-gray-900">{selectedFile.name}</div>
                <div className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ) : (
            <div>
              <Upload className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <div className="text-lg font-medium text-gray-900 mb-2">
                Drop audio file here or click to browse
              </div>
              <div className="text-sm text-gray-500">
                Supports WAV, MP3, FLAC, OGG (no size limits - uses Firebase Storage)
              </div>
            </div>
          )}
        </div>
        
        {/* Firebase Info */}
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Firebase Storage Integration:</p>
              <p className="text-xs mt-1">
                All audio files are automatically uploaded to your Firebase Storage before transcription. 
                This ensures optimal processing and no file size limits.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transcription Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transcription Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-700">Speaker Diarization</label>
              <p className="text-sm text-gray-500">Identify "who spoke when"</p>
            </div>
            <input
              type="checkbox"
              checked={settings.use_diarization}
              onChange={(e) => setSettings(prev => ({ ...prev, use_diarization: e.target.checked }))}
              className="w-4 h-4 text-orange-500 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-700">Include Timestamps</label>
              <p className="text-sm text-gray-500">Add time markers to segments</p>
            </div>
            <input
              type="checkbox"
              checked={settings.include_timestamps}
              onChange={(e) => setSettings(prev => ({ ...prev, include_timestamps: e.target.checked }))}
              className="w-4 h-4 text-orange-500 rounded"
            />
          </div>

          {settings.use_diarization && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Speakers (optional)
              </label>
              <select
                value={settings.num_speakers || ''}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  num_speakers: e.target.value ? parseInt(e.target.value) : null 
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Auto-detect</option>
                <option value="2">2 speakers</option>
                <option value="3">3 speakers</option>
                <option value="4">4 speakers</option>
                <option value="5">5 speakers</option>
                <option value="6">6 speakers</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio Format
            </label>
            <select
              value={settings.audio_format}
              onChange={(e) => setSettings(prev => ({ ...prev, audio_format: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="wav">WAV</option>
              <option value="mp3">MP3</option>
              <option value="flac">FLAC</option>
              <option value="ogg">OGG</option>
              <option value="m4a">M4A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {state.isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            {getStatusIcon()}
            <div>
              <div className="font-medium text-gray-900">
                {state.status === 'SUBMITTING' && 'Submitting job...'}
                {state.status === 'IN_QUEUE' && 'Job queued for processing...'}
                {state.status === 'IN_PROGRESS' && 'Processing audio...'}
              </div>
              {state.jobId && (
                <div className="text-sm text-gray-500">Job ID: {state.jobId}</div>
              )}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${state.progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">{state.progress}% complete</div>
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <div className="font-medium text-red-900">Transcription Failed</div>
              <div className="text-sm text-red-700 mt-1">{state.error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {state.result && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transcription Results</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(state.result?.merged_text || state.result?.text || '')}
                className="p-2 rounded hover:bg-gray-100"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => downloadTranscript(state.result?.merged_text || state.result?.text || '')}
                className="p-2 rounded hover:bg-gray-100"
                title="Download transcript"
              >
                <Download className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-500">Duration</div>
              <div className="font-medium">
                {state.result.duration ? formatTime(state.result.duration) : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Processing Time</div>
              <div className="font-medium">
                {state.result.processing_time ? `${state.result.processing_time.toFixed(1)}s` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Characters</div>
              <div className="font-medium">
                {state.result.metadata?.total_characters || 'N/A'}
              </div>
            </div>
          </div>

          {/* Full Transcript */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Full Transcript</h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap">
                {state.result.merged_text || state.result.text}
              </p>
            </div>
          </div>

          {/* Speaker Segments */}
          {state.result.diarized_transcript && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Speaker Segments ({state.result.diarized_transcript.length})</span>
              </h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {state.result.diarized_transcript.map((segment, index) => (
                  <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="font-medium text-orange-600">{segment.speaker}</span>
                      <span className="text-sm text-gray-500">
                        {formatTime(segment.start_time)} - {formatTime(segment.end_time)}
                      </span>
                    </div>
                    <p className="text-gray-700">{segment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {!isProcessing && !state.isLoading && !state.result && (
          <button
            onClick={() => {
              console.log('🔘 Button clicked!');
              console.log('📁 Selected file:', selectedFile);
              console.log('🚫 Button disabled:', !selectedFile);
              console.log('🎯 Calling handleTranscribe...');
              handleTranscribe();
            }}
            disabled={!selectedFile}
            className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
          >
            <Mic className="w-5 h-5" />
            <span>Start Transcription (File: {selectedFile ? selectedFile.name : 'None'})</span>
          </button>
        )}

        {/* Initial Processing Indicator */}
        {isProcessing && !state.isLoading && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-orange-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
              <span>Starting transcription... Please wait</span>
            </div>
          </div>
        )}

        {/* Transcription Progress Indicator */}
        {state.isLoading && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-orange-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
            <span>Transcribing audio... {state.status}</span>
          </div>
          </div>
        )}

        {/* Status Display */}
        {(isProcessing || state.isLoading) && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">Current Status:</div>
                <div className="text-xs">
                  {isProcessing && !state.isLoading && "🔄 Initializing transcription..."}
                  {state.isLoading && state.status === 'SUBMITTING' && "📤 Submitting to RunPod API..."}
                  {state.isLoading && state.status === 'IN_QUEUE' && "⏳ Job queued, waiting to start..."}
                  {state.isLoading && state.status === 'IN_PROGRESS' && "🎯 Processing audio with NVIDIA Parakeet..."}
                  {state.isLoading && state.status === 'COMPLETED' && "✅ Transcription completed!"}
                </div>
              </div>
            </div>
          </div>
        )}

        {(state.result || state.error) && (
          <button
            onClick={handleReset}
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 font-medium"
          >
            Start New Transcription
          </button>
        )}
      </div>
    </div>
  );
}
