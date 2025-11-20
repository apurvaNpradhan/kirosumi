import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "..";
import { spaces } from "../schema/space";
import {
	type InsertStatus,
	statuses,
	type UpdateStatus,
} from "../schema/status";

export const getAllBySpaceId = async (args: {
	spaceId: number;
	userId: string;
}) => {
	return await db.query.statuses.findMany({
		where: and(
			eq(statuses.spaceId, args.spaceId),
			eq(spaces.userId, args.userId),
			isNull(statuses.deletedAt),
		),
		orderBy: desc(statuses.createdAt),
	});
};

export const getById = async (id: number, userId: string) => {
	const result = await db.query.statuses.findFirst({
		where: and(
			eq(statuses.id, id),
			eq(spaces.userId, userId),
			isNull(statuses.deletedAt),
		),
	});
	return result ?? null;
};

export const getByPublicId = async (publicId: string, userId: string) => {
	const result = await db.query.statuses.findFirst({
		where: and(
			eq(statuses.publicId, publicId),
			eq(spaces.userId, userId),
			isNull(statuses.deletedAt),
		),
	});
	return result ?? null;
};

export const create = async (
	input: InsertStatus & { spaceId: number; userId: string },
) => {
	const [result] = await db.insert(statuses).values(input).returning();
	return result;
};

export const update = async (
	input: UpdateStatus & { id: number; userId: string },
) => {
	const [result] = await db
		.update(statuses)
		.set({
			...input,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(statuses.id, input.id),
				eq(spaces.userId, input.userId),
				isNull(statuses.deletedAt),
			),
		)
		.returning();
	return result;
};

export const softDelete = async (args: {
	id: number;
	userId: string;
	deletedAt: Date;
}) => {
	const [result] = await db
		.update(statuses)
		.set({
			deletedAt: args.deletedAt,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(statuses.id, args.id),
				eq(spaces.userId, args.userId),
				isNull(statuses.deletedAt),
			),
		)
		.returning({
			id: statuses.id,
			name: statuses.name,
		});
	return result;
};

export const hardDelete = async (args: { id: number; userId: string }) => {
	const [result] = await db
		.delete(statuses)
		.where(and(eq(statuses.id, args.id), eq(spaces.userId, args.userId)))
		.returning({
			id: statuses.id,
			name: statuses.name,
		});
	return result;
};

export const getIdByPublicId = async (publicId: string) => {
	const result = await db.query.statuses.findFirst({
		where: eq(statuses.publicId, publicId),
	});
	return result?.id ?? null;
};
