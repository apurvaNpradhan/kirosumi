import { relations } from "drizzle-orm";
import {
	bigserial,
	boolean,
	index,
	pgTable,
	text,
	varchar,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import { timestamps } from "../utils/reusable";
import { user } from "./auth";
import { items } from "./item";
import { projects } from "./project";
import { statuses } from "./status";

export const spaces = pgTable(
	"spaces",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		publicId: varchar("public_id").notNull().unique(),
		userId: varchar("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: varchar("name", { length: 100 }).notNull(),
		description: text("description"),
		isDefault: boolean("is_default").default(false).notNull(),
		isSystem: boolean("is_system").default(false).notNull(),
		...timestamps,
	},
	(table) => ({
		publicIdIdx: index("idx_space_public_id").on(table.publicId),
		userDefaultIdx: index("idx_user_default_space").on(
			table.userId,
			table.isDefault,
		),
	}),
);

export const SpaceRelation = relations(spaces, ({ one, many }) => ({
	createdBy: one(user, {
		fields: [spaces.userId],
		references: [user.id],
		relationName: "space_created_by",
	}),
	statuses: many(statuses),
	projects: many(projects),
	items: many(items),
}));

export const SelectSpace = createSelectSchema(spaces, {
	createdAt: z.coerce.string(),
	updatedAt: z.coerce.string().nullable(),
	deletedAt: z.coerce.string().nullable(),
});

export const InsertSpace = createInsertSchema(spaces, {
	name: z.string().min(1, { message: "Name is required" }),
}).omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export const UpdateSpace = createUpdateSchema(spaces, {}).omit({
	id: true,
	publicId: true,
	userId: true,
	isSystem: true,
	createdAt: true,
});

export type SelectSpace = z.infer<typeof SelectSpace>;
export type InsertSpace = z.infer<typeof InsertSpace>;
export type UpdateSpace = z.infer<typeof UpdateSpace>;
