
const RESUME = `Google — Senior Software Engineer
Team Lead - Subscriptions Platform, Google One
2022-Present
- Leading a 14 engineer, full-stack team driving $500M+ in new revenue for Google via paid subscribers
- We support turnkey subscription management solutions used by GMail, Photos, Search, Drive etc. (cross-platform billing, user targeting and analytics, lifecycle management, feature gating)
Tech Lead - Reliability and Quality, Google Assistant
2019-2022
- Google Assistant consists of multiple non-deterministic systems (ranking, NLP) that fail in unpredictable ways. Our team was tasked with solving reliability and quality issues for these systems
- Used model distillation techniques to capture complex system behavior into simple, explainable student models (1TB+ neural nets were compressed into ~1GB decision tree)
- Distilled models are run alongside teacher models in production with a staggered release, in order to detect regressions on fine grained buckets of data (each leaf of the tree represents a bucket)
- Implemented a custom trie based inference for the decision tree models, allowing us to scale to >1 million QPS at <50 ms latency
- Demonstrated a 5x reduction in user facing outages, and expanded to  launch models for Google Search and GMail as well
Moderation Of User Generated Content On Google Maps
2017-2019
- Developed and launched human-in-the-loop workflows that use outputs from existing ML models to create targeted tasks for manual review, and feed the task outputs back as training data
- Delivered 55% reduction in manual review cost due to targeted nature of the tasks, and a 6% increase in published user content
Research Projects
- Information retrieval from PDFs  using on-device, local inference. Adapted the popular WebLLM project into a Next.js compatible website with vector database support, Apr 2023 - Current
- Automated Ranking And Classification Of Musician Skill. Research Thesis with Prof Preeti Rao, Aug 2016 - May 2017
- Battery Life And Charge Time Optimization For Li-ion Batteries. Samsung R&D, May 2016 - Jul 2016
PUBLICATIONS AND AWARDS
- Patent US11568869, 2023-01-31. Low latency automated identification of automated assistant function failure.
- Thesis Publication, ISMIR 2017. Acoustic features for determining goodness of tabla strokes.
SKILLS AND TECHNOLOGIES
- Systems and Architecture Design
- Microservices (gRPC - Java/ C++/ Go)
- Event-driven (Pub/Sub, Cron)
- SaaS (Android/iOS SDKs, Webviews)
- Database Management (Spanner)
- Pipelines (Flume, MapReduce)
- Optimization (Memcached, Fibers)
- Monitoring/Alerting (Proprietary)
Machine Learning and AI
- Model development: (Pytorch) training, fine-tuning, validation
- On-device (Apache TVM, ggml)
- Feature Engineering (NumPy, Beam)
Frontend Development
- Web (React, NextJS) 
- Mobile (Flutter, Android Native)
Agility & Versatility: Tackling problems holistically through expertise in multiple domains, for example - Google’s subscription platform
Novel Solutions: Applying concepts across disciplines in unique ways, using model distillation  to measure reliability of distributed systems
Collaboration: Leading and growing teams with a focus on sustainable culture and transparency`

const PREFIX = "You are an assistant to Krish, a Senior Software Engineer at Google. Krish has studied engineering at the Indian Institute of Bombay. He is looking for a new job and has been contacted by a recruiter with questions about his resume, provided below. Do not make up any information that is not in the resume."

const ANSWER_RESUME_QUESTIONS_INSTRUCTION_PROMPT = `${PREFIX}
Do your best to answer the questions for Krish and get him the job. For example:
USER: What is your current role?
ASSISTANT: I am a Senior Software Engineer at Google, leading a team of 14 engineers responsible for Google's subscriber acquisition and management platform.

USER: What was your longest role?
ASSISTANT: I have been at Google for 5 years, and have been a Senior Software Engineer for 3 years.

USER: What do you know about distributed systems?
ASSISTANT: I have worked on all aspects of distributed systems at Google, including microservices, event-driven systems, reliability and observability, latency optimization, database management.

Your resume for reference:
${RESUME}
`

const ASK_FOR_FOLLOWUP_QUESTIONS = "Suggest at least 3 followup questions that you think the recruiter might ask from a variety of areas. Respond with only the questions, each on a different line. Limit your questions to things covered in the resume."

const FOLLOWUP_QUESTIONS_PROMPT = `${PREFIX}
${ASK_FOR_FOLLOWUP_QUESTIONS} For example:
The recruiter has asked the following question: What do you know about distributed systems?
Followup questions:
What areas of distributed systems have you worked on?
What is your favorite part of working at Google?
What are areas where you can improve?

Your resume for reference:
${RESUME}
`

const STATIC_QUESTIONS = [
    "What do you know about distributed systems?",
    "What was your longest role?",
    "What is a key skill you have developed through your work experience?",
]

export const askForFollowupQuestions = () => {
    return ASK_FOR_FOLLOWUP_QUESTIONS;
}

export const askAboutResumePrompt = () => {
    return ANSWER_RESUME_QUESTIONS_INSTRUCTION_PROMPT;
}

export const followupQuestionsPrompt = (lastQuestion: string) => {
    return `${FOLLOWUP_QUESTIONS_PROMPT}The recruiter has asked the following question: ${lastQuestion}
    Followup questions:`;
};

export const staticQuestions = () => {
    return STATIC_QUESTIONS;
};
