import { publicIds } from "@kirosumi/shared";
import { and, desc, eq, isNull, or, sql } from "drizzle-orm";
import type { Json } from "drizzle-zod";
import { db } from "..";
import {
	type InsertItem,
	itemRelations,
	items,
	type SelectItem,
	type UpdateItem,
} from "../schema/item";

const DefaultCaptureItem = {
	name: "New Capture",
	kind: "capture" as const,
	content: null satisfies Json | null,
	priority: 0,
	isCompleted: false,
} as const;

export const getAll = async ({
	userId,
	spaceId,
	kind,
	includeCompleted = false,
}: {
	userId: string;
	spaceId?: number;
	kind?: "task" | "note" | "capture" | "scratch";
	includeCompleted?: boolean;
}) => {
	return await db.query.items.findMany({
		where: and(
			spaceId ? eq(items.spaceId, spaceId) : undefined,
			kind ? eq(items.kind, kind) : undefined,
			eq(items.userId, userId),
			includeCompleted ? undefined : eq(items.isCompleted, false),
			isNull(items.deletedAt),
		),
		orderBy: [desc(items.priority), desc(items.createdAt)],
		with: {
			space: true,
			project: true,
		},
	});
};

export const getById = async (
	id: number,
	userId: string,
): Promise<SelectItem | null> => {
	const result = await db.query.items.findFirst({
		where: and(
			eq(items.id, id),
			eq(items.userId, userId),
			isNull(items.deletedAt),
		),
		with: {
			space: true,
			project: true,
		},
	});
	return result ?? null;
};

export const getByPublicId = async (
	publicId: string,
	userId: string,
): Promise<SelectItem | null> => {
	const result = await db.query.items.findFirst({
		where: and(
			eq(items.publicId, publicId),
			eq(items.userId, userId),
			isNull(items.deletedAt),
		),
		with: {
			space: true,
			project: true,
		},
	});
	return result ?? null;
};

export const create = async (
	input: InsertItem & {
		userId: string;
		spaceId?: number;
		projectId?: number;
	},
) => {
	const [result] = await db
		.insert(items)
		.values({
			...input,
		})
		.returning();

	return result!;
};

export const update = async (
	input: UpdateItem & {
		id: number;
		userId: string;
	},
) => {
	const [result] = await db
		.update(items)
		.set({
			...input,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(items.id, input.id),
				eq(items.userId, input.userId),
				isNull(items.deletedAt),
			),
		)
		.returning();

	return result ?? null;
};

export const complete = async ({
	id,
	userId,
	completed = true,
}: {
	id: number;
	userId: string;
	completed?: boolean;
}) => {
	const [result] = await db
		.update(items)
		.set({
			isCompleted: completed,
			completedAt: completed ? new Date() : null,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(items.id, id),
				eq(items.userId, userId),
				eq(items.isCompleted, !completed),
				isNull(items.deletedAt),
			),
		)
		.returning();

	return result ?? null;
};

export const softDelete = async ({
	id,
	userId,
	deletedAt = new Date(),
}: {
	id: number;
	userId: string;
	deletedAt?: Date;
}) => {
	const [result] = await db
		.update(items)
		.set({
			deletedAt,
			updatedAt: new Date(),
		})
		.where(
			and(eq(items.id, id), eq(items.userId, userId), isNull(items.deletedAt)),
		)
		.returning({
			id: items.id,
			publicId: items.publicId,
			name: items.name,
		});

	return result ?? null;
};

export const hardDelete = async ({
	id,
	userId,
}: {
	id: number;
	userId: string;
}) => {
	const [result] = await db
		.delete(items)
		.where(and(eq(items.id, id), eq(items.userId, userId)))
		.returning({
			id: items.id,
			publicId: items.publicId,
			name: items.name,
		});

	return result ?? null;
};

export const getIdByPublicId = async (
	publicId: string,
): Promise<number | null> => {
	const result = await db
		.select({ id: items.id })
		.from(items)
		.where(eq(items.publicId, publicId))
		.limit(1);

	return result[0]?.id ?? null;
};

export const getByProjectId = async (
	projectId: number,
	userId: string,
	includeCompleted = false,
) => {
	return await db.query.items.findMany({
		where: and(
			eq(items.projectId, projectId),
			includeCompleted ? undefined : eq(items.isCompleted, false),
			eq(items.userId, userId),
			isNull(items.deletedAt),
		),
		orderBy: [desc(items.priority), desc(items.createdAt)],
		with: {
			space: true,
			project: true,
		},
	});
};

export const getInboxItems = async (spaceId: number, userId: string) => {
	return await db.query.items.findMany({
		where: and(
			eq(items.spaceId, spaceId),
			eq(items.userId, userId),
			or(
				eq(items.kind, "capture"),
				and(eq(items.kind, "task"), isNull(items.projectId)),
			),
			eq(items.isCompleted, false),
			isNull(items.deletedAt),
		),
		orderBy: desc(items.createdAt),
		with: {
			project: true,
		},
	});
};
