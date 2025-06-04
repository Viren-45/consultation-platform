// data/expertise-categories.ts

export interface ExpertiseCategory {
  id: string;
  name: string;
  description: string;
  subcategories?: string[];
}

export const EXPERTISE_CATEGORIES: ExpertiseCategory[] = [
  {
    id: "marketing",
    name: "Marketing & Growth",
    description:
      "Digital marketing, growth hacking, content strategy, SEO, social media",
    subcategories: [
      "Digital Marketing",
      "Content Marketing",
      "Social Media Marketing",
      "Email Marketing",
      "SEO/SEM",
      "Growth Hacking",
      "Brand Strategy",
      "Marketing Analytics",
      "Influencer Marketing",
      "Performance Marketing",
    ],
  },
  {
    id: "business",
    name: "Business Strategy",
    description:
      "Business planning, strategy, operations, consulting, market research",
    subcategories: [
      "Business Strategy",
      "Strategic Planning",
      "Business Development",
      "Market Research",
      "Competitive Analysis",
      "Business Operations",
      "Process Improvement",
      "Management Consulting",
      "Market Entry Strategy",
      "Business Model Innovation",
    ],
  },
  {
    id: "technology",
    name: "Technology & Development",
    description:
      "Software development, web development, mobile apps, technical architecture",
    subcategories: [
      "Web Development",
      "Mobile App Development",
      "Software Architecture",
      "DevOps",
      "Cloud Computing",
      "Database Design",
      "API Development",
      "Frontend Development",
      "Backend Development",
      "Full-Stack Development",
    ],
  },
  {
    id: "design",
    name: "Design & Creative",
    description:
      "UI/UX design, graphic design, branding, product design, creative direction",
    subcategories: [
      "UI/UX Design",
      "Graphic Design",
      "Product Design",
      "Brand Design",
      "Web Design",
      "Mobile Design",
      "Design Systems",
      "User Research",
      "Prototyping",
      "Creative Direction",
    ],
  },
  {
    id: "finance",
    name: "Finance & Investment",
    description:
      "Financial planning, investment advice, accounting, fundraising, valuation",
    subcategories: [
      "Financial Planning",
      "Investment Strategy",
      "Accounting",
      "Financial Analysis",
      "Fundraising",
      "Venture Capital",
      "Financial Modeling",
      "Tax Planning",
      "Risk Management",
      "Corporate Finance",
    ],
  },
  {
    id: "sales",
    name: "Sales & Customer Success",
    description:
      "Sales strategy, lead generation, customer success, account management",
    subcategories: [
      "Sales Strategy",
      "Lead Generation",
      "Customer Success",
      "Account Management",
      "Sales Operations",
      "CRM Management",
      "Sales Training",
      "Business Development",
      "Channel Partnerships",
      "Customer Retention",
    ],
  },
  {
    id: "hr",
    name: "Human Resources",
    description:
      "Talent acquisition, HR strategy, organizational development, culture building",
    subcategories: [
      "Talent Acquisition",
      "HR Strategy",
      "Organizational Development",
      "Performance Management",
      "Compensation & Benefits",
      "Employee Relations",
      "Culture Building",
      "Training & Development",
      "HR Operations",
      "Diversity & Inclusion",
    ],
  },
  {
    id: "data",
    name: "Data & Analytics",
    description:
      "Data analysis, business intelligence, machine learning, data science",
    subcategories: [
      "Data Analysis",
      "Business Intelligence",
      "Data Science",
      "Machine Learning",
      "Data Engineering",
      "Statistical Analysis",
      "Predictive Analytics",
      "Data Visualization",
      "Big Data",
      "AI Strategy",
    ],
  },
  {
    id: "product",
    name: "Product Management",
    description:
      "Product strategy, product development, user research, product analytics",
    subcategories: [
      "Product Strategy",
      "Product Development",
      "Product Marketing",
      "User Research",
      "Product Analytics",
      "Roadmap Planning",
      "Feature Prioritization",
      "Agile/Scrum",
      "Product Launch",
      "Product Operations",
    ],
  },
  {
    id: "legal",
    name: "Legal & Compliance",
    description:
      "Legal advice, compliance, contracts, intellectual property, regulatory",
    subcategories: [
      "Corporate Law",
      "Contract Law",
      "Intellectual Property",
      "Compliance",
      "Employment Law",
      "Privacy Law",
      "Regulatory Affairs",
      "Legal Operations",
      "Risk Assessment",
      "Legal Strategy",
    ],
  },
  {
    id: "operations",
    name: "Operations & Logistics",
    description:
      "Operations management, supply chain, logistics, process optimization",
    subcategories: [
      "Operations Management",
      "Supply Chain",
      "Logistics",
      "Process Optimization",
      "Quality Management",
      "Vendor Management",
      "Project Management",
      "Lean Operations",
      "Inventory Management",
      "Operations Strategy",
    ],
  },
  {
    id: "consulting",
    name: "General Consulting",
    description:
      "Management consulting, strategic advice, problem-solving, industry expertise",
    subcategories: [
      "Management Consulting",
      "Strategic Consulting",
      "Organizational Consulting",
      "Change Management",
      "Business Transformation",
      "Industry Analysis",
      "Due Diligence",
      "Merger & Acquisition",
      "Turnaround Management",
      "Executive Coaching",
    ],
  },
];

export const getExpertiseCategoryById = (
  id: string
): ExpertiseCategory | undefined => {
  return EXPERTISE_CATEGORIES.find((category) => category.id === id);
};

export const getExpertiseCategoryNames = (): string[] => {
  return EXPERTISE_CATEGORIES.map((category) => category.name);
};

export const searchExpertiseCategories = (
  query: string
): ExpertiseCategory[] => {
  const lowercaseQuery = query.toLowerCase();
  return EXPERTISE_CATEGORIES.filter(
    (category) =>
      category.name.toLowerCase().includes(lowercaseQuery) ||
      category.description.toLowerCase().includes(lowercaseQuery) ||
      category.subcategories?.some((sub) =>
        sub.toLowerCase().includes(lowercaseQuery)
      )
  );
};
