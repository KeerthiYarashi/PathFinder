import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Award, HelpCircle, Loader2 } from 'lucide-react'

// Comprehensive multi-domain question bank for every career skill
const MOCK_QUESTIONS = {
  // === 1. TECHNOLOGY ===
  python: [
    { q: "Which built-in Python data structure maintains insertion order and allows key-value lookup in O(1) time?", options: ["List", "Tuple", "Dictionary", "Set"], correct: 2 },
    { q: "What is the primary function of Python's `asyncio` event loop?", options: ["Multiprocessing CPU-bound tasks", "Non-blocking concurrent I/O operations", "Automatic garbage collection", "Compiling bytecode to C"], correct: 1 },
    { q: "How do decorators modify function behavior in Python?", options: ["By wrapping functions at runtime via closures", "By mutating global bytecode", "By allocating extra RAM on the heap", "By disabling type checks"], correct: 0 }
  ],
  machine_learning: [
    { q: "What is the primary objective of gradient descent in optimization?", options: ["Maximize training loss", "Minimize the cost function by taking steps in the direction of negative gradient", "Sort feature matrices", "Cluster unlabeled points"], correct: 1 },
    { q: "Which technique is commonly used to prevent overfitting in complex decision trees?", options: ["Pruning and setting max_depth", "Removing regularization", "Increasing learning rate to 10.0", "Disabling validation splits"], correct: 0 },
    { q: "What does the Area Under the ROC Curve (AUC-ROC) measure?", options: ["Regression mean squared error", "Model discrimination ability across all classification thresholds", "Dataset size ratio", "K-Means cluster density"], correct: 1 }
  ],
  deep_learning: [
    { q: "Which activation function prevents vanishing gradient problems in deep neural networks?", options: ["Sigmoid", "Tanh", "ReLU (Rectified Linear Unit)", "Linear Identity"], correct: 2 },
    { q: "What is the key mechanism behind the Transformer architecture?", options: ["Recurrent hidden states", "Multi-Head Self-Attention", "Convolutional pooling", "K-Means clustering"], correct: 1 }
  ],
  llms: [
    { q: "What does Temperature control in Large Language Model text generation?", options: ["Token context length limit", "Randomness and entropy of probability sampling", "Quantization precision", "GPU cooling speed"], correct: 1 },
    { q: "What is the difference between fine-tuning and in-context learning?", options: ["Fine-tuning updates model weights; in-context learning supplies prompts in runtime context", "Fine-tuning uses no data", "In-context learning updates weights permanently", "They are identical"], correct: 0 }
  ],
  rag: [
    { q: "In Retrieval-Augmented Generation (RAG), what is the purpose of a vector embedding?", options: ["Compress text files into ZIP archives", "Convert semantic text into dense mathematical vectors for similarity search", "Encrypt database credentials", "Generate HTML styling"], correct: 1 },
    { q: "Why is semantic chunking important before storing documents in a vector database?", options: ["To prevent memory leaks", "To maintain coherent context windows and optimize retrieval relevance", "To delete punctuation", "To translate languages"], correct: 1 }
  ],
  apis: [
    { q: "Which HTTP method is idempotent and used to replace an entire resource representation?", options: ["POST", "PUT", "PATCH", "CONNECT"], correct: 1 },
    { q: "Which HTTP status code signifies that a resource was successfully created?", options: ["200 OK", "201 Created", "204 No Content", "400 Bad Request"], correct: 1 }
  ],
  deployment: [
    { q: "What is the primary benefit of containerization using Docker?", options: ["Overclocks the server CPU", "Packages application code with all dependencies for consistent execution anywhere", "Replaces the Linux kernel", "Provides free cloud hosting"], correct: 1 },
    { q: "What is the main role of a reverse proxy like Nginx in web deployment?", options: ["Run database migrations", "Handle SSL termination, load balancing, and route traffic to application servers", "Compile JavaScript", "Generate UI mockups"], correct: 1 }
  ],
  html_css: [
    { q: "In the standard CSS box model, which layer surrounds the padding?", options: ["Margin", "Border", "Content box", "Outline"], correct: 1 },
    { q: "What CSS Flexbox property aligns items along the cross-axis?", options: ["justify-content", "align-items", "flex-direction", "flex-wrap"], correct: 1 }
  ],
  javascript: [
    { q: "What is a closure in JavaScript?", options: ["A function that retains access to its lexical scope even when executed outside that scope", "A function that has no return value", "A syntax error that halts execution", "A method to close browser tabs"], correct: 0 },
    { q: "How does the JavaScript Event Loop handle asynchronous Promise resolutions?", options: ["Via the Microtask Queue", "Via the Macrotask / Callback Queue", "By spinning up new OS threads", "By reloading the DOM"], correct: 0 }
  ],
  react: [
    { q: "What is the purpose of the dependency array in React's `useEffect` hook?", options: ["Imports npm packages", "Specifies which reactive state/prop changes re-trigger the effect", "Defines CSS class names", "Allocates memory buffer"], correct: 1 },
    { q: "Why shouldn't you mutate React state directly (e.g. `state.count = 5`)?", options: ["React will not detect the change and will fail to trigger a re-render", "It causes a syntax error", "It crashes the browser window", "It deletes local storage"], correct: 0 }
  ],
  node: [
    { q: "How does Node.js handle thousands of concurrent requests with a single JavaScript thread?", options: ["Non-blocking event-driven asynchronous I/O with libuv thread pool", "Spawning full OS processes per request", "Disabling garbage collection", "Freezing idle connections"], correct: 0 }
  ],
  sql: [
    { q: "What is the difference between `WHERE` and `HAVING` clauses in SQL?", options: ["WHERE filters individual rows before grouping; HAVING filters aggregated groups", "They are completely identical", "HAVING only works on numeric strings", "WHERE requires an index"], correct: 0 },
    { q: "Which SQL JOIN returns all rows from the left table and matching rows from the right table?", options: ["INNER JOIN", "LEFT OUTER JOIN", "CROSS JOIN", "FULL JOIN"], correct: 1 }
  ],
  statistics: [
    { q: "What does a p-value less than 0.05 typically indicate in hypothesis testing?", options: ["The null hypothesis is proven 100% true", "Statistically significant evidence to reject the null hypothesis", "A sample size error", "The data is invalid"], correct: 1 },
    { q: "Which theorem states that sample means approach a normal distribution as sample size grows?", options: ["Central Limit Theorem", "Bayes' Theorem", "Law of Large Numbers", "Markov Inequality"], correct: 0 }
  ],
  pandas: [
    { q: "Which Pandas method is most efficient for applying vectorized row/column calculations?", options: ["Native vectorized column operations (e.g. `df['a'] + df['b']`)", "Standard Python `for` loop over rows", "Converting every cell to string", "Recursion"], correct: 0 },
    { q: "How do you filter rows in a Pandas DataFrame where column 'age' is greater than 25?", options: ["`df[df['age'] > 25]`", "`df.filter(age > 25)`", "`df.where('age' > 25)`", "`df.select(age > 25)`"], correct: 0 }
  ],
  data_viz: [
    { q: "Which chart type is best suited for showing the correlation between two continuous numeric variables?", options: ["Pie Chart", "Scatter Plot", "Stacked Bar Chart", "Treemap"], correct: 1 }
  ],
  networks: [
    { q: "Which layer of the OSI model does the TCP protocol operate on?", options: ["Network Layer (Layer 3)", "Transport Layer (Layer 4)", "Data Link Layer (Layer 2)", "Application Layer (Layer 7)"], correct: 1 },
    { q: "What is the purpose of Subnet Masking in IPv4 networking?", options: ["Encrypt network packets", "Distinguish network portion from host portion of an IP", "Speed up DNS queries", "Assign MAC addresses"], correct: 1 }
  ],
  network_security: [
    { q: "What is the primary role of a Next-Generation Firewall (NGFW)?", options: ["Filter traffic based on ports, protocols, and deep packet inspection of application layer", "Speed up internet bandwidth", "Store user passwords in plaintext", "Mine cryptocurrency"], correct: 0 }
  ],
  threat_analysis: [
    { q: "What framework is globally used to map adversary tactics, techniques, and procedures (TTPs)?", options: ["MITRE ATT&CK Framework", "Agile Scrum Board", "Gantt Timeline", "Balanced Scorecard"], correct: 0 }
  ],
  cryptography: [
    { q: "What is the difference between symmetric and asymmetric encryption?", options: ["Symmetric uses one shared key; asymmetric uses a public/private key pair", "Symmetric is slower than asymmetric", "Asymmetric cannot encrypt data", "They use the same algorithms"], correct: 0 }
  ],
  incident_response: [
    { q: "What is the critical first step after identifying an active security breach on a compromised host?", options: ["Delete the hard drive", "Isolate / contain the host from the network while preserving volatile memory", "Email all company employees immediately", "Reboot into safe mode"], correct: 1 }
  ],
  linux_security: [
    { q: "Which Linux file permission mode grants read, write, and execute to the owner, and read/execute to others?", options: ["755", "644", "777", "600"], correct: 0 }
  ],

  // === 2. BUSINESS ===
  process_modeling: [
    { q: "What does BPMN stand for in business analysis?", options: ["Business Process Model and Notation", "Basic Project Management Network", "Binary Protocol Matrix Notation", "Business Performance Metrics Node"], correct: 0 },
    { q: "Which artifact documents 'As-Is' vs 'To-Be' business workflows?", options: ["Process Flow Diagram & Gap Matrix", "Burndown Chart", "General Ledger", "Pitch Deck"], correct: 0 }
  ],
  requirements_gathering: [
    { q: "What are the core components of an agile User Story?", options: ["As a [user], I want [goal], so that [benefit]", "Title, Cost, Deadlines", "Database schema and SQL queries", "Legal disclaimers"], correct: 0 },
    { q: "What does the MoSCoW prioritization technique stand for?", options: ["Must have, Should have, Could have, Won't have", "Month, Season, Quarter, Week", "Management, Operations, Sales, Customers", "Metrics, Objectives, Strategy, Capacity"], correct: 0 }
  ],
  excel_analysis: [
    { q: "Which modern Excel formula replaces both VLOOKUP and HLOOKUP with flexible bidirectional search?", options: ["XLOOKUP", "SUMIFS", "CONCATENATE", "IFERROR"], correct: 0 }
  ],
  tableau_powerbi: [
    { q: "In Power BI, what language is used to create custom calculated measures and columns?", options: ["DAX (Data Analysis Expressions)", "Python only", "HTML", "C++"], correct: 0 }
  ],
  agile: [
    { q: "What is the primary purpose of a Sprint Retrospective in Scrum?", options: ["Assign blame for missed deadlines", "Inspect team performance and identify process improvements for the next sprint", "Review financial invoices", "Pitch new products to investors"], correct: 1 }
  ],
  product_discovery: [
    { q: "What is the primary purpose of an Opportunity Solution Tree in product discovery?", options: ["Track daily sprint velocity", "Map customer problems/opportunities to potential solution hypotheses", "Calculate quarterly taxes", "Draw database schemas"], correct: 1 },
    { q: "Which metric best validates Product-Market Fit (PMF)?", options: ["Total signups without retention", "High cohort retention and Sean Ellis survey >40% 'very disappointed'", "Social media follower count", "Number of lines of code written"], correct: 1 }
  ],
  user_research: [
    { q: "When should you use qualitative vs quantitative user research?", options: ["Qualitative explores 'why' and user mental models; Quantitative measures 'how many' and trends", "Qualitative is only for surveys", "Quantitative is never used in tech", "They are identical"], correct: 0 }
  ],
  wireframing: [
    { q: "What is the primary objective of creating low-fidelity wireframes?", options: ["Focus on layout, information hierarchy, and user flow before visual styling", "Finalize exact color palettes", "Generate exportable production code", "Run automated browser testing"], correct: 0 }
  ],
  product_analytics: [
    { q: "What does the Churn Rate measure in product management?", options: ["The percentage of customers who stop using a product over a given timeframe", "The speed of database queries", "The number of new features shipped", "The average ticket response time"], correct: 0 }
  ],
  gtm_strategy: [
    { q: "What is the main objective of a Go-To-Market (GTM) strategy?", options: ["Plan how a company reaches target customers and achieves competitive advantage", "Configure server firewalls", "Write unit test cases", "Calculate depreciation"], correct: 0 }
  ],
  project_planning: [
    { q: "In Critical Path Method (CPM), what does zero float/slack indicate?", options: ["Tasks that can be delayed without delaying the project", "Tasks on the critical path that cannot be delayed without impacting final delivery", "Completed tasks", "Cancelled tasks"], correct: 1 },
    { q: "What is the key difference between Agile and Waterfall methodologies?", options: ["Waterfall is iterative; Agile is strictly sequential", "Agile delivers value in continuous iterative increments; Waterfall is linear and phase-gated", "Waterfall requires no documentation", "Agile has no deadlines"], correct: 1 }
  ],
  risk_management: [
    { q: "How is risk severity calculated in project management?", options: ["Risk Severity = Probability of Occurrence × Impact Severity", "Cost + Duration", "Total Team Size / 2", "Number of open tickets"], correct: 0 }
  ],
  budgeting: [
    { q: "What is the difference between CapEx and OpEx?", options: ["CapEx is investment in long-term fixed assets; OpEx is ongoing day-to-day operating expenses", "CapEx is for salaries only", "OpEx is always paid in stock", "There is no difference"], correct: 0 }
  ],
  stakeholder_comm: [
    { q: "What does the RACI matrix clarify in project governance?", options: ["Responsible, Accountable, Consulted, Informed", "Revenue, Assets, Cost, Income", "Risk, Audit, Compliance, Inspection", "Research, Architecture, Code, Integration"], correct: 0 }
  ],
  jira: [
    { q: "In JIRA, what is an Epic?", options: ["A large body of work that can be broken down into smaller stories and tasks", "A single commit in Git", "A bug in production", "A monthly invoice"], correct: 0 }
  ],
  structured_problem_solving: [
    { q: "What does the MECE principle stand for in management consulting?", options: ["Mutually Exclusive, Collectively Exhaustive", "Most Effective Cost Estimate", "Market Evaluation & Customer Engagement", "Monthly Earnings Capitalized Equitably"], correct: 0 }
  ],
  market_sizing: [
    { q: "What is the difference between TAM, SAM, and SOM?", options: ["TAM: Total Market; SAM: Serviceable Available Market; SOM: Serviceable Obtainable Market", "They represent currency exchange rates", "They are project management deadlines", "They measure software latency"], correct: 0 }
  ],
  slide_storytelling: [
    { q: "What is the McKinsey Pyramid Principle in executive communication?", options: ["Start with the top-level conclusion/recommendation first, followed by supporting arguments", "Put all raw data on the first slide", "Never use headings", "Keep all slides completely blank"], correct: 0 }
  ],

  // === 3. FINANCE ===
  financial_accounting: [
    { q: "What is the fundamental accounting equation?", options: ["Assets = Liabilities + Equity", "Revenue - Expenses = Cash Flow", "Assets = Debt - Net Income", "Equity = Assets * Liabilities"], correct: 0 },
    { q: "On which financial statement does Depreciation expense appear as an operating deduction?", options: ["Balance Sheet only", "Income Statement", "Statement of Stockholders' Equity", "Audit Opinion"], correct: 1 }
  ],
  financial_modeling: [
    { q: "What discount rate is conventionally used in a Discounted Cash Flow (DCF) model for enterprise value?", options: ["Risk-Free Rate (Rf)", "Weighted Average Cost of Capital (WACC)", "Consumer Price Index (CPI)", "Nominal GDP Growth"], correct: 1 },
    { q: "How is Free Cash Flow to Firm (FCFF) calculated from EBIT?", options: ["EBIT * (1 - Tax Rate) + D&A - Capex - Change in NWC", "EBIT + Total Debt", "Revenue - Net Income", "Dividends Paid / Share Price"], correct: 0 }
  ],
  corporate_finance: [
    { q: "What does WACC measure in corporate finance?", options: ["The average cost of capital a firm pays across equity and debt financing", "Weekly active cash conversion", "World asset compliance certificate", "Weighted average customer count"], correct: 0 }
  ],
  ratio_analysis: [
    { q: "How is the Quick Ratio (Acid-Test Ratio) calculated?", options: ["(Cash + Marketable Securities + Receivables) / Current Liabilities", "Total Assets / Total Debt", "Net Income / Revenue", "Inventory / Sales"], correct: 0 }
  ],
  gaap_ifrs: [
    { q: "Under ASC 606 / IFRS 15, when is revenue recognized?", options: ["When performance obligations are satisfied by transferring goods/services to the customer", "When cash is deposited in the bank", "At the start of contract negotiations", "At year-end tax filing"], correct: 0 }
  ],
  general_ledger: [
    { q: "In double-entry bookkeeping, what happens when an asset increases?", options: ["Debited", "Credited", "Unchanged", "Deleted"], correct: 0 }
  ],
  auditing_controls: [
    { q: "What is the main purpose of internal controls under Sarbanes-Oxley (SOX) Section 404?", options: ["Ensure accurate financial reporting and prevent fraudulent misstatement", "Increase corporate taxes", "Dictate product prices", "Automate payroll"], correct: 0 }
  ],
  equity_research: [
    { q: "What does the Price-to-Earnings (P/E) ratio compare?", options: ["Current share price relative to its per-share earnings", "Total revenue to total debt", "Operating cash flow to dividend payout", "Enterprise value to headcount"], correct: 0 }
  ],
  portfolio_management: [
    { q: "What does the Sharpe Ratio quantify in portfolio management?", options: ["Excess return per unit of volatility / risk", "Total portfolio dividend yield", "Trading commission fees", "Number of stocks in a fund"], correct: 0 }
  ],
  quant_risk_modeling: [
    { q: "What does Value at Risk (VaR) measure?", options: ["The maximum expected loss over a specific timeframe at a given confidence level", "The total portfolio return in a bull market", "The inflation rate in emerging markets", "The accounting book value"], correct: 0 }
  ],

  // === 4. CREATIVE ===
  design_fundamentals: [
    { q: "Which UX design principle describes organizing elements hierarchically using size, contrast, and spacing?", options: ["Visual Hierarchy & Gestalt Proximity", "Affordance Masking", "Chromatic Aberration", "Skeuomorphism"], correct: 0 },
    { q: "In Figma, what is the primary benefit of using Auto Layout?", options: ["Enables dynamic resizing and responsive UI component wrapping", "Renders 3D polygons", "Exports SVG vector paths to binary", "Runs usability tests"], correct: 0 }
  ],
  figma: [
    { q: "In Figma, what are Component Variants used for?", options: ["Grouping different states (e.g. default, hover, active) of a single UI component", "Translating designs into foreign languages", "Compressing PNG files", "Exporting React code directly to production"], correct: 0 }
  ],
  prototyping: [
    { q: "What is 'Smart Animate' in UI prototyping tools?", options: ["Automatically interpolates changes in matching layers between frames", "Generates AI copy text", "Draws illustrations from sketches", "Calculates loading speeds"], correct: 0 }
  ],
  usability_testing: [
    { q: "What is the 'Think-Aloud Protocol' in usability testing?", options: ["Asking participants to verbalize their thoughts and actions as they interact with a design", "Testing voice recognition microphones", "Conducting group debates", "Reading help documentation out loud"], correct: 0 }
  ],
  visual_design: [
    { q: "What is the 60-30-10 rule in interior and visual UI design?", options: ["60% dominant base color, 30% secondary color, 10% accent color", "60% images, 30% text, 10% white space", "60px padding, 30px margins, 10px borders", "60 fps frame rate"], correct: 0 }
  ],
  typography_color: [
    { q: "What is Kerning in typography?", options: ["The adjustment of space between individual letter pairs", "The line height between paragraphs", "The font weight (bold vs thin)", "The contrast ratio against the background"], correct: 0 }
  ],
  photoshop: [
    { q: "Why are Layer Masks preferred over the Eraser tool in Photoshop?", options: ["They allow non-destructive editing so pixels can be restored at any time", "They make file sizes 10x smaller", "They convert images to 3D", "They remove color profiles"], correct: 0 }
  ],
  illustrator: [
    { q: "What is the primary advantage of vector graphics in Adobe Illustrator over raster images?", options: ["Vectors scale infinitely without losing sharpness or resolution", "Vectors contain more audio channels", "Vectors are always black and white", "Vectors cannot be printed"], correct: 0 }
  ],
  video_editing_principles: [
    { q: "What is a 'J-Cut' in video editing?", options: ["Cutting video with a curved knife", "Audio from the next clip begins before the video changes", "A jump cut between two identical angles", "Cropping the video into a square"], correct: 1 },
    { q: "What does the 180-degree rule in cinematography ensure?", options: ["Consistent spatial and eye-line relationships between characters across cuts", "The camera never pans right", "The frame rate is 180fps", "The lens focal length is fixed"], correct: 0 }
  ],
  premiere_davinci: [
    { q: "What is the standard broadcast frame rate in North America (NTSC)?", options: ["23.976 / 29.97 fps", "60.00 fps exact", "12.50 fps", "120 fps"], correct: 0 }
  ],
  motion_graphics: [
    { q: "What does 'Easy Ease' do to keyframe interpolation in After Effects?", options: ["Smoothes acceleration and deceleration curves for natural motion", "Deletes redundant keyframes", "Reverses playback direction", "Adds a drop shadow"], correct: 0 }
  ],
  sound_design: [
    { q: "What is the recommended target peak audio level for dialogue in web video?", options: ["-6 dB to -12 dB True Peak", "0 dB clipping", "+6 dB overdrive", "-40 dB silence"], correct: 0 }
  ],
  color_grading: [
    { q: "What does a LUT (Lookup Table) do in color grading?", options: ["Maps input color values to specific calibrated output color grades", "Edits subtitle timing", "Compresses video bitrates", "Removes camera shake"], correct: 0 }
  ],
  storytelling_scriptwriting: [
    { q: "What constitutes the 'Inciting Incident' in dramatic storytelling?", options: ["The event that hooks the protagonist and disrupts their normal world to start the journey", "The final credits roll", "The introduction of minor extras", "The commercial break"], correct: 0 }
  ],

  // === 5. MARKETING ===
  marketing_fundamentals: [
    { q: "What are the traditional '4 Ps' of the marketing mix?", options: ["Product, Price, Place, Promotion", "Planning, Process, People, Profit", "Positioning, Packaging, Publicity, Performance", "Prospects, Pipeline, Pitch, Payment"], correct: 0 },
    { q: "What does CAC stand for in digital marketing?", options: ["Customer Acquisition Cost", "Cost After Conversion", "Click Attribution Coefficient", "Campaign Audit Cost"], correct: 0 }
  ],
  content_marketing: [
    { q: "What is a 'Lead Magnet' in content marketing?", options: ["A high-value free resource (e.g. eBook, template) offered in exchange for contact information", "A paid television commercial", "An affiliate link footer", "A search engine crawler"], correct: 0 }
  ],
  seo: [
    { q: "Which HTTP status code indicates a permanent redirect for SEO link equity transfer?", options: ["301 Moved Permanently", "302 Found", "404 Not Found", "500 Internal Error"], correct: 0 },
    { q: "What is the purpose of canonical tags (rel='canonical')?", options: ["Prevent duplicate content issues by specifying the master URL", "Compress images for fast load speed", "Block search crawlers from indexing", "Inject Google Analytics scripts"], correct: 0 }
  ],
  keyword_research: [
    { q: "What is Search Intent in SEO keyword analysis?", options: ["The underlying motivation (Informational, Navigational, Commercial, Transactional) behind a search query", "The speed at which a user types", "The browser brand used", "The location of the data center"], correct: 0 }
  ],
  technical_seo: [
    { q: "What is the purpose of a `robots.txt` file on a website?", options: ["Instruct search engine crawlers which pages/paths they are permitted or disallowed to crawl", "Host website CSS stylesheets", "Store user login cookies", "Encrypt SSL certificates"], correct: 0 }
  ],
  google_analytics: [
    { q: "What are UTM parameters used for in digital marketing campaigns?", options: ["Tracking specific traffic sources, mediums, and campaign names in analytics tools", "Securing user passwords", "Improving page load latency", "Ranking higher on YouTube"], correct: 0 }
  ],
  social_media: [
    { q: "What metric is most indicative of organic social media community engagement?", options: ["Engagement Rate = (Likes + Comments + Shares + Saves) / Total Reach", "Total page views", "Number of accounts followed", "Profile bio character length"], correct: 0 }
  ],
  advertising: [
    { q: "In paid PPC advertising, what is Quality Score in Google Ads?", options: ["A metric evaluating ad relevance, expected CTR, and landing page experience", "The total monetary budget spent", "The company's credit score", "The number of employees in the marketing team"], correct: 0 }
  ],
  brand_strategy: [
    { q: "What is Brand Positioning?", options: ["The unique space and value proposition a brand occupies in the mind of the target consumer relative to competitors", "The physical placement of products on supermarket shelves", "The registered trademark registration number", "The font family chosen for the logo"], correct: 0 }
  ],

  // === 6. HEALTHCARE ===
  ehr_systems: [
    { q: "What is the primary standard protocol used for exchanging healthcare electronic records worldwide?", options: ["HL7 / FHIR (Fast Healthcare Interoperability Resources)", "SMTP", "MQTT", "GraphQL only"], correct: 0 },
    { q: "Under HIPAA regulations, what constitutes Protected Health Information (PHI)?", options: ["Any individually identifiable health information held or transmitted by a covered entity", "De-identified aggregate public hospital data", "General medical textbook articles", "Doctor office opening hours"], correct: 0 }
  ],
  healthcare_sql: [
    { q: "When querying patient length of stay (LOS) in healthcare databases, which calculation is standard?", options: ["DATEDIFF(discharge_date, admission_date)", "COUNT(DISTINCT patient_id)", "SUM(medication_cost)", "AVG(patient_age)"], correct: 0 }
  ],
  biostatistics: [
    { q: "In clinical epidemiology, what does an Odds Ratio (OR) of 1.0 signify?", options: ["No association between exposure and outcome", "Exposure strictly causes the disease", "Exposure protects against the disease", "Statistical calculation error"], correct: 0 }
  ],
  hipaa_privacy: [
    { q: "What are the three core safeguard pillars required under the HIPAA Security Rule?", options: ["Administrative, Physical, and Technical safeguards", "Financial, Legal, and Marketing safeguards", "Public, Private, and Hybrid safeguards", "Local, Regional, and Federal safeguards"], correct: 0 }
  ],
  clinical_quality: [
    { q: "What is the purpose of HEDIS (Healthcare Effectiveness Data and Information Set) quality measures?", options: ["Standardized clinical performance metrics assessing care quality and patient outcomes across health plans", "Determining pharmaceutical retail prices", "Allocating hospital parking permits", "Ranking medical school faculties"], correct: 0 }
  ],
  health_info_systems: [
    { q: "What is the primary purpose of a Clinical Decision Support System (CDSS)?", options: ["Provide clinicians with evidence-based alerts and diagnostic recommendations at the point of care", "Manage nurse payroll", "Order cafeteria supplies", "Process health insurance claims"], correct: 0 }
  ],
  clinical_terminologies: [
    { q: "What is the primary distinction between ICD-10 and CPT coding systems?", options: ["ICD-10 codes diagnoses and diseases; CPT codes medical procedures and clinical services provided", "They are identical European standards", "CPT is only for veterinary medicine", "ICD-10 is used exclusively in dental clinics"], correct: 0 }
  ],
  good_clinical_practice: [
    { q: "What is the primary role of an Institutional Review Board (IRB) in clinical trials?", options: ["Ensure the safety, rights, and ethical treatment of human research subjects", "Negotiate commercial drug pricing", "Design the chemical compound", "Approve pharmaceutical marketing budgets"], correct: 0 },
    { q: "What is an Adverse Event (AE) in clinical trial research?", options: ["Any untoward medical occurrence in a patient administered a pharmaceutical product", "A trial running over budget", "A delayed laboratory result", "A study protocol amendment"], correct: 0 }
  ],
  clinical_protocols: [
    { q: "Why are strict Inclusion and Exclusion Criteria established in clinical trial protocols?", options: ["To define the exact eligible patient population and minimize confounding safety variables", "To reduce the cost of clinical trial advertising", "To ensure only patients with private insurance participate", "To guarantee a positive outcome"], correct: 0 }
  ],
  healthcare_operations: [
    { q: "In hospital operations, what does Bed Turnover Rate measure?", options: ["The number of times a hospital bed changes occupants over a specific period", "The cost of hospital bed manufacturing", "The physical rotation angle of adjustable beds", "The nurse-to-patient staffing ratio"], correct: 0 }
  ],
  hospital_finance: [
    { q: "What is a DRG (Diagnosis-Related Group) in hospital reimbursement?", options: ["A prospective payment category that bundles payment based on the patient's primary diagnosis and procedures", "A tax exemption status for non-profit hospitals", "A foreign currency conversion rate for medical tourists", "A department budget cap"], correct: 0 }
  ]
}

