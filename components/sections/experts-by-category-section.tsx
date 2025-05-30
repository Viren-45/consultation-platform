"use client";

import React from 'react';
import { 
  TrendingUp, 
  Megaphone, 
  Scale, 
  Calculator, 
  Palette, 
  Code, 
  Users, 
  Trophy,
  ArrowRight
} from 'lucide-react';

const ExpertsByCategorySection: React.FC = () => {
  const categories = [
    {
      title: "Business Strategy",
      description: "Startup validation, GTM plans, operations",
      icon: TrendingUp,
      gradient: "from-blue-500 via-blue-600 to-blue-700"
    },
    {
      title: "Marketing & Growth",
      description: "Campaign audits, funnel strategy, content planning",
      icon: Megaphone,
      gradient: "from-green-500 via-green-600 to-green-700"
    },
    {
      title: "Legal & Compliance",
      description: "Contract review, IP basics, business setup",
      icon: Scale,
      gradient: "from-purple-500 via-purple-600 to-purple-700"
    },
    {
      title: "Financial Planning",
      description: "Budgeting, forecasting, cash flow advice",
      icon: Calculator,
      gradient: "from-emerald-500 via-emerald-600 to-emerald-700"
    },
    {
      title: "Product & UX Strategy",
      description: "MVP scoping, user feedback analysis, roadmap sanity checks",
      icon: Palette,
      gradient: "from-orange-500 via-orange-600 to-orange-700"
    },
    {
      title: "Tech & Architecture",
      description: "API design, dev stack advice, scaling strategy",
      icon: Code,
      gradient: "from-indigo-500 via-indigo-600 to-indigo-700"
    },
    {
      title: "HR & Management",
      description: "Team hiring, performance reviews, remote culture",
      icon: Users,
      gradient: "from-pink-500 via-pink-600 to-pink-700"
    },
    {
      title: "Career & Leadership",
      description: "Role transitions, communication, exec coaching",
      icon: Trophy,
      gradient: "from-amber-500 via-amber-600 to-amber-700"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Explore Expertise by Category
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover the types of professionals available on MinuteMate — ready to offer focused advice when you need it most. 
            <span className="text-blue-600 font-medium"> New experts are joining every day.</span>
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-gray-100 hover:border-blue-200"
              >
                {/* Gradient background overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${category.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {category.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {category.description}
                  </p>

                  {/* CTA Arrow */}
                  <div className="flex items-center text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <span>Explore experts</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Subtle border glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 via-transparent to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        {/* <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-gray-600 text-sm mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>New categories and experts added weekly</span>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
            Browse All Experts
          </button>
        </div> */}
      </div>
    </section>
  );
};

export default ExpertsByCategorySection;