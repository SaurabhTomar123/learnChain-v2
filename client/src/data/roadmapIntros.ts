export interface RoadmapIntro {
  summary: string;
  videoId?: string;
  videoDuration?: string; // displayed as a badge, e.g. "1:47" or "~5 min"
  videoCaption?: string;
  videoNote?: string; // shown when video exceeds 2 min
}

export const roadmapIntros: Record<string, RoadmapIntro> = {
  "service-tcs": {
    summary: `A career at TCS is one of the most common starting points for Indian engineering graduates, and for good reason. With over 600,000 employees worldwide, TCS offers structured onboarding, a massive internal learning platform (iEvolve), and exposure to global enterprise clients across banking, insurance, healthcare, and retail.

The role of a TCS associate is not glamorous at the start. You will spend your first months learning the company's processes, tooling, and client communication protocols. But this structure teaches you the fundamentals of professional software delivery: version control discipline, documentation standards, sprint ceremonies, and working in cross-functional teams.

What makes this path worthwhile is the sheer breadth of exposure. Over two to three years, most TCS developers touch multiple domains, work with senior architects on real client systems, and pick up skills in Java, SQL, testing frameworks, and cloud platforms. The engineers who thrive here are the ones who use this stability as a launchpad. They pursue TCS certifications, contribute beyond their tickets, and build depth in one specialization.

To master this path, treat your first year as an investment in professional habits. Learn the codebase deeply, not just the surface. Volunteer for debugging, documentation, and cross-team tasks. By year two, your goal should be leading a module or becoming the go-to person for a specific technology. The TCS track rewards consistency, initiative, and continuous upskilling more than raw coding brilliance.`,
    // No video: no concise public intro for TCS career path exists that is accurate and beginner-friendly.
  },

  "service-infosys": {
    summary: `Infosys is one of India's flagship IT companies, and joining as a Systems Engineer is a serious career foundation. Known for its Infosys Training Centre in Mysuru (one of the largest corporate training campuses in the world), Infosys invests heavily in turning fresh graduates into deployable software professionals.

The Infosys journey begins with a rigorous 5-month onboarding at Mysuru, where you study programming fundamentals, database design, Unix/Linux commands, and soft skills. This is not a formality. Engineers who take this training seriously enter their first project far more prepared than peers from companies with lighter onboarding.

What distinguishes Infosys from other service companies is its emphasis on client-facing communication. You will regularly interact with US, UK, or European clients through written reports, sprint demos, and requirement discussions. This exposure builds communication skills that are rare among developers at the same experience level.

To maximize this path, identify your specialization by month three of your first project. Whether it is Java microservices, Salesforce, SAP, or cloud migration, becoming a domain expert within the Infosys ecosystem accelerates promotions and opens up niche high-paying roles. Infosys also offers internal certifications through Lex (their learning platform) that are recognized by clients. Engineers who stack two or three certifications within their first two years consistently outpace their peers in growth and compensation.`,
    // No video: no concise public intro for Infosys career path exists that is accurate and beginner-friendly.
  },

  "service-cognizant": {
    summary: `Cognizant is a powerhouse in IT services, consistently ranked among the top technology employers in India and the US. For fresh engineers, joining Cognizant as a Programmer Analyst Trainee offers a structured entry into professional software development, with real client work beginning within the first six months.

The CognizantAcademy (formerly GenC) program is where most fresh hires spend their first weeks. You will be trained across Java, Python, databases, cloud fundamentals, and Agile methodology. The training is intensive by design: Cognizant deploys engineers to client accounts quickly, so they need you functional fast.

Cognizant's strength lies in its diversity of accounts. The company serves clients in healthcare, financial services, manufacturing, and retail tech. This breadth means you can navigate toward the industry vertical that interests you most (healthcare IT, fintech platforms, or enterprise cloud modernization) and build genuine domain expertise alongside your technical skills.

The engineers who thrive at Cognizant are not passive. They raise their hands for technically complex tasks, pursue external certifications (AWS, Azure, GCP), and engage with internal talent programs like TechCatalyst that identify high-potential engineers for accelerated tracks. After three years at Cognizant, engineers with cloud or automation depth regularly receive offers from product companies at a 40 to 60 percent salary premium. Treat Cognizant as a structured launchpad: master the basics, build a specialty, and use the experience to position yourself strategically for your next move.`,
    // No video: no concise public intro for Cognizant career path exists that is accurate and beginner-friendly.
  },

  "product-amazon": {
    summary: `Getting hired as an SDE at Amazon is one of the most transformative career decisions an Indian engineer can make. Amazon's engineering culture is unlike anything in the service sector. Every decision is driven by the "Working Backwards" method, leadership principles are embedded in every code review and design doc, and the scale of systems you touch (handling millions of requests per second) fundamentally changes how you think about software.

The path to Amazon is not short. Amazon SDE interviews are famously rigorous: multiple LeetCode-style coding rounds, system design problems at scale, and behavioral interviews that assess alignment with Amazon's 16 Leadership Principles. Candidates spend months preparing, and most attempt multiple times before passing. This is normal, not failure.

Once inside, Amazon SDE1s own their modules end-to-end. You write the code, the unit tests, the runbook, and the deployment pipeline. The autonomy is real but so is the accountability. Amazon's on-call culture means you are responsible for production health of what you ship. This builds debugging instincts and operational awareness that are irreplaceable in your career.

The essential skills to master are: strong data structures and algorithms (LeetCode medium/hard), distributed systems design (CAP theorem, eventual consistency, queues), and Amazon's operational toolkit (CloudWatch, DynamoDB, Lambda). Beyond technical depth, the ability to articulate technical decisions clearly in written form (Amazon's "6-pager" culture) is what separates SDE1s from SDE2s. Engineers who crack this written communication component typically grow faster at Amazon than pure coding experts.`,
    // No video: no concise public intro for Amazon SDE career path exists that is accurate, unbiased, and beginner-friendly.
  },

  "product-microsoft": {
    summary: `A career at Microsoft as a Software Engineer means working at one of the most influential technology companies in history, building products that reach billions of users across Windows, Azure, Office 365, GitHub, and Xbox. Microsoft's culture has transformed significantly under Satya Nadella's leadership, shifting from a competitive, silo-driven organization to one centered on growth mindset, collaboration, and cloud-first innovation.

The Microsoft interview process tests both coding ability and problem decomposition. Rounds cover algorithms, design questions (often focused on Azure-scale systems), and behavioral interviews around ownership and collaboration. Unlike some companies, Microsoft values engineering depth over breadth. Demonstrating mastery of a specific domain (distributed systems, compiler design, ML infrastructure) can be a significant differentiator.

Inside Microsoft, engineers work in small feature teams with genuine ownership. The engineering culture places high value on documentation, internal tooling (Azure DevOps is Microsoft's own product), and cross-team API contracts. You will spend real time in design reviews, architecture discussions, and customer feedback loops.

To master this path, focus on C# and .NET for many teams, TypeScript for web properties, and Python for ML roles. Azure fundamentals are essential regardless of team. For system design, study distributed consensus, blob storage architecture, and event-driven patterns. The behavioral dimension of Microsoft's interview is often underestimated: prepare stories around "impact and influence," "dealing with ambiguity," and "building partnerships," as these are the Leadership Principles Microsoft evaluates most carefully.`,
    // No video: no concise public intro for Microsoft SDE career path exists that is accurate, unbiased, and beginner-friendly.
  },

  "product-google": {
    summary: `Google SDE is arguably the most prestigious software engineering role in India and globally. The compensation is exceptional, the engineering problems are genuinely hard, and the internal tooling (Borg, Blaze, Piper) gives you a view into systems that no textbook can replicate. But the path to getting here, and thriving once you do, demands a level of technical depth that most engineers underestimate.

Google's interview process is famously algorithm-heavy: four to six rounds covering data structures, algorithms, and system design at planet-scale. The bar is high and consistent; there are no shortcuts. Most successful candidates have solved 200 to 400 LeetCode problems at medium-hard difficulty, reviewed distributed systems literature (Designing Data-Intensive Applications is essential), and participated in competitive programming or open-source projects.

Inside Google, engineers work within a flat hierarchy where technical credibility is the primary currency. The code review culture is rigorous: even senior engineers receive detailed feedback on their CLs (code changelists). This discipline produces unusually clean, well-documented code, and the habits built here carry enormous career value.

The essential skills: algorithms and data structures at competition level, distributed systems design (consistent hashing, LSM trees, Paxos, Raft), and an understanding of Google's own infrastructure (MapReduce, Bigtable, Spanner papers are worth reading). The behavioral dimension focuses on collaboration, conflict resolution, and ownership of large ambiguous projects. Engineers who combine algorithmic excellence with strong communication and cross-functional leadership are the ones who reach L5 and beyond, the inflection point for exceptional compensation at Google.`,
    // No video: no concise public intro for Google SDE career path exists that is accurate, unbiased, and beginner-friendly.
  },

  "fullstack-mern": {
    summary: `Full Stack MERN development (MongoDB, Express, React, Node.js) is one of the fastest routes to building complete web products with a single programming language: JavaScript. This path is chosen by startup engineers, freelancers, product-focused developers, and anyone who wants end-to-end ownership of what they build, from database schema to pixel-perfect UI.

The MERN stack's superpower is its uniformity. You write JavaScript on the client (React), on the server (Node/Express), and in your database queries (MongoDB). This reduces cognitive switching cost and makes it possible to become deeply productive across the entire stack without learning multiple languages. For solo developers and small teams, this translates directly into speed.

What does a Full Stack MERN engineer actually do? They design and implement REST (or GraphQL) APIs, build responsive React UIs with proper state management, model and query MongoDB or PostgreSQL data, handle authentication (JWT, OAuth), configure cloud deployments (AWS, Vercel, Railway), and write tests. In product companies, they own complete features from wireframe to production. In service companies, they often maintain large Node.js backends and React frontends for enterprise clients.

To master this path, avoid the trap of surface-level knowledge across too many tools. Go deep on React (hooks, rendering, performance), Node.js (event loop, streams, async patterns), and database design. Build three complete projects from scratch: a REST API, a real-time application (WebSockets), and a deployed product with authentication. These projects, more than any certification, are what hiring managers evaluate.`,
    videoId: "8KaJRw-rfn8",
    videoDuration: "~5 min",
    videoCaption: "What Is Full Stack Development? — Simplilearn",
    videoNote: "Longer than 2 min, but highly recommended for a clear overview of the full stack concept.",
  },

  "backend-java": {
    summary: `Java remains the backbone of enterprise software in India and globally. Banking systems, insurance platforms, telecom infrastructure, and large-scale e-commerce backends are predominantly built on Java. Choosing the Java backend path means entering a mature, high-paying ecosystem with decades of tooling, community support, and battle-tested frameworks at its core.

The Java backend engineer's work centers on building APIs that power applications used by millions, often systems where a single bug can affect financial transactions or critical data. This requires more than syntax proficiency. You need to understand concurrency, memory management, exception handling, and how Spring Boot manages the lifecycle of a web request from HTTP header to database write and back.

Spring Boot has become the dominant Java web framework. It handles dependency injection, REST API scaffolding, security configuration, and database connectivity through sensible defaults, letting engineers focus on business logic. Understanding Spring deeply (not just copying tutorials) is what separates a junior Java developer from a mid-level engineer that companies compete to hire.

The essential skills: Core Java (generics, collections, streams, concurrency), Spring Boot (MVC, Security, JPA/Hibernate), REST API design and testing (Postman, JUnit, Mockito), relational databases (PostgreSQL, MySQL), and containerized deployment (Docker, Kubernetes basics). Understanding JVM internals (garbage collection, thread scheduling, heap tuning) becomes critical at senior levels where performance optimization is part of your responsibility. Java backend engineers who can design scalable microservices and reason about production load are among the most in-demand technical profiles in India's enterprise tech market.`,
    videoId: "l9AzO1FMgM8",
    videoDuration: "1:47",
    videoCaption: "Java in 100 Seconds — Fireship",
  },

  "devops-aws": {
    summary: `DevOps engineering is the discipline that bridges the gap between writing software and running it reliably at scale. As companies move to cloud-native architectures, the demand for engineers who understand infrastructure-as-code, CI/CD automation, container orchestration, and cloud cost optimization has exploded. AWS, as the world's leading cloud platform, sits at the center of most of these workflows.

A DevOps engineer is not a developer who occasionally deploys. They are the person who thinks about system reliability before a line of code is written: designing deployment pipelines, configuring auto-scaling groups, setting up observability with metrics and alerts, and ensuring that a single bad commit cannot bring down production. This mindset shift from "build it" to "run it reliably" is the core of the DevOps role.

In practice, you will work with Linux servers (comfortable at the command line is non-negotiable), Docker containers and Kubernetes clusters, CI/CD tools like Jenkins or GitHub Actions, and core AWS services like EC2, S3, Lambda, RDS, VPC, and CloudWatch. Infrastructure as Code with Terraform or AWS CDK is how modern teams manage cloud resources: you define servers and networks in code, not through browser consoles.

The essential skills to master: Linux fundamentals (file system, processes, networking), Git branching strategies, Docker and Kubernetes (CKA is a respected certification), at least one major CI/CD platform, and AWS core services (the AWS Solutions Architect Associate exam is a genuine career accelerator). DevOps engineers who can reduce deployment time, improve system uptime, and cut cloud costs are in extremely high demand across both service and product companies.`,
    videoId: "tqBFyJffkiY",
    videoDuration: "~2 min",
    videoCaption: "What is DevOps? — Microsoft Azure",
  },

  "service-wipro": {
    summary: `Wipro is one of India's most established IT service companies, known for its global delivery model serving clients across North America, Europe, and Asia-Pacific. For engineering graduates, joining Wipro as a Project Engineer provides access to enterprise-grade projects in domains like healthcare IT, BFSI (banking, financial services and insurance), manufacturing, and energy.

Wipro's onboarding program covers Java, Python, SQL, cloud basics, and Agile practices. The training is practical and client-oriented, designed to prepare engineers for immediate project deployment. Engineers who perform well in training are often given preference in project allocation, which significantly affects early career trajectory.

The Wipro culture rewards engineers who demonstrate initiative within their accounts. Taking ownership of automating repetitive tasks, writing documentation that future team members use, and proactively flagging risks in project timelines: these behaviors build reputation faster than raw coding speed. Wipro's internal talent marketplace (Topgun, Velocity) identifies high performers for accelerated tracks and global mobility opportunities.

To get the most from this path, specialize within your first year. Wipro has dedicated practice units in cloud, SAP, Salesforce, cybersecurity, and data engineering. Engineers who pursue certifications aligned to their practice area (AWS Certified Developer, Salesforce Admin, or Microsoft Azure Fundamentals) find themselves assigned to more complex, higher-visibility projects. After three to four years, skilled Wipro engineers frequently transition into product companies or senior consultant roles at a significant salary premium.`,
    // No video: no concise public intro for Wipro career path exists that is accurate and beginner-friendly.
  },

  "service-hcl": {
    summary: `HCL Technologies is one of India's most technically diverse IT companies, with deep strength in product engineering, infrastructure management, and enterprise software. Unlike pure consulting firms, HCL has a significant product engineering heritage. It has built software for global technology companies including HP, Cisco, and Volvo for decades. This makes the HCL experience technically richer than many service company roles.

HCL's strategy spans traditional IT services, next-generation services (cloud, IoT, analytics), and products. Joining HCL exposes you to a broader technology surface than most service companies: engineers frequently work on embedded systems, firmware, enterprise SaaS, or cloud-native platform engineering depending on the account.

The HCL onboarding program covers fundamentals, but the real learning happens on the account. HCL is known for pairing fresh engineers with experienced mentors on client projects, and the culture encourages technical depth over breadth. If you are placed on an engineering-led account (rather than a maintenance or support account), you will work on genuinely interesting technical problems.

To maximize your HCL career, identify your technology interest in the first six months (product engineering, DevOps, embedded software, or cloud architecture) and pursue a relevant certification. HCL's TechBee and Uniforce programs recognize high performers. Engineers who develop expertise in niche areas (VLSI, embedded Linux, platform SRE) often find that HCL offers better long-term specialization paths than generalist service firms. The company's engineering culture, once you navigate to the right account, is a genuine asset for technical growth.`,
    // No video: no concise public intro for HCL career path exists that is accurate and beginner-friendly.
  },

  "service-tech-mahindra": {
    summary: `Tech Mahindra is India's fifth-largest IT company and occupies a distinct position in the industry: it has deep roots in telecom engineering (through its Mahindra Satyam heritage and BT partnership), strong automotive and manufacturing verticals, and a growing presence in 5G, edge computing, and digital transformation. For engineers interested in domain-specific technology, particularly telecom, automotive software, and network engineering, Tech Mahindra offers specialized experience that generalist IT firms do not.

Fresh engineers join as Software Engineers and go through an onboarding program that covers Java, Python, SQL, cloud fundamentals, and telecom basics (for telecom accounts). The training period is shorter than companies like Infosys, but project placement tends to happen quickly, often within the first two months.

Tech Mahindra's accounts range from traditional enterprise IT maintenance to genuinely cutting-edge 5G infrastructure projects. Engineers who land on telecom accounts (working with vendors like Ericsson, Nokia, or directly with telecom operators) are exposed to C/C++ embedded programming, network protocol stacks, and real-time systems: technical areas that command significant premiums in the job market.

To build a strong career at Tech Mahindra, prioritize getting placed on a technology-forward account over a higher-paying maintenance contract early in your career. The depth you build in specialized domains (telecom, automotive software, cloud-native 5G) translates into niche expertise that is genuinely scarce. Pursue certifications in telecom standards (3GPP), cloud platforms, or network engineering (CCNA) depending on your account domain. After three years of specialized experience, Tech Mahindra engineers frequently attract offers from global telecom OEMs and product companies.`,
    // No video: no concise public intro for Tech Mahindra career path exists that is accurate and beginner-friendly.
  },

  "product-flipkart": {
    summary: `Flipkart is India's e-commerce pioneer and one of the most technically demanding product companies to work at domestically. As the company that built India's logistics, payment, and search infrastructure before any other player at scale, Flipkart's engineering teams have solved problems that are uniquely Indian: low-bandwidth users, cash-on-delivery systems, hyperlocal delivery networks, and multilingual product discovery. Working here means building for Bharat, not just metropolitan India.

The Flipkart SDE interview is rigorous by Indian product company standards: multiple coding rounds (data structures, algorithms, problem-solving), one or two system design rounds focused on e-commerce architecture (inventory systems, search ranking, order management at scale), and leadership/behavioral rounds. The bar is not at FAANG level but significantly higher than service company standards.

Inside Flipkart, engineers own complete features on teams that move fast. The culture is data-driven: every product decision is backed by experiments and metrics. As an SDE, you will regularly instrument your code with events for A/B tests, write dashboards in Grafana, and participate in production on-call rotations. This builds engineering maturity that is hard to acquire elsewhere.

The essential technical skills: algorithms at LeetCode medium level, distributed systems design (the Flipkart tech blog publishes excellent architecture deep-dives), Java or Kotlin (backend-heavy teams), React or Angular (frontend teams), and MySQL/Cassandra/Kafka depending on your team. Engineers who understand both the technical and business dimensions of their features (how their code affects conversion rate, delivery time, or fraud) are the ones who grow fastest at Flipkart.`,
    // No video: no concise public intro for Flipkart SDE career path exists that is accurate, unbiased, and beginner-friendly.
  },

  "product-phonepe": {
    summary: `PhonePe is India's largest digital payments platform, processing billions of transactions monthly across UPI, insurance, mutual funds, and merchant services. Working here as a software engineer means building the financial infrastructure of modern India: systems where correctness, consistency, and latency are not engineering preferences but existential requirements. A bug in a payment system is not an inconvenience; it is a breach of financial trust.

PhonePe's engineering culture reflects this gravity. Teams are small and accountable. Engineers are expected to own their services end-to-end (writing the service, the tests, the runbook, the monitoring dashboards, and the incident postmortem when things go wrong). The autonomy is real, and so is the expectation of rigorous engineering judgment.

The interview process covers algorithms, system design with a fintech lens (payment state machines, idempotency in distributed systems, eventual consistency vs. strong consistency), and behavioral rounds focused on ownership and reliability. Candidates who demonstrate an understanding of distributed systems in the context of financial transactions (race conditions in concurrent payment processing, retry storms, saga patterns) stand out significantly.

Essential skills for this path: Java or Go (PhonePe's primary backend languages), distributed systems design (especially two-phase commit, saga orchestration, and message queues), MySQL and NoSQL data modeling, and Kafka for event-driven payment flows. Beyond technical skills, developing fluency in payment domain concepts (UPI rails, settlement cycles, regulatory compliance, and fraud detection patterns) positions you as a high-value engineer in the fintech ecosystem, where domain knowledge commands significant compensation premiums over pure technical skills.`,
    // No video: no concise public intro for PhonePe SDE career path exists that is accurate, unbiased, and beginner-friendly.
  },

  "product-razorpay": {
    summary: `Razorpay is India's most developer-loved payments platform and one of the fastest-growing fintech companies in Asia. Unlike traditional financial institutions, Razorpay was built by engineers for engineers: its API-first approach, comprehensive documentation, and relentless focus on developer experience have made it the payment infrastructure of choice for startups, SaaS companies, and enterprises alike. Working here means building at the intersection of financial systems and developer tooling, a uniquely demanding and rewarding combination.

Razorpay engineers work on problems that span the entire fintech stack: payment gateway routing, banking integrations (NPCI, RBI APIs), fraud detection systems, merchant dashboard infrastructure, and increasingly banking-as-a-service products under RazorpayX. The scale is significant: millions of API calls daily, real-time settlement systems, and compliance requirements that vary by financial product type.

The engineering culture at Razorpay is unusually fast-moving for a company operating in a regulated space. Teams ship frequently, maintain high code quality standards, and are expected to own production incidents with structured postmortems. The company invests heavily in internal tooling and engineering education; there is a genuine culture of technical craftsmanship.

Essential technical skills: Java or Go for backend systems, strong understanding of REST API design and versioning (Razorpay's external API is a product itself), distributed systems fundamentals (idempotency, at-least-once delivery, circuit breakers), and fintech domain knowledge (payment rails, webhooks, reconciliation). For senior roles, experience with high-throughput systems and financial compliance architecture is highly valued. Razorpay is an exceptional launchpad toward senior roles in fintech or CTO tracks at payment-adjacent startups.`,
    // No video: no concise public intro for Razorpay SDE career path exists that is accurate, unbiased, and beginner-friendly.
  },

  "specialized-data-engineering": {
    summary: `Data engineering is the invisible infrastructure layer that makes modern data-driven companies possible. While data scientists and analysts receive more public attention, it is data engineers who build and maintain the pipelines, warehouses, and transformation systems that make data useful in the first place. Without well-designed data infrastructure, machine learning models cannot be trained, business dashboards cannot be trusted, and product decisions are made on gut rather than evidence.

A data engineer's core responsibility is moving data reliably from where it is produced (application databases, event streams, third-party APIs) to where it needs to be analyzed (data warehouses, data lakes). This sounds simple but involves solving complex problems: handling late-arriving data, managing schema evolution, ensuring data quality at scale, and building systems that can process millions of events per hour without losing records.

The Indian market for data engineers is growing rapidly. Companies like Swiggy, Meesho, CRED, and Juspay have invested heavily in data infrastructure teams. Indian data engineers who can build production-grade Airflow DAGs, optimize Spark jobs, and design Redshift or BigQuery schemas are commanding salaries that rival backend engineers at product companies.

Essential skills: SQL at an advanced level (window functions, CTEs, query optimization), Python (pandas, PySpark, Airflow), one cloud data warehouse (BigQuery, Redshift, Snowflake), understanding of batch vs. streaming data (Kafka, Kinesis), and data modeling concepts (star schema, SCD types, data vault). The engineers who stand out are those who combine technical skills with an understanding of the data they work with. They do not just move data; they understand what it means and why it matters to the business.`,
    videoId: "1OPD6XNkQUo",
    videoDuration: "~6 min",
    videoCaption: "What is Data Engineering? — Intellipaat",
    videoNote: "Longer than 2 min, but one of the clearest beginner-friendly explanations of the field available.",
  },

  "specialized-mobile": {
    summary: `Mobile development powers the application layer that most Indians interact with daily: UPI apps, food delivery, OTT platforms, edtech products, and healthcare tools. India's mobile-first internet economy makes mobile engineering one of the most impactful and in-demand technical disciplines in the country. Over 700 million smartphone users access most digital services exclusively on mobile, making mobile app quality a direct business metric.

There are two primary paths in mobile development: cross-platform (React Native, Flutter) and native (Android with Kotlin, iOS with Swift). Cross-platform frameworks let a single codebase run on both platforms, making them the default choice for startups and teams with limited resources. Native development offers maximum performance, access to platform-specific APIs, and is typically required at companies with large, mature apps where milliseconds and battery efficiency matter.

Indian mobile engineers predominantly work in React Native or Flutter for consumer apps and Android-native for feature-phone or performance-critical applications. iOS development is growing but still a smaller market in India, though increasingly valuable as premium user segments expand.

What does a mobile engineer actually build? They create screens, manage local state and network state simultaneously (offline support is critical in India's variable-connectivity environment), integrate payment SDKs, implement push notifications, handle deep links, and optimize app performance (startup time, frame rate, memory). Production mobile engineers also own app store publishing, crash monitoring (Firebase Crashlytics), and A/B testing infrastructure. Essential skills: React Native or Flutter (pick one and go deep), HTTP networking and REST integration, local storage (AsyncStorage, SQLite), navigation patterns, and platform-specific optimization.`,
    videoId: "gvkqT_Uoahw",
    videoDuration: "1:36",
    videoCaption: "React Native in 100 Seconds — Fireship",
  },

  "ai-ml": {
    summary: `Artificial intelligence and machine learning engineering is the most transformative technical discipline of this decade. From recommendation systems in e-commerce to fraud detection in fintech, diagnostic imaging in healthcare, and large language models reshaping software development itself: machine learning is no longer a research curiosity but a production engineering discipline deployed at massive scale.

The AI/ML engineer's role sits between data science and software engineering. A data scientist builds models; an ML engineer ensures those models work reliably in production: serving predictions at low latency, retraining on fresh data, monitoring for drift, and integrating with the broader application stack. This engineering dimension of ML work is where the majority of industry roles live, and it requires both mathematical literacy and software engineering discipline.

India's AI/ML talent market has transformed rapidly. Companies like Google, Microsoft, Adobe, Flipkart, Swiggy, and dozens of AI-first startups are actively building ML teams in Bangalore, Hyderabad, and Chennai. Salaries for engineers with genuine ML production experience (not just Kaggle notebooks but deployed models handling real traffic) are among the highest in the industry.

The essential skills: Python (NumPy, Pandas, Scikit-learn), probability and statistics (not just formulas but intuition), linear algebra basics (matrix operations, eigenvalues for PCA), one deep learning framework (PyTorch is preferred in research; TensorFlow/Keras is common in production), and MLOps tools (MLflow, Vertex AI, SageMaker). For generative AI roles, understanding transformer architecture, fine-tuning techniques (LoRA, PEFT), and LLM inference optimization is increasingly required. The engineers who combine mathematical intuition with production engineering skills (building systems that predict reliably, not just predict) are at the top of the ML compensation curve.`,
    videoId: "qYNweeDHiyU",
    videoDuration: "~8 min",
    videoCaption: "AI, ML, Deep Learning & Generative AI Explained — IBM Technology",
    videoNote: "Longer than 2 min, but this IBM Technology video is widely regarded as one of the clearest domain introductions available.",
  },

  "backend-nodejs": {
    summary: `Node.js has become one of the most widely deployed server-side platforms in the world, powering APIs for startups, scale-ups, and enterprises alike. Its single-threaded, event-driven architecture makes it exceptionally efficient for I/O-heavy workloads: real-time applications, API gateways, microservices, and streaming pipelines. More importantly, it lets JavaScript developers extend their skills from the browser to the server with a single language, reducing the barrier to full-stack development.

The Node.js backend engineer's day-to-day involves building REST or GraphQL APIs with Express or Fastify, connecting to databases (PostgreSQL, MongoDB, Redis), implementing authentication with JWT or OAuth, writing middleware for logging and rate limiting, and deploying containerized services to cloud platforms. In product companies, you will own the reliability and performance of services that other engineers and end users depend on.

India's startup ecosystem runs heavily on Node.js. Companies like Meesho, Razorpay, CRED, and dozens of Y Combinator-backed Indian startups use Node.js as their primary backend language. This makes Node.js expertise directly relevant to the fastest-growing sector of India's tech industry, not just a tool but a career accelerant.

Essential skills: JavaScript (deep understanding of the event loop, Promises, async/await, and closures), TypeScript (increasingly required at senior levels), Express.js or Fastify for API development, SQL and NoSQL database design, authentication patterns (sessions, JWT, OAuth 2.0), Docker for containerization, and basic Linux/cloud operations. Engineers who add TypeScript mastery, database optimization skills, and understanding of Node.js performance characteristics (streams, worker threads, clustering) are consistently rated as senior-level talent across Indian startups and product companies.`,
    videoId: "BwM1V4_dl14",
    videoDuration: "~1:40",
    videoCaption: "Node.js Explained in 100 Seconds — Simplified",
  },

  "frontend-react": {
    summary: `React is the dominant JavaScript framework for building user interfaces, used by Facebook, Airbnb, Netflix, Atlassian, and thousands of startups to build the products that hundreds of millions of people interact with daily. In India, virtually every product company with a web presence uses React: from Flipkart and Swiggy to edtech platforms and fintech dashboards. Learning React is not just a career move; it is learning the lingua franca of modern web development.

The React frontend engineer builds the visual and interactive layer of web applications. You design component architectures, manage application state (when to use local vs. global state, how to structure Redux or Zustand), handle routing, integrate with backend APIs, and ensure the application performs well across devices and network conditions. In Indian product companies, frontend engineers are product engineers: they participate in design discussions, A/B test UI changes, and measure the impact of their features in dashboards.

What separates a good React engineer from a great one is not knowing more hooks. It is understanding the rendering model deeply: when React re-renders and why, how to avoid performance pitfalls (unnecessary renders, expensive calculations in render paths), and how to structure components for long-term maintainability rather than short-term speed.

Essential skills: HTML, CSS, and JavaScript fundamentals (before any framework), React (hooks, context, custom hooks, React Query or SWR for data fetching), TypeScript (required at most product companies), state management patterns, Next.js for SSR/SSG, and performance tools (Lighthouse, React DevTools profiler). The frontend engineers who consistently stand out combine technical excellence with design sensibility: they notice when a transition feels wrong, when a loading state is missing, and when an interaction model confuses users. That product instinct, combined with engineering depth, is what earns recognition at senior levels.`,
    videoId: "Tn6-PIqc4UM",
    videoDuration: "1:47",
    videoCaption: "React in 100 Seconds — Fireship",
  },
};
