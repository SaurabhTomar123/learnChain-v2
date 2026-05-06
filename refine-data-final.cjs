const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'client', 'src', 'data', 'roadmaps.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const riskMap = {
  "backend-java": "Java is the 'gold standard' for stability. You won't be out of a job, but you might find yourself stuck in legacy monoliths if you don't keep up with Spring Boot 3+ and Cloud Native patterns. Tradeoff: High initial complexity (JVM, Memory Mgmt) for long-term career safety.",
  "fullstack-mern": "MERN is 'developer crack'—fast and satisfying. But everyone and their cousin knows it. To survive the saturation in the Indian market, you MUST know how to scale MongoDB and how the JS engine actually executes your code. Avoid being 'just a tutorial' dev.",
  "devops-aws": "You are the wizard of the infrastructure. The pay is insane once you hit the 3-year mark. Tradeoff: You are on-call. If the database goes down at 10 PM on a Sunday, it's your problem. Requires extreme discipline and a 'security-first' mindset.",
  "specialized-data-engineering": "This is a quiet, high-paying niche. Less visual glory than Frontend, but critical for the business. Tradeoff: Debugging a Spark cluster at scale is a nightmare compared to fixing a CSS bug. Requires strong SQL and distributed systems mental models.",
  "product-amazon": "The BAR is high. They don't just want you to code; they want you to take ownership. Tradeoff: High churn rate in some teams. You must be comfortable with constant documentation and 'Two-Pizza Teams' culture.",
  "service-tcs": "TCS is a safe harbor. Great for learning 'Enterprise' standards and working on massive scale projects. Tradeoff: Growth can be bureaucratic. You have to be proactive about upskilling yourself because the internal projects might not always use the latest tech."
};

const moduleMaterialsMap = {
  "Java Core & OOP": [
    { name: "Java Brains - Java 8 Streams & Lambdas", platform: "YouTube", link: "https://www.youtube.com/@JavaBrains", type: "free" },
    { name: "Telusko - Core Java for Beginners", platform: "YouTube", link: "https://www.youtube.com/playlist?list=PLsyeobzWxl7pe_IiTfNygGiBAtfKwKlIT", type: "free" },
    { name: "Javarevisited - OOP Design Patterns", platform: "Blog", link: "https://javarevisited.blogspot.com/", type: "doc" }
  ],
  "Spring Boot Framework": [
    { name: "Amigoscode - Spring Boot Masterclass", platform: "YouTube", link: "https://www.youtube.com/@amigoscode", type: "free" },
    { name: "Spring Academy (Pro Prep)", platform: "VMware", link: "https://spring.academy/", type: "paid/free" },
    { name: "Baeldung - Spring Boot Guides", platform: "Blog", link: "https://www.baeldung.com/spring-boot", type: "doc" }
  ],
  "React Essentials": [
    { name: "Akshay Saini - Namaste React", platform: "YouTube", link: "https://www.youtube.com/@akshaysaini", type: "free" },
    { name: "Hitesh Choudhary - React Series", platform: "YouTube", link: "https://www.youtube.com/@HiteshChoudharydotcom", type: "free" },
    { name: "Official React.dev Interactive Scrim", platform: "React", link: "https://react.dev/learn", type: "doc" }
  ],
  "Backend with Node.js": [
    { name: "Sheryians Coding School - Node.js Mastery", platform: "YouTube", link: "https://www.youtube.com/@SheryiansCodingSchool", type: "free" },
    { name: "Piyush Garg - Backend Development", platform: "YouTube", link: "https://www.youtube.com/@PiyushGargDev", type: "free" },
    { name: "MDN Web Docs - Express & Node", platform: "Mozilla", link: "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs", type: "doc" }
  ],
  "DSA Foundations": [
    { name: "Striver - A2Z DSA Course", platform: "YouTube", link: "https://takeuforward.org/", type: "free" },
    { name: "Kunal Kushwaha - System Design & DSA", platform: "YouTube", link: "https://www.youtube.com/@KunalKushwaha", type: "free" },
    { name: "LeetCode Explore - Top Interview Questions", platform: "LeetCode", link: "https://leetcode.com/explore/", type: "paid/free" }
  ]
};

data.roadmaps.forEach(roadmap => {
  roadmap.riskTradeoff = riskMap[roadmap.id] || "Reliable track with consistent market demand. Tradeoff: Requires deep specialization in core modules to break into senior pay brackets.";
  
  const seenMaterials = new Set();
  
  roadmap.modules.forEach(mod => {
    let materials = moduleMaterialsMap[mod.title] || [];
    
    // Filter out duplicates
    materials = materials.filter(m => !seenMaterials.has(m.link));
    
    // If we have specific materials, add them to seen
    materials.forEach(m => seenMaterials.add(m.link));
    
    // Populate with 2-3 unique materials
    if (materials.length < 2) {
       const general = [
         { name: `${mod.title} Masterclass`, platform: "Udemy", link: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(mod.title)}`, type: "paid" },
         { name: `${mod.title} Simplified`, platform: "YouTube Search", link: `https://www.youtube.com/results?search_query=${encodeURIComponent(mod.title)}`, type: "free" },
         { name: `${mod.title} Official Documentation`, platform: "Official", link: `https://www.google.com/search?q=${encodeURIComponent(mod.title)}+official+docs`, type: "doc" }
       ];
       
       for (const m of general) {
         if (!seenMaterials.has(m.link) && materials.length < 3) {
            materials.push(m);
            seenMaterials.add(m.link);
         }
       }
    }

    mod.recommendedMaterials = materials;
  });
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log("Roadmaps data fully refined with high-quality, non-repetitive materials and unique risk assessments.");
