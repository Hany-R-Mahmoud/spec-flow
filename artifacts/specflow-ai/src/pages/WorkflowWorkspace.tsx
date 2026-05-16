import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useSessionStore } from '@/store/session-store';
import { Phase } from '@/lib/types';
import { PhaseTracker } from '@/components/workspace/PhaseTracker';
import { WorkflowStatusBar } from '@/components/workspace/WorkflowStatusBar';
import { type GuidanceItem } from '@/components/workspace/WorkflowStatusBar';
import { ClarificationPanel } from '@/components/workspace/ClarificationPanel';
import { PRDPanel } from '@/components/workspace/PRDPanel';
import { EpicsPanel } from '@/components/workspace/EpicsPanel';
import { StoriesPanel } from '@/components/workspace/StoriesPanel';
import { QualityReviewPanel } from '@/components/workspace/QualityReviewPanel';
import { DeveloperReviewPanel } from '@/components/workspace/DeveloperReviewPanel';
import { ExportPanel } from '@/components/workspace/ExportPanel';
import { useToast } from '@/hooks/use-toast';
import type { ClarificationQuestion, PRDSection, Story, ProjectSession } from '@/lib/types';
import { type StepSkillPhase } from '@/lib/step-skills';
import { useStepSkills } from '@/lib/step-skills';
import { StepSkillSidebar } from '@/components/workspace/StepSkillSidebar';
import { getAiProviderUiState } from '@/lib/ai-capability';

type GuidanceActions = {
  onGeneratePRD: () => void;
  onGenerateEpics: () => void;
  onGenerateStories: () => void;
  onGenerateQuality: () => void;
  onSendToDevReview: () => void;
  onCompleteReview: () => void;
};

type GenerationPhase = 'clarification' | 'prd' | 'epics' | 'stories' | 'quality';
type ManualNextPhase = Phase | null;

const generationFailureLabels: Record<GenerationPhase, string> = {
  clarification: 'clarification questions',
  prd: 'PRD sections',
  epics: 'epics',
  stories: 'user stories',
  quality: 'quality scores',
};

function formatGenerationFailure(error: unknown): string {
  const fallback = 'Generation failed before valid output could be saved.';
  if (!(error instanceof Error)) {
    return fallback;
  }

  return error.message.replace(/^HTTP \d+ [^:]+:\s*/, '').trim() || fallback;
}

const MANUAL_PHASE_FLOW: Record<GenerationPhase, ManualNextPhase> = {
  clarification: 'prd',
  prd: 'epics',
  epics: 'stories',
  stories: 'quality',
  quality: 'devReview',
};

function getManualNextPhase(phase: GenerationPhase): ManualNextPhase {
  return MANUAL_PHASE_FLOW[phase];
}



