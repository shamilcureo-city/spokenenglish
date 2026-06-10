import { useMemo, useState } from 'react';
import type { TrackId } from '@fluentmap/core/domain';
import { MapScreen } from './map/MapScreen';
import { LessonSession } from './session/LessonSession';
import { ReviewSession } from './session/ReviewSession';
import { ProgressScreen } from './session/ProgressScreen';
import { ScienceScreen } from './ScienceScreen';
import { useStore } from './store';
import { chooseNextLesson } from './lib/nextLesson';

type View = 'map' | 'practice' | 'review' | 'progress' | 'science';

/** The main app shell (post-onboarding): map ↔ adaptive practice ↔ reviews. */
export function MainApp() {
  const [view, setView] = useState<View>('map');
  const { skillStates, now, assessment, trackId } = useStore();

  const next = useMemo(
    () =>
      chooseNextLesson(
        skillStates,
        now,
        assessment?.placement.band ?? 'B1',
        (trackId ?? undefined) as TrackId | undefined,
      ),
    [skillStates, now, assessment, trackId],
  );

  if (view === 'practice') {
    return <LessonSession lesson={next.lesson} rationale={next.rationale} onBack={() => setView('map')} />;
  }
  if (view === 'review') {
    return <ReviewSession onBack={() => setView('map')} />;
  }
  if (view === 'progress') {
    return <ProgressScreen onBack={() => setView('map')} />;
  }
  if (view === 'science') {
    return <ScienceScreen onBack={() => setView('map')} />;
  }
  return (
    <MapScreen
      onStartPractice={() => setView('practice')}
      onStartReview={() => setView('review')}
      onShowProgress={() => setView('progress')}
      onShowScience={() => setView('science')}
    />
  );
}
