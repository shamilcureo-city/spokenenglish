import {
  courseCatalog,
  getLessonById,
  getLessonTotalMinutes,
  learnerGoals,
  supportLanguages,
} from './domain/course.js';
import {
  calculateStreak,
  createSessionRuntime,
  createTurn,
  getNextPhase,
  getPhaseProgress,
  getSessionElapsedMinutes,
  shouldResumeSession,
} from './domain/session.js';
import {
  getCodeMixedExample,
  getLanguageProfile,
  getLocalizedCopy,
  getLocalizedScenarioPrompt,
  scenarioLibrary,
} from './domain/localization.js';
import {
  applyRetentionPolicy,
  createQualityEvent,
  estimateAiCost,
  moderateLearnerText,
  summarizeQualityEvents,
} from './domain/quality.js';
import { defaultReminder, getReminderMessage, reminderOptions } from './domain/retention.js';
import { createNotebookEntry, correctionModes, practiceNotebookEntry, summarizeMistakeNotebook } from './domain/correction.js';
import { createSavedReport, generateSessionReport, generateWeeklyProgress } from './domain/report.js';
import { demoCohort } from './domain/organization.js';
import {
  addUsageMinutes,
  canUseMinutes,
  completeCheckout,
  getPlanByName,
  getRemainingMinutes,
  normalizeUsageForToday,
  subscriptionPlans,
} from './domain/subscription.js';
import { createTutorSystemPrompt, getMockTutorResponse } from './services/aiTutor.js';
import { clearAppState, defaultProfile, loadAppState, saveAppState } from './services/storage.js';
import { createBrowserSpeechRecognizer, createVoiceSessionStatus, speakText } from './services/voiceSession.js';

const saved = loadAppState();
const initialLesson = getLessonById(saved.activeLessonId);

const state = {
  activeTab: saved.activeTab ?? 'learn',
  profile: { ...defaultProfile, ...(saved.profile ?? {}) },
  activeLessonId: initialLesson.id,
  currentPhase: saved.currentPhase ?? initialLesson.steps[0].phase,
  learnerInput: saved.learnerInput ?? 'I am completed my degree and my strength is hard work',
  transcript: saved.transcript ?? [
    createTurn('ai', initialLesson.steps[0].phase, 'Namaste! I am SpeakSaathi. Today we will practice your English speaking with gentle corrections.'),
  ],
  corrections: saved.corrections ?? [],
  correctionMode: saved.correctionMode ?? 'gentle',
  mistakeNotebook: saved.mistakeNotebook ?? [],
  reports: saved.reports ?? [],
  progress: saved.progress ?? {},
  privacy: saved.privacy ?? {
    saveAudio: false,
    saveTranscript: true,
    childSafeMode: true,
    retentionDays: 30,
  },
  voice: {
    status: 'idle',
    partialTranscript: '',
    lastError: '',
    capability: createVoiceSessionStatus(),
  },
  sessionRuntime: saved.sessionRuntime ?? null,
  sessionStartedAt: saved.sessionStartedAt ?? null,
  reminder: saved.reminder ?? defaultReminder,
  lastCompletedAt: saved.lastCompletedAt ?? null,
  usage: normalizeUsageForToday(saved.usage),
  billingEvents: saved.billingEvents ?? [],
  upgradePrompt: saved.upgradePrompt ?? '',
  qualityEvents: saved.qualityEvents ?? [],
  safetyEvents: saved.safetyEvents ?? [],
};

const persist = () => saveAppState(state);

const activeLesson = () => getLessonById(state.activeLessonId);
const phaseOrder = () => activeLesson().steps.map((step) => step.phase);

const nextPhase = () => getNextPhase(activeLesson(), state.currentPhase);

const ensureSessionRuntime = () => {
  if (shouldResumeSession(state.sessionRuntime)) return state.sessionRuntime;

  state.sessionRuntime = createSessionRuntime(activeLesson());
  state.sessionStartedAt = state.sessionRuntime.startedAt;
  return state.sessionRuntime;
};

const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}[char]));

const optionList = (items, selected) => items
  .map((item) => `<option ${item === selected ? 'selected' : ''}>${escapeHtml(item)}</option>`)
  .join('');

const buttonTab = (id, label) => `<button class="tab ${state.activeTab === id ? 'active' : ''}" data-tab="${id}">${label}</button>`;

const completionFor = (lessonId) => state.progress[lessonId]?.completedSessions ?? 0;
const notebookSummary = () => summarizeMistakeNotebook(state.mistakeNotebook);
const weeklyProgress = () => generateWeeklyProgress(state.reports);
const sessionProgress = () => getPhaseProgress(activeLesson(), state.currentPhase);
const sessionElapsed = () => getSessionElapsedMinutes(state.sessionRuntime?.startedAt ?? state.sessionStartedAt);
const languageProfile = () => getLanguageProfile(state.profile.supportLanguage);
const activePlan = () => getPlanByName(state.profile.plan);
const remainingMinutes = () => getRemainingMinutes(state.profile.plan, state.usage);
const hasEnoughMinutesForSession = () => canUseMinutes(state.profile.plan, state.usage, getLessonTotalMinutes(activeLesson()));
const qualitySummary = () => summarizeQualityEvents(state.qualityEvents);

