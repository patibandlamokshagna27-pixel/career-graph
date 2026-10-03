/**
 * Industry Standard Role Benchmark Taxonomies
 * These represent real-world job role competency benchmarks used by matching algorithms.
 */
export const ROLE_TAXONOMY = [
  {
    id: 'swe-fullstack',
    title: 'Full Stack Software Engineer',
    level: 'Mid - Senior',
    category: 'Software Engineering',
    description: 'Architects and builds complete client-server web applications, scalable APIs, and microservices.',
    requiredSkills: [
      { name: 'JavaScript / TypeScript', category: 'Core Language', priority: 'High', minProficiency: 'Advanced' },
      { name: 'React', category: 'Frontend', priority: 'High', minProficiency: 'Advanced' },
      { name: 'Node.js', category: 'Backend', priority: 'High', minProficiency: 'Intermediate' },
      { name: 'REST APIs', category: 'Architecture', priority: 'High', minProficiency: 'Advanced' },
      { name: 'PostgreSQL / SQL', category: 'Database', priority: 'High', minProficiency: 'Intermediate' },
      { name: 'Git & Version Control', category: 'Tools', priority: 'Medium', minProficiency: 'Intermediate' },
      { name: 'Docker & Containerization', category: 'DevOps', priority: 'Medium', minProficiency: 'Foundational' },
      { name: 'CI/CD Pipelines', category: 'DevOps', priority: 'Low', minProficiency: 'Foundational' },
      { name: 'Data Structures & Algorithms', category: 'Fundamentals', priority: 'High', minProficiency: 'Intermediate' },
      { name: 'Testing (Jest / Cypress)', category: 'Quality', priority: 'Medium', minProficiency: 'Intermediate' },
    ]
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist / ML Engineer',
    level: 'Mid - Senior',
    category: 'Data & AI',
    description: 'Builds machine learning pipelines, statistical models, and extracts predictive insights from complex datasets.',
    requiredSkills: [
      { name: 'Python', category: 'Core Language', priority: 'High', minProficiency: 'Advanced' },
      { name: 'SQL', category: 'Data Querying', priority: 'High', minProficiency: 'Advanced' },
      { name: 'Machine Learning (Scikit-Learn)', category: 'Modeling', priority: 'High', minProficiency: 'Advanced' },
      { name: 'Deep Learning (PyTorch / TensorFlow)', category: 'Modeling', priority: 'High', minProficiency: 'Intermediate' },
      { name: 'Pandas & NumPy', category: 'Data Wrangling', priority: 'High', minProficiency: 'Advanced' },
      { name: 'Probability & Statistics', category: 'Fundamentals', priority: 'High', minProficiency: 'Advanced' },
      { name: 'Data Visualization (Matplotlib / Seaborn)', category: 'Analysis', priority: 'Medium', minProficiency: 'Intermediate' },
      { name: 'Model Deployment (FastAPI / Docker)', category: 'MLOps', priority: 'Medium', minProficiency: 'Foundational' },
      { name: 'Feature Engineering', category: 'Modeling', priority: 'Medium', minProficiency: 'Intermediate' },
    ]
  },
  {
    id: 'devops-cloud',
    title: 'DevOps & Cloud Infrastructure Engineer',
    level: 'Mid - Senior',
    category: 'Infrastructure',
    description: 'Designs reliable cloud architecture, automated build/release pipelines, and container orchestrations.',
    requiredSkills: [
      { name: 'Linux / Bash Scripting', category: 'OS & Scripting', priority: 'High', minProficiency: 'Advanced' },
      { name: 'Docker', category: 'Containers', priority: 'High', minProficiency: 'Advanced' },
      { name: 'Kubernetes', category: 'Orchestration', priority: 'High', minProficiency: 'Intermediate' },
      { name: 'Cloud Provider (AWS / GCP / Azure)', category: 'Cloud', priority: 'High', minProficiency: 'Advanced' },
      { name: 'Terraform / IaC', category: 'Infrastructure', priority: 'High', minProficiency: 'Intermediate' },
      { name: 'CI/CD (GitHub Actions / GitLab)', category: 'Automation', priority: 'High', minProficiency: 'Advanced' },
      { name: 'Monitoring (Prometheus / Grafana)', category: 'Observability', priority: 'Medium', minProficiency: 'Intermediate' },
      { name: 'Networking & DNS', category: 'Fundamentals', priority: 'Medium', minProficiency: 'Intermediate' },
      { name: 'Security & IAM Policies', category: 'Security', priority: 'Medium', minProficiency: 'Intermediate' },
    ]
  },
  {
    id: 'backend-engineer',
    title: 'Backend Systems Engineer',
    level: 'Mid - Senior',
    category: 'Software Engineering',
    description: 'Engineers high-throughput backend services, concurrency pipelines, and reliable distributed architectures.',
    requiredSkills: [
      { name: 'Python / Go / Java', category: 'Core Language', priority: 'High', minProficiency: 'Advanced' },
      { name: 'Distributed Systems Architecture', category: 'Architecture', priority: 'High', minProficiency: 'Intermediate' },
      { name: 'Relational Databases (PostgreSQL / MySQL)', category: 'Database', priority: 'High', minProficiency: 'Advanced' },
      { name: 'Caching (Redis / Memcached)', category: 'Performance', priority: 'High', minProficiency: 'Intermediate' },
      { name: 'Message Brokers (Kafka / RabbitMQ)', category: 'Async Systems', priority: 'Medium', minProficiency: 'Intermediate' },
      { name: 'API Design (REST / gRPC / GraphQL)', category: 'Networking', priority: 'High', minProficiency: 'Advanced' },
      { name: 'Docker & Containerization', category: 'DevOps', priority: 'Medium', minProficiency: 'Intermediate' },
      { name: 'Concurrency & Multi-threading', category: 'Fundamentals', priority: 'High', minProficiency: 'Intermediate' },
    ]
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst & Security Engineer',
    level: 'Entry - Mid',
    category: 'Security',
    description: 'Protects enterprise systems through threat analysis, vulnerability assessments, and secure infrastructure auditing.',
    requiredSkills: [
      { name: 'Network Protocols & Firewalls', category: 'Networking', priority: 'High', minProficiency: 'Advanced' },
      { name: 'Vulnerability Assessment & Penetration Testing', category: 'Security Testing', priority: 'High', minProficiency: 'Intermediate' },
      { name: 'SIEM Tools (Splunk / Elastic SIEM)', category: 'Monitoring', priority: 'High', minProficiency: 'Intermediate' },
      { name: 'Linux Administration', category: 'OS', priority: 'High', minProficiency: 'Intermediate' },
      { name: 'Python / Scripting for Security', category: 'Scripting', priority: 'Medium', minProficiency: 'Intermediate' },
      { name: 'Cryptography & Identity Management (IAM)', category: 'Security Fundamentals', priority: 'High', minProficiency: 'Intermediate' },
      { name: 'OWASP Top 10 & Application Security', category: 'AppSec', priority: 'High', minProficiency: 'Intermediate' },
    ]
  },
  {
    id: 'product-manager',
    title: 'Technical Product Manager',
    level: 'Mid - Senior',
    category: 'Product & Strategy',
    description: 'Drives product vision, translates customer needs into technical roadmaps, and aligns cross-functional engineering teams.',
    requiredSkills: [
      { name: 'Product Roadmapping & Strategy', category: 'Product', priority: 'High', minProficiency: 'Advanced' },
      { name: 'Technical Requirements (PRD / User Stories)', category: 'Documentation', priority: 'High', minProficiency: 'Advanced' },
      { name: 'Data Analysis & SQL', category: 'Analytics', priority: 'High', minProficiency: 'Intermediate' },
      { name: 'Agile & Scrum Methodologies', category: 'Execution', priority: 'High', minProficiency: 'Advanced' },
      { name: 'User Experience (UX) Research', category: 'Design', priority: 'Medium', minProficiency: 'Intermediate' },
      { name: 'A/B Testing & Metric Instrumentation', category: 'Experimentation', priority: 'Medium', minProficiency: 'Intermediate' },
      { name: 'Stakeholder Management & Communication', category: 'Soft Skills', priority: 'High', minProficiency: 'Advanced' },
    ]
  }
];
