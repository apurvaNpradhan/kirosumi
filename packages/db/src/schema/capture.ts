import { relations } from "drizzle-orm";
import {
	bigserial,
	index,
	json,
	pgTable,
	text,
	varchar,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
	type Json,
} from "drizzle-zod";
import z from "zod";
import { timestamps } from "../utils/reusable";
import { user } from "./auth";

export const captures = pgTable(
	"capture",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		title: varchar("title", { length: 255 }).notNull(),
		description: json("content").$type<Json>(),
		createdBy: text("createdBy")
			.references(() => user.id, { onDelete: "cascade" })
			.notNull(),
		...timestamps,
	},
	(table) => [index("capture_created_by_idx").on(table.createdBy)],
);

export const captureRelations = relations(captures, ({ one }) => ({
	createdBy: one(user, {
		fields: [captures.createdBy],
		references: [user.id],
		relationName: "captureCreatedByUser",
	}),
}));

export const SelectCapture = createSelectSchema(captures, {
	createdAt: z.coerce.string(),
	updatedAt: z.coerce.string().nullable(),
	deletedAt: z.coerce.string().nullable(),
});
export type SelectCapture = z.infer<typeof SelectCapture>;
export const InsertCapture = createInsertSchema(captures, {
	title: z.string().min(1, { message: "Title is required" }),
}).omit({
	id: true,
	createdBy: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});
export type InsertCapture = z.infer<typeof InsertCapture>;

export const UpdateCapture = createUpdateSchema(captures).omit({
	id: true,
	createdBy: true,
	createdAt: true,
});
export type UpdateCapture = z.infer<typeof UpdateCapture>;
