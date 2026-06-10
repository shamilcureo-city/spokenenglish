import { AuthGate } from './auth/AuthGate';
import { StoreProvider, useStore } from './store';
import { Onboarding } from './onboarding/Onboarding';
import { AssessmentFlow } from './onboarding/AssessmentFlow';
import { AssessmentResult } from './onboarding/AssessmentResult';
import { MainApp } from './MainApp';

function Routed() {
  const { stage, hydrating } = useStore();
  if (hydrating) {
    return <div className="grid min-h-screen place-items-center text-sm text-white/40">Loading your map…</div>;
  }
  switch (stage) {
    case 'onboarding':
      return <Onboarding />;
    case 'assessment':
      return <AssessmentFlow />;
    case 'result':
      return <AssessmentResult />;
    default:
      return <MainApp />;
  }
}

export default function App() {
  return (
    <AuthGate>
      {(userId, cloud, signOut) => (
        <StoreProvider userId={userId} cloud={cloud} signOut={signOut}>
          <Routed />
        </StoreProvider>
      )}
    </AuthGate>
  );
}
