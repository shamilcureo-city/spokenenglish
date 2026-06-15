# Speakwell — the whole plan

*A voice-first spoken-English course for India that you finish by talking — and the playbook to
take it to millions.* This is the single source of truth; it folds the product, the build roadmap,
and the growth engine into one sequence. Growth detail lives in **[GROWTH.md](GROWTH.md)**.

---

## 1. What it is

**One-line promise (lead with emotion, never grammar):**
> **"Stop freezing. Speak English without fear — and we'll explain every mistake in YOUR language."**

**The user (first, and only first):** the **Tier-2/3 fresher / job-seeker** who can read & write
English but **freezes when speaking**. Start in **one language — Hindi** — then Telugu/Tamil.

**The moat** (the intersection no incumbent owns): human-like **unscripted AI conversation** +
**mother-tongue feedback during live speech** + a **5-min/day habit** + **affordable**. AI = zero
marginal human cost = the only structural way to reach millions where human-tutor apps physically
can't.

**The aha (design everything backward from this, hit it in <90s, no signup):** first unscripted
5-minute talk → you freeze → the tutor fixes it *in Hindi* → you try again → **you don't freeze.**

---

## 2. Where we are (built & verified)

- ✅ **Live voice tutor** — Gemini Live, upgraded to the production "Interloop" spec: **echo gate**
  (no more hearing yourself / self-interrupt), **AI greets first**, `realtime_input.audio` format,
  **800ms VAD**, verbatim transcripts, session resumption, `gemini-3.1-flash-live-preview` (2.5
  fallback). Verified live; 3 real bugs caught by adversarial review & fixed.
- ✅ **The course** — pure-data curriculum: 3 levels · 16 units · ~37 lessons. Each lesson is
  **Learn → Speak → Feedback**.
- ✅ **Placement** (2-min spoken check), **mother-tongue recap**, **daily free-talk**, basic
  **progress**, **local-first** store (no accounts yet).
- ✅ Runs with no Docker (`npm run dev:api` + `npm run dev`); 32 core tests; both workspaces typecheck.

**The gap to "good + millions":** completing a lesson is unrewarding (no stars/XP/celebration);
there's no share/virality loop; **the live-voice COGS is unmetered** (existential at scale); no
accounts/native app (which gates Play-Store growth); content is thin in places.

---

## 3. The strategy in one picture

```
  CREATOR SPARK ─► first 5-min talk ─► a WIN ─► one-tap WhatsApp share ─┐
  (vernacular,     (no signup, fix     (streak / before→after clip /     │
   Tier-2/3,        in Hindi)           "I can speak now" card)          │
   barter)                                     │                         │
        ▲                                      ▼                         │
        │                            "practise WITH me" invite ──────────┘
        └──────────────  deep link back into the PWA  ───────────────────┘
```

Two non-negotiable truths this is built on:
1. **"Millions of users" ≠ "a business."** Stimuler (near-identical AI app): **4M downloads, ~45k
   payers (1.1%)**. Hello English: **50M users → ₹1–10 Cr**. Chase **free users** with the growth
   engine; chase money with a **thin paid slice + B2B2C**.
2. **Live voice is a COGS bomb.** ₹3.2/min × 5 min/day = **~₹480/mo per free user** vs a ₹100/mo
   price ceiling. **Uncapped viral growth bankrupts you.** Margin engineering is P0.

---

## 4. The integrated roadmap (build × growth) — the heart

Build phases are gated by **retention/virality metrics**, not by feature count. Each phase ships
product *and* turns on a matching growth motion. **A phase's gate must pass before scaling spend.**

### Phase 0 — Foundation ✅ (done)
The live voice tutor + the course + placement + local-first app.

### Phase 1 — Make it RETAIN & make it CHEAP *(the gate to all growth)*
*Goal: D7 ≥ 12–15% on one Hindi cohort, and free-user COGS in single-digit ₹/mo.*
**Build:**
- **Async-cheap free tier + COGS controls** *(P0, ship WITH live voice)* — free default = record →
  cheap STT → Flash-Lite **mother-tongue text feedback** → TTS; **3–5 live realtime min/day cap**;
  **idle-timeout** (stop billing dead air); **per-session caps**; **context caching** for the fixed
  persona/lesson scaffold. Reserve native-audio Live for high-intent/paying users.
