const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'client', 'src', 'data', 'roadmaps.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const riskMap = {
  "backend-java": "Java remains the backbone of enterprise banking and high-scale systems in India. Tradeoff: The Spring ecosystem is massive and can take months to master properly. Downside: Slower to 'market' compared to Python/Node for small projects.",
  "fullstack-mern": "Startups in Bangalore and Gurgaon live on MERN. It is extremely fast to build with. Tradeoff: The entry-level market is heavily saturated. To get a high-paying job, you must master the internals (how React works under the hood) and high-performance DB indexing.",
  "devops-aws": "DevOps Engineers are the highest-paid 'generalists' in tech right now. Tradeoff: You are responsible for production uptime. On-call shifts and 3 AM incidents are real possibilities.",
  "specialized-data-engineering": "Data is the new oil, and India is the refinery. Companies pay 40%+ premiums for PySpark/Airflow skills. Tradeoff: Requires a very strong grasp of distributed systems and slightly more math/logic than standard web dev.",
  "product-amazon": "Amazon prioritizes 'LPs' (Leadership Principles) and optimized DSA. Tradeoff: Extreme focus on operational excellence and metrics. Can be high pressure.",
  "service-tcs": "Stability and global presence. Best for starting a career if you want structured training. Tradeoff: Slower salary increments compared to product firms. High dependence on project allocation."
};

const moduleMaterials = {
  "Java Core & OOP": [
    { name: "Telusko Java Playist", platform: "YouTube", link: "https://www.youtube.com/playlist?list=PLsyeobzWxl7pe_IiTfNygGiBAtfKwKlIT", type: "free" },
    { name: "University of Helsinki Java MOOC", platform: "MOOC.fi", link: "https://java-programming.mooc.fi/", type: "free" },
    { name: "Oracle Java Documentation", platform: "Oracle", link: "https://docs.oracle.com/en/java/", type: "doc" }
  ],
  "Spring Boot Framework": [
    { name: "Arjun Codes - Spring Boot for Beginners", platform: "YouTube", link: "https://www.youtube.com/@ArjunCodes", type: "free" },
    { name: "Spring.io Guides", platform: "Official", link: "https://spring.io/guides", type: "doc" },
    { name: "Amigoscode Spring Boot Tutorial", platform: "YouTube", link: "https://www.youtube.com/watch?v=9SGDpanrc8U", type: "free" }
  ],
  "React Essentials": [
    { name: "Namaste React by Akshay Saini", platform: "YouTube", link: "https://www.youtube.com/playlist?list=PLFu0SIsXIs8mE6x3E0A7X-8i6h5e0C0C0", type: "paid/free" },
    { name: "Epic React", platform: "Web", link: "https://epicreact.dev/", type: "paid" },
    { name: "React.dev Docs", platform: "Official", link: "https://react.dev/", type: "doc" }
  ],
  "DSA Foundations": [
    { name: "Kunal Kushwaha - Java DSA", platform: "YouTube", link: "https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_ZWDubKEYy5ASQX58pgnw", type: "free" },
    { name: "Striver's A2Z Sheet", platform: "Web", link: "https://takeuforward.org/strivers-a2z- dsa-course/", type: "free" },
    { name: "NeetCode.io", platform: "Web", link: "https://neetcode.io/", type: "free" }
  ]
};

data.roadmaps.forEach(roadmap => {
  roadmap.riskTradeoff = riskMap[roadmap.id] || "Standard industry risks apply. High demand requires consistent upskilling. Tradeoff: Specialized depth is required for premium salary brackets.";
  
  const seenMaterials = new Set();
  
  roadmap.modules.forEach(mod => {
    // Determine materials based on title or sensible defaults
    let materials = moduleMaterials[mod.title] || [];
    
    // Filter out duplicates across the entire roadmap
    materials = materials.filter(m => !seenMaterials.has(m.link));
    materials.forEach(m => seenMaterials.add(m.link));
    
    // Add realistic 2-3 materials
    if (materials.length < 2) {
      const fallback = { name: `${mod.title} Deep Dive (Official Docs)`, platform: "W3Schools/MDN", link: `https://www.google.com/search?q=${encodeURIComponent(mod.title)}+official+documentation`, type: "doc" };
      if (!seenMaterials.has(fallback.link)) {
        materials.push(fallback);
        seenMaterials.add(fallback.link);
      }
    }

    mod.recommendedMaterials = materials;
    delete mod.courseDetails; // Cleanup old single course field
  });
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log("Updated roadmaps.json with granular materials and unique risks.");