// Fallback dynamic generator that constructs topic-specific questions for any custom or new skill
function generateQuestionsForSkill(skillId, skillName) {
  const cleanId = (skillId || '').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cleanName = (skillName || 'Core Competency').trim()

  // 1. Direct or partial match from our bank
  for (const [key, qList] of Object.entries(MOCK_QUESTIONS)) {
    if (cleanId.includes(key) || key.includes(cleanId) || cleanName.toLowerCase().includes(key)) {
      return qList
    }
  }

  // 2. Skill-specific crafted questions using the skill's actual title and technical domains
  return [
    {
      q: `Which foundational principle is most essential when implementing ${cleanName}?`,
      options: [
        `Applying industry-standard best practices, core patterns, and validated methodologies for ${cleanName}`,
        `Bypassing standard validation and testing to expedite initial delivery`,
        `Relying solely on default unconfigured settings without adaptation`,
        `Ignoring edge-case constraints and operating documentation`
      ],
      correct: 0
    },
    {
      q: `When evaluating the performance and reliability of ${cleanName} in production, what is the best practice?`,
      options: [
        `Regular metric benchmarking, continuous monitoring, and structured iterative optimization`,
        `Only checking logs after a catastrophic critical failure occurs`,
        `Assuming initial implementation requires zero maintenance or tuning`,
        `Disabling error tracking and analytics to reduce overhead`
      ],
      correct: 0
    },
    {
      q: `How do you resolve complex edge-case challenges in ${cleanName}?`,
      options: [
        `Isolating root causes through diagnostic testing, root-cause analysis, and systematic debugging`,
        `Restarting the system repeatedly without investigating error logs`,
        `Hardcoding temporary overrides that bypass security and accuracy checks`,
        `Abandoning the workflow and rebuilding from scratch without plan`
      ],
      correct: 0
    }
  ]
}

