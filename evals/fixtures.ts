import { COLD_EMAIL_SYSTEM_PROMPT, buildColdEmailPrompt } from "../src/prompts/cold-email";
import { THANK_YOU_SYSTEM_PROMPT, buildThankYouPrompt } from "../src/prompts/thank-you";
import { RESUME_SYSTEM_PROMPT, buildResumePrompt } from "../src/prompts/resume";
import { STAR_SYSTEM_PROMPT, buildStarPrompt } from "../src/prompts/star";
import { COFFEE_CHAT_SYSTEM_PROMPT, buildCoffeeChatPrompt } from "../src/prompts/coffee-chat";

export type Fixture = {
  id: string;
  tool: "cold-email" | "thank-you" | "resume" | "star" | "coffee-chat";
  mode: "sparse" | "rich";
  label: string;
  systemPrompt: string;
  userMessage: string;
};

export const FIXTURES: Fixture[] = [
  {
    id: "cold-email-sparse",
    tool: "cold-email",
    mode: "sparse",
    label: "Minimal input — just name, role, company, alumni connection",
    systemPrompt: COLD_EMAIL_SYSTEM_PROMPT,
    userMessage: buildColdEmailPrompt({
      senderName: "Vatsal Khemani",
      school: "Wharton MBA '28",
      recipientName: "Sarah Chen",
      recipientRole: "Senior PM",
      recipientCompany: "Stripe",
      connectionType: "Alumni",
      connectionDetail: "",
      goal: "Coffee chat about PM career",
      personalDetail: "",
      tone: "warm",
    }),
  },
  {
    id: "cold-email-rich",
    tool: "cold-email",
    mode: "rich",
    label: "Rich input — personal detail, career-switcher context",
    systemPrompt: COLD_EMAIL_SYSTEM_PROMPT,
    userMessage: buildColdEmailPrompt({
      senderName: "Priya Patel",
      school: "Wharton MBA '28",
      recipientName: "Marcus Liu",
      recipientRole: "Director of Product",
      recipientCompany: "Notion",
      connectionType: "LinkedIn cold",
      connectionDetail: "",
      goal: "Explore PM roles post-MBA and learn about Notion's API platform direction",
      personalDetail: "He gave a talk at Figma Config 2025 on building a developer ecosystem around no-code tools. I'm switching from biotech R&D and want to understand how domain experts become product leaders.",
      tone: "warm",
    }),
  },

  {
    id: "thank-you-sparse",
    tool: "thank-you",
    mode: "sparse",
    label: "Minimal input — 60-second coffee chat thank-you",
    systemPrompt: THANK_YOU_SYSTEM_PROMPT,
    userMessage: buildThankYouPrompt({
      senderName: "Vatsal",
      recipientName: "Amit",
      recipientRole: "PM at Google",
      context: "Coffee chat",
      discussed: "",
      followUp: "",
      tone: "warm",
    }),
  },
  {
    id: "thank-you-rich",
    tool: "thank-you",
    mode: "rich",
    label: "Rich input — final-round interview with specifics",
    systemPrompt: THANK_YOU_SYSTEM_PROMPT,
    userMessage: buildThankYouPrompt({
      senderName: "Priya",
      recipientName: "Jordan",
      recipientRole: "VP of Product",
      context: "Final-round interview",
      discussed: "The tradeoff between platform extensibility and UX simplicity in their enterprise tier; how they decided to sunset the old workflow builder; Jordan's view that the next 18 months will be about agentic workflows not just templates",
      followUp: "I'm going to send Jordan the McKinsey report on enterprise AI adoption I mentioned",
      tone: "professional",
    }),
  },

  {
    id: "resume-sparse",
    tool: "resume",
    mode: "sparse",
    label: "Vague bullets with no metrics",
    systemPrompt: RESUME_SYSTEM_PROMPT,
    userMessage: buildResumePrompt({
      bullets: `- Responsible for managing social media for a nonprofit
- Helped with customer research for a startup
- Worked on the onboarding flow redesign`,
      targetRole: "",
      goal: "Land a tech PM internship",
    }),
  },
  {
    id: "resume-rich",
    tool: "resume",
    mode: "rich",
    label: "Career-switcher bullets (military) with some metrics, targeting consulting",
    systemPrompt: RESUME_SYSTEM_PROMPT,
    userMessage: buildResumePrompt({
      bullets: `- Platoon leader for 40 soldiers during 9-month deployment, maintained 100% equipment readiness
- Coordinated logistics for battalion-wide training exercise involving 600 personnel across 3 locations
- Wrote standard operating procedures adopted by 2 other units`,
      targetRole: "Consulting (McKinsey/BCG/Bain)",
      goal: "MBB consulting summer internship",
    }),
  },

  {
    id: "star-sparse",
    tool: "star",
    mode: "sparse",
    label: "Two-sentence raw story",
    systemPrompt: STAR_SYSTEM_PROMPT,
    userMessage: buildStarPrompt({
      rawStory: "I led a project that improved sales at my company. We had good results and my boss was happy.",
      competency: "Leadership",
      interviewType: "General behavioral",
    }),
  },
  {
    id: "star-rich",
    tool: "star",
    mode: "rich",
    label: "Detailed raw story for Amazon LP interview",
    systemPrompt: STAR_SYSTEM_PROMPT,
    userMessage: buildStarPrompt({
      rawStory: `At my last company (a fintech startup, 80 people), our mobile app's 7-day retention was stuck at 22% for six months. I was the PM on the growth team. Everyone wanted to add more features but I pushed back. I pulled 30 days of funnel data and noticed 60% of drop-off happened between first-launch and second session. I ran 12 user interviews over two weeks and learned most users didn't understand the core value prop because our onboarding assumed crypto knowledge. My eng lead disagreed — he thought we should ship a referral feature instead because it was faster. I proposed we run both in parallel as A/B tests. I built the new onboarding with one designer in 3 weeks. The referral shipped in 1 week. Retention went from 22% to 34% with the new onboarding. Referral barely moved the needle. We adopted onboarding redesign as a quarterly rhythm after that.`,
      competency: "Disagree and Commit",
      interviewType: "Amazon Leadership Principles",
    }),
  },

  {
    id: "coffee-chat-sparse",
    tool: "coffee-chat",
    mode: "sparse",
    label: "Minimal — senior person, no background given",
    systemPrompt: COFFEE_CHAT_SYSTEM_PROMPT,
    userMessage: buildCoffeeChatPrompt({
      personName: "Rachel Wong",
      personRole: "SVP Product",
      personCompany: "Airbnb",
      context: "Alumni",
      yourBackground: "",
      whatToLearn: "",
    }),
  },
  {
    id: "coffee-chat-rich",
    tool: "coffee-chat",
    mode: "rich",
    label: "Career-switcher, specific decision to navigate",
    systemPrompt: COFFEE_CHAT_SYSTEM_PROMPT,
    userMessage: buildCoffeeChatPrompt({
      personName: "David Kim",
      personRole: "Principal PM",
      personCompany: "Anthropic",
      context: "Warm intro from a classmate",
      yourBackground: "5 years in management consulting at Deloitte, first-year Wharton MBA, switching to tech PM",
      whatToLearn: "Deciding between joining an AI foundation model company as a PM vs a late-stage AI application startup. Want his honest take on which path leads to better judgment building in the next 3 years.",
    }),
  },

  // === NEW FIXTURES (Run 004+) — different scenario branches to test generalization ===

  {
    id: "cold-email-referral",
    tool: "cold-email",
    mode: "rich",
    label: "Referral-based cold email (mutual connection, not alumni/LinkedIn)",
    systemPrompt: COLD_EMAIL_SYSTEM_PROMPT,
    userMessage: buildColdEmailPrompt({
      senderName: "James Chen",
      school: "Wharton MBA '28",
      recipientName: "Maya Rodriguez",
      recipientRole: "Head of Growth",
      recipientCompany: "Ramp",
      connectionType: "Referral",
      connectionDetail: "Introduced through Alex Park (ex-Ramp PM, now classmate of mine)",
      goal: "Informational chat about growth-PM roles at fintech",
      personalDetail: "Alex mentioned you rebuilt Ramp's activation funnel last year and that you're the person who'd have the sharpest take on growth PM work in B2B fintech.",
      tone: "warm",
    }),
  },
  {
    id: "thank-you-class-speaker",
    tool: "thank-you",
    mode: "rich",
    label: "Class speaker thank-you with one specific insight to reference",
    systemPrompt: THANK_YOU_SYSTEM_PROMPT,
    userMessage: buildThankYouPrompt({
      senderName: "Priya",
      recipientName: "Professor Liu",
      recipientRole: "guest speaker",
      context: "Class speaker",
      discussed: "His example of how Dropbox's reverse-trial pricing broke conventional SaaS wisdom — the insight that 'pricing is a signal about what you believe the product is worth, not a calculation from cost'",
      followUp: "",
      tone: "professional",
    }),
  },
  {
    id: "resume-polished",
    tool: "resume",
    mode: "rich",
    label: "Already-polished bullets needing only minor tightening",
    systemPrompt: RESUME_SYSTEM_PROMPT,
    userMessage: buildResumePrompt({
      bullets: `- Built and shipped a pricing A/B test that lifted conversion 18% and generated $1.2M incremental ARR in Q3
- Led a team of 6 (3 engineers, 2 designers, 1 data scientist) to launch our mobile app, reaching 45K DAUs in 4 months
- Presented growth strategy to CEO and board quarterly, influencing $3M budget reallocation toward platform work`,
      targetRole: "Tech PM (FAANG)",
      goal: "FAANG PM internship",
    }),
  },
  {
    id: "star-consulting-pei",
    tool: "star",
    mode: "rich",
    label: "Consulting PEI story — personal impact dimension",
    systemPrompt: STAR_SYSTEM_PROMPT,
    userMessage: buildStarPrompt({
      rawStory: `During my 2 years at Bain before the MBA, I was staffed on a telco merger for 8 months. Our team of 4 was helping the client consolidate two network-operations orgs. I was the most junior person but noticed the workstream lead was building a solution based on assumptions that didn't match what I was hearing from operators on the ground. I flagged it twice in team meetings and got brushed off. I spent a weekend building a counter-model with data from 15 operator interviews I ran, then walked my manager through it Monday morning. She was skeptical but agreed to let me present to the partner. The partner adopted the new model. We ended up saving the client ~40 FTE roles compared to the original plan, which was a better outcome because their attrition was already high. I learned that at junior levels, data beats hierarchy, but you have to do the work to bring the data.`,
      competency: "Personal Impact",
      interviewType: "Consulting (McKinsey/BCG/Bain PEI)",
    }),
  },
  {
    id: "coffee-chat-peer",
    tool: "coffee-chat",
    mode: "rich",
    label: "Peer-level recent MBA grad at an early-stage startup",
    systemPrompt: COFFEE_CHAT_SYSTEM_PROMPT,
    userMessage: buildCoffeeChatPrompt({
      personName: "Sam Park",
      personRole: "Founding PM",
      personCompany: "Strand (Series A, 18 people)",
      context: "Wharton alum, graduated 2 years ago",
      yourBackground: "First-year Wharton MBA, 3 years as a software engineer before business school",
      whatToLearn: "Trying to figure out whether to join a Series A startup as an early PM right after graduation vs taking a FAANG PM rotation. Want the tactical reality of being a founding PM at 18 people — what the day actually looks like, what sucks about it, what he wishes he'd known.",
    }),
  },

  // === RUN 007 FRESH FIXTURES — truly unoptimized scenarios to verify no overfitting ===

  {
    id: "cold-email-boutique-vp",
    tool: "cold-email",
    mode: "rich",
    label: "Cold email to VP at a boutique firm (not FAANG/unicorn), career switcher from healthcare",
    systemPrompt: COLD_EMAIL_SYSTEM_PROMPT,
    userMessage: buildColdEmailPrompt({
      senderName: "Sneha Reddy",
      school: "Wharton MBA '28",
      recipientName: "David Alvarez",
      recipientRole: "VP of Strategy",
      recipientCompany: "Welch Health Advisors (boutique healthcare consulting, ~60 people)",
      connectionType: "Wharton alum",
      connectionDetail: "",
      goal: "Explore healthcare-focused consulting post-MBA",
      personalDetail: "He wrote a piece in Health Affairs last fall on value-based care reimbursement models and mentioned at our recruiting event that his firm turned down a PE acquisition offer last year to preserve independence.",
      tone: "professional",
    }),
  },
  {
    id: "thank-you-networking-event",
    tool: "thank-you",
    mode: "sparse",
    label: "Post-networking-event thank-you (one of 50 attendees, tough to differentiate)",
    systemPrompt: THANK_YOU_SYSTEM_PROMPT,
    userMessage: buildThankYouPrompt({
      senderName: "Marcus",
      recipientName: "Elena",
      recipientRole: "Director of Talent",
      context: "Networking event",
      discussed: "I was the one wearing a bright red blazer who asked about their internship-to-FT conversion process",
      followUp: "",
      tone: "professional",
    }),
  },
  {
    id: "resume-finance",
    tool: "resume",
    mode: "rich",
    label: "Finance bullets targeting buy-side investing",
    systemPrompt: RESUME_SYSTEM_PROMPT,
    userMessage: buildResumePrompt({
      bullets: `- Analyzed 12 public companies across industrials sector using DCF, comps, and LBO models, produced 30-page investment thesis
- Built proprietary screening tool in Python that flagged 8 acquisition targets for MD team, 2 of which became live deals
- Presented weekly industry update to 15-person sector team, including senior bankers and 3 MDs`,
      targetRole: "Private equity (buy-side)",
      goal: "Summer internship at a middle-market PE fund",
    }),
  },
  {
    id: "star-tech-customer-obsession",
    tool: "star",
    mode: "rich",
    label: "Tech PM interview, Customer Obsession competency, launch-that-failed story",
    systemPrompt: STAR_SYSTEM_PROMPT,
    userMessage: buildStarPrompt({
      rawStory: `I was PM on a B2B SaaS team of 30 people at my last company. We spent 4 months building a "smart scheduling" feature for enterprise admins after they asked for it in 5 consecutive user research sessions. We shipped it with a big launch, press, and training materials. Within 6 weeks, adoption was flat — 4% of target users activated it. I was devastated but dug in. I ran 20 follow-up customer calls and discovered the feature solved a problem admins talked about in interviews but didn't actually experience — they only complained about scheduling when it broke, not daily, so the value prop fell flat. I killed the feature and wrote a postmortem explaining the gap between "stated pain" and "felt pain." The postmortem became required reading for new PMs at the company.`,
      competency: "Customer Obsession",
      interviewType: "Tech PM",
    }),
  },
  {
    id: "coffee-chat-international",
    tool: "coffee-chat",
    mode: "rich",
    label: "International grad at a non-US market leader, specific regulatory context",
    systemPrompt: COFFEE_CHAT_SYSTEM_PROMPT,
    userMessage: buildCoffeeChatPrompt({
      personName: "Ayesha Kapoor",
      personRole: "Head of Product - India",
      personCompany: "PhonePe",
      context: "Warm intro through a mutual classmate",
      yourBackground: "First-year Wharton MBA, 4 years at a US fintech (Block) before school, Indian citizen planning to return home post-MBA",
      whatToLearn: "Want her honest take on whether it makes more sense to join a local-market leader like PhonePe at a senior IC level or to join an India-focused fund/operator role. Also trying to understand how UPI regulation changes in the last 18 months have reshaped product strategy for incumbents.",
    }),
  },
];
