'use client';

import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  Mic, 
  Upload, 
  Settings, 
  Search, 
  Plus,
  Menu,
  User,
  Bell,
  HelpCircle,
  ChevronDown,
  Filter,
  Volume2,
  Users,
  Palette,
  Copy
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', href: '/', section: 'main' },
    { icon: FileText, label: 'My Transcriptions', href: '/transcriptions', section: 'personal', badge: 'NEW' },
    { icon: Mic, label: 'Live Transcription', href: '/live', section: 'personal' },
    { icon: Upload, label: 'Batch Upload', href: '/batch', section: 'personal' },
  ];

  const ttsItems = [
    { icon: Volume2, label: 'Text to Speech', href: '/tts', section: 'tts' },
    { icon: Copy, label: 'Voice Cloning', href: '/voice-clone', section: 'tts' },
    { icon: Users, label: 'Voice Gallery', href: '/voice-gallery', section: 'tts' },
    { icon: Settings, label: 'TTS Templates', href: '/tts-templates', section: 'tts' },
  ];

  const teamItems = [
    { icon: FileText, label: 'Shared Transcriptions', href: '/shared', section: 'team' },
    { icon: Upload, label: 'Team Uploads', href: '/team-uploads', section: 'team' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">VoiceAI Studio</h1>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Search */}
        {sidebarOpen && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Add New Button */}
        {sidebarOpen && (
          <div className="px-4 pb-4">
            <button className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {/* Main Section */}
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group"
              >
                <item.icon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </a>
            ))}
          </div>

          {/* TTS Section */}
          {sidebarOpen && (
            <div className="pt-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                TEXT-TO-SPEECH
              </h3>
              <div className="mt-2 space-y-1">
                {ttsItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group"
                  >
                    <item.icon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500" />
                    <span className="flex-1">{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Personal Section */}
          {sidebarOpen && (
            <div className="pt-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                PERSONAL
              </h3>
              <div className="mt-2 space-y-1">
                <a href="/archived" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
                  <FileText className="w-5 h-5 mr-3 text-gray-400" />
                  Archived
                </a>
                <a href="/favorites" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
                  <FileText className="w-5 h-5 mr-3 text-gray-400" />
                  Favorites
                </a>
              </div>
            </div>
          )}

          {/* Team Section */}
          {sidebarOpen && (
            <div className="pt-6">
              <div className="flex items-center justify-between px-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  TEAM
                </h3>
                <button className="text-blue-500 text-sm hover:text-blue-600">
                  Manage users
                </button>
              </div>
              <div className="mt-2 space-y-1">
                {teamItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <item.icon className="w-5 h-5 mr-3 text-gray-400" />
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">My Transcriptions</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Filter */}
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4 text-gray-500" />
              </button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <HelpCircle className="w-5 h-5 text-gray-500" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">A</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Anthony Johnson</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
                
                <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
