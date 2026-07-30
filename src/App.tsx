import { AppProvider, useApp } from '@/store';
import { TabBar } from '@/components/TabBar';
import { BraiseMascot } from '@/components/BraiseMascot';
import { OnboardingView } from '@/views/OnboardingView';
import { HomeView } from '@/views/HomeView';
import { MatieresView } from '@/views/MatieresView';
import { RevisionsView } from '@/views/RevisionsView';
import { ProgresView } from '@/views/ProgresView';
import { SubjectView } from '@/views/SubjectView';
import { LessonView } from '@/views/LessonView';
import { CompleteView } from '@/views/CompleteView';
import { ProfileView } from '@/views/ProfileView';
import { SettingsView } from '@/views/SettingsView';

function Screen() {
  const { state, setTab, loaded } = useApp();

  const showTabBar = ['home', 'matieres', 'revisions', 'progres', 'profile'].includes(state.view);

  if (!loaded) {
    return (
      <div className="app-shell">
        <div className="app-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <BraiseMascot size={80} mood="happy" className="flame-hero" />
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>Chargement de ton parcours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-shell ${state.darkMode ? 'dark' : ''} ${state.dyslexiaMode ? 'dyslexia-mode' : ''}`}>
      <div className="app-content">
        {state.view === 'onboarding' && <OnboardingView />}
        {state.view === 'home' && <HomeView />}
        {state.view === 'matieres' && <MatieresView />}
        {state.view === 'revisions' && <RevisionsView />}
        {state.view === 'progres' && <ProgresView />}
        {state.view === 'subject' && <SubjectView />}
        {state.view === 'lesson' && <LessonView />}
        {state.view === 'complete' && <CompleteView />}
        {state.view === 'profile' && <ProfileView />}
        {state.view === 'settings' && <SettingsView />}
      </div>

      {showTabBar && <TabBar active={state.tab} onChange={setTab} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Screen />
    </AppProvider>
  );
}
