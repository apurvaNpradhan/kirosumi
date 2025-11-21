import { publicIds } from "@kirosumi/shared";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { Json } from "drizzle-zod";
import { db } from "..";
import {
	type InsertProject,
	projects,
	type SelectProject,
	type UpdateProject,
} from "../schema/project";

const DefaultProject = {
	name: "My First Project",
	description: null satisfies Json | null,
} as const;

export const createDefaultProject = async (
	userId: string,
	defaultSpaceId: number,
) => {
	return await db.transaction(async (tx) => {
		const [project] = await tx
			.insert(projects)
			.values({
				...DefaultProject,
				userId,
				spaceId: defaultSpaceId,
				publicId: publicIds.project(),
			})
			.returning();

		if (!project) throw new Error("Failed to create default project");

		return project;
	});
};

export const getAll = async ({ userId }: { userId: string }) => {
	return await db.query.projects.findMany({
		where: and(eq(projects.userId, userId), isNull(projects.deletedAt)),
		orderBy: desc(projects.createdAt),
		with: {
			space: true,
		},
	});
};

export const getById = async (
	id: number,
	userId: string,
): Promise<SelectProject | null> => {
	const result = await db.query.projects.findFirst({
		where: and(
			eq(projects.id, id),
			eq(projects.userId, userId),
			isNull(projects.deletedAt),
		),
		with: {
			space: true,
			createdBy: true,
		},
	});

	return result ?? null;
};

export const getByPublicId = async (
	publicId: string,
	userId: string,
): Promise<SelectProject | null> => {
	const result = await db.query.projects.findFirst({
		where: and(
			eq(projects.publicId, publicId),
			eq(projects.userId, userId),
			isNull(projects.deletedAt),
		),
		with: {
			space: true,
			createdBy: true,
		},
	});

	return result ?? null;
};

export const create = async (
	input: InsertProject & { userId: string; spaceId: number },
) => {
	const [result] = await db
		.insert(projects)
		.values({
			...input,
			publicId: publicIds.project(),
		})
		.returning();

	return result!;
};

export const update = async (
	input: UpdateProject & { id: number; userId: string },
) => {
	const [result] = await db
		.update(projects)
		.set({
			...input,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(projects.id, input.id),
				eq(projects.userId, input.userId),
				isNull(projects.deletedAt),
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
		.update(projects)
		.set({
			deletedAt,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(projects.id, id),
				eq(projects.userId, userId),
				isNull(projects.deletedAt),
			),
		)
		.returning({
			id: projects.id,
			name: projects.name,
			publicId: projects.publicId,
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
		.delete(projects)
		.where(and(eq(projects.id, id), eq(projects.userId, userId)))
		.returning({
			id: projects.id,
			name: projects.name,
			publicId: projects.publicId,
		});

	return result ?? null;
};

export const getIdByPublicId = async (
	publicId: string,
): Promise<number | null> => {
	const result = await db.query.projects.findFirst({
		columns: { id: true },
		where: eq(projects.publicId, publicId),
	});

	return result?.id ?? null;
};

export const getBySpaceId = async (spaceId: number, userId: string) => {
	return await db.query.projects.findMany({
		where: and(
			eq(projects.spaceId, spaceId),
			eq(projects.userId, userId),
			isNull(projects.deletedAt),
		),
		orderBy: desc(projects.createdAt),
		with: {
			space: true,
		},
	});
};
