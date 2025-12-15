import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables from .env.local
const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '***' : 'missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestData() {
    try {
        console.log('Creating test job posting and application...');

        // First, get or create a test company
        let company;
        const { data: existingCompany } = await supabase
            .from('companies')
            .select('*')
            .eq('company_name', 'Test Company')
            .single();

        if (existingCompany) {
            company = existingCompany;
            console.log('Using existing test company:', company.id);
        } else {
            const { data: newCompany, error: companyError } = await supabase
                .from('companies')
                .insert([{
                    company_name: 'Test Company',
                    company_description: 'Test company for debugging evaluations',
                    website_url: 'https://test.com',
                    industry: 'Technology',
                    user_id: 'test-user-' + Date.now(),
                    is_active: true
                }])
                .select()
                .single();

            if (companyError) {
                console.error('Error creating company:', companyError);
                return;
            }

            company = newCompany;
            console.log('Created test company:', company.id);
        }

        // Create a test job posting
        const jobData = {
            company_id: company.id,
            title: 'Senior Software Developer',
            description: `We are seeking a Senior Software Developer to join our innovative team at NexusStream. In this role, you will be responsible for designing, developing, and maintaining high-performance web applications using modern technologies.

Key Responsibilities:
• Design and implement scalable full-stack applications using React and Node.js
• Optimize application performance and user experience
• Collaborate with cross-functional teams to deliver high-quality software
• Mentor junior developers and contribute to code reviews
• Implement security best practices and ensure data compliance

Our "automate everything" mindset means you'll have the opportunity to streamline processes, eliminate manual tasks, and build efficient systems that scale.`,
            requirements: `• 5+ years of experience in full-stack development
• Strong proficiency in React, TypeScript, and Node.js
• Experience with PostgreSQL, Redis, and cloud infrastructure (AWS)
• Knowledge of security best practices and compliance (PCI-DSS, SOC 2)
• Experience mentoring junior developers
• Excellent problem-solving and communication skills
• Experience with CI/CD pipelines and Docker/Kubernetes`,
            responsibilities: `• Lead architectural decisions for complex systems
• Develop and maintain high-traffic web applications
• Implement automated testing and deployment pipelines
• Conduct code reviews and mentor team members
• Ensure security and compliance of applications
• Optimize performance and scalability`,
            location: 'Remote',
            job_type: 'Remote',
            credit_cost_per_applicant: 1,
            status: 'active',
            slug: 'senior-software-developer-test-' + Date.now(),
            shareable_url: 'senior-software-developer-test-' + Date.now(),
            ai_interview_questions: {}
        };

        const { data: jobPost, error: jobError } = await supabase
            .from('job_posts')
            .insert([jobData])
            .select()
            .single();

        if (jobError) {
            console.error('Error creating job post:', jobError);
            return;
        }

        console.log('Created test job posting:', jobPost.id);

        // Create a test applicant response with strong answers
        const applicantResponse = {
            job_post_id: jobPost.id,
            applicant_user_id: null,
            applicant_name: 'Roki Rokoski',
            applicant_email: 'akolov@gmail.com',
            applicant_cv: `SENIOR SOFTWARE DEVELOPER

PROFESSIONAL SUMMARY
Results-driven Senior Software Developer with 7+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of leading architectural decisions, implementing automation solutions, and mentoring development teams. Strong focus on performance optimization, security, and scalable system design.

TECHNICAL SKILLS
• Frontend: React, TypeScript, Next.js, Redux, CSS3, HTML5
• Backend: Node.js, Python, Express, REST APIs, GraphQL
• Database: PostgreSQL, Redis, MongoDB
• Cloud/DevOps: AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes, CI/CD
• Tools: Git, Jenkins, Terraform, Prometheus, Grafana
• Security: OAuth, JWT, encryption, PCI-DSS compliance

PROFESSIONAL EXPERIENCE

Senior Full-Stack Developer | TechCorp Inc. (2020-Present)
• Led migration from CSR to SSR architecture using Next.js, reducing load times by 70%
• Implemented automated ETL pipeline with Python/Airflow, cutting reconciliation time from 3 days to 5 minutes
• Architected zero-trust security model on AWS, passing SOC 2 audit
• Mentored 5 junior developers, improving team productivity by 40%

Software Developer | StartupXYZ (2018-2020)
• Built customer-facing fintech dashboard serving 10k+ users
• Optimized API performance, reducing response times from 800ms to 150ms
• Implemented Redis caching and database query optimization

EDUCATION
Bachelor of Science in Computer Science
University of Technology, 2018

CERTIFICATIONS
• AWS Solutions Architect Associate
• Certified Kubernetes Administrator (CKA)
• PCI-DSS Compliance Professional`,
            answers: [
                {
                    question: "Describe a time you had to make a significant architectural decision for a system involving both frontend (React) and backend (Node.js). What factors did you consider, and what were the trade-offs?",
                    answer: `Situation: "At my previous company, our main product was a customer-facing fintech dashboard built as a Single Page Application (SPA) using standard React. While the interactive elements were smooth, our initial load time on mobile networks was over 4 seconds. Furthermore, our marketing pages—which were part of the same React app—were ranking poorly on Google because search crawlers were struggling to index the dynamic content."

Task: "I needed to architect a solution that would drastically improve the 'First Contentful Paint' (FCP) for users and fix our SEO issues, without sacrificing the rich interactivity of the dashboard once it loaded."

Action: "I led the migration from a pure Client-Side Rendering architecture to a Server-Side Rendering (SSR) approach using Next.js on top of our Node.js backend. Hybrid Approach: I decided not to render everything on the server. I used Static Site Generation (SSG) for the marketing pages (cached via CDN) for maximum speed, and SSR for the user dashboards to pre-populate user data securely. API Restructuring: I had to refactor our Node.js API. Instead of the frontend making 5 different fetch calls on mount, the Node server now aggregated this data and injected it directly into the initial HTML payload. Caching Strategy: I implemented Redis caching on the Node.js side to store the rendered HTML of non-personalized pages, protecting our servers from CPU spikes."

Trade-offs & Considerations: "The biggest trade-off was Server Load vs. Client Speed. The Cost: moving rendering to the server meant our Node.js CPU usage increased significantly, raising our AWS bill. The Evaluation: I calculated that the cost of extra EC2 instances was negligible compared to the revenue lost from the high bounce rate. Complexity: It also introduced 'Hydration' complexity—we had to be very careful that the HTML generated on the server matched exactly what React expected on the client, or the app would crash."

Result: "The First Contentful Paint dropped from 4s to 0.8s. Our SEO rankings recovered within a month, leading to a 20% increase in organic sign-ups. The user experience felt instantaneous, which is critical for trust in a finance app."`
                },
                {
                    question: "NexusStream values an \"automate everything\" mindset. Can you share an example of a situation where you successfully automated a process that significantly improved efficiency or reduced errors? What tools did you use, and what challenges did you overcome?",
                    answer: `Situation: "At my previous fintech job, our reconciliation process was a major bottleneck. Every month-end, the finance team spent three days manually downloading CSVs from our payment gateway and cross-referencing them with our internal database using Excel vLookups. It was slow, and human error led to a few embarrassing discrepancies in user balances."

Task: "I wanted to fully automate this reconciliation loop to eliminate human error and free up the finance team for analysis rather than data entry. The goal was to turn a 3-day process into a near real-time system."

Action: "I built an automated ETL (Extract, Transform, Load) pipeline using Python and Apache Airflow. Ingestion: I wrote a Python script using the payment gateway's API to fetch transaction data every night, rather than relying on manual CSV downloads. Processing: I used the Pandas library to handle the heavy lifting of matching thousands of internal transaction IDs against the external gateway data. Alerting: Instead of a silent failure, I integrated the script with Slack and PagerDuty. If a discrepancy of more than $0.01 was found, it immediately posted an alert to the finance channel with a link to the specific record."

Result: "The process went from taking 3 days of manual work to running automatically in 5 minutes every night. We caught payment failures 29 days earlier than before, and the finance team was able to focus on forecasting rather than fixing spreadsheets."`
                },
                {
                    question: "Imagine you're tasked with optimizing a slow-performing API endpoint in our Node.js backend that interacts with a PostgreSQL database. Walk me through your debugging process, including the tools and techniques you would employ to identify the bottleneck and potential solutions.",
                    answer: `If the API is slow, it's probably because Node.js is single-threaded and can't handle the load. I would usually just wrap the code in a try/catch block or maybe add a caching layer like Redis immediately. Caching solves everything. If that doesn't work, I'd probably restart the server.`
                },
                {
                    question: "We're looking for someone who can mentor junior engineers. Describe your approach to mentoring and how you would help a junior developer improve their understanding of React hooks or CI/CD pipelines with Docker/Kubernetes.",
                    answer: `Philosophy: "My mentorship philosophy is 'Guide, don't drive.' I believe the goal of mentorship is to build the junior engineer's mental model so they can solve future problems independently, rather than just fixing the bug for them."

Scenario A: Teaching React Hooks (The 'Mental Model' Approach) "When helping a junior developer who is struggling with React Hooks—specifically the common useEffect infinite loop or stale closures—I don't just patch the code. Visualization: I start by drawing a diagram to shift their thinking from 'Lifecycle Methods' (Mount/Update) to 'Synchronization.' I explain that useEffect is about keeping the UI in sync with the state. Practical Exercise: I ask them to trace the dependency array. I'll ask, 'If this variable changes, do we want this effect to run again?' Custom Hooks: To solidify the learning, I often encourage them to extract the logic into a custom hook. This usually clears up the confusion by isolating the logic from the UI."

Scenario B: Teaching CI/CD & Docker (The 'First Principles' Approach) "For Docker and CI/CD, the concepts can be abstract. The 'Why': I explain the problem first: 'It works on my machine' syndrome. I describe Docker as 'shipping the computer, not just the code.' Interactive Debugging: If a pipeline fails in Kubernetes, I don't fix the YAML myself. We start a screen-share, and I have them read the logs. I ask, 'Is this an application error or an infrastructure error?' Safe Failure: I set up a 'sandbox' namespace in our Kubernetes cluster where they can deploy and break things without affecting production. This removes the fear of learning."

Result: "In my last team, this approach helped a junior dev go from being afraid to touch the deployment pipeline to owning the entire migration of our legacy service to Kubernetes within six months."`
                },
                {
                    question: "How have you approached ensuring data security and compliance (e.g., handling sensitive financial data) in your previous full-stack development projects, especially when dealing with cloud infrastructure like AWS?",
                    answer: `Situation: "In my previous role building a lending platform, we were storing sensitive user data (SSNs and credit scores) on AWS. We needed to ensure strict compliance with PCI-DSS standards and prepare for a SOC 2 audit."

Task: "My goal was to architect the cloud infrastructure so that even if the application layer was compromised, the core financial data would remain secure. I needed to move away from a 'castle-and-moat' reliance (just one firewall) to a zero-trust architecture."

Action: "I implemented security controls at three distinct layers using AWS services: Network Isolation (VPC): I designed a custom VPC with strict subnet isolation. The database and backend services resided in Private Subnets with no direct internet access. Only the Load Balancer was in the Public Subnet. I configured Security Groups to whitelist traffic only from specific internal services, effectively blocking all port scanning. Identity & Access (IAM): I enforced the Principle of Least Privilege. Instead of using long-lived AWS Access Keys, I assigned IAM Roles to our EC2/Lambda instances. For example, the backend service role had permission to write to the S3 bucket but not delete from it. Data Protection: I utilized AWS KMS (Key Management Service) to manage encryption keys. We enabled envelope encryption for the database volumes (EBS) and S3 objects. Crucially, I migrated all API keys and database credentials out of environment variables and into AWS Secrets Manager, enabling automatic rotation."

Result: "We passed our third-party penetration test with no high-severity findings. The automated secrets rotation also saved us from a potential incident when a developer accidentally committed an old config file to GitHub—since the creds had already rotated, the leak was harmless."`
                }
            ],
            status: 'pending'
        };

        const { data: response, error: responseError } = await supabase
            .from('applicant_responses')
            .insert([applicantResponse])
            .select()
            .single();

        if (responseError) {
            console.error('Error creating applicant response:', responseError);
            return;
        }

        console.log('Created test applicant response:', response.id);
        console.log('Test data created successfully!');
        console.log('Job Post ID:', jobPost.id);
        console.log('Response ID:', response.id);

        // Now let's trigger the evaluation using a direct API call
        console.log('Triggering AI evaluation via API call...');

        const apiUrl = 'http://localhost:3000/api/gemini';
        const evaluationPayload = {
            action: 'evaluateApplicant',
            context: {
                jobPosting: jobData.description,
                companyInfo: 'NexusStream is a fintech company focused on innovative financial solutions.',
                applicantName: 'Roki Rokoski',
                applicantEmail: 'akolov@gmail.com',
                applicantCV: applicantResponse.applicant_cv,
                interviewAnswers: applicantResponse.answers
            },
            userId: 'test-user',
            // Temporarily disable real AI to test with mock response
            useMock: true
        };

        try {
            const evaluationResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(evaluationPayload)
            });

            const evaluationResult = await evaluationResponse.json();

            if (evaluationResponse.ok) {
                console.log('Evaluation successful!');
                console.log('Evaluation result:', JSON.stringify(evaluationResult, null, 2));
            } else {
                console.log('Evaluation failed with status:', evaluationResponse.status);
                console.log('Error:', evaluationResult);
            }
        } catch (fetchError) {
            console.log('Failed to call evaluation API:', fetchError.message);
            console.log('Make sure the Next.js development server is running on localhost:3000');
        }

    } catch (error) {
        console.error('Error creating test data:', error);
    }
}

createTestData();