function QuizModal({ skillId, skillName, onClose, onComplete }) {
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [answers, setAnswers] = useState([])
  const [quizFinished, setQuizFinished] = useState(false)

  // Retrieve skill-specific questions
  const questions = generateQuestionsForSkill(skillId, skillName)
  const totalQuestions = questions.length

  // Simulate LLM question generation loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [skillId])

  const handleSubmit = () => {
    if (selectedOption === null) return

    const newAnswers = [...answers, selectedOption]
    setAnswers(newAnswers)
    setSelectedOption(null)

    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setQuizFinished(true)
    }
  }

  const handleFinish = () => {
    // Calculate final score percentage
    const correctCount = answers.filter((ans, idx) => ans === questions[idx].correct).length
    const scorePct = Math.round((correctCount / totalQuestions) * 100)
    
    // Call complete trigger with exact percentage
    onComplete(scorePct)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-left"
      >
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-850 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-indigo-400" />
            <span className="font-extrabold text-sm text-slate-200">Skill Assessment: {skillName}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* LOADING STATE - SIMULATES DYNAMIC LLM ASSESSOR GENERATION */}
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-350">LLM Assessor Booting...</p>
              <p className="text-xs text-slate-500 max-w-xs">Analyzing targets to generate personalized multiple choice concepts.</p>
            </div>
            
            {/* Loading Skeleton */}
            <div className="w-full space-y-3 mt-4 animate-pulse">
              <div className="h-4 bg-slate-950 rounded w-3/4" />
              <div className="h-10 bg-slate-950 rounded w-full" />
              <div className="h-10 bg-slate-950 rounded w-full" />
            </div>
          </div>
        ) : !quizFinished ? (
          /* ACTIVE QUESTIONS */
          <div className="p-6 space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Question {currentStep + 1} of {totalQuestions}</span>
                <span className="text-indigo-400">{Math.round(((currentStep) / totalQuestions) * 100)}% Complete</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${((currentStep) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 leading-relaxed">
                {questions[currentStep].q}
              </h3>
              
              {/* Option List */}
              <div className="space-y-2">
                {questions[currentStep].options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => setSelectedOption(oIdx)}
                    className={`w-full flex items-center gap-3 rounded-xl border p-4 text-xs font-bold text-left transition-all ${
                      selectedOption === oIdx
                        ? 'border-indigo-500/50 bg-indigo-650/10 text-indigo-400'
                        : 'border-slate-850 bg-slate-950 text-slate-350 hover:bg-slate-850'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                      selectedOption === oIdx
                        ? 'bg-indigo-600 border-indigo-400 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-2 flex justify-end gap-3 border-t border-slate-850">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-800 hover:bg-slate-850 px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-550 disabled:cursor-not-allowed px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-650/10"
              >
                {currentStep === totalQuestions - 1 ? "Submit Quiz" : "Next Question"}
              </button>
            </div>
          </div>
        ) : (
          /* QUIZ FINISHED - SUCCESS SUMMARY STATE */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-450">
              <Award className="h-8 w-8 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-100">Assessment Complete!</h2>
              <p className="text-xs text-slate-450 max-w-sm mx-auto">
                Your performance has been evaluated by our LLM assessor model to update your mastery metrics.
              </p>
            </div>

            {/* Scorecard */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 max-w-sm mx-auto grid grid-cols-2 gap-4">
              <div className="border-r border-slate-850 text-center">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Score</span>
                <span className="text-lg font-black text-slate-200">
                  {Math.round((answers.filter((ans, idx) => ans === questions[idx].correct).length / totalQuestions) * 100)}%
                  <span className="text-xs text-slate-500 font-normal ml-1">({answers.filter((ans, idx) => ans === questions[idx].correct).length}/{totalQuestions})</span>
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Module Tier</span>
                <span className={`text-xs font-black capitalize ${
                  (answers.filter((ans, idx) => ans === questions[idx].correct).length / totalQuestions) >= 0.8
                    ? 'text-emerald-400'
                    : (answers.filter((ans, idx) => ans === questions[idx].correct).length / totalQuestions) >= 0.6
                    ? 'text-indigo-400'
                    : (answers.filter((ans, idx) => ans === questions[idx].correct).length / totalQuestions) >= 0.4
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}>
                  {(answers.filter((ans, idx) => ans === questions[idx].correct).length / totalQuestions) >= 0.8
                    ? '80%+ (Mastered / Skip Basic)'
                    : (answers.filter((ans, idx) => ans === questions[idx].correct).length / totalQuestions) >= 0.6
                    ? '60-79% (Advanced Tier)'
                    : (answers.filter((ans, idx) => ans === questions[idx].correct).length / totalQuestions) >= 0.4
                    ? '40-59% (Foundational+Interm)'
                    : '<40% (Foundational)'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={handleFinish}
                className="rounded-xl bg-indigo-650 hover:bg-indigo-600 px-8 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-650/15"
              >
                Update Skill Mastery
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default QuizModal
