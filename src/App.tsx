codex/analyser-l-application-pour-ameliorer-l-education-na83h9
import { useState } from "react";
import { AppProvider, useApp } from "@/store";
import { TabBar } from "@/components/TabBar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PiocheRevealVeil } from "@/components/PiocheRevealVeil";
import { BraiseMascot } from "@/components/BraiseMascot";
import { RankUpCelebration } from "@/components/RankUpCelebration";
import { ShareAuraModal } from "@/components/ShareAuraModal";
import { useMilestoneCelebrations } from "@/lib/useMilestoneCelebrations";
import { rankUpLine, getAgeGroup } from "@/lib/braiseVoice";
import { getRankInfo, countMasteredCards } from "@/lib/aura";
import { FLASHCARDS } from "@/data";
import { OnboardingView } from "@/views/OnboardingView";
import { HomeView } from "@/views/HomeView";
import { LearnView } from "@/views/LearnView";
import { RevisionsView } from "@/views/RevisionsView";
import { ProfilAuraView } from "@/views/ProfilAuraView";
import { SubjectView } from "@/views/SubjectView";
import { LessonView } from "@/views/LessonView";
import { CompleteView } from "@/views/CompleteView";
import { ProfileView } from "@/views/ProfileView";
import { SettingsView } from "@/views/SettingsView";
=======
import { useState } from 'react';
import { AppProvider, useApp } from '@/store';
import { TabBar } from '@/components/TabBar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PiocheRevealVeil } from '@/components/PiocheRevealVeil';
import { BraiseMascot } from '@/components/BraiseMascot';
import { RankUpCelebration } from '@/components/RankUpCelebration';
import { ShareAuraModal } from '@/components/ShareAuraModal';
import { useMilestoneCelebrations } from '@/lib/useMilestoneCelebrations';
import { rankUpLine, getAgeGroup } from '@/lib/braiseVoice';
import { getRankInfo, countMasteredCards } from '@/lib/aura';
import { FLASHCARDS } from '@/data';
import { OnboardingView } from '@/views/OnboardingView';
import { HomeView } from '@/views/HomeView';
import { SubjectsView } from '@/views/SubjectsView';
import { RevisionsView } from '@/views/RevisionsView';
import { ProfilAuraView } from '@/views/ProfilAuraView';
import { SubjectView } from '@/views/SubjectView';
import { LessonView } from '@/views/LessonView';
import { CompleteView } from '@/views/CompleteView';
import { ProfileView } from '@/views/ProfileView';
import { SettingsView } from '@/views/SettingsView';
main

function Screen() {
  const { state, setTab, loaded } = useApp();
  // Mounted regardless of which view is active — a rank-up or badge unlock can be earned from
  // LessonView or RevisionsView just as easily as from Home, and should be celebrated the moment
  // it happens, not only if the student later happens to reopen Profile.
  const { celebration, dismiss } = useMilestoneCelebrations(state, loaded, state.soundOn);
  const [shareOpen, setShareOpen] = useState(false);

  // The floating dock stays through a review session too — it sits under the action row,
  // in its own glass layer, so it never competes with the verdict buttons for the thumb.
codex/analyser-l-application-pour-ameliorer-l-education-na83h9
  const showTabBar = ["home", "learn", "revisions", "progres", "profile"].includes(state.view);
=======
  const showTabBar = ['home', 'subjects', 'revisions', 'progres', 'profile'].includes(state.view);
main

  if (!loaded) {
    return (
      <div className="app-shell">
        <div
          className="app-content"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <BraiseMascot size={80} mood="happy" className="flame-hero" />
          <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>
            Chargement de ton parcours...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`app-shell ${state.darkMode ? "dark" : ""} ${state.dyslexiaMode ? "dyslexia-mode" : ""}`}
    >
      <div className="app-content">
        {/* `key={state.view}`: this is what makes the boundary self-healing on navigation — a
            crash on one view sets its internal hasError, and switching to any other view (via
            the tab bar, which lives outside this boundary and stays clickable, or the
            fallback's own "Retour à l'accueil") changes the key, which remounts a fresh
            boundary for wherever the player lands instead of carrying the old error forward. */}
codex/analyser-l-application-pour-ameliorer-l-education-na83h9
        <ErrorBoundary key={state.view} onGoHome={() => setTab("home")}>
          {state.view === "onboarding" && <OnboardingView />}
          {state.view === "home" && <HomeView />}
          {state.view === "learn" && <LearnView />}
          {state.view === "revisions" && <RevisionsView />}
          {state.view === "progres" && <ProfilAuraView />}
          {state.view === "subject" && <SubjectView />}
          {state.view === "lesson" && <LessonView />}
          {state.view === "complete" && <CompleteView />}
          {state.view === "profile" && <ProfileView />}
          {state.view === "settings" && <SettingsView />}
=======
        <ErrorBoundary key={state.view} onGoHome={() => setTab('home')}>
          {state.view === 'onboarding' && <OnboardingView />}
          {state.view === 'home' && <HomeView />}
          {state.view === 'subjects' && <SubjectsView />}
          {state.view === 'revisions' && <RevisionsView />}
          {state.view === 'progres' && <ProfilAuraView />}
          {state.view === 'subject' && <SubjectView />}
          {state.view === 'lesson' && <LessonView />}
          {state.view === 'complete' && <CompleteView />}
          {state.view === 'profile' && <ProfileView />}
          {state.view === 'settings' && <SettingsView />}
main
        </ErrorBoundary>
      </div>

      {showTabBar && <TabBar active={state.tab} onChange={setTab} />}

      {/* Sits here, not inside HeroPiocheCard/HomeView — it needs to survive the exact unmount
          it's meant to cover. See PiocheRevealVeil for why. */}
      <PiocheRevealVeil />

      {celebration?.type === "badge" && (
        <div key={`badge-${celebration.badge.id}`} className="milestone-toast">
          {celebration.badge.emoji} Badge débloqué : {celebration.badge.name} !
        </div>
      )}

      {celebration?.type === "rank" && (
        <RankUpCelebration
          key={`rank-${celebration.toRank.id}`}
          fromRank={celebration.fromRank}
          toRank={celebration.toRank}
          xp={state.xp}
          // "Cool" (sunglasses) for the Coach Savage tone, "proud" for Pote Chill — the mood and
          // the voice tone were two already-built systems that just never spoke to each other on
          // this screen; a savage-toned message paired with a plain happy face undercut its own
          // punchline.
          mood={state.user.personality === "savage" ? "cool" : "proud"}
          ageGroup={getAgeGroup(state.user.level)}
          message={rankUpLine(
            { personality: state.user.personality, age: getAgeGroup(state.user.level) },
            celebration.toRank.name,
            celebration.toRank.id,
          )}
          onDismiss={dismiss}
          onShare={() => setShareOpen(true)}
        />
      )}

      {shareOpen && (
        <ShareAuraModal
          rank={celebration?.type === "rank" ? celebration.toRank : getRankInfo(state.xp).current}
          streak={state.streak}
          xp={state.xp}
          subjectsCount={
            new Set(
              Object.keys(state.cardReviews)
                .map((id) => FLASHCARDS.find((c) => c.id === id)?.subject)
                .filter(Boolean),
            ).size
          }
          masteredCards={countMasteredCards(state.cardReviews)}
          onClose={() => setShareOpen(false)}
        />
      )}
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