function buildGuidanceItems(
  phase: Phase,
  questions: ClarificationQuestion[],
  prdSections: PRDSection[],
  stories: Story[],
  actions: Partial<GuidanceActions>,
): GuidanceItem[] {
  const items: GuidanceItem[] = [];

  if (phase === 'clarification') {
    const unanswered = questions.filter((q) => q.required && !q.answer && !q.skipped);
    if (unanswered.length > 0) {
      items.push({ type: 'error', message: `${unanswered.length} required question${unanswered.length > 1 ? 's' : ''} unanswered` });
    }
    const skipped = questions.filter((q) => q.skipped);
    if (skipped.length > 0) {
      items.push({ type: 'warning', message: `${skipped.length} question${skipped.length > 1 ? 's' : ''} skipped — may reduce quality` });
    }
    if (unanswered.length === 0) {
      items.push({ type: 'success', message: 'All required questions answered. Ready to generate PRD.' });
      if (actions.onGeneratePRD) {
        items.push({ type: 'action', message: 'Generate PRD', onAction: actions.onGeneratePRD });
      }
    }
    items.push({ type: 'action', message: 'Answer remaining questions before generating PRD' });
    items.push({ type: 'action', message: 'Expand each section to see grouped questions' });
  }

  if (phase === 'prd') {
    const incomplete = prdSections.filter((section) => !section.complete);
    if (incomplete.length > 0) {
      items.push({ type: 'warning', message: `${incomplete.length} PRD section${incomplete.length > 1 ? 's' : ''} incomplete` });
    }
    if (incomplete.length === 0) {
      items.push({ type: 'success', message: 'All PRD sections complete. Ready to generate epics.' });
      if (actions.onGenerateEpics) {
        items.push({ type: 'action', message: 'Generate Epics', onAction: actions.onGenerateEpics });
      }
    }
    items.push({ type: 'action', message: 'Review each PRD section for accuracy' });
    items.push({ type: 'action', message: 'Edit sections by clicking "Edit" on any card' });
  }

  if (phase === 'epics') {
    items.push({ type: 'success', message: '4 epics generated from PRD requirements' });
    items.push({ type: 'action', message: 'Review epic scope and business objectives' });
    items.push({ type: 'action', message: 'Copy epic descriptions to Jira as needed' });
    if (actions.onGenerateStories) {
      items.push({ type: 'action', message: 'Generate Stories', onAction: actions.onGenerateStories });
    }
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
    if (actions.onGenerateQuality) {
      items.push({ type: 'action', message: 'Refresh Quality Scores', onAction: actions.onGenerateQuality });
    }
  }

  if (phase === 'quality') {
    const notReady = stories.filter(s => s.readinessScore.total < 75);
    if (notReady.length > 0) {
      items.push({ type: 'error', message: `${notReady.length} ${notReady.length === 1 ? 'story' : 'stories'} below quality threshold` });
    }
    items.push({ type: 'action', message: 'Apply suggested fixes to low-scoring stories' });
    if (actions.onSendToDevReview) {
      items.push({ type: 'action', message: 'Send All to Dev Review', onAction: actions.onSendToDevReview });
    }
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
    if (actions.onCompleteReview) {
      items.push({ type: 'action', message: 'Complete Review', onAction: actions.onCompleteReview });
    }
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
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/workspace/:id');
  const sessionId = params?.id;
  const { state, dispatch } = useSessionStore();

  const session = state.sessions.find(s => s.id === sessionId);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    dispatch({ type: 'SET_ACTIVE_SESSION', payload: sessionId });
  }, [sessionId]);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xs text-muted-foreground">Loading persisted workspace…</p>
      </div>
    );
  }

  if (state.error && !session) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xs text-[var(--color-danger)]">{state.error}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="max-w-md rounded-md border border-border bg-card p-6 text-center">
          <div className="text-sm font-semibold text-foreground">Session not found</div>
          <p className="mt-2 text-xs text-muted-foreground">
            This workspace no longer exists in local memory. Open another project or start a new breakdown.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setLocation('/projects')}
              className="rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Go to Projects
            </button>
            <button
              type="button"
              onClick={() => setLocation('/new')}
              className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              New Breakdown
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <WorkflowWorkspaceContent session={session} />;
}

