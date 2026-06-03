# AI Spoken English App: Build Plan and Sprint Roadmap

## 1. Product vision

Build an India-first AI spoken English coach that gives learners a structured course, daily 30-minute voice practice, live correction during conversation, and a detailed improvement report after every session. The app should support Indian languages as learner-assistance languages, start with a focused set of high-demand languages, and expand toward all major Indian languages after proving retention and learning outcomes.

## 2. Important model decision

The product can use Gemini 3.5 Flash as the core reasoning model for lesson planning, evaluation, reports, personalization, and content generation. For low-latency voice conversations, use a Gemini Live API-compatible voice model because real-time spoken practice needs streaming audio, interruption handling, and natural turn-taking. The architecture should keep the AI provider layer modular so the app can swap or add models as Gemini model availability and pricing changes.

## 3. Market gap

The strongest market gap is not another grammar-content app. The gap is affordable, private, daily speaking practice that understands Indian accents, Indian language mixing, job-focused scenarios, and beginner confidence issues. Many learners need a safe place to speak every day, get corrected without embarrassment, and see measurable progress.

## 4. Initial target segments

1. Job seekers in tier 2 and tier 3 cities preparing for interviews, customer support, sales, hospitality, retail, and BPO roles.
2. College students preparing for placements, group discussions, viva, presentations, and workplace communication.
3. Working professionals who need better meeting, customer, email, and client-call English.
4. Adult learners and homemakers who want confidence in everyday English but may avoid public spoken-English classes.
5. Schools, coaching centers, colleges, NGOs, and skill-development institutes as B2B customers after the consumer MVP is validated.

## 5. MVP scope

The first production MVP should be narrow and strong instead of trying to support every use case. Launch with Android-first mobile experience, five learner-assistance languages, daily 30-minute AI speaking sessions, one beginner course, one interview course, live correction, daily reports, weekly progress, and subscriptions.

### Recommended MVP languages

1. Hindi
2. Tamil
3. Telugu
4. Kannada
5. Malayalam

These languages create a strong first launch across North and South India while keeping localization and QA manageable.

## 6. Differentiators

1. Mother-tongue explanations for corrections.
2. Code-mixed support such as Hinglish, Tanglish, Tenglish, and other regional-English combinations.
3. Indian scenarios such as placement interviews, railway station conversations, customer-service calls, college viva, sales pitches, government office conversations, and family/social conversations.
4. A confidence-first teaching style that corrects mistakes without over-interrupting.
5. Detailed reports that show exact mistakes, corrected versions, pronunciation targets, vocabulary learned, speaking time, and next homework.
6. Career-specific learning tracks for interview English, BPO English, sales English, hospitality English, nursing English, office English, and IELTS-style speaking.

## 7. User experience

### Daily 30-minute session structure

1. Warm-up: 3 minutes of simple daily conversation.
2. Lesson: 5 minutes introducing the speaking target.
3. Guided practice: 10 minutes of AI-led questions and corrections.
4. Role play: 7 minutes in a realistic scenario.
5. Fluency challenge: 3 minutes of continuous speaking.
6. Summary and homework: 2 minutes of corrections, vocabulary, and next steps.

### Correction modes

1. Gentle mode: correct after the learner finishes an answer.
2. Real-time mode: correct immediately only for important repeated mistakes.
3. Fluency mode: focus on speaking confidence and correct after the exercise.

The default should be gentle mode for beginners because over-correction can reduce confidence and retention.

## 8. Report design

Every session report should include:

1. Session date, course, topic, level, duration, learner talk time, and AI talk time.
2. Scores for grammar, vocabulary, pronunciation, fluency, listening comprehension, and confidence.
3. Top five mistakes with original sentence, corrected sentence, short explanation in the learner's language, and repeat-practice prompt.
4. New vocabulary and phrases learned.
5. Pronunciation focus for the next session.
6. Homework: one speaking task, one repetition task, and one short scenario task.
7. Weekly progress comparison: speaking minutes, mistake reduction, level movement, and confidence trend.

## 9. Course architecture

### Level 0: Starter

Basic greetings, names, family, numbers, common words, simple question-answer patterns, and repeat-after-me pronunciation.

### Level 1: Daily English

Daily routine, food, shopping, travel, asking for help, describing people, describing problems, and phone conversations.

### Level 2: Speaking grammar

Present, past, future, questions, articles, prepositions, subject-verb agreement, modals, and common Indian-English mistakes.

