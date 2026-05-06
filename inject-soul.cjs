const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'client', 'src', 'data', 'roadmaps.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const developerSoul = {
  "Java Core & OOP": "Don't just learn syntax. Master how JVM handles memory, the difference between stack/heap, and why Interfaces are the secret to decoupled code. You'll thank yourself in LLD rounds.",
  "Spring Boot Framework": "The magic of @Autowired is great until it breaks. Understand Proxy patterns, Bean lifecycles, and how Spring actually boots up. This is where most junior devs get stuck.",
  "Data Access (JPA/Hibernate)": "N+1 queries will kill your production app. Learn how to write efficient JPQL, use `@EntityGraph`, and when to drop down to native SQL for performance.",
  "React Essentials": "Stop passing props 10 levels deep. Master Hooks (not just useState) and understand the Reconciliation process. A good dev knows HOW React updates the DOM.",
  "Backend with Node.js": "Event loop is your best friend and worst enemy. Learn to write non-blocking code and handle cluster-mode for high-scale apps. Production apps don't run on `node index.js`.",
  "DSA Foundations": "Don't memorize LeetCode. Learn to spot patterns (Sliding Window, Two Pointers). Product companies care about HOW you arrived at the optimized solution, not just the result.",
  "Linux & System Administration": "If you can't navigate a server using only CLI, you aren't ready for production. Master grep, awk, and basic bash scripting to automate the boring stuff."
};

data.roadmaps.forEach(roadmap => {
  roadmap.modules.forEach(mod => {
    if (developerSoul[mod.title]) {
      mod.description = developerSoul[mod.title];
    }
  });
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log("Developer 'Soul' injected into module descriptions.");
