# Speakwell Redesign Blueprint
### A competitor-grounded rebuild for a voice-first, India-first, mother-tongue, affordable English coach

> Built from a teardown of **Speak, Duolingo, ELSA Speak, Babbel, Busuu**, the emerging AI-tutor
> apps (**Loora, TalkPal, Praktika, Gliglish**), and India-market players (**Hello English, EngVarta,
> SpeakX, MySivi**), plus their App Store / Play / Reddit user sentiment.

---

## 1. Honest diagnosis — why today's Speakwell feels weak

The live conversation with Sunny is genuinely good. Everything *around* it is a generic edtech shell.

- **The course is a textbook table-of-contents, not a path.** "3 levels → 16 units → 64 lessons, sequential unlock" is exactly the structure Duolingo *abandoned* — a flat menu of folders freezes users. The leaders converged on either a single winding visual path with one next action (Duolingo) or an outcome-framed syllabus ("Job Interview English", not "Unit 7" — Babbel). Speakwell has neither.
- **The Home screen is a dashboard, not a coach.** Nine competing CTAs make the user the product manager. For a *voice-first* app, the first action on Home is to read and tap — not to speak. Speak/ELSA make the first action *talking*.
- **Feedback is a report card, not a signature moment.** It's missing the one micro-interaction every voice leader is built around: the learner's own sentence rendered back with **word/phoneme-level color** (ELSA's traffic-light, Speak's green-words). Flat dimension bars never show *which syllable* failed.
- **No memory across sessions — the biggest open gap in the market.** Speak's stickiest mechanic is per-concept **Mastery from real spoken usage, weakest-first**, plus re-surfacing *your* past errors. Speakwell tracks lesson completion, not recurring mistakes. Cheapest premium-feeling moat available, left on the floor.
- **The UI is "minimal" in the forgettable way.** Dark-emerald-on-near-black is the exact "AI-app blandness" the benchmark warns against — restraint without craft. And Sunny has a *voice* but no *face/presence*.
- **Gamification is table-stakes, not a weapon.** Voice makes celebration personal — Sunny could *voice* every milestone. We ship the mechanics but not the voice-celebration edge only we can.

**Net: the conversation is a 9/10 wrapped in a 4/10 product.** The rebuild = re-center the whole app on the voice loop and steal the three proven hooks it lacks (mastery memory, traffic-light pronunciation, one-tap next action).

---

## 2. The winning patterns we're missing (ranked by leverage)

| # | Pattern | Who / why | Our move |
|---|---|---|---|
| 1 | **Concept-Mastery + Smart Review** scored from real spoken usage, weakest-first | Speak (its stickiest mechanic); no AI competitor does cross-session memory | Track mastery per spoken concept; Sunny narrates it. The retention engine. |
| 2 | **Traffic-light speech replay** at word+phoneme level, tap-to-fix | ELSA's crown jewel; Speak's green-words | The signature moment of Feedback, replacing flat bars. India-calibrated. |
| 3 | **One obvious next action on open** | Duolingo (choice froze users) | Home = Sunny + one big "Start today's 5 min". Keep a small escape hatch. |
| 4 | **Mother-tongue scaffolding as the wedge** — code-switch when stuck | Babbel's #1-praised trait; no global voice app nails it | Sunny explains/encourages in L1, weans off. UI stays English. |
| 5 | **Specific end-of-turn recap** (3 nailed, 2 to fix) | Busuu timing; Praktika/TalkPal give none | Sunny's *voiced* recap + traffic-light replay. |
| 6 | **India-calibrated pronunciation scoring** ("understood", not "American-native") | Fixes Speak's leniency AND ELSA's over-strictness | The differentiator, per mother tongue. |
| 7 | **Speak-first daily loop** — first action is talking | Speak, ELSA | Drop into voice fast; Speak comes earlier. |
| 8 | **India scenario roleplay** (interview/manager/customer/IELTS) with 3 tasks + setting | Speak's 3-task structure; Loora | Reskin free-talk into structured scenarios. Sunny reacts, doesn't interrogate. |
| 9 | **Voiced, non-punitive gamification** | Duolingo mechanics, minus hearts/guilt | Sunny voices milestones; friend-streaks; no cutthroat leagues. |
| 10 | **Transparent ₹99–₹299/mo billing**, one-tap cancel | Inverts the #1 churn cluster across all rivals; SpeakX proves the price | Trust as a durable wedge. |

