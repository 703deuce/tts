'use client';

import React, { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import TranscriptionUpload from '@/components/TranscriptionUpload';
import { 
  Upload, 
  FileAudio, 
  Mic, 
  Settings, 
  Play, 
  Pause, 
  Download,
  Copy,
  Edit3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function TranscriptionsPage() {
  const [transcriptions, setTranscriptions] = useState([
    {
      id: '1',
      title: "Team Meeting - Q1 Planning", 
      lastActivity: "Today at 2:43 PM",
      duration: "45:32",
      status: "Completed",
      type: "audio" as const,
      result: null
    },
    {
      id: '2',
      title: "Client Interview - Product Feedback",
      lastActivity: "Yesterday at 10:15 AM", 
      duration: "1:23:45",
      status: "Processing...",
      type: "video" as const,
      result: null
    }
  ]);

  const handleTranscriptionComplete = (result: any) => {
    const newTranscription = {
      id: Date.now().toString(),
      title: `Transcription ${new Date().toLocaleString()}`,
      lastActivity: "Just now",
      duration: result.duration ? `${Math.floor(result.duration / 60)}:${(result.duration % 60).toFixed(0).padStart(2, '0')}` : "Unknown",
      status: "Completed",
      type: "audio" as const,
      result
    };
    
    setTranscriptions(prev => [newTranscription, ...prev]);
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Audio Transcription</h1>
          <p className="text-gray-600">Upload audio files and convert speech to text with speaker diarization using Firebase Storage</p>
        </div>

        {/* Transcription Upload Component */}
        <TranscriptionUpload onTranscriptionComplete={handleTranscriptionComplete} />

        {/* Recent Transcriptions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transcriptions</h2>
            <button className="text-orange-500 hover:text-orange-600 font-medium">
              View all
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Transcription Card 1 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileAudio className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Team Meeting</h3>
                    <p className="text-sm text-gray-500">45:32 duration</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Complete</span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  "Welcome everyone to today's quarterly planning meeting. We'll be discussing our goals for Q1 and reviewing the roadmap..."
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">2 hours ago</span>
                <div className="flex items-center space-x-2">
                  <button className="p-1 rounded hover:bg-gray-100">
                    <Play className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-100">
                    <Edit3 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-100">
                    <Download className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Transcription Card 2 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileAudio className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Client Interview</h3>
                    <p className="text-sm text-gray-500">1:23:45 duration</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-yellow-600 font-medium">Processing</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Transcribing audio...</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '65%'}}></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">65% complete</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">5 minutes ago</span>
                <div className="flex items-center space-x-2">
                  <button className="p-1 rounded hover:bg-gray-100" disabled>
                    <Play className="w-4 h-4 text-gray-300" />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-100" disabled>
                    <Edit3 className="w-4 h-4 text-gray-300" />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-100" disabled>
                    <Download className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Transcription Card 3 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Mic className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Live Webinar</h3>
                    <p className="text-sm text-gray-500">2:15:30 duration</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-600 font-medium">Failed</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">
                    Transcription failed due to poor audio quality. Please try uploading again or contact support.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">1 day ago</span>
                <div className="flex items-center space-x-2">
                  <button className="bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600">
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Start Live Recording</div>
                <div className="text-sm text-gray-500">Begin real-time transcription</div>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Batch Upload</div>
                <div className="text-sm text-gray-500">Upload multiple files at once</div>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Transcription Settings</div>
                <div className="text-sm text-gray-500">Configure language & quality</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
