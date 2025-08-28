'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTTS } from '@/hooks/useTTS';
import { ttsService } from '@/services/ttsService';
import { voiceCloningService } from '@/services/voiceCloningService';
import { Voice } from '@/data/voices';
import { 
  Volume2, 
  Play, 
  Pause, 
  Download, 
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Sparkles
} from 'lucide-react';

interface TTSGeneratorProps {
  onGenerationComplete?: (result: { audio_base64: string; duration: number; generated_text: string }) => void;
  defaultVoice?: string;
}

export default function TTSGenerator({ onGenerationComplete, defaultVoice }: TTSGeneratorProps) {
  const { state, generateSpeech, reset, playAudio, pauseAudio, downloadAudio } = useTTS();
  const [text, setText] = useState('Welcome to VoiceAI Studio! This is a demonstration of our advanced text-to-speech technology powered by Higgs Audio V2. You can create natural-sounding voices for any purpose.');
  const [selectedVoice, setSelectedVoice] = useState(defaultVoice || 'belinda');
  const [isMultiSpeaker, setIsMultiSpeaker] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('podcast');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Voice loading state
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState({
    temperature: 0.6,
    top_p: 0.99,
    top_k: 100,
    max_new_tokens: 1024,
    scene_description: '',
    chunk_method: 'none' as 'word' | 'speaker' | 'sentence' | 'none',
    chunk_max_word_num: 50,
    chunk_max_num_turns: 2,
    generation_chunk_buffer_size: 2,
    ref_audio_in_system_message: false,
    // Experimental features
    experimental_features: {
      humming: false,
      bgm: false
    },
    ras_win_len: 0
  });

  // Load voices on component mount
  useEffect(() => {
    // Ensure voices are loaded to get latest cloned voices
    voiceCloningService.ensureVoicesLoaded();
    loadVoices();
  }, []);

  // Update selected voice when defaultVoice prop changes
  useEffect(() => {
    if (defaultVoice) {
      setSelectedVoice(defaultVoice);
    }
  }, [defaultVoice]);

  const loadVoices = useCallback(async () => {
    try {
      setLoadingVoices(true);
      setVoiceError(null);
      
      const allVoices = await ttsService.getAvailableVoices();
      setVoices(allVoices);
      
      console.log(`🎤 TTS Generator: Loaded ${allVoices.length} voices`);
      
      // If we have a default voice but it's not in the loaded voices, try to find it
      if (defaultVoice && !allVoices.find(v => v.id === defaultVoice)) {
        console.warn(`⚠️ Default voice "${defaultVoice}" not found in available voices`);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
      setVoiceError('Failed to load voices. Please refresh the page.');
    } finally {
      setLoadingVoices(false);
    }
  }, [defaultVoice]);

  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

  const multiSpeakerCombinations = ttsService.getMultiSpeakerCombinations();
  const presets = ttsService.getPresetConfigurations();

  const handleTextChange = (newText: string) => {
    setText(newText);
    // You could show validation messages here
  };

  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey);
    const preset = presets[presetKey as keyof typeof presets];
    if (preset) {
      setSettings(prev => ({
        ...prev,
        ...preset.config
      }));
    }
  };

     const handleGenerate = async () => {
     try {
       // Build the TTS request with all available parameters
       const request: any = {
         text: isMultiSpeaker ? ttsService.formatMultiSpeakerText(text) : text,
         ...settings,
         ref_audio_in_system_message: isMultiSpeaker || settings.ref_audio_in_system_message
       };

       // Handle different voice modes
       if (settings.experimental_features.humming) {
         // For humming mode, don't specify ref_audio_name
         request.ras_win_len = 0;
       } else if (settings.experimental_features.bgm) {
         // For BGM mode, enable ref_audio_in_system_message
         request.ref_audio_in_system_message = true;
       } else {
         // Regular voice clone mode
         request.ref_audio_name = selectedVoice;
       }

       // Add experimental feature flags
       if (settings.experimental_features.humming || settings.experimental_features.bgm) {
         request.experimental_mode = true;
       }

       console.log('🚀 TTS Request:', request);
       await generateSpeech(request);

       if (onGenerationComplete && state.result) {
         onGenerationComplete(state.result);
       }
     } catch (error) {
       console.error('TTS generation failed:', error);
     }
   };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
      setIsPlaying(false);
    } else {
      playAudio();
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    reset();
    setIsPlaying(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDuration = (seconds: number): string => {
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
        return <Clock className="w-5 h-5 text-orange-500 animate-spin" />;
      default:
        return null;
    }
  };

  const isCustomVoice = (voiceId: string) => {
    return voiceId.startsWith('cloned_');
  };

  const getVoiceDisplayName = (voice: Voice) => {
    if (isCustomVoice(voice.id)) {
      return voice.name; // Use human-readable name for custom voices
    }
    return voice.name; // Use regular name for standard voices
  };

  if (loadingVoices) {
    return (
      <div className="space-y-6">
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-700">Loading Voices...</h2>
          <p className="text-gray-500 mt-2">Fetching available voices</p>
        </div>
      </div>
    );
  }

  if (voiceError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-20">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Error Loading Voices</h2>
          <p className="text-gray-500 mb-6">{voiceError}</p>
          <button
            onClick={loadVoices}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Text Input */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Text Input</h2>
          <div className="flex items-center space-x-2">
            <button 
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              onClick={() => setText('')}
            >
              Clear
            </button>
          </div>
        </div>
        
                 <textarea
           value={text}
           onChange={(e) => handleTextChange(e.target.value)}
           placeholder={isMultiSpeaker ? 
             "Enter your text here...\n\nExample:\n[SPEAKER0] Hello, how are you today?\n[SPEAKER1] I'm doing great, thank you for asking!\n[SPEAKER0] That's wonderful to hear." :
             "Enter your text here... Use [SPEAKER0] and [SPEAKER1] tags for multi-speaker content."
           }
           className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
         />
        
                 <div className="flex items-center justify-between mt-4">
           <div className="text-sm text-gray-500">
             Characters: <span className="font-medium">{text.length}</span>
             {text.length > 1000 && (
               <span className="ml-2 text-amber-600">• Consider chunking for long text</span>
             )}
           </div>
           <div className="flex items-center space-x-4">
             <label className="flex items-center space-x-2">
               <input
                 type="checkbox"
                 checked={isMultiSpeaker}
                 onChange={(e) => setIsMultiSpeaker(e.target.checked)}
                 className="w-4 h-4 text-orange-500 rounded"
               />
               <span className="text-sm text-gray-700">Multi-Speaker</span>
             </label>
             
             {isMultiSpeaker && (
               <div className="flex items-center space-x-4 text-xs text-gray-600">
                 <span>Use [SPEAKER0], [SPEAKER1], etc. in your text</span>
                 <span>•</span>
                 <span>Supports up to 4 speakers</span>
               </div>
             )}
           </div>
         </div>
      </div>

      {/* Voice Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Selection</h3>
        
                 {isMultiSpeaker ? (
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Multi-Speaker Combination
               </label>
               <select
                 value={selectedVoice}
                 onChange={(e) => setSelectedVoice(e.target.value)}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
               >
                 {multiSpeakerCombinations.map((combo) => (
                   <option key={combo.voices} value={combo.voices}>
                     {combo.name} - {combo.description}
                   </option>
                 ))}
               </select>
               <p className="mt-2 text-sm text-gray-500">
                 Use [SPEAKER0] and [SPEAKER1] tags in your text to assign different speakers.
               </p>
             </div>
             
             {/* Multi-Speaker Advanced Options */}
             <div className="bg-gray-50 rounded-lg p-4">
               <h4 className="text-sm font-medium text-gray-700 mb-3">🎭 Multi-Speaker Settings</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="flex items-center space-x-2 mb-2">
                     <input
                       type="checkbox"
                       checked={settings.ref_audio_in_system_message}
                       onChange={(e) => setSettings(prev => ({ ...prev, ref_audio_in_system_message: e.target.checked }))}
                       className="w-4 h-4 text-orange-500 rounded"
                     />
                     <span className="text-sm text-gray-700">Reference Audio in System Message</span>
                   </label>
                   <p className="text-xs text-gray-500">Enable for better multi-speaker voice consistency</p>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Speaker Chunking: {settings.chunk_method === 'speaker' ? 'Enabled' : 'Disabled'}
                   </label>
                   <button
                     onClick={() => setSettings(prev => ({ 
                       ...prev, 
                       chunk_method: prev.chunk_method === 'speaker' ? 'none' : 'speaker' 
                     }))}
                     className={`px-3 py-1 text-xs rounded ${
                       settings.chunk_method === 'speaker'
                         ? 'bg-orange-500 text-white'
                         : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                     }`}
                   >
                     {settings.chunk_method === 'speaker' ? 'Disable' : 'Enable'}
                   </button>
                   <p className="text-xs text-gray-500 mt-1">Cluster segments by speaker turns for better dialog flow</p>
                 </div>
               </div>
               
               <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                 <div className="text-xs text-blue-800">
                   <strong>💡 Multi-Speaker Tips:</strong>
                   <ul className="mt-1 space-y-1">
                     <li>• Use [SPEAKER0] for the first speaker, [SPEAKER1] for the second, etc.</li>
                     <li>• Each speaker tag should be on its own line for best results</li>
                     <li>• Enable speaker chunking for long conversations</li>
                     <li>• Set chunk_max_num_turns in Advanced Settings for speaker control</li>
                   </ul>
                 </div>
               </div>
             </div>
           </div>
         ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Voice ({voices.length} available)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {voices.map((voice) => {
                const isCustom = isCustomVoice(voice.id);
                const isSelected = selectedVoice === voice.id;
                
                return (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`p-3 border rounded-lg text-left hover:shadow-md transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <User className={`w-4 h-4 ${
                        voice.gender === 'Female' ? 'text-pink-500' : 
                        voice.gender === 'Male' ? 'text-blue-500' :
                        voice.gender === 'Custom' ? 'text-purple-500' :
                        'text-gray-500'
                      }`} />
                      <span className="font-medium text-gray-900">{getVoiceDisplayName(voice)}</span>
                      {isCustom && <Sparkles className="w-4 h-4 text-purple-500" />}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {voice.gender} • {voice.category}
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-2">{voice.description}</div>
                    {isCustom && (
                      <div className="mt-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                        Custom Cloned Voice
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Preset Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Style Presets</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetChange(key)}
              className={`p-4 border rounded-lg text-left hover:shadow-md transition-all ${
                selectedPreset === key
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900 mb-1">{preset.name}</div>
              <div className="text-sm text-gray-600">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Advanced Settings</h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>
        
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature ({settings.temperature})
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">Controls expressiveness</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Top P ({settings.top_p})
              </label>
              <input
                type="range"
                min="0.9"
                max="0.99"
                step="0.01"
                value={settings.top_p}
                onChange={(e) => setSettings(prev => ({ ...prev, top_p: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">Nucleus sampling</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Top K ({settings.top_k})
              </label>
              <input
                type="range"
                min="30"
                max="100"
                step="10"
                value={settings.top_k}
                onChange={(e) => setSettings(prev => ({ ...prev, top_k: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">Top-k sampling</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max New Tokens</label>
              <select
                value={settings.max_new_tokens}
                onChange={(e) => setSettings(prev => ({ ...prev, max_new_tokens: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value={512}>512</option>
                <option value={1024}>1024</option>
                <option value={1536}>1536</option>
                <option value={2048}>2048</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chunk Method</label>
              <select
                value={settings.chunk_method}
                onChange={(e) => setSettings(prev => ({ ...prev, chunk_method: e.target.value as 'word' | 'speaker' | 'sentence' | 'none' }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="none">None (Default)</option>
                <option value="word">Word - Granular prosody control</option>
                <option value="sentence">Sentence - Stable generation</option>
                <option value="speaker">Speaker - Dialog clustering</option>
              </select>
              <div className="text-xs text-gray-500 mt-1">
                {settings.chunk_method === 'word' && 'Highly granular prosody and voice control'}
                {settings.chunk_method === 'sentence' && 'Stable generation per sentence'}
                {settings.chunk_method === 'speaker' && 'Clusters segments by speaker turns'}
                {settings.chunk_method === 'none' && 'No chunking - default behavior'}
              </div>
            </div>

            {/* Conditional chunking parameters based on method */}
            {settings.chunk_method === 'word' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Words per Chunk ({settings.chunk_max_word_num})
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={settings.chunk_max_word_num}
                  onChange={(e) => setSettings(prev => ({ ...prev, chunk_max_word_num: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">Maximum words per chunk for word-based chunking</div>
              </div>
            )}

            {settings.chunk_method === 'speaker' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Speaker Turns ({settings.chunk_max_num_turns})
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={settings.chunk_max_num_turns}
                  onChange={(e) => setSettings(prev => ({ ...prev, chunk_max_num_turns: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">Maximum speaker turns per chunk</div>
              </div>
            )}

            {(settings.chunk_method === 'word' || settings.chunk_method === 'speaker') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chunk Buffer Size ({settings.generation_chunk_buffer_size})
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={settings.generation_chunk_buffer_size}
                  onChange={(e) => setSettings(prev => ({ ...prev, generation_chunk_buffer_size: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">Number of chunks to buffer during generation</div>
              </div>
            )}

                         <div className="md:col-span-2 lg:col-span-3">
               <label className="block text-sm font-medium text-gray-700 mb-2">Scene Description</label>
               <input
                 type="text"
                 value={settings.scene_description}
                 onChange={(e) => setSettings(prev => ({ ...prev, scene_description: e.target.value }))}
                 placeholder="e.g., Professional podcast studio with energetic hosts"
                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
               />
             </div>

             {/* Experimental Features */}
             <div className="md:col-span-2 lg:col-span-3">
               <h4 className="text-sm font-medium text-gray-700 mb-3">🧪 Experimental Features</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-3">
                   <label className="flex items-center space-x-3">
                     <input
                       type="checkbox"
                       checked={settings.experimental_features.humming}
                       onChange={(e) => setSettings(prev => ({
                         ...prev,
                         experimental_features: {
                           ...prev.experimental_features,
                           humming: e.target.checked
                         }
                       }))}
                       className="w-4 h-4 text-orange-500 rounded"
                     />
                     <div>
                       <span className="text-sm font-medium text-gray-700">Humming Mode</span>
                       <p className="text-xs text-gray-500">Enable voice humming capabilities</p>
                     </div>
                   </label>
                   
                   <label className="flex items-center space-x-3">
                     <input
                       type="checkbox"
                       checked={settings.experimental_features.bgm}
                       onChange={(e) => setSettings(prev => ({
                         ...prev,
                         experimental_features: {
                           ...prev.experimental_features,
                           bgm: e.target.checked
                         }
                       }))}
                       className="w-4 h-4 text-orange-500 rounded"
                     />
                     <div>
                       <span className="text-sm font-medium text-gray-700">Background Music</span>
                       <p className="text-xs text-gray-500">Add background music to speech</p>
                     </div>
                   </label>
                 </div>
                 
                 <div className="space-y-3">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       RAS Window Length ({settings.ras_win_len})
                     </label>
                     <input
                       type="range"
                       min="0"
                       max="10"
                       step="1"
                       value={settings.ras_win_len}
                       onChange={(e) => setSettings(prev => ({ ...prev, ras_win_len: parseInt(e.target.value) }))}
                       className="w-full"
                     />
                     <div className="text-xs text-gray-500 mt-1">Reference audio window length (0 = disabled)</div>
                   </div>
                   
                   <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                     ⚠️ Experimental features may be unstable and are subject to change in future versions.
                   </div>
                 </div>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Processing Status */}
      {state.isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            {getStatusIcon()}
            <div>
              <div className="font-medium text-gray-900">
                {state.status === 'SUBMITTING' && 'Submitting generation job...'}
                {state.status === 'IN_QUEUE' && 'Job queued for processing...'}
                {state.status === 'IN_PROGRESS' && 'Generating audio...'}
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
              <div className="font-medium text-red-900">Generation Failed</div>
              <div className="text-sm text-red-700 mt-1">{state.error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {state.result && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Generated Audio</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(state.audioUrl || '')}
                className="p-2 rounded hover:bg-gray-100"
                title="Copy audio URL"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => downloadAudio()}
                className="p-2 rounded hover:bg-gray-100"
                title="Download audio"
              >
                <Download className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Audio Player */}
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </button>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-900">generated_audio.wav</span>
                  <span className="text-xs text-gray-500">{formatDuration(state.result.duration)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: '0%'}}></div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                0:00 / {formatDuration(state.result.duration)}
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => downloadAudio('generated_audio.wav')}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                <span>Download WAV</span>
              </button>
              <button
                onClick={() => downloadAudio('generated_audio.mp3')}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                <span>Download MP3</span>
              </button>
            </div>
          </div>

          {/* Generation Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-500">Duration</div>
              <div className="font-medium">{formatDuration(state.result.duration)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Sample Rate</div>
              <div className="font-medium">{state.result.sampling_rate} Hz</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Token Usage</div>
              <div className="font-medium">{state.result.usage.total_tokens}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Cache Status</div>
              <div className="font-medium">
                {state.result.cache_status.cache_exists ? 'Cached' : 'New'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {!state.isLoading && !state.result && (
          <button
            onClick={handleGenerate}
            disabled={!text.trim()}
            className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
          >
            <Volume2 className="w-5 h-5" />
            <span>Generate Speech</span>
          </button>
        )}

        {(state.result || state.error) && (
          <button
            onClick={handleReset}
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 font-medium"
          >
            Generate New Audio
          </button>
        )}
      </div>
    </div>
  );
}