### Level 3: Confidence and fluency

One-minute speaking, storytelling, opinions, explaining problems, comparing options, and small presentations.

### Level 4: Career English

Self-introduction, interview answers, resume explanation, group discussion, workplace conversation, email-to-speech practice, customer-service scenarios, and sales pitches.

### Level 5: Advanced spoken English

Debates, presentations, negotiation, client calls, leadership communication, conflict handling, and accent clarity.

## 10. Technical architecture

### Mobile app

Use Flutter or React Native for fast Android-first delivery and future iOS support. Android should be prioritized because it fits the primary Indian mass-market segment.

### Backend

Use a modular backend with these services:

1. Auth and user profile service.
2. Course and lesson service.
3. Voice session orchestration service.
4. AI provider adapter service.
5. Report generation service.
6. Progress analytics service.
7. Payment and subscription service.
8. Notification service.
9. Admin and B2B dashboard service.

### AI provider layer

Separate the app from direct model calls through an AI adapter. The adapter should support:

1. Real-time voice sessions.
2. Transcript extraction.
3. Correction event generation.
4. Structured report generation.
5. Lesson personalization.
6. Safety filtering and teacher-tone control.

### Data model

Core entities:

1. User
2. LearnerProfile
3. LanguagePreference
4. Course
5. Lesson
6. Session
7. TranscriptTurn
8. Correction
9. PronunciationMetric
10. SessionReport
11. WeeklyReport
12. Subscription
13. Organization
14. Classroom
15. Assignment

## 11. Privacy and safety requirements

1. Ask consent before saving audio recordings.
2. Allow users to delete audio and transcript history.
3. Store only the data needed to generate reports and improve learning.
4. Use age-appropriate flows for minors.
5. Avoid shaming language in corrections.
6. Add abuse, self-harm, harassment, and unsafe-content handling.
7. Do not use learner recordings for unrelated purposes without explicit consent.

## 12. Monetization plan

### Consumer pricing

1. Free tier: 5 minutes per day, limited report, basic beginner lessons.
2. Starter tier: about ₹99 per month for short daily practice and basic reports.
3. Core tier: about ₹199-299 per month for full 30-minute daily sessions and detailed reports.
4. Career tier: about ₹499 per month for interview simulator, job tracks, advanced reports, and mock tests.

### B2B pricing

1. Per-student monthly plan for colleges and coaching centers.
2. Skill-development cohort pricing for NGOs and CSR programs.
3. Dashboard and reporting add-on for institutions.
4. White-label or co-branded training packages for employability programs.

## 13. Metrics

### Product metrics

1. Daily active users.
2. 7-day retention.
3. 30-day retention.
4. Average speaking minutes per user per day.
5. Session completion rate.
6. Correction repeat-practice completion rate.
7. Subscription conversion rate.
8. Paid retention and churn.

### Learning metrics

1. Speaking time growth.
2. Repeated mistake reduction.
3. Words per minute improvement.
4. Pause reduction.
5. Pronunciation clarity improvement.
6. Level advancement.
7. Interview simulator score improvement.

## 14. Sprint roadmap

Assume two-week sprints with a small team: one product owner, one UX designer, two mobile engineers, two backend engineers, one AI engineer, one QA engineer, and one curriculum/localization specialist.

### Sprint 0: Discovery and foundation

Goals:

1. Validate target users and first languages.
2. Define MVP scope and success metrics.
3. Choose technical stack.
4. Create initial curriculum map.
5. Prototype Gemini voice session feasibility.

Deliverables:

1. Product requirements document.
2. User personas and top use cases.
3. MVP language decision.
4. Course outline for beginner and interview tracks.
5. Technical architecture diagram.
6. AI feasibility prototype.

Exit criteria:

1. Voice latency and transcript quality are acceptable for a demo.
2. Team agrees on MVP scope.
3. First 20 lessons are outlined.

### Sprint 1: App shell and onboarding

Goals:

1. Build the mobile app skeleton.
2. Create onboarding and language selection.
3. Add account creation.
4. Add learner profile setup.

Deliverables:

1. Splash screen, login, signup, language selection, goal selection, and level self-assessment.
2. Backend auth and user profile APIs.
3. Basic analytics events.
4. Design system basics.

Exit criteria:

1. A user can create an account and select language, goal, and current level.
2. Profile data persists in the backend.

### Sprint 2: Course and lesson engine

