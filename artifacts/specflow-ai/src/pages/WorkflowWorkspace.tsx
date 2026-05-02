import { useState } from 'react';
import { useRoute } from 'wouter';
import { useSessionStore } from '@/store/session-store';
import { Phase } from '@/lib/types';
import { PhaseTracker } from '@/components/workspace/PhaseTracker';
import { GuidancePanel } from '@/components/workspace/GuidancePanel';
import { ClarificationPanel } from '@/components/workspace/ClarificationPanel';
import { PRDPanel } from '@/components/workspace/PRDPanel';
import { EpicsPanel } from '@/components/workspace/EpicsPanel';
import { StoriesPanel } from '@/components/workspace/StoriesPanel';
import { QualityReviewPanel } from '@/components/workspace/QualityReviewPanel';
import { DeveloperReviewPanel } from '@/components/workspace/DeveloperReviewPanel';
import { ExportPanel } from '@/components/workspace/ExportPanel';
import { useToast } from '@/hooks/use-toast';

function buildGuidanceItems(phase: Phase, session: any, questions: any[], prdSections: any[], stories: any[]) {
  const items: any[] = [];

  if (phase === 'clarification') {
    const unanswered = questions.filter((q: any) => q.required && !q.answer && !q.skipped);
    if (unanswered.length > 0) {
      items.push({ type: 'error', message: `${unanswered.length} required question${unanswered.length > 1 ? 's' : ''} unanswered` });
    }
    const skipped = questions.filter((q: any) => q.skipped);
    if (skipped.length > 0) {
      items.push({ type: 'warning', message: `${skipped.length} question${skipped.length > 1 ? 's' : ''} skipped — may reduce quality` });
    }
    if (unanswered.length === 0) {
      items.push({ type: 'success', message: 'All required questions answered. Ready to generate PRD.' });
    }
    items.push({ type: 'action', message: 'Answer remaining questions before generating PRD' });
    items.push({ type: 'action', message: 'Expand each section to see grouped questions' });
  }

  if (phase === 'prd') {
    const incomplete = prdSections.filter((s: any) => !s.complete);
    if (incomplete.length > 0) {
      items.push({ type: 'warning', message: `${incomplete.length} PRD section${incomplete.length > 1 ? 's' : ''} incomplete` });
    }
    if (incomplete.length === 0) {
      items.push({ type: 'success', message: 'All PRD sections complete. Ready to generate epics.' });
    }
    items.push({ type: 'action', message: 'Review each PRD section for accuracy' });
    items.push({ type: 'action', message: 'Edit sections by clicking "Edit" on any card' });
  }

  if (phase === 'epics') {
    items.push({ type: 'success', message: '4 epics generated from PRD requirements' });
    items.push({ type: 'action', message: 'Review epic scope and business objectives' });
    items.push({ type: 'action', message: 'Copy epic descriptions to Jira as needed' });
    items.push({ type: 'action', message: 'Generate stories when epics look correct' });
  }

  if (phase === 'stories') {
    const lowScore = stories.filter(s => s.readinessScore.total < 75);
    const withWarnings = stories.filter(s => s.warnings.length > 0);
    if (lowScore.length > 0) {
      items.push({ type: 'warning', message: `${lowScore.length} ${lowScore.length === 1 ? 'story' : 'stories'} below readiness threshold (75)` });
    }
    if (withWarnings.length > 0) {
      items.push({ type: 'warning', message: `${withWarnings.length} ${withWarnings.length === 1 ? 'story has' : 'stories have'} quality warnings` });
    }
    const ready = stories.filter(s => s.readinessScore.total >= 90);
    if (ready.length > 0) {
      items.push({ type: 'success', message: `${ready.length} ${ready.length === 1 ? 'story' : 'stories'} ready for Jira` });
    }
    items.push({ type: 'action', message: 'Expand stories to review acceptance criteria' });
    items.push({ type: 'action', message: 'Address quality warnings before export' });
  }

  if (phase === 'quality') {
    const notReady = stories.filter(s => s.readinessScore.total < 75);
    if (notReady.length > 0) {
      items.push({ type: 'error', message: `${notReady.length} ${notReady.length === 1 ? 'story' : 'stories'} below quality threshold` });
    }
    items.push({ type: 'action', message: 'Apply suggested fixes to low-scoring stories' });
    items.push({ type: 'action', message: 'Send all ready stories to developer review' });
  }

  if (phase === 'devReview') {
    const pending = stories.filter(s => s.reviewStatus === 'pending').length;
    if (pending > 0) {
      items.push({ type: 'warning', message: `${pending} ${pending === 1 ? 'story' : 'stories'} awaiting developer input` });
    }
    const approved = stories.filter(s => s.reviewStatus === 'approved').length;
    if (approved > 0) {
      items.push({ type: 'success', message: `${approved} ${approved === 1 ? 'story' : 'stories'} approved` });
    }
    items.push({ type: 'action', message: 'Submit reviews for each story' });
    items.push({ type: 'action', message: 'Resolve clarification requests before export' });
  }

  if (phase === 'export') {
    const ready = stories.filter(s => s.readinessScore.total >= 90 || s.reviewStatus === 'approved').length;
    items.push({ type: 'success', message: `${ready} ${ready === 1 ? 'story' : 'stories'} ready for export` });
    const notReady = stories.length - ready;
    if (notReady > 0) {
      items.push({ type: 'warning', message: `${notReady} ${notReady === 1 ? 'story' : 'stories'} still need review` });
    }
    items.push({ type: 'action', message: 'Copy all Jira-ready stories to clipboard' });
    items.push({ type: 'action', message: 'Download JSON or CSV for your records' });
  }

  return items;
}