function WorkflowWorkspaceContent({ session }: { session: ProjectSession }) {
  const [, setLocation] = useLocation();
  const { state, dispatch, runGeneration, saveWorkflowArtifacts, refreshAiCapability, cancelGeneration } = useSessionStore();
  const { toast } = useToast();
  const { skillsByPhase } = useStepSkills();
  const [activePhase, setActivePhase] = useState<Phase>(session.currentPhase || 'clarification');

  useEffect(() => {
    if (session.currentPhase) {
      setActivePhase(session.currentPhase);
    }
  }, [session.currentPhase]);

  const epics = state.epics.filter(e => e.sessionId === session.id);
  const stories = state.stories.filter(s => s.sessionId === session.id);
  const questions = state.clarificationQuestions;
  const prdSections = state.prdSections;
  const isWorkflowGenerating = (Object.values(session.generation) as Array<{ status: string }>).some(
    (step) => step.status === 'running',
  );

  // Derive which phase is currently generating (for PhaseTracker indicator)
  const generatingPhase: Phase | null = (() => {
    const steps = ['clarification', 'prd', 'epics', 'stories', 'quality'] as const;
    for (const step of steps) {
      if (session.generation[step].status === 'running') return step as Phase;
    }
    return null;
  })();

  const handleCancel = useCallback(() => {
    cancelGeneration();
    toast({ title: 'Generation cancelled', description: 'The AI request was stopped.' });
  }, [cancelGeneration, toast]);

  const advancePhase = useCallback((nextPhase: Phase) => {
    setActivePhase(nextPhase);
    dispatch({ type: 'SET_PHASE', payload: { sessionId: session.id, phase: nextPhase } });
    toast({ title: 'Phase updated', description: `Current phase: ${nextPhase}.` });
  }, [dispatch, session.id, toast]);

  const handleSendStoryToReview = async (storyId: string) => {
    const targetStory = stories.find((story) => story.id === storyId);
    if (!targetStory) {
      return;
    }

    const nextStories = stories.map((story) =>
      story.id === storyId
        ? {
            ...story,
            reviewStatus: 'pending' as const,
            developerReview: undefined,
          }
        : story,
    );
    const savedSession = await saveWorkflowArtifacts({ stories: nextStories });

    if (!savedSession) {
      toast({
        title: 'Send to review failed',
        description: 'Could not update the review queue. Try again.',
      });
      return;
    }

    toast({
      title: 'Sent to review',
      description: `${targetStory.id} added to developer review queue.`,
    });
  };

  const handleSplitStory = async (storyId: string) => {
    const sourceStory = stories.find((story) => story.id === storyId);
    if (!sourceStory) {
      return;
    }

    const sourceEpic = epics.find((epic) => epic.id === sourceStory.epicId);
    const splitIndex = stories.filter((story) => story.id.startsWith(`${sourceStory.id}-split-`)).length + 1;
    const splitStoryId = `${sourceStory.id}-split-${splitIndex}`;
    const midpoint = Math.max(1, Math.ceil(sourceStory.acceptanceCriteria.length / 2));
    const primaryCriteria = sourceStory.acceptanceCriteria.slice(0, midpoint);
    const splitCriteria = sourceStory.acceptanceCriteria.slice(midpoint);
    const nextSourceCriteria =
      splitCriteria.length > 0 ? primaryCriteria : sourceStory.acceptanceCriteria.slice(0, 1);
    const nextSplitCriteria =
      splitCriteria.length > 0
        ? splitCriteria
        : [`Complete the remaining scope for ${sourceStory.title}`];

    const resetReadinessScore = (): Story['readinessScore'] => ({
      total: 0,
      clarity: 0,
      acceptanceCriteria: 0,
      businessAlignment: 0,
      technicalFeasibility: 0,
      testability: 0,
      edgeCasesErrorHandling: 0,
      dependenciesDesignLocalization: 0,
      label: 'Not ready',
    });

    const splitWarning = (storyIdValue: string) => [
      {
        id: `${storyIdValue}-warning-split`,
        type: 'split-story',
        message: 'Story was split. Run quality review again before export.',
        severity: 'warning' as const,
      },
    ];

    const nextSourceStory: Story = {
      ...sourceStory,
      title: `${sourceStory.title} (Part 1)`,
      userStory: `${sourceStory.userStory} (part 1)`,
      description: `${sourceStory.description}\n\nSplit focus: ${nextSourceCriteria.join(' · ')}`,
      acceptanceCriteria: nextSourceCriteria,
      reviewStatus: 'pending',
      developerReview: undefined,
      readinessScore: resetReadinessScore(),
      warnings: splitWarning(sourceStory.id),
    };

    const nextSplitStory: Story = {
      ...sourceStory,
      id: splitStoryId,
      title: `${sourceStory.title} (Part 2)`,
      userStory: `${sourceStory.userStory} (part 2)`,
      description: `${sourceStory.description}\n\nSplit focus: ${nextSplitCriteria.join(' · ')}`,
      acceptanceCriteria: nextSplitCriteria,
      reviewStatus: 'pending',
      developerReview: undefined,
      readinessScore: resetReadinessScore(),
      warnings: splitWarning(splitStoryId),
    };

    const nextStories = stories.flatMap((story) =>
      story.id === sourceStory.id ? [nextSourceStory, nextSplitStory] : [story],
    );
    const nextEpics = epics.map((epic) =>
      epic.id === sourceStory.epicId
        ? { ...epic, storyCount: nextStories.filter((story) => story.epicId === epic.id).length }
        : epic,
    );

    const savedSession = await saveWorkflowArtifacts({
      stories: nextStories,
      epics: nextEpics,
    });

    if (!savedSession) {
      toast({
        title: 'Split failed',
        description: 'Could not split the story. Try again.',
      });
      return;
    }

    toast({
      title: 'Story split',
      description: sourceEpic
        ? `${sourceStory.id} split under ${sourceEpic.title}.`
        : `${sourceStory.id} split into two stories.`,
    });
  };

  const completionBlocker = (() => {
    const pending = stories.filter((story) => story.reviewStatus === 'pending').length;
    if (pending > 0) {
      return `${pending} ${pending > 1 ? 'stories are' : 'story is'} still in the review queue.`;
    }

    const unresolvedPm = stories.filter(
      (story) => story.developerReview && story.developerReview.pmRevisionStatus !== 'resolved',
    ).length;
    if (unresolvedPm > 0) {
      return `${unresolvedPm} ${unresolvedPm > 1 ? 'stories' : 'story'} still need PM revision resolution.`;
    }

    if (stories.length === 0) {
      return 'No stories available for review yet.';
    }

    return null;
  })();

  const canCompleteReview = completionBlocker === null;
  const handleCompleteReview = useCallback(() => {
    if (!canCompleteReview) {
      toast({
        title: 'Review not complete',
        description: completionBlocker || 'Resolve all review blockers first.',
      });
      return;
    }

    advancePhase('export');
  }, [advancePhase, canCompleteReview, completionBlocker, toast]);

  const handleGeneration = useCallback(async (step: GenerationPhase) => {
    if (isWorkflowGenerating) {
      return;
    }

    const capability = state.aiCapability;
    if (!capability?.canGenerate) {
      const nextPhase = getManualNextPhase(activePhase);
      if (nextPhase) {
        advancePhase(nextPhase);
      }

      toast({
        title: 'Manual mode',
        description: nextPhase
          ? `Moved to ${nextPhase}. Continued without AI generation.`
          : 'Continued without AI generation.',
      });
      return;
    }

    try {
      const updatedSession = await runGeneration(session.id, step);

      if (!updatedSession) {
        const latestCapability = await refreshAiCapability();
        const latestProviderUi = getAiProviderUiState(latestCapability);

        if (latestProviderUi.isAiEnabled) {
          toast({
            title: 'Generation failed',
            description: 'The previous saved output was preserved. Review the status message and retry when ready.',
          });
          return;
        }

        const nextPhase = getManualNextPhase(activePhase);
        if (nextPhase) {
          advancePhase(nextPhase);
        }

        toast({
          title: latestProviderUi.label,
          description: `${latestCapability?.reason ?? latestProviderUi.helperText} Continued without AI generation.`,
        });
        return;
      }

      const phaseMap = {
        clarification: 'clarification',
        prd: 'prd',
        epics: 'epics',
        stories: 'stories',
        quality: 'quality',
      } as const;

      setActivePhase(phaseMap[step]);
      toast({
        title: step === 'quality' ? 'Quality refreshed' : 'Generation complete',
        description: 'Workflow output generated and saved.',
      });
    } catch (error) {
      toast({
        title: `Could not generate ${generationFailureLabels[step]}`,
        description: formatGenerationFailure(error),
      });
    }
  }, [activePhase, advancePhase, isWorkflowGenerating, refreshAiCapability, runGeneration, session.id, state.aiCapability, toast]);

  const guidanceItems: GuidanceItem[] = useMemo(() => {
    // Sidebar only handles navigation/phase transitions — never AI generation.
    // Generation is triggered exclusively from the main panel action bars.
    const callbacks: Partial<GuidanceActions> = {
      onSendToDevReview: () => advancePhase('devReview'),
      onCompleteReview: handleCompleteReview,
    };

    return buildGuidanceItems(activePhase, questions, prdSections, stories, callbacks);
  }, [
    activePhase,
    advancePhase,
    handleCompleteReview,
    questions,
    prdSections,
    stories,
  ]);

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

  const clarificationBusy = session.generation.clarification.status === 'running';
  const prdBusy = session.generation.prd.status === 'running';
  const epicsBusy = session.generation.epics.status === 'running';
  const storiesBusy = session.generation.stories.status === 'running';
  const qualityBusy = session.generation.quality.status === 'running';

  return (
    <div className="flex flex-col h-full -m-4 sm:-m-6 md:-m-8">
      {/* Phase tracker */}
      <PhaseTracker
        session={session}
        activePhase={activePhase}
        onPhaseClick={advancePhase}
        generatingPhase={generatingPhase}
      />

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content — guidance integrated inline */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Inline status + guidance */}
            <WorkflowStatusBar
              phase={activePhase}
              phaseStatus={session.phases[activePhase]}
              items={guidanceItems}
              completionCount={completionCount}
              isGenerating={isWorkflowGenerating}
              generatingLabel={generatingPhase ? `Generating ${generatingPhase}…` : undefined}
            />

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
              generationStep={session.generation.clarification}
              onGenerateClarification={() => void handleGeneration('clarification')}
              onGeneratePRD={() => void handleGeneration('prd')}
              isAiBusy={clarificationBusy}
              onCancel={handleCancel}
            />
            )}

            {activePhase === 'prd' && (
            <PRDPanel
              sections={prdSections}
              generationStep={session.generation.prd}
              onGeneratePRD={() => void handleGeneration('prd')}
              onGenerateEpics={() => void handleGeneration('epics')}
              isAiBusy={prdBusy}
              onCancel={handleCancel}
            />
            )}

            {activePhase === 'epics' && (
            <EpicsPanel
              epics={epics}
              generationStep={session.generation.epics}
              onGenerateEpics={() => void handleGeneration('epics')}
              onGenerateStories={() => void handleGeneration('stories')}
              isAiBusy={epicsBusy}
              onCancel={handleCancel}
            />
            )}

            {activePhase === 'stories' && (
            <StoriesPanel
              epics={epics}
              stories={stories}
              onSendToReview={handleSendStoryToReview}
              generationStep={session.generation.stories}
              onGenerateStories={() => void handleGeneration('stories')}
              onGenerateQuality={() => void handleGeneration('quality')}
              isAiBusy={storiesBusy}
              onCancel={handleCancel}
            />
            )}

            {activePhase === 'quality' && (
            <QualityReviewPanel
              stories={stories}
              epics={epics}
              generationStep={session.generation.quality}
              onGenerateQuality={() => void handleGeneration('quality')}
              isAiBusy={qualityBusy}
              onCancel={handleCancel}
              onSendToDevReview={async () => {
                const queuedStories = stories.map((story) => ({
                  ...story,
                  reviewStatus: 'pending' as const,
                  developerReview: undefined,
                }));
                const savedSession = await saveWorkflowArtifacts({ stories: queuedStories });

                if (!savedSession) {
                  toast({
                    title: 'Handoff failed',
                    description: 'Could not save the developer review queue.',
                  });
                  return;
                }

                advancePhase('devReview');
              }}
              onSplitStory={handleSplitStory}
            />
          )}

            {activePhase === 'devReview' && (
              <DeveloperReviewPanel
                stories={stories}
                onComplete={handleCompleteReview}
                canCompleteReview={canCompleteReview}
                completionBlocker={completionBlocker}
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

        {/* Step skill sidebar — shows the active skill for the current phase */}
        {(activePhase === 'clarification' || activePhase === 'prd' || activePhase === 'epics' || activePhase === 'stories' || activePhase === 'quality' || activePhase === 'export') && (
          <div className="w-64 flex-shrink-0 hidden lg:block overflow-y-auto">
            <StepSkillSidebar
              phase={activePhase}
              skill={skillsByPhase[activePhase]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
