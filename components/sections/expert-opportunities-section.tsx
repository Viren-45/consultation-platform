"use client";

import React from 'react';
import { 
  Clock, 
  DollarSign, 
  Star, 
  Video,
  FileText,
  CheckCircle2,
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const ExpertOpportunitiesSection: React.FC = () => {
  const opportunities = [
    {
      title: "Flexible Micro-Sessions",
      description: "15-30 minute consultations that fit around your schedule",
      highlight: "Fill calendar gaps",
      icon: Clock,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Set Your Own Rates",
      description: "Earn $50-500+ per session based on your expertise level",
      highlight: "You control pricing",
      icon: DollarSign,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Global Client Reach",
      description: "Connect with clients worldwide through video consultations",
      highlight: "No geographic limits",
      icon: Video,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "AI-Enhanced Sessions",
      description: "Clients come prepared with context, maximizing session value",
      highlight: "No time wasted",
      icon: FileText,
      color: "from-orange-500 to-orange-600"
    }
  ];

  const earnings = [
    { sessions: "5", weekly: "$375", monthly: "$1,500", type: "Side Income" },
    { sessions: "15", weekly: "$1,125", monthly: "$4,500", type: "Part-Time", popular: true },
    { sessions: "30", weekly: "$2,250", monthly: "$9,000", type: "Full-Time" }
  ];

  const benefits = [
    "Verified expert badge increases your credibility",
    "Client rating system builds your reputation",
    "AI-generated session summaries save time",
    "Instant payments after each session"
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
        <div className="inline-flex items-center px-6 py-3 bg-white/60 backdrop-blur-lg rounded-full border border-white/40 shadow-lg mb-8 hover:bg-white/70 transition-all duration-300">
            <Sparkles className="w-4 h-4 text-blue-600 mr-2 animate-pulse" />
            <span className="text-blue-700 font-semibold bg-gradient-to-r from-blue-900 via-blue-500 to-blue-800 bg-clip-text text-transparent">
              Expert Opportunities
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Turn expertise into
            <span className="block bg-gradient-to-r from-blue-900 via-blue-600 to-blue-300 bg-clip-text text-transparent">
              recurring income
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join the future of professional consulting. Share your knowledge through focused micro-sessions 
            and build a flexible income stream on your terms.
          </p>
        </div>

        {/* Opportunities Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {opportunities.map((opportunity, index) => {
            const IconComponent = opportunity.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${opportunity.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                
                <div className="inline-block px-3 py-1 bg-blue-100 rounded-full text-blue-600 text-xs font-medium mb-3">
                  {opportunity.highlight}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {opportunity.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {opportunity.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExpertOpportunitiesSection;