import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
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
import type { GuidanceItem } from '@/components/workspace/GuidancePanel';
import type { ClarificationQuestion, PRDSection, ProjectSession, Story } from '@/lib/types';
import { type StepSkillPhase } from '@/lib/step-skills';
import { useStepSkills, type StepSkill } from '@/lib/step-skills';
import { getAiProviderUiState } from '@/lib/ai-capability';
import { getWorkflowGuidance, type AiGuidanceItem, type GuidanceActionKey } from '@workspace/api-client-react';

type GuidanceActions = {
  onGeneratePRD: () => void;
  onGenerateEpics: () => void;
  onGenerateStories: () => void;
  onGenerateQuality: () => void;
  onSendToDevReview: () => void;
  onCompleteReview: () => void;
  onEditStepSkill?: (phase: StepSkillPhase) => void;
};

type GenerationPhase = 'clarification' | 'prd' | 'epics' | 'stories' | 'quality';

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

function resolveStepSkillPhase(phase: Phase): StepSkillPhase {
  if (
    phase === 'clarification' ||
    phase === 'prd' ||
    phase === 'epics' ||
    phase === 'stories' ||
    phase === 'quality' ||
    phase === 'export'
  ) {
    return phase;
  }

  return phase === 'devReview' ? 'quality' : 'clarification';
}

function toSkillSnapshot(skill: StepSkill): {
  id: string;
  phase: StepSkillPhase;
  name: string;
  version: number;
  source: 'default' | 'custom';
  content: string;
} {
  return {
    id: skill.id,
    phase: skill.phase,
    name: skill.name,
    version: skill.version,
    source: skill.source,
    content: skill.content,
  };
}

function buildGuidanceSnapshot(
  session: ProjectSession,
  activePhase: Phase,
  skillsByPhase: Record<string, StepSkill>,
): string {
  return JSON.stringify({
    sessionId: session.id,
    phase: activePhase,
    phaseStatus: session.phases[activePhase],
    session: {
      name: session.name,
      inputType: session.inputType,
      outputDepth: session.outputDepth,
      jiraKey: session.jiraKey,
      targetUsers: session.targetUsers,
      businessGoal: session.businessGoal,
      knownConstraints: session.knownConstraints,
      labels: session.labels,
      rawInput: session.rawInput,
    },
    flowSummary: {
      sessionId: session.id,
      sessionName: session.name,
      currentPhase: session.currentPhase,
      phaseStatuses: session.phases,
      clarificationQuestions: session.clarificationQuestions,
      prdSections: session.prdSections,
      epics: session.epics,
      stories: session.stories,
    },
    stepSkills: Object.values(skillsByPhase).map(toSkillSnapshot),
  });
}

