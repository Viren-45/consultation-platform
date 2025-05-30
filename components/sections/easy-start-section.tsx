"use client";

import React from 'react';
import { Search, Zap, MessageCircle } from 'lucide-react';

const EasyStartSection: React.FC = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-8 items-center">
          {/* Left side - Illustration placeholder */}
          <div>
            <div className="bg-blue-50 rounded-2xl h-96 sm:h-96 lg:h-[450px] flex items-center justify-center">
              {/* Placeholder for illustration - you can add your image here later */}
              <div className="text-blue-300 text-sm font-medium">
                Illustration placeholder
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-8">
            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-4xl font-semibold text-gray-900 leading-tight">
              Expert advice, without the hassle
            </h2>

            {/* Feature list */}
            <div className="space-y-6">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    No cost to explore
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Browse expert profiles, check ratings, and preview consultation types — all for free.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Book in minutes, not weeks
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    No contracts, no emails back and forth. Just tell us what you need, and we'll match you instantly.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Get real advice, real fast
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    15–30 minute video calls with vetted professionals — from marketing to legal, product, finance, and more.
                  </p>
                </div>
              </div>
            </div>

            {/* Call to action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-base transition-colors shadow-lg cursor-pointer">
                Sign up free
              </button>
              <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold text-base transition-colors cursor-pointer">
                How it works
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EasyStartSection;