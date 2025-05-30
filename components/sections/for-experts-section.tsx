"use client";

import React from 'react';
import { DollarSign, Clock, Star, ArrowRight, Users, TrendingUp } from 'lucide-react';

const ForExpertsSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Modern asymmetric container */}
        <div className="relative">      
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Label with modern pill design */}
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full border border-blue-200/50">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-blue-700 font-semibold text-sm">For Experts</span>
              </div>
              
              {/* Main heading with gradient text */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-gray-900">Turn your expertise</span><br />
                <span className="bg-gradient-to-r from-blue-900 via-blue-500 to-blue-800 bg-clip-text text-transparent">
                  into income
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Share your knowledge through quick consultations and build a flexible income stream. 
                Set your rates, choose your schedule, work from anywhere.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-8 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">$20-100</div>
                    <div className="text-sm text-gray-600">per session</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">15-30</div>
                    <div className="text-sm text-gray-600">min sessions</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-400 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.03] flex items-center justify-center gap-2 cursor-pointer">
                  Start Earning Today
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-blue-50 cursor-pointer">
                  See How It Works
                </button>
              </div>
            </div>

            {/* Right side - Feature cards in a staggered layout */}
            <div className="relative">
              {/* Background image placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 rounded-3xl opacity-50"></div>
              
              {/* Floating feature cards */}
              <div className="relative z-10 space-y-6 p-8">
                {/* Card 1 - Top */}
                <div className="ml-auto max-w-sm bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Build Your Reputation</h3>
                      <p className="text-gray-600 text-sm">Get rated by clients and showcase your expertise to attract more bookings.</p>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Middle */}
                <div className="max-w-sm bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Connect Globally</h3>
                      <p className="text-gray-600 text-sm">Reach clients worldwide through our platform's video consultation system.</p>
                    </div>
                  </div>
                </div>

                {/* Card 3 - Bottom */}
                <div className="ml-auto max-w-sm bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Grow Your Income</h3>
                      <p className="text-gray-600 text-sm">Scale from side hustle to full-time income as you build your client base.</p>
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

export default ForExpertsSection;