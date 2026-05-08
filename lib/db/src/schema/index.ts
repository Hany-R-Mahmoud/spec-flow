import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const phaseSchema = z.enum([
  "intake",
  "clarification",
  "prd",
  "epics",
  "stories",
  "quality",
  "devReview",
  "export",
]);

export const phaseStatusSchema = z.enum([
  "not-started",
  "in-progress",
  "complete",
  "needs-attention",
]);

export const phasesRecordSchema = z.record(phaseSchema, phaseStatusSchema);

export const reviewStatusSchema = z.enum([
  "pending",
  "approved",
  "needs-clarification",
  "too-large",
  "technically-risky",
  "blocked",
  "missing-ac",
]);

export const prioritySchema = z.enum(["P0", "P1", "P2", "P3"]);
export const epicPrioritySchema = z.enum(["P0", "P1", "P2"]);

export const readinessLabelSchema = z.enum([
  "Ready for Jira",
  "Minor review needed",
  "Needs PM refinement",
  "Not ready",
]);

export const warningSeveritySchema = z.enum(["error", "warning", "info"]);
export const exportFormatSchema = z.enum(["markdown", "csv", "json"]);
export const exportStatusSchema = z.enum(["complete", "partial", "draft"]);
export const pmRevisionStatusSchema = z.enum([
  "not-started",
  "in-progress",
  "resolved",
]);
export const generationModeSchema = z.enum(["demo", "live", "unavailable"]);
export const generationStatusSchema = z.enum([
  "idle",
  "running",
  "succeeded",
  "failed",
  "unavailable",
]);
export const generationStepSchema = z.object({
  status: generationStatusSchema,
  mode: generationModeSchema,
  promptVersion: z.string(),
  updatedAt: z.iso.datetime().nullable(),
  errorMessage: z.string().nullable(),
});
export const workflowGenerationSchema = z.object({
  clarification: generationStepSchema,
  prd: generationStepSchema,
  epics: generationStepSchema,
  stories: generationStepSchema,
  quality: generationStepSchema,
});
export const workflowArtifactsMetadataSchema = z.object({
  generation: workflowGenerationSchema,
});

export const clarificationQuestionSchema = z.object({
  id: z.string(),
  group: z.string(),
  text: z.string(),
  required: z.boolean(),
  answer: z.string(),
  skipped: z.boolean(),
});

export const prdSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  complete: z.boolean(),
  order: z.number().int(),
});

export const readinessScoreSchema = z.object({
  total: z.number().int(),
  clarity: z.number().int(),
  acceptanceCriteria: z.number().int(),
  businessAlignment: z.number().int(),
  technicalFeasibility: z.number().int(),
  testability: z.number().int(),
  edgeCasesErrorHandling: z.number().int(),
  dependenciesDesignLocalization: z.number().int(),
  label: readinessLabelSchema,
});

export const qualityWarningSchema = z.object({
  id: z.string(),
  type: z.string(),
  message: z.string(),
  severity: warningSeveritySchema,
});

export const developerReviewSchema = z.object({
  status: reviewStatusSchema,
  comment: z.string(),
  reviewerName: z.string(),
  timestamp: z.iso.datetime(),
  pmRevisionStatus: pmRevisionStatusSchema,
});

export const epicSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  title: z.string(),
  businessObjective: z.string(),
  scopeSummary: z.string(),
  prdRequirements: z.array(z.string()),
  priority: epicPrioritySchema,
  dependencies: z.array(z.string()),
  risks: z.array(z.string()),
  jiraEpicDescription: z.string(),
  storyCount: z.number().int(),
});