Goals:

1. Add course browsing and lesson state.
2. Create first beginner lessons.
3. Create first interview lessons.

Deliverables:

1. Course home screen.
2. Lesson detail screen.
3. Course progress model.
4. Admin seed data for 10 beginner lessons and 10 interview lessons.
5. Backend course APIs.

Exit criteria:

1. A user can view courses, start a lesson, and see progress.
2. Curriculum content can be changed without app release.

### Sprint 3: Voice session MVP

Goals:

1. Implement real-time AI voice practice.
2. Capture transcript turns.
3. Add simple correction prompts.

Deliverables:

1. Voice session screen with microphone controls.
2. AI voice connection through the provider adapter.
3. Transcript storage.
4. Session timer and progress indicator.
5. Basic interruption and reconnect handling.

Exit criteria:

1. A learner can complete a 10-minute practice conversation.
2. Transcript turns are stored reliably.
3. AI uses the selected learner-assistance language when explaining.

### Sprint 4: Live corrections

Goals:

1. Add structured correction logic.
2. Support gentle, real-time, and fluency modes.
3. Save corrections for later reports.

Deliverables:

1. Correction prompt templates.
2. Correction event schema.
3. In-session correction UI.
4. Repeat-after-correction flow.
5. Mistake notebook data model.

Exit criteria:

1. Corrections include original sentence, corrected sentence, explanation, mistake type, and practice sentence.
2. The learner can repeat corrected sentences.
3. Beginner sessions avoid excessive interruptions.

### Sprint 5: Daily report

Goals:

1. Generate detailed post-session reports.
2. Add scoring rubric.
3. Show homework.

Deliverables:

1. Session report generator.
2. Report screen.
3. Scores for grammar, vocabulary, pronunciation, fluency, confidence, and listening comprehension.
4. Mistake list and homework list.
5. Report history screen.

Exit criteria:

1. Every completed session produces a report within an acceptable time.
2. Report recommendations are specific and actionable.
3. Reports are stored and can be reopened.

### Sprint 6: 30-minute session flow and retention

Goals:

1. Expand sessions from short MVP to full 30-minute structure.
2. Add streaks, reminders, and weekly progress.
3. Improve session pacing.

Deliverables:

1. Full session state machine: warm-up, lesson, guided practice, role play, fluency challenge, summary.
2. Daily streaks.
3. Push or WhatsApp-style reminder integration plan.
4. Weekly progress report.
5. Session resume support.

Exit criteria:

1. A user can complete a full 30-minute session.
2. Weekly report shows progress across multiple sessions.
3. Reminder flow increases return usage in pilot testing.

### Sprint 7: Localization and Indian scenarios

Goals:

1. Localize the app for MVP languages.
2. Add India-specific role plays.
3. Improve code-mixed language handling.

Deliverables:

1. UI copy in five MVP languages.
2. Correction explanation templates for each language.
3. Scenario library: interview, college, customer support, sales, travel, shopping, office.
4. QA test set for Indian accents and code-mixed inputs.

Exit criteria:

1. Learners can use onboarding, lessons, corrections, and reports in their selected support language.
2. AI handles common code-mixed utterances gracefully.

### Sprint 8: Payments and subscriptions

Goals:

1. Add paid plans.
2. Add usage limits.
3. Add plan upgrade prompts.

Deliverables:

1. Subscription plan screens.
2. Payment integration.
3. Entitlement service.
4. Daily minute limits by plan.
5. Billing event tracking.

Exit criteria:

1. Free and paid users receive correct feature access.
2. Payment success and failure states work.
3. The system prevents uncontrolled AI cost overruns.

### Sprint 9: Quality, cost, and safety hardening

Goals:

1. Improve reliability and latency.
2. Reduce AI cost per session.
3. Add privacy and safety controls.

Deliverables:

1. Latency dashboard.
2. AI cost dashboard.
3. Audio retention settings.
4. Delete-my-data flow.
5. Safety prompt and moderation handling.
6. Load testing for expected pilot traffic.

Exit criteria:

1. Session reliability meets pilot requirements.
2. Cost per completed 30-minute session is understood and controlled.
3. Privacy controls are user-visible and tested.

### Sprint 10: Closed beta

Goals:

1. Launch to 100-300 learners.
2. Collect qualitative and quantitative feedback.
3. Fix the highest-impact issues.

Deliverables:

