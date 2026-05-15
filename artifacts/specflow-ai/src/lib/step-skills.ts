import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Phase } from '@/lib/types';

export type StepSkillPhase = Extract<
  Phase,
  'clarification' | 'prd' | 'epics' | 'stories' | 'quality' | 'export'
>;

export type StepSkill = {
  id: string;
  phase: StepSkillPhase;
  name: string;
  version: number;
  source: 'default' | 'custom';
  content: string;
  updatedAt: string;
};

export type StepSkillSnapshot = Pick<
  StepSkill,
  'id' | 'phase' | 'name' | 'version' | 'source' | 'content'
>;

export type StepSkillState = {
  customSkills: Partial<Record<StepSkillPhase, StepSkill>>;
  assignedSkillIds: Partial<Record<StepSkillPhase, string>>;
};

export const STEP_SKILL_PHASES: Array<{ phase: StepSkillPhase; label: string }> = [
  { phase: 'clarification', label: 'Clarification' },
  { phase: 'prd', label: 'PRD' },
  { phase: 'epics', label: 'Epics' },
  { phase: 'stories', label: 'Stories' },
  { phase: 'quality', label: 'Quality' },
  { phase: 'export', label: 'Export' },
];

const STORAGE_KEY = 'specflow.stepSkills.v1';

const DEFAULT_SKILL_CONTENT: Record<StepSkillPhase, string> = {
  clarification: `# Clarification Skill

## Purpose
Identify missing product decisions before generation.

## Inputs
- rough input
- imported content
- business goal
- target users
- constraints

## Process Rules
- Ask specific, actionable questions.
- Avoid repeating answers already present in imported content.
- Mark uncertain facts as Unknown / verify.

## Output Contract
- grouped questions
- required flag
- short reason for each question

## Quality Checks
- missing user
- unclear scope
- missing success measure
- hidden dependency`,
  prd: `# PRD Skill

## Purpose
Turn clarified input into review-ready PRD sections.

## Inputs
- rough input
- clarification answers
- imported PRD sections

## Process Rules
- Preserve user-provided decisions unless contradicted.
- Keep assumptions visible.
- Use concise product language.

## Output Contract
- problem statement
- target users
- scope
- requirements
- risks and unknowns

## Quality Checks
- missing owner
- vague scope
- missing success criteria
- unverified technical constraint`,
  epics: `# Epics Skill

## Purpose
Group PRD requirements into bounded delivery epics.

## Inputs
- PRD sections
- imported epics
- constraints

## Process Rules
- Keep epics outcome-oriented.
- Avoid duplicate scope.
- Surface dependencies and risks.

## Output Contract
- title
- business objective
- scope summary
- linked PRD requirements
- priority
- risks

## Quality Checks
- epic too broad
- unclear business objective
- missing dependency`,
  stories: `# Stories Skill

## Purpose
Create implementation-ready stories from epics.

## Inputs
- epics
- PRD sections
- imported stories
- labels and components

## Process Rules
- Use user-story format when useful.
- Make acceptance criteria testable.
- Preserve imported stories unless regenerate is requested.

## Output Contract
- title
- user story
- description
- acceptance criteria
- priority
- labels
- technical notes
- open questions

## Quality Checks
- missing acceptance criteria
- story too large
- unclear actor
- missing edge cases`,
  quality: `# Quality Skill

## Purpose
Review stories before developer handoff and export.

## Inputs
- stories
- epics
- PRD sections
- quality threshold

## Process Rules
- Score stories against readiness criteria.
- Flag gaps with actionable warnings.
- Do not hide unresolved unknowns.

## Output Contract
- readiness score
- warnings
- review recommendation

## Quality Checks
- vague acceptance criteria
- missing technical feasibility
- missing QA notes
- unresolved dependency`,
  export: `# Export Skill

## Purpose
Prepare reviewed stories for external handoff.

## Inputs
- approved stories
- export target
- Jira/GitHub settings

## Process Rules
- Preserve story structure.
- Show export blockers before handoff.
- Keep external mappings explicit.

## Output Contract
- export-ready story body
- labels
- components
- warnings
- target mapping notes

## Quality Checks
- missing title
- missing acceptance criteria
- unresolved review status
- target mapping gap`,
};

export const DEFAULT_STEP_SKILLS: Record<StepSkillPhase, StepSkill> =
  STEP_SKILL_PHASES.reduce((acc, { phase }) => {
    acc[phase] = {
      id: `${phase}-default`,
      phase,
      name: `${phase[0]?.toUpperCase()}${phase.slice(1)} Default Skill`,
      version: 1,
      source: 'default',
      content: DEFAULT_SKILL_CONTENT[phase],
      updatedAt: '2026-05-15T00:00:00.000Z',
    };
    return acc;
  }, {} as Record<StepSkillPhase, StepSkill>);