let activeRecognizer = null;

const voiceStatusLabel = () => {
  if (!state.voice.capability.speechRecognition) return 'Typed fallback';
  if (state.voice.status === 'listening') return 'Listening...';
  if (state.voice.status.startsWith('error:')) return 'Voice error';
  return 'Voice ready';
};

const renderHero = () => `
  <section class="hero panel">
    <div>
      <p class="eyebrow">✦ AI spoken-English coach for India</p>
      <h1>Buildable MVP: onboarding, courses, AI-style correction, reports, plans, privacy, and B2B pilot views.</h1>
      <p class="localized-promise">${escapeHtml(getLocalizedCopy('appPromise', state.profile.supportLanguage))}</p>
      <p class="hero-copy">
        This version moves beyond the static demo and implements foundation slices across the remaining sprint roadmap.
        Browser speech capture is now wired for the voice-session sprint; Gemini Live, backend persistence, payments, and production analytics still need service integration.
      </p>
      <div class="hero-actions">
        <button id="try-correction">🎙 Try correction</button>
        <button class="secondary" id="start-session">▶ Start / resume session</button>
        <button class="secondary" id="start-voice">🔴 Start voice</button>
        <button class="secondary" id="finish-session">📈 Save report</button>
      </div>
    </div>
    <div class="metric-card">
      <strong>${getLessonTotalMinutes(activeLesson())} min</strong>
      <span>Structured daily speaking session</span>
    </div>
  </section>
`;

const renderTabs = () => `
  <nav class="tabs panel">
    ${buttonTab('learn', 'Learn')}
    ${buttonTab('session', 'Session')}
    ${buttonTab('reports', 'Reports')}
    ${buttonTab('plans', 'Plans')}
    ${buttonTab('privacy', 'Privacy')}
    ${buttonTab('b2b', 'B2B')}
  </nav>
`;

const renderLearnTab = () => `
  <section class="grid two-columns">
    <div class="panel stack">
      <div class="section-title"><span>🌐</span><div><h2>Onboarding profile</h2><p>Local prototype persistence for Sprint 1 profile setup.</p></div></div>
      <label>Name<input id="profile-name" value="${escapeHtml(state.profile.name)}" /></label>
      <label>Support language<select id="support-language">${optionList(supportLanguages, state.profile.supportLanguage)}</select></label>
      <label>Learning goal<select id="goal">${optionList(learnerGoals, state.profile.goal)}</select></label>
      <label>Current level<select id="level">${optionList(['Starter', 'Beginner', 'Intermediate', 'Career'], state.profile.level)}</select></label>
      <div class="lesson-card"><span>🔥</span><div><h3>${state.profile.streak}-day streak</h3><p>Streak updates once per completed practice day.</p></div></div>
      <div class="lesson-card"><span>⏰</span><div><h3>Daily reminder</h3><p>${escapeHtml(getReminderMessage(state.profile, state.reminder))}</p></div></div>
      <label class="check-row"><input type="checkbox" id="reminder-enabled" ${state.reminder.enabled ? 'checked' : ''}/> Enable daily reminder</label>
      <label>Reminder time<select id="reminder-option">${reminderOptions.map((option) => `<option value="${option.id}" ${option.id === state.reminder.optionId ? 'selected' : ''}>${option.label} (${option.time})</option>`).join('')}</select></label>
      <div class="localization-card">
        <span>${escapeHtml(languageProfile().nativeName)}</span>
        <h3>${escapeHtml(languageProfile().greeting)} — local language support</h3>
        <p>${escapeHtml(getLocalizedCopy('sessionHint', state.profile.supportLanguage))}</p>
        <em>${escapeHtml(getCodeMixedExample(state.profile.supportLanguage))}</em>
      </div>
    </div>

    <div class="panel stack">
      <div class="section-title"><span>📚</span><div><h2>Course catalog</h2><p>Four seed lessons for Sprint 2 course browsing.</p></div></div>
      <div class="course-grid">
        ${courseCatalog.map((lesson) => `
          <article class="course-card ${lesson.id === state.activeLessonId ? 'selected' : ''}">
            <span>${lesson.level}</span>
            <h3>${escapeHtml(lesson.title)}</h3>
            <p>${escapeHtml(lesson.scenario)}</p>
            <small>Outcome: ${escapeHtml(lesson.outcome)}</small>
            <button data-lesson="${lesson.id}">${lesson.id === state.activeLessonId ? 'Selected' : 'Start lesson'}</button>
            <em>${completionFor(lesson.id)} completed session(s)</em>
          </article>
        `).join('')}
      </div>
    </div>
  </section>
  <section class="panel stack">
    <div class="section-title"><span>🇮🇳</span><div><h2>India-first scenarios</h2><p>Localized role-play prompts for Sprint 7.</p></div></div>
    <div class="scenario-grid">
      ${scenarioLibrary.map((scenario) => `
        <article class="scenario-card">
          <span>${escapeHtml(scenario.category)}</span>
          <h3>${escapeHtml(scenario.title)}</h3>
          <p>${escapeHtml(getLocalizedScenarioPrompt(scenario, state.profile.supportLanguage))}</p>
          <button data-scenario-prompt="${scenario.id}">Use prompt</button>
        </article>
      `).join('')}
    </div>
  </section>
`;

