import { useEffect, useState } from 'react';
import type { Lesson, Turn } from '@fluentmap/core/conversation';
import { StoreProvider, useStore } from './store';
import { track } from './lib/analytics';
import { Onboarding } from './screens/Onboarding';
import { PlacementScreen } from './screens/PlacementScreen';
import { Today } from './screens/Today';
import { CourseScreen } from './screens/CourseScreen';
import { Review } from './screens/Review';
import { You } from './screens/You';
import { LessonScreen } from './screens/LessonScreen';
import { ConversationScreen } from './screens/ConversationScreen';
import { RecapScreen } from './screens/RecapScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { Settings } from './screens/Settings';
import { StateStrip, TabBar, type Tab } from './screens/shell';

/** Full-screen flows that take over from the tabs (immersive — no nav chrome). */
type Modal =
  | { name: 'lesson'; lesson: Lesson }
  | { name: 'warmup'; prompt: string }
  | { name: 'warmupRecap'; transcript: Turn[]; recording?: Blob; prompt: string }
  | { name: 'placement' }
  | { name: 'progress' }
  | { name: 'settings' };

function Shell() {
  const { onboarded } = useStore();
  const [tab, setTab] = useState<Tab>('today');
  const [modal, setModal] = useState<Modal | null>(null);
  const close = () => setModal(null);
  const openLesson = (lesson: Lesson) => setModal({ name: 'lesson', lesson });
  const openWarmup = (prompt: string) => setModal({ name: 'warmup', prompt });

  useEffect(() => {
    track('app_open');
  }, []);

  if (!onboarded) {
    return <Onboarding onDone={() => setModal({ name: 'placement' })} />;
  }

  // Immersive full-screen flows (no tab bar / state strip).
  if (modal) {
    switch (modal.name) {
      case 'placement':
        return <PlacementScreen onDone={close} />;
      case 'lesson':
        return <LessonScreen lesson={modal.lesson} onExit={close} onNext={close} />;
      case 'warmup':
        return (
          <ConversationScreen
            mode="warmup"
            warmupPrompt={modal.prompt}
            onBack={close}
            onEnd={(transcript, recording) =>
              setModal({ name: 'warmupRecap', transcript, recording, prompt: modal.prompt })
            }
          />
        );
      case 'warmupRecap':
        return (
          <RecapScreen
            transcript={modal.transcript}
            mode="warmup"
            recording={modal.recording}
            onDone={close}
            onRedo={() => setModal({ name: 'warmup', prompt: modal.prompt })}
          />
        );
      case 'progress':
        return <ProgressScreen onBack={close} />;
      case 'settings':
        return <Settings onBack={close} />;
    }
  }

  // The 4-tab home.
  let content: React.ReactNode;
  switch (tab) {
    case 'path':
      content = <CourseScreen onOpenLesson={openLesson} />;
      break;
    case 'review':
      content = <Review onOpenLesson={openLesson} onFreeChat={openWarmup} />;
      break;
    case 'you':
      content = <You onProgress={() => setModal({ name: 'progress' })} onSettings={() => setModal({ name: 'settings' })} />;
      break;
    case 'today':
    default:
      content = <Today onStartLesson={openLesson} onFreeChat={openWarmup} onBrowsePath={() => setTab('path')} />;
  }

  return (
    <>
      {/* You owns its own header + stats; the strip would just duplicate them there. */}
      {tab !== 'you' && <StateStrip />}
      {content}
      <TabBar active={tab} onChange={setTab} />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
