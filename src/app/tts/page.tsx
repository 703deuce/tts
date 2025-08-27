'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import TTSGenerator from '@/components/TTSGenerator';
import { voiceCloningService } from '@/services/voiceCloningService';
import { 
  Volume2, 
  Play, 
  Pause, 
  Download, 
  Settings, 
  Upload,
  Copy,
  RotateCcw,
  Sliders,
  FileText,
  Waveform,
  Clock,
  Mic,
  User,
  Crown,
  RefreshCw
} from 'lucide-react';

export default function TTSPage() {
  const searchParams = useSearchParams();
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  
  useEffect(() => {
    const voiceParam = searchParams.get('voice');
    if (voiceParam) {
      setSelectedVoice(voiceParam);
    }
  }, [searchParams]);

  // Refresh voice list on every page load
  useEffect(() => {
    voiceCloningService.refreshVoiceList();
  }, []);

  const [generations, setGenerations] = useState([
    {
      id: '1',
      title: 'Product Demo Script',
      voice: 'Belinda (Professional)',
      duration: '3:45',
      created: '2 hours ago',
      text: 'Welcome to our revolutionary new product...'
    },
    {
      id: '2', 
      title: 'Podcast Intro',
      voice: 'Marcus + Belinda (Podcast Duo)',
      duration: '1:20',
      created: '1 day ago',
      text: '[SPEAKER0] Welcome to Tech Talk! [SPEAKER1] Thanks for joining us...'
    }
  ]);

  const handleGenerationComplete = (result: any) => {
    const newGeneration = {
      id: Date.now().toString(),
      title: `TTS Generation ${new Date().toLocaleString()}`,
      voice: 'Generated Voice',
      duration: `${Math.floor(result.duration / 60)}:${(result.duration % 60).toFixed(0).padStart(2, '0')}`,
      created: 'Just now',
      text: 'Generated audio content'
    };
    
    setGenerations(prev => [newGeneration, ...prev]);
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Text to Speech</h1>
              <p className="text-gray-600">Convert your text into natural-sounding speech using Higgs Audio V2 AI voices</p>
              {selectedVoice && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      Voice pre-selected: <span className="font-semibold">{selectedVoice}</span>
                      {selectedVoice.startsWith('cloned_') && (
                        <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          Custom Cloned Voice
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Manual Refresh Button */}
            <button
              onClick={() => {
                voiceCloningService.refreshVoiceList();
                // Force a page reload to show updated voices
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Voices</span>
            </button>
          </div>
        </div>

        {/* TTS Generator Component */}
        <TTSGenerator 
          onGenerationComplete={handleGenerationComplete} 
          defaultVoice={selectedVoice}
        />

        {/* Recent Generations */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Generations</h2>
            <button className="text-orange-500 hover:text-orange-600 font-medium">
              View all
            </button>
          </div>
          
          <div className="space-y-3">
            {generations.map((generation) => (
              <div key={generation.id} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{generation.title}</div>
                  <div className="text-sm text-gray-500">{generation.voice} • {generation.duration}</div>
                </div>
                <div className="text-sm text-gray-500">{generation.created}</div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 rounded hover:bg-gray-100">
                    <Play className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-100">
                    <Download className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
