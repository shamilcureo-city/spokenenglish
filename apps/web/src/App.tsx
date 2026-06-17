import { useEffect, useState } from 'react';
import type { Lesson, Turn } from '@fluentmap/core/conversation';
import { StoreProvider, useStore } from './store';
import { track } from './lib/analytics';
import { Onboarding } from './screens/Onboarding';
import { PlacementScreen } from './screens/PlacementScreen';
import { Home } from './screens/Home';
import { CourseScreen } from './screens/CourseScreen';
import { LessonScreen } from './screens/LessonScreen';
import { ConversationScreen } from './screens/ConversationScreen';
import { RecapScreen } from './screens/RecapScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { Settings } from './screens/Settings';

type Route =
  | { name: 'home' }
  | { name: 'course' }
  | { name: 'lesson'; lesson: Lesson }
  | { name: 'warmup'; prompt: string }
  | { name: 'warmupRecap'; transcript: Turn[]; recording?: Blob }
  | { name: 'placement' }
  | { name: 'progress' }
  | { name: 'settings' };

function Shell() {
  const { onboarded } = useStore();
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const home = () => setRoute({ name: 'home' });

  useEffect(() => {
    track('app_open');
  }, []);

  if (!onboarded) {
    return <Onboarding onDone={() => setRoute({ name: 'placement' })} />;
  }

  switch (route.name) {
    case 'placement':
      return <PlacementScreen onDone={home} />;
    case 'course':
      return (
        <CourseScreen onBack={home} onOpenLesson={(lesson) => setRoute({ name: 'lesson', lesson })} />
      );
    case 'lesson':
      return (
        <LessonScreen
          lesson={route.lesson}
          onExit={() => setRoute({ name: 'course' })}
          onNext={() => setRoute({ name: 'course' })}
        />
      );
    case 'warmup':
      return (
        <ConversationScreen
          mode="warmup"
          warmupPrompt={route.prompt}
          onBack={home}
          onEnd={(transcript, recording) => setRoute({ name: 'warmupRecap', transcript, recording })}
        />
      );
    case 'warmupRecap':
      return (
        <RecapScreen
          transcript={route.transcript}
          mode="warmup"
          recording={route.recording}
          onDone={home}
          onRedo={home}
        />
      );
    case 'progress':
      return <ProgressScreen onBack={home} />;
    case 'settings':
      return <Settings onBack={home} />;
    case 'home':
    default:
      return (
        <Home
          onOpenLesson={(lesson) => setRoute({ name: 'lesson', lesson })}
          onBrowseCourse={() => setRoute({ name: 'course' })}
          onWarmup={(prompt) => setRoute({ name: 'warmup', prompt })}
          onProgress={() => setRoute({ name: 'progress' })}
          onSettings={() => setRoute({ name: 'settings' })}
        />
      );
  }
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