const renderPhaseList = () => `
  <div class="phase-list">
    ${activeLesson().steps.map((step) => `
      <div class="phase ${step.phase === state.currentPhase ? 'active' : ''}">
        <span>${step.minutes}m</span>
        <div><strong>${escapeHtml(step.phase)}</strong><p>${escapeHtml(step.prompt)}</p></div>
      </div>
    `).join('')}
  </div>
`;

const renderSessionTab = () => {
  const lesson = activeLesson();
  const activeStep = lesson.steps.find((step) => step.phase === state.currentPhase) ?? lesson.steps[0];

  return `
    <section class="grid session-grid">
      <div class="panel stack conversation-panel">
        <div class="section-title"><span>🎙</span><div><h2>${escapeHtml(lesson.title)}</h2><p>${escapeHtml(activeStep.instruction)}</p></div></div>
        <div class="session-dashboard">
          <div><span>Phase</span><strong>${sessionProgress().currentIndex + 1}/${sessionProgress().totalPhases}</strong></div>
          <div><span>Progress</span><strong>${sessionProgress().percent}%</strong></div>
          <div><span>Elapsed</span><strong>${sessionElapsed()}m</strong></div>
          <div><span>Status</span><strong>${state.sessionRuntime?.status ?? 'not started'}</strong></div>
        </div>
        <div class="progress-track"><span style="width: ${sessionProgress().percent}%"></span></div>
        <div class="entitlement-banner ${hasEnoughMinutesForSession() ? '' : 'blocked'}">
          <strong>${escapeHtml(activePlan().name)} plan</strong> • ${remainingMinutes()} of ${activePlan().dailyMinutes} minutes remaining today.
          ${hasEnoughMinutesForSession() ? 'You can start this full session.' : 'Upgrade or choose a shorter practice before starting a full 30-minute session.'}
        </div>
        <div class="localized-tip"><strong>${escapeHtml(languageProfile().correctionLabel)}:</strong> ${escapeHtml(getLocalizedCopy('sessionHint', state.profile.supportLanguage))}</div>
        <label>Correction mode<select id="correction-mode">${correctionModes.map((mode) => `<option value="${mode.id}" ${mode.id === state.correctionMode ? 'selected' : ''}>${mode.label}</option>`).join('')}</select></label>
        <div class="voice-controls">
          <div>
            <strong>${voiceStatusLabel()}</strong>
            <p>${state.voice.capability.speechRecognition ? 'Use your microphone to dictate learner turns, then send for correction.' : 'Speech recognition is not available in this browser, so typed practice is enabled.'}</p>
            ${state.voice.lastError ? `<em>${escapeHtml(state.voice.lastError)}</em>` : ''}
          </div>
          <button id="start-voice-session">🎙 Start mic</button>
          <button class="secondary" id="stop-voice">Stop</button>
          <button class="secondary" id="speak-last-ai">🔊 Speak AI</button>
        </div>
        ${state.voice.partialTranscript ? `<p class="voice-partial">Heard: ${escapeHtml(state.voice.partialTranscript)}</p>` : ''}
        ${renderPhaseList()}
        <div class="transcript">
          ${state.transcript.map((turn) => `
            <article class="turn ${turn.speaker}"><span>${turn.speaker === 'ai' ? 'SpeakSaathi' : state.profile.name} • ${escapeHtml(turn.phase)}</span><p>${escapeHtml(turn.text)}</p></article>
          `).join('')}
        </div>
        <div class="composer">
          <textarea id="learner-input" aria-label="Learner response" placeholder="Type or dictate the learner response...">${escapeHtml(state.learnerInput)}</textarea>
          <button id="send-turn">➤ Send</button>
          <button class="secondary" id="next-phase">Next phase</button>
        </div>
      </div>

      <aside class="panel stack">
        <div class="section-title"><span>✅</span><div><h2>Live corrections</h2><p>Gentle mode: correction after the learner finishes.</p></div></div>
        ${state.corrections.length === 0 ? '<p class="empty">Send the sample response to generate the first correction.</p>' : state.corrections.map((correction) => `
          <article class="correction">
            <span>${escapeHtml(correction.mistakeType)} • ${escapeHtml(correction.correctionMode ?? state.correctionMode)}</span>
            <p><strong>Original:</strong> ${escapeHtml(correction.original)}</p>
            <p><strong>Correct:</strong> ${escapeHtml(correction.corrected)}</p>
            <p>${escapeHtml(correction.explanation)}</p>
            <em>${escapeHtml(correction.practicePrompt)}</em>
            <button data-practice-correction="${correction.id}">Repeat practice (${correction.practicedCount ?? 0}/3)</button>
          </article>
        `).join('')}
        <div class="notebook-mini">
          <h3>Mistake notebook</h3>
          ${state.mistakeNotebook.length === 0 ? '<p class="empty">Corrections you practice will appear here.</p>' : state.mistakeNotebook.slice(0, 4).map((entry) => `
            <article class="history-card"><strong>${escapeHtml(entry.corrected)}</strong><span>${entry.mastered ? 'Mastered' : `${entry.practicedCount}/3`}</span><p>${escapeHtml(entry.mistakeType)} • ${escapeHtml(entry.practicePrompt)}</p></article>
          `).join('')}
        </div>
      </aside>
    </section>
  `;
};