function emptyState(): StepSkillState {
  return {
    customSkills: {},
    assignedSkillIds: {},
  };
}

function parseStoredState(raw: string | null): StepSkillState {
  if (!raw) {
    return emptyState();
  }

  try {
    const parsed = JSON.parse(raw) as StepSkillState;
    return {
      customSkills: parsed.customSkills ?? {},
      assignedSkillIds: parsed.assignedSkillIds ?? {},
    };
  } catch {
    return emptyState();
  }
}

export function getStepSkillSnapshotForPhase(
  phase: StepSkillPhase,
): StepSkillSnapshot {
  if (typeof window === 'undefined') {
    const fallback = DEFAULT_STEP_SKILLS[phase];
    return {
      id: fallback.id,
      phase: fallback.phase,
      name: fallback.name,
      version: fallback.version,
      source: fallback.source,
      content: fallback.content,
    };
  }

  const state = parseStoredState(window.localStorage.getItem(STORAGE_KEY));
  const customSkill = state.customSkills[phase];
  const assignedId = state.assignedSkillIds[phase];
  const skill =
    customSkill && assignedId === customSkill.id
      ? customSkill
      : DEFAULT_STEP_SKILLS[phase];

  return {
    id: skill.id,
    phase: skill.phase,
    name: skill.name,
    version: skill.version,
    source: skill.source,
    content: skill.content,
  };
}

export function validateStepSkill(content: string): string[] {
  const warnings: string[] = [];

  if (content.trim().length < 120) {
    warnings.push('Skill is short. Add process rules and output contract.');
  }

  if (!/output contract/i.test(content)) {
    warnings.push('Missing Output Contract section.');
  }

  if (!/quality checks/i.test(content)) {
    warnings.push('Missing Quality Checks section.');
  }

  if (/\b(ignore|bypass|disable)\b.+\b(system|security|auth|permission)\b/i.test(content)) {
    warnings.push('Risky instruction detected. Review security boundaries.');
  }

  return warnings;
}

export function useStepSkills() {
  const [state, setState] = useState<StepSkillState>(() => {
    if (typeof window === 'undefined') {
      return emptyState();
    }

    return parseStoredState(window.localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getSkill = useCallback(
    (phase: StepSkillPhase): StepSkill => {
      const customSkill = state.customSkills[phase];
      const assignedId = state.assignedSkillIds[phase];

      if (customSkill && assignedId === customSkill.id) {
        return customSkill;
      }

      return DEFAULT_STEP_SKILLS[phase];
    },
    [state.assignedSkillIds, state.customSkills],
  );

  const saveCustomSkill = useCallback(
    (phase: StepSkillPhase, input: { name: string; content: string }) => {
      setState((current) => {
        const previous = current.customSkills[phase];
        const skill: StepSkill = {
          id: previous?.id ?? `${phase}-custom`,
          phase,
          name: input.name.trim() || `${DEFAULT_STEP_SKILLS[phase].name} Copy`,
          version: (previous?.version ?? 1) + 1,
          source: 'custom',
          content: input.content,
          updatedAt: new Date().toISOString(),
        };

        return {
          customSkills: {
            ...current.customSkills,
            [phase]: skill,
          },
          assignedSkillIds: {
            ...current.assignedSkillIds,
            [phase]: skill.id,
          },
        };
      });
    },
    [],
  );

  const duplicateDefaultSkill = useCallback((phase: StepSkillPhase) => {
    const base = DEFAULT_STEP_SKILLS[phase];
    saveCustomSkill(phase, {
      name: `${base.name} Copy`,
      content: base.content,
    });
  }, [saveCustomSkill]);

  const assignDefaultSkill = useCallback((phase: StepSkillPhase) => {
    setState((current) => ({
      ...current,
      assignedSkillIds: {
        ...current.assignedSkillIds,
        [phase]: DEFAULT_STEP_SKILLS[phase].id,
      },
    }));
  }, []);

  const resetCustomSkill = useCallback((phase: StepSkillPhase) => {
    setState((current) => {
      const nextCustomSkills = { ...current.customSkills };
      delete nextCustomSkills[phase];

      return {
        customSkills: nextCustomSkills,
        assignedSkillIds: {
          ...current.assignedSkillIds,
          [phase]: DEFAULT_STEP_SKILLS[phase].id,
        },
      };
    });
  }, []);

  const skillsByPhase = useMemo(
    () =>
      STEP_SKILL_PHASES.reduce((acc, { phase }) => {
        acc[phase] = getSkill(phase);
        return acc;
      }, {} as Record<StepSkillPhase, StepSkill>),
    [getSkill],
  );

  return {
    state,
    skillsByPhase,
    getSkill,
    saveCustomSkill,
    duplicateDefaultSkill,
    assignDefaultSkill,
    resetCustomSkill,
  };
}
