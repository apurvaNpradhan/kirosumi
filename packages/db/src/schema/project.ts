import { relations } from "drizzle-orm";
import {
	bigint,
	bigserial,
	index,
	json,
	pgTable,
	varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, type Json } from "drizzle-zod";
import { z } from "zod";
import { timestamps } from "../utils/reusable";
import { user } from "./auth";
import { items } from "./item";
import { spaces } from "./space";

export const projects = pgTable(
	"projects",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		publicId: varchar("public_id").notNull().unique(),
		spaceId: bigint("space_id", { mode: "number" })
			.notNull()
			.references(() => spaces.id, { onDelete: "cascade" }),
		userId: varchar("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: varchar("name", { length: 255 }).notNull(),
		description: json("content").$type<Json>(),
		...timestamps,
	},
	(table) => ({
		publicIdIdx: index("idx_project_public_id").on(table.publicId),
		spaceIdx: index("idx_project_space").on(table.spaceId),
		userIdx: index("idx_project_user").on(table.userId),
	}),
);

export const ProjectRelations = relations(projects, ({ one, many }) => ({
	space: one(spaces, {
		fields: [projects.spaceId],
		references: [spaces.id],
		relationName: "project_space",
	}),
	createdBy: one(user, {
		fields: [projects.userId],
		references: [user.id],
		relationName: "project_created_by",
	}),
	items: many(items),
}));

export const SelectProject = createSelectSchema(projects, {
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date().nullable(),
	deletedAt: z.coerce.date().nullable(),
});

export const InsertProject = createInsertSchema(projects, {
	name: z.string().min(1, "Project name is required").max(255),
	spaceId: z.number(),
}).omit({
	id: true,
	publicId: true,
	userId: true,
	spaceId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export const UpdateProject = createInsertSchema(projects, {
	name: z.string().min(1).max(255).optional(),
}).omit({
	id: true,
	publicId: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export type SelectProject = z.infer<typeof SelectProject>;
export type InsertProject = z.infer<typeof InsertProject>;
export type UpdateProject = z.infer<typeof UpdateProject>;
