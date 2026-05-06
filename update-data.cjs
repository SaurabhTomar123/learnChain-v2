const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'client', 'src', 'data', 'roadmaps.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const newRoadmaps = [
  {
    "id": "service-wipro",
    "category": "Service-Based",
    "company": "Wipro",
    "title": "Wipro Fresher to Senior",
    "description": "Complete roadmap for Wipro employees from fresher to senior engineer",
    "salaryFresher": "₹3.5-5 LPA",
    "salarySenior": "₹14-25 LPA",
    "timeline": "0-8 years",
    "modules": [
      {
        "id": "training",
        "title": "Initial Training",
        "description": "Wipro PRP training",
        "duration": "3 months",
        "topics": ["Programming", "Soft Skills"]
      }
    ],
    "essentialSkills": ["Core programming", "Problem solving"],
    "communityInsights": ["Internal job postings are good for growth"]
  },
  {
    "id": "service-hcl",
    "category": "Service-Based",
    "company": "HCL",
    "title": "HCL Fresher to Senior",
    "description": "Complete roadmap for HCL employees from fresher to senior engineer",
    "salaryFresher": "₹3.5-5 LPA",
    "salarySenior": "₹15-26 LPA",
    "timeline": "0-8 years",
    "modules": [
      {
        "id": "training",
        "title": "Onboarding",
        "description": "HCL onboarding",
        "duration": "3 months",
        "topics": ["Programming", "Soft Skills"]
      }
    ],
    "essentialSkills": ["Core programming", "Problem solving"],
    "communityInsights": ["Good work-life balance"]
  },
  {
    "id": "service-tech-mahindra",
    "category": "Service-Based",
    "company": "Tech Mahindra",
    "title": "Tech Mahindra Fresher to Senior",
    "description": "Complete roadmap for Tech Mahindra employees from fresher to senior engineer",
    "salaryFresher": "₹3.5-5 LPA",
    "salarySenior": "₹14-24 LPA",
    "timeline": "0-8 years",
    "modules": [
      {
        "id": "training",
        "title": "Initial Training",
        "description": "Training and bench",
        "duration": "3 months",
        "topics": ["Programming", "Soft Skills"]
      }
    ],
    "essentialSkills": ["Core programming", "Problem solving"],
    "communityInsights": ["Opportunity to work on telecom domain"]
  },
  {
    "id": "product-flipkart",
    "category": "Product-Based",
    "company": "Flipkart",
    "title": "Flipkart Engineer Path",
    "description": "Complete roadmap for Flipkart engineers from entry-level to senior",
    "salaryFresher": "₹15-22 LPA",
    "salarySenior": "₹50-90 LPA",
    "timeline": "0-6 years",
    "modules": [
      {
        "id": "interview",
        "title": "Interview Prep",
        "description": "DSA and System Design",
        "duration": "4 months",
        "topics": ["DSA", "System Design"]
      }
    ],
    "essentialSkills": ["Advanced DSA", "System Design"],
    "communityInsights": ["Great e-commerce exposure"]
  },
  {
    "id": "product-phonepe",
    "category": "Product-Based",
    "company": "PhonePe",
    "title": "PhonePe Engineer Path",
    "description": "Complete roadmap for PhonePe engineers from entry-level to senior",
    "salaryFresher": "₹18-24 LPA",
    "salarySenior": "₹60-100 LPA",
    "timeline": "0-6 years",
    "modules": [
      {
        "id": "interview",
        "title": "Interview Prep",
        "description": "DSA and System Design",
        "duration": "4 months",
        "topics": ["DSA", "System Design"]
      }
    ],
    "essentialSkills": ["Advanced DSA", "System Design"],
    "communityInsights": ["High scale fintech challenges"]
  },
  {
    "id": "product-razorpay",
    "category": "Product-Based",
    "company": "Razorpay",
    "title": "Razorpay Engineer Path",
    "description": "Complete roadmap for Razorpay engineers from entry-level to senior",
    "salaryFresher": "₹16-22 LPA",
    "salarySenior": "₹55-90 LPA",
    "timeline": "0-6 years",
    "modules": [
      {
        "id": "interview",
        "title": "Interview Prep",
        "description": "DSA and System Design",
        "duration": "4 months",
        "topics": ["DSA", "System Design"]
      }
    ],
    "essentialSkills": ["Advanced DSA", "System Design"],
    "communityInsights": ["Strong engineering culture"]
  },
  {
    "id": "specialized-data-engineering",
    "category": "Specialized",
    "title": "Data Engineering",
    "company": "",
    "description": "Complete roadmap for Data Engineering in India",
    "salaryFresher": "₹6-12 LPA",
    "salarySenior": "₹20-45 LPA",
    "timeline": "0-5 years",
    "modules": [
      {
        "id": "basics",
        "title": "Data Basics",
        "description": "SQL and Python",
        "duration": "3 months",
        "topics": ["SQL", "Python"]
      }
    ],
    "essentialSkills": ["SQL", "Python", "Spark", "Hadoop"],
    "communityInsights": ["High demand in unicorns"]
  },
  {
    "id": "specialized-mobile",
    "category": "Specialized",
    "title": "Mobile Development",
    "company": "",
    "description": "Complete roadmap for Mobile Development (React Native / Android / iOS) in India",
    "salaryFresher": "₹5-10 LPA",
    "salarySenior": "₹18-40 LPA",
    "timeline": "0-5 years",
    "modules": [
      {
        "id": "basics",
        "title": "Mobile Basics",
        "description": "React Native or Kotlin",
        "duration": "4 months",
        "topics": ["React Native", "Kotlin", "Swift"]
      }
    ],
    "essentialSkills": ["React Native", "Android/iOS context"],
    "communityInsights": ["Cross-platform is huge in Indian startups"]
  }
];

data.roadmaps.push(...newRoadmaps);

// Add missing course properties
data.courses.forEach(c => {
  if (!c.completionTime) c.completionTime = c.duration || "Self-paced";
  if (!c.certificateValue) c.certificateValue = c.certificate || "Valuable for entry-level";
  if (!c.actualStudentReviews) c.actualStudentReviews = c.communityReview || "Highly rated";
  if (!c.alternativeFreeResources) c.alternativeFreeResources = "YouTube, official docs";
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log("Updated roadmaps.json");