const renderReportsTab = () => {
  const report = generateSessionReport(activeLesson().title, state.transcript, state.corrections);
  const progress = weeklyProgress();

  return `
    <section class="panel stack">
      <div class="section-title"><span>📈</span><div><h2>Detailed daily report</h2><p>Generated from transcript and correction events; save it to history.</p></div></div>
      <div class="score-grid">
        <div class="score highlight"><span>Overall</span><strong>${report.overallScore}/100</strong></div>
        <div class="score"><span>Talk time</span><strong>${report.talkTimeMinutes}m</strong></div>
        ${Object.entries(report.scores).map(([label, score]) => `<div class="score"><span>${escapeHtml(label)}</span><strong>${score}/100</strong></div>`).join('')}
      </div>
      <div class="report-grid">
        <div><h3>Strengths</h3><ul>${report.strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
        <div><h3>Homework</h3><ul>${report.homework.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
        <div><h3>Pronunciation focus</h3><ul>${report.pronunciationFocus.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
        <div><h3>Top corrections</h3>${report.topCorrections.length === 0 ? '<p class="empty">No corrections yet.</p>' : `<ul>${report.topCorrections.map((item) => `<li>${escapeHtml(item.corrected)} <small>(${escapeHtml(item.mistakeType)})</small></li>`).join('')}</ul>`}</div>
        <div><h3>Vocabulary</h3><div class="chips">${report.vocabulary.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div></div>
        <div><h3>Mistake summary</h3><div class="chips">${Object.entries(notebookSummary()).map(([type, count]) => `<span>${escapeHtml(type)}: ${count}</span>`).join('') || '<span>No saved mistakes yet</span>'}</div></div>
        <div><h3>Provider prompt preview</h3><code>${escapeHtml(createTutorSystemPrompt(state.profile.supportLanguage, activeLesson().title, state.correctionMode))}</code></div>
      </div>
      <button id="finish-session">Save report and update streak</button>
      <div class="panel-subsection">
        <h3>Weekly progress</h3>
        <div class="score-grid compact">
          <div class="score"><span>Sessions</span><strong>${progress.sessions}</strong></div>
          <div class="score"><span>Talk time</span><strong>${progress.totalTalkTime}m</strong></div>
          <div class="score"><span>Avg score</span><strong>${progress.averageOverall}/100</strong></div>
          <div class="score"><span>Corrections</span><strong>${progress.totalCorrections}</strong></div>
          <div class="score"><span>Score change</span><strong>${progress.scoreDelta >= 0 ? '+' : ''}${progress.scoreDelta}</strong></div>
        </div>
      </div>
      <div class="history-list">
        <h3>Report history</h3>
        ${state.reports.length === 0 ? '<p class="empty">No saved reports yet.</p>' : state.reports.map((item) => `
          <article class="history-card"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.date)}</span><p>Overall ${item.overallScore}/100 • Talk ${item.talkTimeMinutes}m • Grammar ${item.scores.grammar}/100 • Fluency ${item.scores.fluency}/100 • ${item.correctionCount} correction(s)</p><details><summary>Review report</summary><ul>${(item.homework ?? []).map((task) => `<li>${escapeHtml(task)}</li>`).join('')}</ul><div class="chips">${(item.pronunciationFocus ?? []).map((focus) => `<span>${escapeHtml(focus)}</span>`).join('')}</div></details></article>
        `).join('')}
      </div>
    </section>
  `;
};

