'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Download, 
  Share2, 
  MoreVertical,
  Upload,
  Mic,
  FileAudio,
  Search,
  Volume2,
  Copy,
  Users,
  TrendingUp,
  Star,
  Zap
} from 'lucide-react';

const TranscriptionItem = ({ 
  title, 
  lastActivity, 
  duration, 
  status, 
  type = 'audio' 
}: {
  title: string;
  lastActivity: string;
  duration: string;
  status: string;
  type?: 'audio' | 'video' | 'live';
}) => {
  const getIcon = () => {
    switch (type) {
      case 'video':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'live':
        return <Mic className="w-5 h-5 text-red-500" />;
      default:
        return <FileAudio className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <input type="checkbox" className="w-4 h-4 text-orange-500 rounded border-gray-300" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <div>
            <div className="font-medium text-gray-900">{title}</div>
            <div className="text-sm text-gray-500">{duration}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        <div>{lastActivity}</div>
        <div className="text-gray-500">{status}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded hover:bg-gray-100">
            <Share2 className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-1 rounded hover:bg-gray-100">
            <Download className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-1 rounded hover:bg-gray-100">
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function HomePage() {
  const transcriptions = [
    {
      title: "Team Meeting - Q1 Planning",
      lastActivity: "Today at 2:43 PM",
      duration: "45:32",
      status: "Transcribed to Documents",
      type: "audio" as const
    },
    {
      title: "Client Interview - Product Feedback",
      lastActivity: "Yesterday at 10:15 AM",
      duration: "1:23:45",
      status: "Processing...",
      type: "video" as const
    },
    {
      title: "Podcast Episode 12",
      lastActivity: "2 days ago",
      duration: "2:15:30",
      status: "Completed",
      type: "audio" as const
    },
    {
      title: "Live Webinar - AI Trends",
      lastActivity: "3 days ago",
      duration: "1:05:20",
      status: "Live Session Ended",
      type: "live" as const
    }
  ];

  return (
    <Layout>
      <div className="p-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transcriptions</p>
                <p className="text-2xl font-bold text-gray-900">124</p>
                <p className="text-sm text-green-600">+12% this month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileAudio className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">TTS Generated</p>
                <p className="text-2xl font-bold text-gray-900">87</p>
                <p className="text-sm text-green-600">+25% this month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cloned Voices</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-sm text-blue-600">2 in training</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Copy className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hours Processed</p>
                <p className="text-2xl font-bold text-gray-900">342</p>
                <p className="text-sm text-green-600">+8% this month</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <a href="/transcriptions" className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 hover:from-blue-600 hover:to-blue-700 transition-all">
            <div className="flex items-center space-x-3 mb-2">
              <Upload className="w-6 h-6" />
              <span className="font-semibold">Upload Audio</span>
            </div>
            <p className="text-blue-100 text-sm">Convert audio to text</p>
          </a>

          <a href="/tts" className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 hover:from-purple-600 hover:to-purple-700 transition-all">
            <div className="flex items-center space-x-3 mb-2">
              <Volume2 className="w-6 h-6" />
              <span className="font-semibold">Text to Speech</span>
            </div>
            <p className="text-purple-100 text-sm">Convert text to audio</p>
          </a>

          <a href="/voice-clone" className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 hover:from-green-600 hover:to-green-700 transition-all">
            <div className="flex items-center space-x-3 mb-2">
              <Copy className="w-6 h-6" />
              <span className="font-semibold">Clone Voice</span>
            </div>
            <p className="text-green-100 text-sm">Create custom voices</p>
          </a>

          <a href="/voice-gallery" className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 hover:from-orange-600 hover:to-orange-700 transition-all">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-6 h-6" />
              <span className="font-semibold">Voice Gallery</span>
            </div>
            <p className="text-orange-100 text-sm">Browse AI voices</p>
          </a>
        </div>
        {/* Header with filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <option>All Types</option>
              <option>Audio</option>
              <option>Video</option>
              <option>Live</option>
            </select>
            
            <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Today</option>
            </select>
            
            <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <option>All Status</option>
              <option>Completed</option>
              <option>Processing</option>
              <option>Failed</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              <span>Upload Audio</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              <Mic className="w-4 h-4" />
              <span>Start Live</span>
            </button>
          </div>
        </div>

        {/* Transcriptions Table */}
        {transcriptions.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" className="w-4 h-4 text-orange-500 rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transcriptions.map((transcription, index) => (
                  <TranscriptionItem
                    key={index}
                    title={transcription.title}
                    lastActivity={transcription.lastActivity}
                    duration={transcription.duration}
                    status={transcription.status}
                    type={transcription.type}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Empty State
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FileAudio className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transcriptions yet</h3>
            <p className="text-gray-500 mb-6">
              Upload an audio file or start a live transcription to get started.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Upload className="w-5 h-5" />
                <span>Upload Audio</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                <Mic className="w-5 h-5" />
                <span>Start Live Transcription</span>
              </button>
            </div>
          </div>
        )}
    </div>
    </Layout>
  );
}