1. Beta cohort onboarding.
2. Feedback collection flow.
3. Bug triage process.
4. Analytics review dashboard.
5. Learning-outcome interview scripts.

Exit criteria:

1. At least 100 users complete one session.
2. At least 30 users complete three or more sessions.
3. Main blockers for retention and voice quality are identified.

### Sprint 11: Public MVP launch

Goals:

1. Launch Android MVP.
2. Support subscriptions.
3. Track retention and conversion.

Deliverables:

1. App store listing.
2. Production monitoring.
3. Support workflow.
4. Referral or invite flow.
5. Launch marketing landing page.

Exit criteria:

1. Production app is live.
2. Payment and usage limits are stable.
3. Core dashboards show product, learning, cost, and reliability metrics.

### Sprint 12: B2B pilot

Goals:

1. Prepare institutional dashboard.
2. Pilot with colleges, coaching centers, or NGOs.
3. Build cohort reporting.

Deliverables:

1. Organization admin dashboard.
2. Cohort management.
3. Student progress reports.
4. Attendance and speaking-minutes tracking.
5. Exportable weekly reports.

Exit criteria:

1. One institution can onboard a cohort.
2. Admin can see attendance, speaking minutes, report scores, and weak areas.
3. B2B pilot produces sales feedback.

## 15. Team plan

### Minimum MVP team

1. Founder/product owner.
2. Mobile engineer.
3. Backend engineer.
4. AI engineer.
5. Curriculum/localization specialist.
6. Part-time designer.
7. Part-time QA tester.

### Stronger team

1. Product manager.
2. UX/UI designer.
3. Two mobile engineers.
4. Two backend engineers.
5. AI/ML engineer.
6. DevOps engineer.
7. QA engineer.
8. Curriculum lead.
9. Localization reviewers.
10. Growth marketer.

## 16. Build-versus-buy decisions

Build:

1. Course engine.
2. AI tutor personality and correction rules.
3. Report engine.
4. Progress analytics.
5. Indian scenario curriculum.
6. B2B dashboard.

Buy or integrate:

1. Auth provider if speed matters.
2. Payment gateway.
3. Push notification provider.
4. Analytics platform.
5. Crash reporting.
6. Cloud storage.
7. Optional speech analytics provider if Gemini voice metrics are insufficient.

## 17. Key risks and mitigations

### Risk: Voice latency is too high

Mitigation: Use streaming voice models, keep prompts compact, pre-load lesson context, measure time to first audio, and keep a fallback flow where AI responds in text plus TTS if needed.

### Risk: AI costs are too high

Mitigation: Add free-tier limits, use shorter warm-up sessions for free users, summarize transcripts incrementally, cache lesson content, use cheaper models for reports where possible, and monitor cost per completed session.

### Risk: Speech recognition struggles with Indian accents

Mitigation: Test with real users across regions, collect consented audio samples, compare transcripts to user intent, tune prompts for code-mixed speech, and avoid penalizing accent when the speech is understandable.

### Risk: Users stop after a few days

Mitigation: Add streaks, visible progress, friendly reminders, short wins, career-oriented milestones, and weekly reports that show real improvement.

### Risk: The app becomes a generic chatbot

Mitigation: Keep course progression, lesson goals, reports, homework, and level advancement at the center of the product.

## 18. First 90-day execution plan

### Days 1-15

1. Interview 30 learners and 5 training institutes.
2. Choose initial languages.
3. Validate voice model latency.
4. Create course outline.
5. Build clickable prototype.

### Days 16-30

1. Build onboarding, profile, and course home.
2. Build first voice session prototype.
3. Create 20 lessons.
4. Test with 20 users.

### Days 31-45

1. Add correction modes.
2. Add transcript and correction storage.
3. Add report generator.
4. Test with 50 users.

### Days 46-60

1. Add full 30-minute session structure.
2. Add weekly report.
3. Add localization for five languages.
4. Improve latency and reliability.

### Days 61-75

1. Add subscriptions and usage limits.
2. Add privacy controls.
3. Add analytics dashboards.
4. Start closed beta with 100-300 users.

### Days 76-90

1. Fix beta issues.
2. Launch public MVP.
3. Start B2B pilot conversations.
4. Track retention, conversion, cost, and learning improvement.

## 19. Recommended first release promise

Speak English for 30 minutes every day with an AI teacher that understands your mother tongue, corrects your mistakes, and gives you a detailed progress report after every class.