export const storySchema = z.object({
  id: z.string(),
  epicId: z.string(),
  sessionId: z.string(),
  title: z.string(),
  userStory: z.string(),
  description: z.string(),
  acceptanceCriteria: z.array(z.string()),
  priority: prioritySchema,
  labels: z.array(z.string()),
  components: z.array(z.string()),
  dependencies: z.array(z.string()),
  edgeCases: z.array(z.string()),
  errorHandling: z.string(),
  localizationNotes: z.string(),
  designNotes: z.string(),
  analyticsNotes: z.string(),
  qaNotes: z.string(),
  technicalNotes: z.string(),
  openQuestions: z.array(z.string()),
  readinessScore: readinessScoreSchema,
  warnings: z.array(qualityWarningSchema),
  reviewStatus: reviewStatusSchema,
  developerReview: developerReviewSchema.optional(),
});

export const exportPackageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  sessionName: z.string(),
  date: z.iso.datetime(),
  epicCount: z.number().int(),
  storyCount: z.number().int(),
  avgReadiness: z.number().int(),
  format: exportFormatSchema,
  status: exportStatusSchema,
});

export const projectsTable = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  jiraKey: text("jira_key").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  inputType: text("input_type").notNull(),
  outputDepth: text("output_depth").notNull(),
  jiraKey: text("jira_key").notNull().default(""),
  targetUsers: jsonb("target_users").$type<string[]>().notNull().default([]),
  businessGoal: text("business_goal").notNull().default(""),
  knownConstraints: text("known_constraints").notNull().default(""),
  labels: jsonb("labels").$type<string[]>().notNull().default([]),
  rawInput: text("raw_input").notNull(),
  currentPhase: text("current_phase").notNull(),
  phases: jsonb("phases")
    .$type<z.infer<typeof phasesRecordSchema>>()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const workflowArtifactsTable = pgTable("workflow_artifacts", {
  sessionId: text("session_id")
    .primaryKey()
    .references(() => sessionsTable.id, { onDelete: "cascade" }),
  clarificationQuestions: jsonb("clarification_questions")
    .$type<Array<z.infer<typeof clarificationQuestionSchema>>>()
    .notNull()
    .default([]),
  prdSections: jsonb("prd_sections")
    .$type<Array<z.infer<typeof prdSectionSchema>>>()
    .notNull()
    .default([]),
  epics: jsonb("epics").$type<Array<z.infer<typeof epicSchema>>>().notNull().default([]),
  stories: jsonb("stories")
    .$type<Array<z.infer<typeof storySchema>>>()
    .notNull()
    .default([]),
  metadata: jsonb("metadata")
    .$type<z.infer<typeof workflowArtifactsMetadataSchema>>()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const settingsTable = pgTable("settings", {
  id: text("id").primaryKey(),
  workspaceName: text("workspace_name").notNull(),
  jiraKey: text("jira_key").notNull().default(""),
  defaultLabels: jsonb("default_labels")
    .$type<string[]>()
    .notNull()
    .default([]),
  defaultComponents: jsonb("default_components")
    .$type<string[]>()
    .notNull()
    .default([]),
  templatePreference: text("template_preference").notNull().default("Standard"),
  qualityThreshold: integer("quality_threshold").notNull().default(75),
  devReviewRequired: boolean("dev_review_required").notNull().default(true),
  autoGenerateQuestions: boolean("auto_generate_questions")
    .notNull()
    .default(true),
  showReadinessWarnings: boolean("show_readiness_warnings")
    .notNull()
    .default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const exportPackagesTable = pgTable("export_packages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessionsTable.id, { onDelete: "cascade" }),
  sessionName: text("session_name").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  epicCount: integer("epic_count").notNull(),
  storyCount: integer("story_count").notNull(),
  avgReadiness: integer("avg_readiness").notNull(),
  format: text("format").notNull(),
  status: text("status").notNull(),
});

export const exportItemsTable = pgTable("export_items", {
  id: text("id").primaryKey(),
  exportPackageId: text("export_package_id")
    .notNull()
    .references(() => exportPackagesTable.id, { onDelete: "cascade" }),
  storyId: text("story_id").notNull(),
  epicId: text("epic_id").notNull(),
  title: text("title").notNull(),
  priority: text("priority").notNull(),
  readinessScore: integer("readiness_score").notNull(),
  reviewStatus: text("review_status").notNull(),
  jiraKey: text("jira_key"),
  githubIssueUrl: text("github_issue_url"),
  externalExportStatus: text("external_export_status"),
  externalExportError: text("external_export_error"),
  exportedAt: timestamp("exported_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const integrationConfigTable = pgTable("integration_config", {
  id: text("id").primaryKey(),
  integrationType: text("integration_type").notNull(),
  enabled: boolean("enabled").notNull().default(false),
  config: jsonb("config").$type<Record<string, string>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const projectsRelations = relations(projectsTable, ({ many }) => ({
  sessions: many(sessionsTable),
}));

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [sessionsTable.projectId],
    references: [projectsTable.id],
  }),
  workflowArtifacts: one(workflowArtifactsTable, {
    fields: [sessionsTable.id],
    references: [workflowArtifactsTable.sessionId],
  }),
}));

export const workflowArtifactsRelations = relations(
  workflowArtifactsTable,
  ({ one }) => ({
    session: one(sessionsTable, {
      fields: [workflowArtifactsTable.sessionId],
      references: [sessionsTable.id],
    }),
  }),
);

export const exportPackagesRelations = relations(
  exportPackagesTable,
  ({ one, many }) => ({
    session: one(sessionsTable, {
      fields: [exportPackagesTable.sessionId],
      references: [sessionsTable.id],
    }),
    items: many(exportItemsTable),
  }),
);

export const exportItemsRelations = relations(exportItemsTable, ({ one }) => ({
  exportPackage: one(exportPackagesTable, {
    fields: [exportItemsTable.exportPackageId],
    references: [exportPackagesTable.id],
  }),
}));

export const insertProjectSchema = createInsertSchema(projectsTable);
export const insertSessionSchema = createInsertSchema(sessionsTable);
export const insertWorkflowArtifactsSchema = createInsertSchema(
  workflowArtifactsTable,
);
export const insertSettingsSchema = createInsertSchema(settingsTable);
export const insertExportPackageSchema = createInsertSchema(exportPackagesTable);
export const insertExportItemSchema = createInsertSchema(exportItemsTable);
export const insertIntegrationConfigSchema = createInsertSchema(integrationConfigTable);

export type Phase = z.infer<typeof phaseSchema>;
export type PhaseStatus = z.infer<typeof phaseStatusSchema>;
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;
export type ClarificationQuestion = z.infer<typeof clarificationQuestionSchema>;
export type PRDSection = z.infer<typeof prdSectionSchema>;
export type ReadinessScore = z.infer<typeof readinessScoreSchema>;
export type QualityWarning = z.infer<typeof qualityWarningSchema>;
export type DeveloperReview = z.infer<typeof developerReviewSchema>;
export type Epic = z.infer<typeof epicSchema>;
export type Story = z.infer<typeof storySchema>;
export type ExportPackage = z.infer<typeof exportPackageSchema>;
export type GenerationMode = z.infer<typeof generationModeSchema>;
export type GenerationStatus = z.infer<typeof generationStatusSchema>;
export type GenerationStep = z.infer<typeof generationStepSchema>;
export type WorkflowGeneration = z.infer<typeof workflowGenerationSchema>;
export type WorkflowArtifactsMetadata = z.infer<typeof workflowArtifactsMetadataSchema>;

export type Project = typeof projectsTable.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Session = typeof sessionsTable.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type WorkflowArtifacts = typeof workflowArtifactsTable.$inferSelect;
export type InsertWorkflowArtifacts = z.infer<typeof insertWorkflowArtifactsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type ExportPackageRow = typeof exportPackagesTable.$inferSelect;
export type InsertExportPackage = z.infer<typeof insertExportPackageSchema>;
export type ExportItemRow = typeof exportItemsTable.$inferSelect;
export type InsertExportItem = z.infer<typeof insertExportItemSchema>;
export type IntegrationConfigRow = typeof integrationConfigTable.$inferSelect;
export type InsertIntegrationConfig = z.infer<typeof insertIntegrationConfigSchema>;
