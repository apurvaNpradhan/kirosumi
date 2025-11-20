import { relations } from "drizzle-orm";
import { bigserial, index, pgTable, varchar } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { timestamps } from "../utils/reusable";
import { spaces } from "./space";

export const statuses = pgTable(
	"statuses",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		publicId: varchar("public_id").notNull().unique(),
		spaceId: bigserial("space_id", { mode: "number" })
			.notNull()
			.references(() => spaces.id, { onDelete: "cascade" }),
		name: varchar("name", { length: 50 }).notNull(),
		type: varchar("type", { length: 20 }).notNull().default("Backlog"),
		color: varchar("color", { length: 7 }),
		icon: varchar("icon", { length: 50 }),
		...timestamps,
	},
	(table) => ({
		publicIdIdx: index("idx_status_public_id").on(table.publicId),
		spaceIdIdx: index("idx_status_space_id").on(table.spaceId),
	}),
);

export const statusesRelations = relations(statuses, ({ one }) => ({
	space: one(spaces, {
		fields: [statuses.spaceId],
		references: [spaces.id],
		relationName: "status_space",
	}),
}));

export const statusTypeEnum = z
	.enum(["Backlog", "In Progress", "Completed", "Cancelled"] as const)
	.default("Backlog");

export const SelectStatus = createSelectSchema(statuses, {
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date().nullable(),
	deletedAt: z.coerce.date().nullable(),
	type: statusTypeEnum,
});

export const InsertStatus = createInsertSchema(statuses, {
	name: z.string().min(1, "Name is required").max(50),
	type: statusTypeEnum,
	color: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/)
		.optional(),
	icon: z.string().max(50).optional(),
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export const UpdateStatus = createUpdateSchema(statuses, {
	name: z.string().min(1).max(50).optional(),
	type: statusTypeEnum.optional(),
	color: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/)
		.optional(),
	icon: z.string().max(50).optional(),
}).omit({
	id: true,
	publicId: true,
	spaceId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export type SelectStatus = z.infer<typeof SelectStatus>;
export type InsertStatus = z.infer<typeof InsertStatus>;
export type UpdateStatus = z.infer<typeof UpdateStatus>;
