import { relations } from "drizzle-orm";
import {
	type AnyPgColumn,
	bigint,
	bigserial,
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
	type Json,
} from "drizzle-zod";
import { z } from "zod";
import { timestamps } from "../utils/reusable";
import { user } from "./auth";
import { projects } from "./project";
import { spaces } from "./space";
import { statuses } from "./status";

export const itemKindEnum = pgEnum("item_kind", [
	"task",
	"note",
	"capture",
	"scratch",
]);
export const items = pgTable(
	"item",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		userId: varchar("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		publicId: varchar("public_id").notNull().unique(),
		parentId: bigint("parent_id", { mode: "number" }).references(
			(): AnyPgColumn => items.id,
			{ onDelete: "cascade" },
		),
		spaceId: bigint("space_id", { mode: "number" }).references(
			() => spaces.id,
			{ onDelete: "cascade" },
		),
		projectId: bigint("project_id", { mode: "number" }).references(
			() => projects.id,
			{ onDelete: "set null" },
		),
		name: varchar("name", { length: 255 }).notNull(),
		statusId: bigint("status_id", { mode: "number" }).references(
			() => statuses.id,
			{ onDelete: "set null" },
		),
		kind: itemKindEnum("kind").notNull().default("capture"),
		priority: integer("priority").notNull().default(0),
		content: jsonb("content").$type<Json>(),
		isCompleted: boolean("is_completed").notNull().default(false),
		completedAt: timestamp("completed_at", {
			mode: "date",
			precision: 3,
			withTimezone: true,
		}),
		...timestamps,
	},
	(table) => ({
		userIdIdx: index("idx_item_user_id").on(table.userId),
		publicIdIdx: index("idx_item_public_id").on(table.publicId),
		spaceIdIdx: index("idx_item_space_id").on(table.spaceId),
		projectIdIdx: index("idx_item_project_id").on(table.projectId),
		completedIdx: index("idx_item_is_completed").on(table.isCompleted),
		parentIdIdx: index("idx_item_parent_id").on(table.parentId),
	}),
);

export const itemRelations = relations(items, ({ one, many }) => ({
	space: one(spaces, {
		fields: [items.spaceId],
		references: [spaces.id],
		relationName: "item_space",
	}),
	project: one(projects, {
		fields: [items.projectId],
		references: [projects.id],
		relationName: "item_project",
	}),
	status: one(statuses, {
		fields: [items.statusId],
		references: [statuses.id],
		relationName: "item_status",
	}),
	parent: one(items, {
		fields: [items.parentId],
		references: [items.id],
		relationName: "item_children",
	}),
	children: many(items, { relationName: "item_children" }),
}));

export const SelectItem = createSelectSchema(items, {
	createdAt: z.coerce.string(),
	updatedAt: z.coerce.string().nullable(),
	deletedAt: z.coerce.string().nullable(),
	completedAt: z.coerce.string().nullable(),
});

export const InsertItem = createInsertSchema(items, {
	name: z.string().min(1, "Name is required"),
	kind: z.enum(["task", "note", "scratch"]),
}).omit({
	id: true,
	userId: true,
	spaceId: true,
	projectId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	isCompleted: true,
	completedAt: true,
});

export const UpdateItem = createUpdateSchema(items, {
	name: z.string().min(1).optional(),
}).omit({
	id: true,
	publicId: true,
	spaceId: true,
	projectId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export type SelectItem = z.infer<typeof SelectItem>;
export type InsertItem = z.infer<typeof InsertItem>;
export type UpdateItem = z.infer<typeof UpdateItem>;