- **Earned lessons** (E2): stars from the recap + "phrases you used" + XP + redo-to-improve.
- **Humane streaks + daily goal** (E3): 5-min goal, free weekly **streak-freeze + repair**, warm
  vernacular reminders, **no shaming**, small 20–30 leagues.
- **<90s no-signup onboarding** to the aha; mother-tongue from step one.
- **Analytics instrumentation**: install→activation (3 sessions/7d), D1/D7/D30, K per cohort.
**Growth motion:** founder posts **daily Hindi "Speak English without fear" Shorts**; onboard the
first users by hand. **Scale nothing yet.**
**Gate → Phase 2:** D7 ≥ 12–15%.

### Phase 2 — Make it SPREAD *(the loop)*
*Goal: loop K ≥ 0.4 and ≥2 replicable creator "hits".*
**Build:**
- **The shareable win**: auto **result card** + **30-sec before→after clip** (watermark + deep
  link) at each milestone. (E6's "hear yourself" reframed as the virality artifact.)
- **One-tap WhatsApp share** (pre-filled Hindi) + the **"practise WITH me" invite** (both unlock
  Pro days — zero marginal cost; gated on first-session completion, fraud <2%).
- **Coach character + celebrations** (E4): a named tutor + confetti at unit/level-up — delight that
  *fuels* sharing.
- **Personalization** (E5): interests/goals → flavored scenarios.
**Growth motion:** seed **30–50 nano/micro Hindi creators** (barter/affiliate; brief =
freeze→talk→link); pilot **3–5 B2B2C deals** (one IELTS centre, one Tier-2 placement cell, one BPO);
₹500–1,000/day UAC test *only* to benchmark cost-per-activated-user.
**Gate → Phase 3:** K ≥ 0.4 + creator hits replicating.

### Phase 3 — SCALE & MONETIZE
*Goal: LTV/CAC > 3:1, D30 > 10%, B2B2C ARR proven.*
**Build:**
- **Native Android app + accounts (Supabase email auth + cloud sync)** (E8) — **unlocks the
  Play-Store ASO engine** (gated until now). Lightweight (runs on 3GB-RAM 4G phones).
- **Complete the content** (E7): all 16 units, scenario variants per lesson, pronunciation drills.
- **Pro tier** (annual hero **₹999–1,499/yr** + micro-packs ₹19/30min) + **paywall/metering** wired
  to the COGS caps. Annual prepaid via one-time UPI (not AutoPay).
**Growth motion:** localized **Play listings** per language, push 4.5★; expand to **Telugu/Tamil**;
scale the **college/placement-cell** motion to 50–100 deals.
**Gate → Phase 4:** ASO live + monetization proven.

### Phase 4 — POUR FUEL
More languages; 100–200 college deals; **employer/BPO** line; **govt skilling empanelment**
(PMKVY/NSDC) as *funded acquisition*; reminders/notifications; deploy & scale infra; only now
consider **telco/OEM bundles**.

---

## 5. The growth engine (condensed — full detail in GROWTH.md)

**Channels, strict priority:**
1. **Vernacular Tier-2/3 creators** (HIGH) — the demo is *filmable*; **barter = ₹0 cash**; effective
   CPI ₹3–15 on a hit. The cold-start spark.
2. **WhatsApp share/referral loop** (HIGH) — status + access, not cash (fraud); realistic **K 0.5–0.7**
   → ~25–40% of signups free. The amplifier.
3. **Play Store ASO** (HIGH, **gated on native app**) — how Hello English hit #1 free; ₹0 marginal.
- **Never fund growth with paid ads** (Byju's: CAC ~80% of revenue → collapse). **Android-only.**
  No celebrity spend. No telco/govt/field-agents pre-traction.

**Activation & retention is the real killer** (edtech D30 ~2–7%): the <90s aha, humane streaks, the
mother-tongue feedback. **No channel scales until D7 ≥ 12–15%.**

---

## 6. Monetization & the margin game

- **Free** = async-cheap + 3–5 live min/day + rewarded-video top-ups.
- **Pro** = annual **₹999–1,499/yr** ("₹3/day, less than a chai") / ₹149–249/mo fallback; deep
  feedback, generous live minutes, mock interviews, certificate. **Micro-packs** (₹19/30min) for the
  ~97% who refuse subscriptions.
- **Model on 1–3% conversion, not 8%.** Price ceiling ≈ ₹100/mo.
- **B2B2C = the revenue that scales WITH growth** (institutional CAC ₹10–50/student vs ₹150–600 D2C):
  **colleges/placement cells first** (200 colleges ≈ ₹8 Cr ARR), then **employers/BPOs**, then **govt
  skilling** as funded distribution (ring-fenced, never cash-flow runway). The Physics-Wallah model:
  near-zero-CAC organic → small high-ARPU D2C core → majority of revenue from B2B2C.

---

## 7. The numbers (instrument from day one — downloads LIE)

| Metric | Target | Stop-and-fix |
|---|---|---|
| Install → activation (3 sessions/7d) | ≥ 25–30% | < 20% |
| **D1 / D7 / D30** | 35–45% / ~20% / 10–15% | **D7 < 12–15% → freeze all spend** |
| K-factor (per cohort) | 0.5–0.7 | < 0.3 → fix share UX/timing |
| Free→paid conversion | 1–3% | model on this |
| Per-user AI-minute COGS (free) | single-digit ₹/mo | rising → tighten caps/async |
| LTV / CAC · payback | > 3:1 · < 12 mo | < 3:1 → shift weight to B2B2C |

**Top 3 risks:** (1) AI-voice COGS bankrupts you on virality → async-cheap-by-default + caps (P0).
(2) India doesn't pay (~1.1%) → annual-prepaid + micro-packs + B2B2C, underwrite on 1–3%. (3)
Leaky-bucket retention → hard gate: no scaling until D7 ≥ 12–15%.

---

## 8. First 90 days (lean solo founder)

- **Weeks 1–3 — instrument & build the loop:** local-first analytics; the two-button pre-filled-Hindi
  **WhatsApp share** + **result card** + **before→after clip**; <90s aha onboarding; **humane
  streaks** + a 20–30 league; lock the low-end release gate (3GB-RAM 4G phone; voice degrades to
  push-to-talk).
- **Weeks 4–6 — re-architect economics:** ship the **async (STT→Flash-Lite→TTS) free pipeline** +
  3–5 live-min/day cap + idle-timeout + per-session caps + context caching; rewarded-minutes. Model
  COGS/session *before* promoting anything.
- **Weeks 5–10 — spark + amplifier:** seed 30–50 nano Hindi creators (barter); founder daily Hindi
  Shorts; turn on the two-sided **"practise-with-me"** invite; ₹500–1,000/day UAC test purely to
  benchmark.
- **Weeks 8–12 — open B2B2C + decide native:** close 3–5 pilots; if **D7 ≥ 12–15% AND K ≥ 0.4**,
  start the **native Android app + accounts** (the gate to ASO). If not, keep fixing activation.

---

## 9. The path in one sentence

Nail the 5-min daily-habit + mother-tongue aha → **keep AI-voice COGS cheap-by-default** → light it
with vernacular Tier-2/3 creators (barter) → amplify with a WhatsApp clip/"practise-with-me" loop →
unlock free organic ASO once the native app ships → monetize *later* via a cheap annual Pro + B2B2C
— **and never, ever fund growth with paid acquisition.**

---

## 10. Open decisions
- **Brand/name** (working: *Speakwell*) and the Play-Store listing identity.
- **When to build native** — gated on Phase-1 retention; PWA until then.
- **Which B2B2C lane to open first** (recommend Tier-2 college placement cells).
- **Funding** — this plan is bootstrapped/lean; capital accelerates creators + B2B2C sales, *not*
  paid ads.
