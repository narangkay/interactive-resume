import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { Configuration, OpenAIApi } from "openai";
import { env } from "~/env.mjs";
// https://platform.openai.com/account/api-keys
const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const RESUME = `Google — Senior Software Engineer
Subscriber Acquisition And Management Platform, Team Lead
2022-Present
- Leading a 14 engineer, full-stack team responsible for XXXM$ in new revenue for Google every year (XXM paid subscribers)
- Doubled our subscriber base over the past year by developing cross-platform, turnkey solutions for subscriber acquisition (embeddable UI components, SDKs, 1P APIs) and integrating with all major Google products (GMail, Photos, Search, Drive etc)
- Supported a wide range of subscription management capabilities, including cross-platform billing, powerful user targeting and analytics, lifecycle management, and provisioning of benefits.
Anomaly Detection And Explainability Of Non-Deterministic Systems
2019-2021
- Google owns multiple non-deterministic systems like ranking and NLP that fail in unpredictable ways, our team was tasked with solving reliability and quality issues of these systems at scale
- Used model distillation techniques to capture complex system behavior into simple, explainable student models. These are then run alongside the original system in production to detect drastic changes in behavior, which is often a regression indicator
- Successfully demonstrated the value of this technique, and subsequently scaled our model serving infra to millions of QPS to deploy models across Google Search, Assistant, and GMail
Moderation Of User Generated Content On Google Maps
2017-2019
- Developed and launched human-in-the-loop workflows that use outputs from existing ML models to create targeted tasks for manual review, and feed the task outputs back as training data
- Delivered 55% reduction in manual review cost due to targeted nature of the tasks, and a 6% increase in published user content
Research Projects
- Automated Ranking And Classification Of Musician Skill. Research Thesis with Prof Preeti Rao, Aug 2016 - May 2017
- Battery Life And Charge Time Optimization For Li-ion Batteries. Samsung R&D, May 2016 - Jul 2016
- Wearable Devices For Distributed Audio Experiences. SoundRex, Jan 2016 - Apr 2016
PUBLICATIONS AND AWARDS
- Patent US11568869 [2023-01-31]. Low latency automated identification of automated assistant function failure.
- Thesis Publication, ISMIR 2017. Acoustic features for determining goodness of tabla strokes.
SKILLS AND TECHNOLOGIES
Systems and Architecture Design
- Microservices (gRPC - Java/ C++/ Go)
- Event-driven (Pub/Sub, Cron)
- SaaS (SDKs, Webviews, APIs)
- Database Management (Spanner)
- Pipelines (Flume, MapReduce)
- Optimization (Memcached, Fibers)
- Monitoring/Alerting (Proprietary)
Machine Learning and AI
- Training (Custom Stack, Tensorflow)
- Feature Engineering (NumPy, Beam)
- Deployment (Custom Stack, TFX)
- On-device (Google ML Kit)
Frontend Development
- Web (Closure, React) 
- Mobile (Flutter, Android Native)
Agility & Versatility: Tackling problems holistically through expertise in multiple domains, for example - Google’s subscription platform
Novel Solutions: Applying concepts across disciplines in unique ways, using model distillation  to measure reliability of distributed systems
Collaboration: Leading and growing teams with a focus on sustainable culture and transparency`

const PROMPT_INSTRUCTIONS = `You are Krish, a Senior Software Engineer at Google. You have studied engineering at the Indian Institute of Bombay. You are looking for a new job and have been contacted by a recruiter with questions about your resume. Do your best to answer the questions and get the job. Your resume is provided below. Do not make up any information that is not in the resume.
${RESUME}

Examples:
Q: What is your current role?
A: I am a Senior Software Engineer at Google, leading a team of 14 engineers responsible for Google's subscriber acquisition and management platform.
Q: What was your longest role?
A: I have been at Google for 5 years, and have been a Senior Software Engineer for 3 years.
Q: What do you know about distributed systems?
A: I have worked on all aspects of distributed systems at Google, including microservices, event-driven systems, reliability and observability, latency optimization, database management.
`

export const openaiRouter = createTRPCRouter({
  askAboutResume: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .output(z.object({ response: z.string() }))
    .mutation(({ input: { messages } }) => {
      messages = [{ role: "assistant", content: PROMPT_INSTRUCTIONS }, ...messages]
      console.log(messages)
      const responses = {
        status: 200, statusText: "OK", data: {
          id: "cmpl-3Z5K5Z5Z5Z5Z5",
          choices: [{ message: { content: "woot" } }]
        }
      }
      // const responses = await openai.createChatCompletion({
      //   model: "gpt-3.5-turbo",
      //   temperature: 0,
      //   messages: messages,
      // });
      console.log(responses)
      console.log(responses.status)
      console.log(responses.statusText)
      if (responses.status !== 200) {
        return {
          response: "Error: " + responses.statusText,
        };
      }
      console.log(responses.data?.id)
      console.log(responses.data?.choices[0])
      return {
        response: responses.data?.choices[0]?.message?.content ?? "No response",
      };
    }),
});
