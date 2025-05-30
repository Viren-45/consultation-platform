"use client";

import React from 'react';
import { Zap, Users, MessageSquare, ArrowRight } from 'lucide-react';

const ForClientsSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Modern container with subtle gradient */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* Background Image with improved overlay */}
          <div 
            className="relative h-[500px] sm:h-[600px] lg:h-[700px] bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/Images/client-section-bg.png')"
            }}
          >
            {/* Sophisticated overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Content with better spacing */}
            <div className="relative z-10 h-full flex items-center px-8 sm:px-12 lg:px-16">
              <div className="max-w-6xl w-full">
                {/* Refined label */}
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8 border border-white/20">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  For Clients
                </div>
                
                {/* Improved typography */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white leading-[1.1] mb-6 tracking-tight">
                  Get expert advice,<br />
                  <span className="text-blue-400">your way</span>
                </h1>
                
                {/* Better description styling */}
                <p className="text-white/80 text-xl sm:text-2xl mb-8 max-w-2xl leading-relaxed font-light">
                  From idea validation to tough decisions — book short, effective sessions with trusted professionals. No contracts. No wasted time.
                </p>
                
                {/* Modern card grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Card 1 - Enhanced design */}
                  <div className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 transition-all duration-500 hover:scale-[1.02] cursor-pointer">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 transition-opacity duration-500 rounded-2xl"></div>
                    
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 transition-colors duration-300">
                        <Zap className="w-7 h-7 text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        Get Matched Instantly
                      </h3>
                      <p className="text-white/70 text-base mb-6 leading-relaxed">
                        Let our AI recommend the best-fit experts for your exact challenge.
                      </p>
                      <div className="flex items-center text-blue-400 font-semibold text-base group-hover:text-blue-300 transition-colors">
                        <span>Smart Match</span>
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 transition-all duration-500 hover:scale-[1.02] cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 transition-opacity duration-500 rounded-2xl"></div>
                    
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 transition-colors duration-300">
                        <Users className="w-7 h-7 text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        Browse Expert Profiles
                      </h3>
                      <p className="text-white/70 text-base mb-6 leading-relaxed">
                        View top-rated professionals by skill, rating, and availability.
                      </p>
                      <div className="flex items-center text-blue-400 font-semibold text-base group-hover:text-blue-300 transition-colors">
                        <span>Explore Experts</span>
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 transition-all duration-500 hover:scale-[1.02] cursor-pointer sm:col-span-2 lg:col-span-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 transition-opacity duration-500 rounded-2xl"></div>
                    
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 transition-colors duration-300">
                        <MessageSquare className="w-7 h-7 text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        Post Your Challenge
                      </h3>
                      <p className="text-white/70 text-base mb-6 leading-relaxed">
                        Describe what you need and let experts apply to help you.
                      </p>
                      <div className="flex items-center text-blue-400 font-semibold text-base group-hover:text-blue-300 transition-colors">
                        <span>Request Help</span>
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForClientsSection;