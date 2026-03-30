import {
  pgTable,
  pgEnum,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  varchar,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const fileTypeEnum = pgEnum('file_type', ['pdf', 'docx', 'video', 'article']);

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: text('icon').default('📄'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => categories.id),
  fileType: fileTypeEnum('file_type').notNull(),
  fileKey: text('file_key').notNull(),
  thumbnailKey: text('thumbnail_key'),
  fileSize: integer('file_size'),
  duration: integer('duration'),
  content: text('content'),
  videoUrl: text('video_url'),
  videoSource: text('video_source').default('upload'),
  isPublished: boolean('is_published').default(false).notNull(),
  publishAt: timestamp('publish_at'),
  viewCount: integer('view_count').default(0).notNull(),
  shareCount: integer('share_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const anonymousUsers = pgTable('anonymous_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fingerprint: text('fingerprint'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastSeen: timestamp('last_seen').defaultNow().notNull(),
});

export const unlockTokens = pgTable('unlock_tokens', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .references(() => anonymousUsers.id)
    .notNull(),
  documentId: integer('document_id')
    .references(() => documents.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
});

export const shareEvents = pgTable('share_events', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => anonymousUsers.id),
  documentId: integer('document_id')
    .references(() => documents.id)
    .notNull(),
  platform: text('platform').default('facebook'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Analytics ───────────────────────────────────────────────────────────────

export const analyticsSnapshots = pgTable('analytics_snapshots', {
  id: serial('id').primaryKey(),
  snapshotDate: text('snapshot_date').notNull().unique(),
  totalDocs: integer('total_docs').default(0).notNull(),
  totalViews: integer('total_views').default(0).notNull(),
  totalUnlocks: integer('total_unlocks').default(0).notNull(),
  totalShares: integer('total_shares').default(0).notNull(),
  totalMembers: integer('total_members').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Learning Paths ──────────────────────────────────────────────────────────

export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced']);

export const learningPaths = pgTable('learning_paths', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').default(''),
  coverKey: text('cover_key'),
  difficulty: difficultyEnum('difficulty').default('beginner').notNull(),
  estimatedDays: integer('estimated_days').default(0).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pathSteps = pgTable('path_steps', {
  id: serial('id').primaryKey(),
  pathId: integer('path_id').references(() => learningPaths.id, { onDelete: 'cascade' }).notNull(),
  docId: integer('doc_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  phase: integer('phase').default(1).notNull(),
  phaseName: text('phase_name').default(''),
  stepOrder: integer('step_order').default(0).notNull(),
  note: text('note').default(''),
});

export const pathProgress = pgTable('path_progress', {
  id: serial('id').primaryKey(),
  pathId: integer('path_id').references(() => learningPaths.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => anonymousUsers.id).notNull(),
  docId: integer('doc_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => [
  uniqueIndex('path_progress_unique').on(table.pathId, table.userId, table.docId),
]);

export const pathEnrollments = pgTable('path_enrollments', {
  id: serial('id').primaryKey(),
  pathId: integer('path_id').references(() => learningPaths.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => anonymousUsers.id).notNull(),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const categoriesRelations = relations(categories, ({ many }) => ({
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  category: one(categories, {
    fields: [documents.categoryId],
    references: [categories.id],
  }),
  unlockTokens: many(unlockTokens),
  shareEvents: many(shareEvents),
}));

export const anonymousUsersRelations = relations(anonymousUsers, ({ many }) => ({
  unlockTokens: many(unlockTokens),
  shareEvents: many(shareEvents),
}));

export const unlockTokensRelations = relations(unlockTokens, ({ one }) => ({
  user: one(anonymousUsers, {
    fields: [unlockTokens.userId],
    references: [anonymousUsers.id],
  }),
  document: one(documents, {
    fields: [unlockTokens.documentId],
    references: [documents.id],
  }),
}));

export const shareEventsRelations = relations(shareEvents, ({ one }) => ({
  user: one(anonymousUsers, {
    fields: [shareEvents.userId],
    references: [anonymousUsers.id],
  }),
  document: one(documents, {
    fields: [shareEvents.documentId],
    references: [documents.id],
  }),
}));

export const learningPathsRelations = relations(learningPaths, ({ many }) => ({
  steps: many(pathSteps),
  progress: many(pathProgress),
  enrollments: many(pathEnrollments),
}));

export const pathStepsRelations = relations(pathSteps, ({ one }) => ({
  path: one(learningPaths, { fields: [pathSteps.pathId], references: [learningPaths.id] }),
  document: one(documents, { fields: [pathSteps.docId], references: [documents.id] }),
}));

export const pathProgressRelations = relations(pathProgress, ({ one }) => ({
  path: one(learningPaths, { fields: [pathProgress.pathId], references: [learningPaths.id] }),
  user: one(anonymousUsers, { fields: [pathProgress.userId], references: [anonymousUsers.id] }),
  document: one(documents, { fields: [pathProgress.docId], references: [documents.id] }),
}));

export const pathEnrollmentsRelations = relations(pathEnrollments, ({ one }) => ({
  path: one(learningPaths, { fields: [pathEnrollments.pathId], references: [learningPaths.id] }),
  user: one(anonymousUsers, { fields: [pathEnrollments.userId], references: [anonymousUsers.id] }),
}));

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type AnonymousUser = typeof anonymousUsers.$inferSelect;
export type UnlockToken = typeof unlockTokens.$inferSelect;
export type ShareEvent = typeof shareEvents.$inferSelect;
export type LearningPath = typeof learningPaths.$inferSelect;
export type NewLearningPath = typeof learningPaths.$inferInsert;
export type PathStep = typeof pathSteps.$inferSelect;
export type PathProgress = typeof pathProgress.$inferSelect;
export type PathEnrollment = typeof pathEnrollments.$inferSelect;
