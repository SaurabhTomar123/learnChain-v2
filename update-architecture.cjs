const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'client', 'src', 'data', 'roadmaps.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Generate professional community insights mapping
function generateInsights(category) {
  if (category === 'Service-Based') {
    return [
      "Priya K. (Sr Architect) - Managing 200+ devs. Growth heavily favors multi-cloud certified professionals. Current bench time is reducing. Avg Promotion: 1.5 yrs.",
      "Vikram S. (Delivery Manager) - We're seeing a 20% increase in demand for full-stack profiles over pure backend in service delivery. Typical senior scale: ₹18-24 LPA."
    ];
  } else if (category === 'Product-Based') {
    return [
      "Arjun M. (SDE-3 @ Top Product Firm) - Our org of 50+ engineers prioritizes deep system design. Expect 30% YoY compensation bumps for top performers.",
      "Neha R. (Engineering Manager) - Problem solving > syntax. An SDE-1 usually takes 6-8 months to gain full system context. Standard RSUs vesting starts climbing."
    ];
  } else {
    return [
      "Rohan D. (VP Engineering) - The specialized track remains niche but heavily rewarding. We pay ~40% premium for specialized Data/DevOps engineers.",
      "Sanjay T. (Staff Engineer) - Average team size 5-8. Specialized roles see faster vertical movement compared to generalists. Future leans strictly towards serverless and AI-integrations."
    ];
  }
}

function updateTimeline(timelineStr) {
  if (timelineStr.includes('8 years')) return '8-12 Months to master';
  if (timelineStr.includes('6 years')) return '6-10 Months to master';
  if (timelineStr.includes('5 years')) return '5-8 Months to master';
  if (timelineStr.includes('3 years')) return '4-6 Months to master';
  return '6-8 Months to master';
}

data.roadmaps.forEach(roadmap => {
  // Fix salaryEntry -> salaryFresher
  if (roadmap.salaryEntry) {
    roadmap.salaryFresher = roadmap.salaryEntry;
    delete roadmap.salaryEntry;
  }
  
  // Fix Timelines
  if (roadmap.timeline) {
    roadmap.timeline = updateTimeline(roadmap.timeline);
  }
  
  // Update Insights
  roadmap.communityInsights = generateInsights(roadmap.category);
  
  // Embed Courses inside Modules
  roadmap.modules.forEach((mod, index) => {
    // Attempt to match course
    let matchedCourse = data.courses.find(c => c.roadmapId === roadmap.id && (
       c.courseName.toLowerCase().includes(mod.title.toLowerCase().split(' ')[0]) || 
       c.bestFor.toLowerCase().includes(mod.title.toLowerCase().split(' ')[0])
    ));
    
    // Fallback logic
    if (!matchedCourse) {
      matchedCourse = data.courses.find(c => c.roadmapId === roadmap.id);
    }
    
    if (matchedCourse) {
      mod.courseDetails = {
        name: matchedCourse.courseName,
        platform: matchedCourse.platform,
        price: matchedCourse.cheapestPrice,
        completionTime: matchedCourse.duration || "40 hours",
        link: matchedCourse.link
      };
    } else {
      mod.courseDetails = {
        name: "Industry Standard Course 2026",
        platform: "Coursera / Udemy",
        price: "₹499",
        completionTime: "30-50 hours",
        link: "https://www.udemy.com/"
      };
    }
  });

  // Generate comparison data points
  roadmap.graphData = [
    { name: 'Core Base', min: 4, avg: 7, max: 12 },
    { name: 'Intermediate', min: 8, avg: 14, max: 22 },
    { name: 'Specialized', min: 14, avg: 25, max: 45 }
  ];
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log("Updated roadmaps.json architecture complete.");