**Two India engineering moats:** low-end-Android + flaky-network resilience; Sunny as a lightweight illustrated/audio presence (never an uncanny un-disableable 3D avatar).

---

## 3. Proposed new structure (IA)

**4 bottom tabs**, with a persistent top strip (streak flame · daily-goal ring · level). Currency = **sentences spoken / speaking-minutes**.

```
[ Today ]   [ Path ]   [ Review ]   [ You ]
```

- **Today** (replaces the 9-CTA home): Sunny's face + a spoken+text greeting in the mother tongue, ONE pulsing "Start today's session" node (previews warm-up · task · free chat), one small "practise something else" escape hatch.
- **Path** (replaces "Browse the course"): a winding visual path **organized by real-world outcome** (Introduce Yourself · Phone & WhatsApp · Talking to Your Manager · Customer Conversations · Job Interview · IELTS/Visa · College/Viva), with Review / Scenario / "Made-For-You" special nodes interspersed.
- **Review** (the moat): pick a 3/7/12-min **voice** block; Sunny serves weakest concepts first from real usage; "your recurring mistakes / your sounds over time" in the mother tongue.
- **You**: the **5-skill speaking radar** (Pronunciation, Fluency, Intonation, Vocabulary, Confidence), streak history, a **speaking certificate** per level (employability proof), friend-streaks/invite, settings (transparent billing, mother-tongue, **Sunny audio-only toggle**).

---

## 4. The new daily loop (voice-first, 3–5 min)

```
1. OPEN     → Sunny greets by name in mother tongue, names today's theme, one START node.
2. WARM-UP  → "Say these 3 from last time." Weakest concepts; live green-word highlighting.
3. GUIDED   → Sunny models a phrase; user repeats aloud; traffic-light replay; tap red → fix
              (native audio + slow + A/B). Unlimited retries (NO hearts/energy).
4. FREE CHAT→ India scenario, up to 3 optional tasks. Sunny reacts naturally; corrections held
              to end-of-turn. "slow down / repeat / say it in my language" buttons.
5. RECAP    → Sunny SPEAKS "3 nailed, 2 to fix" + traffic-light replay + radar nudge.
              Celebration scales with milestone (Sunny's voiced reaction). Share-to-WhatsApp.
```

**First run (<60s to first spoken win):** mother-tongue → one "why" question → 60-sec spoken diagnostic (encouraging score + L1 sounds to watch + tiny plan + level band) → straight into lesson 1. **Account wall + notifications come AFTER the first spoken win.**

---

## 5. Course architecture & redesigned lesson loop