const renderPlansTab = () => `
  <section class="panel stack">
    <div class="section-title"><span>💳</span><div><h2>Plans and usage limits</h2><p>Prototype entitlement layer for Sprint 8.</p></div></div>
    <div class="entitlement-banner ${hasEnoughMinutesForSession() ? '' : 'blocked'}">
      <strong>${escapeHtml(activePlan().name)} active</strong> • ${state.usage.usedMinutes} used / ${activePlan().dailyMinutes} minutes today • ${remainingMinutes()} minutes left.
      ${state.upgradePrompt ? `<p>${escapeHtml(state.upgradePrompt)}</p>` : ''}
    </div>
    <div class="plan-grid">
      ${subscriptionPlans.map((plan) => `
        <article class="plan-card ${state.profile.plan === plan.name ? 'selected' : ''}">
          <h3>${escapeHtml(plan.name)}</h3><strong>${escapeHtml(plan.price)}</strong><p>${plan.dailyMinutes} minutes/day</p>
          <ul>${plan.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>
          <button data-plan="${plan.name}">${state.profile.plan === plan.name ? 'Current plan' : `Simulate checkout`}</button>
        </article>
      `).join('')}
    </div>
    <div class="history-list">
      <h3>Billing events</h3>
      ${state.billingEvents.length === 0 ? '<p class="empty">No billing events yet.</p>' : state.billingEvents.map((event) => `
        <article class="history-card"><strong>${escapeHtml(event.planName)}</strong><span>${escapeHtml(event.status)}</span><p>₹${event.amount} • ${escapeHtml(new Date(event.createdAt).toLocaleString('en-IN'))}</p></article>
      `).join('')}
    </div>
  </section>
`;

const renderPrivacyTab = () => {
  const summary = qualitySummary();

  return `
    <section class="panel stack">
      <div class="section-title"><span>🔐</span><div><h2>Privacy, safety, cost, and reliability</h2><p>Prototype controls for Sprint 9 hardening.</p></div></div>
      <div class="score-grid compact">
        <div class="score"><span>Reliability</span><strong>${summary.reliabilityPercent}%</strong></div>
        <div class="score"><span>Avg latency</span><strong>${summary.averageLatencyMs}ms</strong></div>
        <div class="score"><span>Est. cost</span><strong>₹${summary.totalCost}</strong></div>
        <div class="score"><span>Safety events</span><strong>${state.safetyEvents.length}</strong></div>
        <div class="score"><span>Errors</span><strong>${summary.errorCount}</strong></div>
      </div>
      <label class="check-row"><input type="checkbox" id="save-audio" ${state.privacy.saveAudio ? 'checked' : ''}/> Save audio recordings after consent</label>
      <label class="check-row"><input type="checkbox" id="save-transcript" ${state.privacy.saveTranscript ? 'checked' : ''}/> Save transcript for reports</label>
      <label class="check-row"><input type="checkbox" id="child-safe-mode" ${state.privacy.childSafeMode ? 'checked' : ''}/> Enable child-safe teaching tone</label>
      <label>Transcript retention days<input id="retention-days" type="number" min="1" max="365" value="${state.privacy.retentionDays ?? 30}" /></label>
      <div class="history-list">
        <h3>Safety events</h3>
        ${state.safetyEvents.length === 0 ? '<p class="empty">No safety events recorded.</p>' : state.safetyEvents.map((event) => `
          <article class="history-card"><strong>${escapeHtml(event.category)}</strong><span>${escapeHtml(new Date(event.createdAt).toLocaleString('en-IN'))}</span><p>${escapeHtml(event.message)}</p></article>
        `).join('')}
      </div>
      <div class="history-list">
        <h3>Quality events</h3>
        ${state.qualityEvents.length === 0 ? '<p class="empty">No quality events yet.</p>' : state.qualityEvents.slice(0, 8).map((event) => `
          <article class="history-card"><strong>${escapeHtml(event.kind)}</strong><span>${escapeHtml(event.status)}</span><p>${event.latencyMs}ms • ₹${event.cost} • ${escapeHtml(event.detail)}</p></article>
        `).join('')}
      </div>
      <button id="apply-retention">Apply retention policy</button>
      <button class="danger" id="delete-data">Delete local prototype data</button>
    </section>
  `;
};

const renderB2BTab = () => `
  <section class="panel stack">
    <div class="section-title"><span>🏫</span><div><h2>B2B pilot dashboard</h2><p>Institution view for Sprint 12 pilot planning.</p></div></div>
    <div class="score-grid">
      <div class="score"><span>Organization</span><strong>${escapeHtml(demoCohort.organization)}</strong></div>
      <div class="score"><span>Cohort</span><strong>${escapeHtml(demoCohort.cohort)}</strong></div>
      <div class="score"><span>Learners</span><strong>${demoCohort.learners}</strong></div>
      <div class="score"><span>Avg minutes</span><strong>${demoCohort.averageSpeakingMinutes}</strong></div>
      <div class="score"><span>Completion</span><strong>${demoCohort.completionRate}%</strong></div>
      <div class="score"><span>Weak areas</span><strong>${demoCohort.weakAreas.length}</strong></div>
    </div>
    <div class="chips">${demoCohort.weakAreas.map((area) => `<span>${escapeHtml(area)}</span>`).join('')}</div>
  </section>
`;

const renderActiveTab = () => ({
  learn: renderLearnTab,
  session: renderSessionTab,
  reports: renderReportsTab,
  plans: renderPlansTab,
  privacy: renderPrivacyTab,
  b2b: renderB2BTab,
}[state.activeTab] ?? renderLearnTab)();

const render = () => {
  document.querySelector('#root').innerHTML = `
    <main class="app-shell">
      ${renderHero()}
      ${renderTabs()}
      ${renderActiveTab()}
    </main>
  `;

  bindEvents();
};



const useScenarioPrompt = (scenarioId) => {
  const scenario = scenarioLibrary.find((item) => item.id === scenarioId);
  if (!scenario) return;

  state.activeTab = 'session';
  state.learnerInput = getLocalizedScenarioPrompt(scenario, state.profile.supportLanguage);
  state.transcript = [
    ...state.transcript,
    createTurn('ai', state.currentPhase, `Role-play prompt: ${scenario.prompt}`),
  ];
  persist();
  render();
};

const startOrResumeSession = () => {
  state.usage = normalizeUsageForToday(state.usage);
  if (!hasEnoughMinutesForSession()) {
    state.upgradePrompt = `${activePlan().name} has only ${remainingMinutes()} minutes left today. Upgrade to Core or Career for a full 30-minute session.`;
    state.activeTab = 'plans';
    persist();
    render();
    return;
  }

  const runtime = ensureSessionRuntime();
  state.currentPhase = runtime.currentPhase;
  state.activeTab = 'session';
  state.transcript = state.transcript.length ? state.transcript : [
    createTurn('ai', state.currentPhase, `Session started. ${activeLesson().steps[0].prompt}`),
  ];
  persist();
  render();
};

const sendLearnerTurn = () => {
  const input = document.querySelector('#learner-input')?.value?.trim() ?? state.learnerInput.trim();
  if (!input) return;

  if (!shouldResumeSession(state.sessionRuntime) && !hasEnoughMinutesForSession()) {
    state.upgradePrompt = `${activePlan().name} has only ${remainingMinutes()} minutes left today. Upgrade to Core or Career to continue full daily practice.`;
    state.activeTab = 'plans';
    persist();
    render();
    return;
  }

  ensureSessionRuntime();

  const moderation = moderateLearnerText(input);
  const learnerTurn = createTurn('learner', state.currentPhase, input);
  if (!moderation.safe) {
    const safetyEvent = {
      id: crypto.randomUUID(),
      category: moderation.category,
      message: moderation.message,
      text: input,
      createdAt: new Date().toISOString(),
    };
    const safeAiTurn = createTurn('ai', state.currentPhase, 'Let us keep this practice safe and respectful. If you feel unsafe, please contact a trusted person or local emergency support. We can continue with a calmer English sentence.');
    state.safetyEvents = [safetyEvent, ...state.safetyEvents].slice(0, 20);
    state.qualityEvents = [createQualityEvent({ kind: 'moderation', status: 'blocked', detail: moderation.category }), ...state.qualityEvents].slice(0, 30);
    state.transcript = [...state.transcript, learnerTurn, safeAiTurn];
    state.learnerInput = '';
    persist();
    render();
    return;
  }

  const startedAt = performance.now();
  const tutorResponse = getMockTutorResponse(learnerTurn, state.profile.supportLanguage, state.correctionMode);
  const latencyMs = Math.round(performance.now() - startedAt);
  const aiTurn = createTurn('ai', state.currentPhase, tutorResponse.aiText);
  const estimatedCost = estimateAiCost({ inputChars: input.length, outputChars: tutorResponse.aiText.length, audioMinutes: 0.1 });
  speakText(tutorResponse.aiText);

  state.qualityEvents = [createQualityEvent({
    kind: 'ai_turn',
    latencyMs,
    cost: estimatedCost,
    detail: `${state.correctionMode} correction response`,
  }), ...state.qualityEvents].slice(0, 30);
  state.transcript = [...state.transcript, learnerTurn, aiTurn];
  state.learnerInput = '';

  if (tutorResponse.correction) {
    const correction = createNotebookEntry(tutorResponse.correction);
    state.corrections = [...state.corrections, correction];
    state.mistakeNotebook = [correction, ...state.mistakeNotebook.filter((entry) => entry.id !== correction.id)].slice(0, 20);
  }

  persist();
  render();
};

const advancePhase = () => {
  ensureSessionRuntime();
  state.sessionRuntime.completedPhases = [...new Set([...state.sessionRuntime.completedPhases, state.currentPhase])];
  state.currentPhase = nextPhase();
  state.sessionRuntime.currentPhase = state.currentPhase;
  const nextStep = activeLesson().steps.find((step) => step.phase === state.currentPhase);
  state.transcript = [
    ...state.transcript,
    createTurn('ai', state.currentPhase, `Next: ${nextStep.phase}. ${nextStep.prompt}`),
  ];
  persist();
  render();
};

const saveReport = () => {
  const report = generateSessionReport(activeLesson().title, state.transcript, state.corrections);
  state.reports = [createSavedReport({
    report,
    lessonId: state.activeLessonId,
    correctionMode: state.correctionMode,
  }), ...state.reports].slice(0, 10);
  const completedAt = new Date();
  state.profile.streak = calculateStreak(state.profile.streak, state.lastCompletedAt, completedAt);
  state.lastCompletedAt = completedAt.toISOString();
  if (state.sessionRuntime) state.sessionRuntime.status = 'completed';
  state.sessionStartedAt = null;
  state.usage = addUsageMinutes(state.usage, getLessonTotalMinutes(activeLesson()));
  state.progress[state.activeLessonId] = {
    completedSessions: completionFor(state.activeLessonId) + 1,
    lastCompletedAt: new Date().toISOString(),
  };
  state.activeTab = 'reports';
  persist();
  render();
};

const switchLesson = (lessonId) => {
  const lesson = getLessonById(lessonId);
  state.activeLessonId = lesson.id;
  state.currentPhase = lesson.steps[0].phase;
  state.transcript = [createTurn('ai', state.currentPhase, `New lesson: ${lesson.title}. ${lesson.steps[0].prompt}`)];
  state.corrections = [];
  state.learnerInput = 'I am completed my degree and my strength is hard work';
  state.activeTab = 'session';
  state.sessionRuntime = null;
  state.sessionStartedAt = null;
  state.voice.partialTranscript = '';
  persist();
  render();
};



const practiceCorrection = (correctionId) => {
  const currentEntry = state.mistakeNotebook.find((entry) => entry.id === correctionId)
    ?? state.corrections.find((correction) => correction.id === correctionId);
  if (!currentEntry) return;

  const practiced = practiceNotebookEntry(currentEntry);
  state.mistakeNotebook = [
    practiced,
    ...state.mistakeNotebook.filter((entry) => entry.id !== correctionId),
  ];
  state.corrections = state.corrections.map((correction) => (
    correction.id === correctionId ? { ...correction, ...practiced } : correction
  ));
  state.transcript = [
    ...state.transcript,
    createTurn('ai', state.currentPhase, practiced.mastered
      ? `Great repetition. You have practiced this correction three times: ${practiced.corrected}`
      : `Practice saved. Repeat again: ${practiced.corrected}`),
  ];
  persist();
  render();
};

const startVoiceCapture = () => {
  state.activeTab = 'session';
  state.voice.capability = createVoiceSessionStatus();

  if (!state.voice.capability.speechRecognition) {
    state.voice.status = 'typed-fallback';
    state.voice.lastError = 'Speech recognition is unavailable in this browser. Use typed practice or connect Gemini Live in the backend.';
    state.qualityEvents = [createQualityEvent({ kind: 'voice', status: 'fallback', detail: 'Speech recognition unavailable' }), ...state.qualityEvents].slice(0, 30);
    persist();
    render();
    return;
  }

  activeRecognizer?.stop?.();
  activeRecognizer = createBrowserSpeechRecognizer({
    language: 'en-IN',
    onPartial: (partial) => {
      state.voice.partialTranscript = partial;
      render();
    },
    onFinal: (finalText) => {
      state.learnerInput = finalText;
      state.voice.partialTranscript = '';
      state.voice.status = 'idle';
      persist();
      render();
    },
    onStatus: (status) => {
      state.voice.status = status;
      state.voice.lastError = status.startsWith('error:') ? status : '';
      persist();
      render();
    },
  });

  activeRecognizer?.start?.();
};

const stopVoiceCapture = () => {
  activeRecognizer?.stop?.();
  activeRecognizer = null;
  state.voice.status = 'idle';
  state.voice.partialTranscript = '';
  persist();
  render();
};

const speakLastAiTurn = () => {
  const lastAiTurn = [...state.transcript].reverse().find((turn) => turn.speaker === 'ai');
  if (!lastAiTurn) return;

  const didSpeak = speakText(lastAiTurn.text);
  state.voice.lastError = didSpeak ? '' : 'Speech synthesis is unavailable in this browser.';
  persist();
  render();
};


const applyPrivacyRetention = () => {
  const retained = applyRetentionPolicy({
    transcript: state.transcript,
    corrections: state.corrections,
    reports: state.reports,
  }, {
    saveTranscript: state.privacy.saveTranscript,
    retentionDays: Number(state.privacy.retentionDays ?? 30),
  });
  state.transcript = retained.transcript;
  state.corrections = retained.corrections;
  state.reports = retained.reports;
  state.qualityEvents = [createQualityEvent({ kind: 'privacy', detail: 'Retention policy applied' }), ...state.qualityEvents].slice(0, 30);
  persist();
  render();
};

const bindEvents = () => {
  document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', (event) => {
    state.activeTab = event.currentTarget.dataset.tab;
    persist();
    render();
  }));
  document.querySelectorAll('[data-scenario-prompt]').forEach((button) => button.addEventListener('click', (event) => useScenarioPrompt(event.currentTarget.dataset.scenarioPrompt)));
  document.querySelector('#start-session')?.addEventListener('click', startOrResumeSession);
  document.querySelector('#try-correction')?.addEventListener('click', () => {
    state.activeTab = 'session';
    persist();
    render();
    setTimeout(sendLearnerTurn, 0);
  });
  document.querySelector('#start-voice')?.addEventListener('click', startVoiceCapture);
  document.querySelector('#start-voice-session')?.addEventListener('click', startVoiceCapture);
  document.querySelector('#stop-voice')?.addEventListener('click', stopVoiceCapture);
  document.querySelector('#speak-last-ai')?.addEventListener('click', speakLastAiTurn);
  document.querySelector('#send-turn')?.addEventListener('click', sendLearnerTurn);
  document.querySelector('#correction-mode')?.addEventListener('change', (event) => {
    state.correctionMode = event.target.value;
    persist();
    render();
  });
  document.querySelectorAll('[data-practice-correction]').forEach((button) => button.addEventListener('click', (event) => practiceCorrection(event.currentTarget.dataset.practiceCorrection)));
  document.querySelector('#next-phase')?.addEventListener('click', advancePhase);
  document.querySelector('#finish-session')?.addEventListener('click', saveReport);
  document.querySelectorAll('[data-lesson]').forEach((button) => button.addEventListener('click', (event) => switchLesson(event.currentTarget.dataset.lesson)));
  document.querySelectorAll('[data-plan]').forEach((button) => button.addEventListener('click', (event) => {
    const checkout = completeCheckout(state.profile.plan, event.currentTarget.dataset.plan);
    state.profile.plan = checkout.planName;
    state.billingEvents = [checkout.event, ...state.billingEvents].slice(0, 12);
    state.upgradePrompt = checkout.event.status === 'payment_success'
      ? `${checkout.planName} activated. You now have ${getPlanByName(checkout.planName).dailyMinutes} minutes per day.`
      : `${checkout.planName} is already active.`;
    persist();
    render();
  }));
  document.querySelector('#profile-name')?.addEventListener('input', (event) => {
    state.profile.name = event.target.value;
    persist();
  });
  document.querySelector('#support-language')?.addEventListener('change', (event) => {
    state.profile.supportLanguage = event.target.value;
    persist();
    render();
  });
  document.querySelector('#goal')?.addEventListener('change', (event) => {
    state.profile.goal = event.target.value;
    persist();
    render();
  });
  document.querySelector('#level')?.addEventListener('change', (event) => {
    state.profile.level = event.target.value;
    persist();
  });
  document.querySelector('#reminder-enabled')?.addEventListener('change', (event) => {
    state.reminder.enabled = event.target.checked;
    persist();
    render();
  });
  document.querySelector('#reminder-option')?.addEventListener('change', (event) => {
    state.reminder.optionId = event.target.value;
    persist();
    render();
  });
  document.querySelector('#learner-input')?.addEventListener('input', (event) => {
    state.learnerInput = event.target.value;
    persist();
  });
  document.querySelector('#save-audio')?.addEventListener('change', (event) => {
    state.privacy.saveAudio = event.target.checked;
    persist();
  });
  document.querySelector('#save-transcript')?.addEventListener('change', (event) => {
    state.privacy.saveTranscript = event.target.checked;
    persist();
  });
  document.querySelector('#child-safe-mode')?.addEventListener('change', (event) => {
    state.privacy.childSafeMode = event.target.checked;
    persist();
  });
  document.querySelector('#retention-days')?.addEventListener('input', (event) => {
    state.privacy.retentionDays = Number(event.target.value);
    persist();
  });
  document.querySelector('#apply-retention')?.addEventListener('click', applyPrivacyRetention);
  document.querySelector('#delete-data')?.addEventListener('click', () => {
    clearAppState();
    location.reload();
  });
};

render();
