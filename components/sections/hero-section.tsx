"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';

const HeroSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'find' | 'offer'>('find');

  return (
    <section className="py-26 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Modern container with enhanced styling */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          {/* Background Image */}
          <div 
            className="h-[500px] sm:h-[600px] lg:h-[650px] bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/Images/hero-bg-main.png')"
            }}
          >
            {/* Sophisticated overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            
            {/* Content with improved layout */}
            <div className="relative z-10 h-full flex items-center px-8 sm:px-12 lg:px-16">
              <div className="max-w-2xl">
                {/* Refined Main Heading */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-8 tracking-tight">
                  Connect with verified<br />
                  experts for{' '}
                  <span className="text-blue-400 relative">
                    instant
                  </span>{' '}
                  business solutions
                </h1>
                
                {/* Compact Tabbed Interface */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl max-w-xl border border-white/20">
                  {/* Compact Tab Headers */}
                  <div className="flex gap-1 mb-6 bg-black/20 p-1 rounded-full backdrop-blur-sm">
                    <button
                      onClick={() => setActiveTab('find')}
                      className={`flex-1 py-2.5 px-5 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeTab === 'find'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'text-white/90 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Find Experts
                    </button>
                    <button
                      onClick={() => setActiveTab('offer')}
                      className={`flex-1 py-2.5 px-5 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeTab === 'offer'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'text-white/90 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Offer Expertise
                    </button>
                  </div>
                  
                  {/* Compact Tab Content */}
                  {activeTab === 'find' ? (
                    <div className="space-y-4">
                      {/* Refined Search Bar */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search by role, skills, or keywords"
                          className="w-full px-5 py-3.5 pr-16 text-gray-900 placeholder-gray-500 bg-white rounded-xl border-0 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-lg text-sm font-medium transition-all duration-300"
                        />
                        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-1.5 text-sm font-medium">
                          <Search className="w-4 h-4" />
                          Search
                        </button>
                      </div>
                      
                      {/* Subtle stats */}
                      <div className="text-center">
                        <p className="text-white/60 text-xs">
                          10,000+ verified experts ready to help
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <h3 className="text-white text-lg font-semibold mb-3">
                        Share Your Expertise
                      </h3>
                      <p className="text-white/70 text-sm mb-5 leading-relaxed">
                        Join our platform and connect with clients who need your skills.
                      </p>
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg">
                        Get Started
                      </button>
                      <div className="mt-3">
                        <p className="text-white/50 text-xs">
                          5,000+ professionals earning on our platform
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;