- **3 plain levels** (Beginner / Building / Confident), CEFR-mapped internally, labelled by outcome.
- **Units = real-world goals** (India-relevant). Each unit = 4–6 lessons + 1 Review node + 1 Scenario node.
- **Mastery, not completion, drives unlock**; content stays **generative at higher levels** (Sunny's adaptive conversation) to dodge the intermediate plateau — the #1 churn driver across Speak/Babbel/Busuu.

**Redesigned lesson loop** (replaces Learn → Speak → Feedback):
```
LEARN (30–45s) → 3–5 phrases with the mother-tongue "why"; repeat-aloud required here.
DRILL          → say sentences; traffic-light word/phoneme feedback; tap-to-fix (IPA optional).
SPEAK          → live scenario with Sunny (the existing strength) + 3 tasks + a place.
FEEDBACK       → Sunny's voiced recap + traffic-light replay + radar nudge + 1 tip + retry + win card.
                 Mistakes feed the Mastery engine → may auto-generate a "Made-For-You" node.
```
**Honesty rule:** strict-but-kind, India-calibrated. Win-state = "clearly understood," not "American-native."

---

## 6. UI / visual direction

Beat ELSA/Babbel's *forgettable-plain* and Duolingo's *childish-candy* with a third thing: **warm, confident, voice-as-the-hero.**

- **Layout:** big tappable nodes, oversized headlines, generous whitespace; every screen has a clear voice affordance as its visual center. The **animated voice waveform / listening state is a signature element** — no competitor owns it.
- **Color & type:** drop dark-emerald-on-black and the generic purple-gradient look. Move to a **warm, India-resonant palette** (saffron/marigold or warm coral on warm neutrals). Green/yellow/red reserved strictly for the traffic-light system. Rounded approachable display type; **Devanagari/Tamil/Telugu render first-class.**
- **Sunny as the brand signature:** a warm, expressive **2D illustrated character** that reacts in real time to your speaking. **No uncanny 3D**; **audio-only toggle** for eyes-free practice.
- **Motion & celebration:** high-craft micro-interactions; satisfying success tones + haptics; **celebration scales with achievement** and is *voiced* by Sunny.
- **Progress:** the 5-skill radar as the hero progress object + "your sounds over time" chart.

---

## 7. Keep / Change / Add / Cut (summary)

- **KEEP:** Gemini Live conversation with Sunny (the 9/10 asset); mother-tongue feedback (deepen → core wedge); streak/XP (reframe to speaking-minutes, voice the milestones); WhatsApp share/invite; React PWA local-first (harden for India).
- **CHANGE:** gut the 9-CTA Home → one Sunny-led node; re-architect the course into an outcome-labelled Path; speak-first lesson loop; Feedback → traffic-light replay; warm visual identity; onboarding → <60s to first spoken win.
- **ADD:** traffic-light phoneme scoring (India-calibrated); Smart Review tab w/ concept-mastery + cross-session error memory; "Made-For-You" remediation; India scenario roleplay; 5-skill radar + speaking certificate; transparent ₹99–₹299/mo billing; audio-only Sunny.
- **CUT:** abstract grammar units / generic phrases; hearts/lives/energy (never add — toxic for shy speakers); cutthroat global leaderboards.

---

## 8. Phased build plan (each phase ships something testable)

- **Phase 0 — Re-center on the voice loop** *(weeks, mostly reuse).* Gut Home → single "Start today's session" node + escape hatch; wire the new daily loop over the *existing* Gemini Live engine; reframe currency; move invite to a You tab. → *Does single-tap-to-speak lift completion & time-to-first-speech?*
- **Phase 1 — The signature feedback moment** *(new build).* Traffic-light word/phoneme replay + tap-to-fix, India-calibrated; live green-word drills. Replaces flat bars. → *Does it lift "this app heard me" + retry + D1?*
- **Phase 2 — Memory: the retention moat** *(new build, highest long-term leverage).* Concept-Mastery engine (needs accounts — introduce deferred signup here); Smart Review tab; cross-session error re-surfacing. → *Does weakest-first review + visible improvement lift W1/W4?*
- **Phase 3 — New Path + India scenarios** *(rebuild + content).* Re-architect the 64 lessons into the outcome-labelled mastery-gated Path; ship scenario roleplay; Made-For-You nodes. → *Does it cut mid-course drop-off?*
- **Phase 4 — Visual identity + delight** *(design + build).* Warm palette, expressive Sunny, voice-waveform hero, first-class scripts, voiced celebrations, radar, Wrapped/certificate cards. → *Does it lift WhatsApp share rate + brand recall?*
- **Phase 5 — Trust & resilience** *(India moat, parallelizable).* Transparent billing + one-tap cancel; offline + low-end-Android + graceful mic. → *Conversion at India prices; churn vs. billing complaints.*

**Ruthless priority:** 0 → 1 → 2 are non-negotiable; 3–5 compound the wedge.

---

**Thesis:** Speakwell already has the hardest thing — a real-time voice coach. The rebuild is to stop hiding it behind a generic dashboard and a report-card UI: re-center on a speak-first loop, add the two hooks every voice leader proves (ELSA's traffic-light replay + Speak's mastery memory), label the course by Indian real-world outcomes (Babbel), and make Sunny a warm, voiced, India-tuned presence that celebrates without shaming (the anti-Duolingo) — at a transparent ₹99–₹299/mo no incumbent will match.