function mapGuidanceItem(
  item: AiGuidanceItem,
  phase: Phase,
  actions: Partial<GuidanceActions>,
): GuidanceItem {
  const actionMap: Record<GuidanceActionKey, (() => void) | undefined> = {
    'generate-prd': actions.onGeneratePRD,
    'generate-epics': actions.onGenerateEpics,
    'generate-stories': actions.onGenerateStories,
    'generate-quality': actions.onGenerateQuality,
    'send-to-dev-review': actions.onSendToDevReview,
    'complete-review': actions.onCompleteReview,
    'edit-step-skill': () => {},
  };

  const onAction =
    item.actionKey === 'edit-step-skill'
      ? () => actions.onEditStepSkill?.(resolveStepSkillPhase(phase))
      : item.actionKey
        ? actionMap[item.actionKey]
        : undefined;

  return {
    type: item.type,
    message: item.message,
    onAction: onAction ?? undefined,
  };
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
  const { state, dispatch, runGeneration, saveWorkflowArtifacts, refreshAiCapability } = useSessionStore();
  const { skillsByPhase } = useStepSkills();
  const { toast } = useToast();
  const aiCapability = state.aiCapability;
  const providerUi = getAiProviderUiState(aiCapability);
  const canGenerate = providerUi.isAiEnabled;
  const canEditSkills = providerUi.canEditSkills;
  const [activePhase, setActivePhase] = useState<Phase>(session.currentPhase || 'clarification');
  const [guidanceItems, setGuidanceItems] = useState<GuidanceItem[]>([]);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const guidanceCacheRef = useRef(new Map<string, GuidanceItem[]>());

  useEffect(() => {
    if (session.currentPhase) {
      setActivePhase(session.currentPhase);
    }
  }, [session.currentPhase]);

  const epics = state.epics.filter(e => e.sessionId === session.id);
  const stories = state.stories.filter(s => s.sessionId === session.id);
  const questions = state.clarificationQuestions;
  const prdSections = state.prdSections;
  const isWorkflowGenerating = Object.values(session.generation).some(
    (step) => step.status === 'running',
  );

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

        if (step !== 'clarification') {
          const nextPhase =
            step === 'prd'
              ? 'prd'
              : step === 'epics'
                ? 'epics'
                : step === 'stories'
                  ? 'stories'
                  : 'quality';

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
  }, [advancePhase, isWorkflowGenerating, refreshAiCapability, runGeneration, session.id, toast]);

  const handleEditSkill = useCallback((phase: StepSkillPhase) => {
    setLocation(`/settings?step-skill=${phase}`);
  }, [setLocation]);

  const guidanceSnapshotKey = buildGuidanceSnapshot(session, activePhase, skillsByPhase);

  useEffect(() => {
    const callbacks = {
      onGeneratePRD: () => void handleGeneration('prd'),
      onGenerateEpics: () => void handleGeneration('epics'),
      onGenerateStories: () => void handleGeneration('stories'),
      onGenerateQuality: () => void handleGeneration('quality'),
      onSendToDevReview: () => advancePhase('devReview'),
      onCompleteReview: handleCompleteReview,
      onEditStepSkill: handleEditSkill,
    };

    if (!canGenerate) {
      setGuidanceItems(buildGuidanceItems(activePhase, questions, prdSections, session.stories, callbacks));
      setGuidanceLoading(false);
      return;
    }

    const cachedGuidance = guidanceCacheRef.current.get(guidanceSnapshotKey);
    if (cachedGuidance) {
      setGuidanceItems(cachedGuidance);
      setGuidanceLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const loadGuidance = async () => {
      setGuidanceLoading(true);

      try {
        const response = await getWorkflowGuidance(
          session.id,
          {
            phase: activePhase,
            phaseStatus: session.phases[activePhase],
            session: {
              name: session.name,
              inputType: session.inputType,
              outputDepth: session.outputDepth,
              jiraKey: session.jiraKey,
              targetUsers: session.targetUsers,
              businessGoal: session.businessGoal,
              knownConstraints: session.knownConstraints,
              labels: session.labels,
              rawInput: session.rawInput,
            },
            flowSummary: {
              sessionId: session.id,
              sessionName: session.name,
              currentPhase: session.currentPhase,
              phaseStatuses: session.phases,
              clarificationQuestions: questions,
              prdSections,
              epics,
              stories,
            },
            stepSkills: Object.values(skillsByPhase).map(toSkillSnapshot),
          },
          { signal: controller.signal },
        );

        if (cancelled || controller.signal.aborted) {
          return;
        }

        const nextItems = response.items.map((item) => mapGuidanceItem(item, activePhase, callbacks));
        guidanceCacheRef.current.set(guidanceSnapshotKey, nextItems);
        setGuidanceItems(nextItems);
      } catch (error) {
        if (!cancelled && !controller.signal.aborted) {
          setGuidanceItems(buildGuidanceItems(activePhase, questions, prdSections, stories, callbacks));
        }
      } finally {
        if (!cancelled && !controller.signal.aborted) {
          setGuidanceLoading(false);
        }
      }
    };

    void loadGuidance();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    guidanceSnapshotKey,
    activePhase,
    canGenerate,
    handleGeneration,
    handleCompleteReview,
    handleEditSkill,
    questions,
    prdSections,
    epics,
    stories,
    session.id,
    session.currentPhase,
    session.name,
    session.inputType,
    session.outputDepth,
    session.jiraKey,
    session.targetUsers,
    session.businessGoal,
    session.knownConstraints,
    session.labels,
    session.rawInput,
    session.phases,
    skillsByPhase,
    session.stories,
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

  const clarificationBusy =
    session.generation.clarification.status === 'running' ||
    session.generation.prd.status === 'running';
  const prdBusy =
    session.generation.prd.status === 'running' ||
    session.generation.epics.status === 'running';
  const epicsBusy =
    session.generation.epics.status === 'running' ||
    session.generation.stories.status === 'running';
  const storiesBusy =
    session.generation.stories.status === 'running' ||
    session.generation.quality.status === 'running';
  const qualityBusy = session.generation.quality.status === 'running';

  return (
    <div className="flex flex-col h-full -m-4 sm:-m-6 md:-m-8">
      {/* Phase tracker */}
      <PhaseTracker
        session={session}
        activePhase={activePhase}
        onPhaseClick={advancePhase}
        onEditSkill={handleEditSkill}
        canEditSkills={canEditSkills}
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
              generationStep={session.generation.clarification}
              onGenerateClarification={() => void handleGeneration('clarification')}
              onGeneratePRD={() => void handleGeneration('prd')}
              isAiBusy={clarificationBusy}
            />
            )}

            {activePhase === 'prd' && (
            <PRDPanel
              sections={prdSections}
              generationStep={session.generation.prd}
              onGeneratePRD={() => void handleGeneration('prd')}
              onGenerateEpics={() => void handleGeneration('epics')}
              isAiBusy={prdBusy}
            />
            )}

            {activePhase === 'epics' && (
            <EpicsPanel
              epics={epics}
              generationStep={session.generation.epics}
              onGenerateEpics={() => void handleGeneration('epics')}
              onGenerateStories={() => void handleGeneration('stories')}
              isAiBusy={epicsBusy}
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
            />
            )}

            {activePhase === 'quality' && (
            <QualityReviewPanel
              stories={stories}
              epics={epics}
              generationStep={session.generation.quality}
              onGenerateQuality={() => void handleGeneration('quality')}
              isAiBusy={qualityBusy}
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

        {/* Guidance panel */}
        <div className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto">
          <GuidancePanel
            phase={activePhase}
            phaseStatus={session.phases[activePhase]}
            items={guidanceItems}
            isLoading={guidanceLoading}
            loadingLabel={canGenerate ? 'Updating guidance...' : 'Showing manual guidance...'}
            completionCount={completionCount}
          />
        </div>
      </div>
    </div>
  );
}