export function WorkflowWorkspace() {
  const [, params] = useRoute('/workspace/:id');
  const sessionId = params?.id;
  const { state, dispatch } = useSessionStore();
  const { toast } = useToast();

  const session = state.sessions.find(s => s.id === sessionId);
  const [activePhase, setActivePhase] = useState<Phase>(session?.currentPhase || 'clarification');

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-muted-foreground">Session not found.</div>
      </div>
    );
  }

  const epics = state.epics.filter(e => e.sessionId === session.id);
  const stories = state.stories.filter(s => s.sessionId === session.id);
  const questions = state.clarificationQuestions;
  const prdSections = state.prdSections;

  const advancePhase = (nextPhase: Phase) => {
    setActivePhase(nextPhase);
    dispatch({ type: 'SET_PHASE', payload: { sessionId: session.id, phase: nextPhase } });
    dispatch({
      type: 'UPDATE_SESSION', payload: {
        id: session.id,
        currentPhase: nextPhase,
        phases: { ...session.phases, [nextPhase]: 'in-progress' as const }
      }
    });
    toast({ title: 'Phase advanced', description: `Now in ${nextPhase} phase.` });
  };

  const completionCount = (() => {
    if (activePhase === 'clarification') {
      const answered = questions.filter(q => q.answer || q.skipped).length;
      return { done: answered, total: questions.length };
    }
    if (activePhase === 'prd') {
      const completed = prdSections.filter(s => s.complete).length;
      return { done: completed, total: prdSections.length };
    }
    if (activePhase === 'stories') {
      const ready = stories.filter(s => s.readinessScore.total >= 75).length;
      return { done: ready, total: stories.length };
    }
    if (activePhase === 'devReview') {
      const reviewed = stories.filter(s => s.reviewStatus !== 'pending').length;
      return { done: reviewed, total: stories.length };
    }
    return undefined;
  })();

  const guidanceItems = buildGuidanceItems(activePhase, session, questions, prdSections, stories);

  return (
    <div className="flex flex-col h-full -m-4 sm:-m-6 md:-m-8">
      {/* Phase tracker */}
      <PhaseTracker
        session={session}
        activePhase={activePhase}
        onPhaseClick={setActivePhase}
      />

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {activePhase === 'intake' && (
              <div className="text-center py-16">
                <div className="text-sm font-medium text-foreground mb-2">Intake Complete</div>
                <p className="text-xs text-muted-foreground mb-4">Your product input has been received. Proceed to the Clarification phase.</p>
                <button onClick={() => advancePhase('clarification')} className="text-xs text-primary hover:text-primary/80">
                  Go to Clarification →
                </button>
              </div>
            )}

            {activePhase === 'clarification' && (
              <ClarificationPanel
                questions={questions}
                onGeneratePRD={() => advancePhase('prd')}
              />
            )}

            {activePhase === 'prd' && (
              <PRDPanel
                sections={prdSections}
                onGenerateEpics={() => advancePhase('epics')}
              />
            )}

            {activePhase === 'epics' && (
              <EpicsPanel
                epics={epics}
                onGenerateStories={() => advancePhase('stories')}
              />
            )}

            {activePhase === 'stories' && (
              <StoriesPanel
                epics={epics}
                stories={stories}
                onSendToReview={(id) => toast({ title: 'Sent', description: `${id} added to review queue.` })}
                onGenerateQuality={() => advancePhase('quality')}
              />
            )}

            {activePhase === 'quality' && (
              <QualityReviewPanel
                stories={stories}
                epics={epics}
                onSendToDevReview={() => advancePhase('devReview')}
              />
            )}

            {activePhase === 'devReview' && (
              <DeveloperReviewPanel
                stories={stories}
                onComplete={() => advancePhase('export')}
              />
            )}

            {activePhase === 'export' && (
              <ExportPanel
                epics={epics}
                stories={stories}
              />
            )}
          </div>
        </div>

        {/* Guidance panel */}
        <div className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto">
          <GuidancePanel
            phase={activePhase}
            phaseStatus={session.phases[activePhase]}
            items={guidanceItems}
            completionCount={completionCount}
          />
        </div>
      </div>
    </div>
  );
}
