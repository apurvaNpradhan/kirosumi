import { publicIds } from "@kirosumi/shared";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "..";
import { type InsertStatus, statuses } from "../schema";
import { type InsertSpace, spaces, type UpdateSpace } from "../schema/space";

const DefaultSpace = {
	name: "Inbox",
	isDefault: true,
	isSystem: true,
} as InsertSpace;

export const createDefaultSpaces = async (userId: string) => {
	return await db.transaction(async (tx) => {
		const [space] = await tx
			.insert(spaces)
			.values({
				...DefaultSpace,
				userId,
				publicId: publicIds.space(),
			})
			.returning();
		if (!space) throw new Error("Failed to create default space");
		const defaultStatuses: InsertStatus[] = [
			{
				name: "Not started",
				type: "Backlog",
				color: "#f6d860",
				spaceId: space.id,
				publicId: publicIds.status(),
			},
			{
				name: "In progress",
				type: "In Progress",
				color: "#f6d860",
				spaceId: space.id,
				publicId: publicIds.status(),
			},
			{
				name: "Done",
				type: "Completed",
				color: "#a5f3fc",
				spaceId: space.id,
				publicId: publicIds.status(),
			},
		];

		await tx.insert(statuses).values(defaultStatuses);
		return space;
	});
};

export const getDefaultSpace = async (userId: string) => {
	const result = await db.query.spaces.findFirst({
		where: and(
			eq(spaces.userId, userId),
			eq(spaces.isDefault, true),
			isNull(spaces.deletedAt),
		),
		with: {
			statuses: true,
		},
	});

	return result;
};

export const getAll = async (args: { userId: string }) => {
	const result = await db.query.spaces.findMany({
		where: and(
			eq(spaces.userId, args.userId),
			isNull(spaces.deletedAt),
			isNull(spaces.isDefault),
		),
		orderBy: desc(spaces.createdAt),
	});

	return result;
};

export const getById = async (id: number, userId: string) => {
	const result = await db.query.spaces.findFirst({
		where: and(
			eq(spaces.id, id),
			eq(spaces.userId, userId),
			isNull(spaces.deletedAt),
		),
	});

	return result ?? null;
};

export const getByPublicId = async (publicId: string, userId: string) => {
	const result = await db.query.spaces.findFirst({
		where: and(
			eq(spaces.publicId, publicId),
			eq(spaces.userId, userId),
			isNull(spaces.deletedAt),
		),
	});

	return result ?? null;
};

export const create = async (input: InsertSpace & { userId: string }) => {
	const [result] = await db
		.insert(spaces)
		.values({
			...input,
		})
		.returning();

	return result;
};

export const update = async (
	input: UpdateSpace & { id: number; userId: string },
) => {
	const [result] = await db
		.update(spaces)
		.set({
			...input,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(spaces.id, input.id),
				eq(spaces.userId, input.userId),
				isNull(spaces.deletedAt),
				isNull(spaces.isSystem),
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
		.update(spaces)
		.set({
			deletedAt: args.deletedAt,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(spaces.id, args.id),
				eq(spaces.userId, args.userId),
				isNull(spaces.deletedAt),
			),
		)
		.returning({
			id: spaces.id,
			name: spaces.name,
		});

	return result;
};

export const hardDelete = async (args: { id: number; userId: string }) => {
	const [result] = await db
		.delete(spaces)
		.where(and(eq(spaces.id, args.id), eq(spaces.userId, args.userId)))
		.returning({
			id: spaces.id,
			name: spaces.name,
		});

	return result;
};

export const getIdByPublicId = async (publicId: string) => {
	const result = await db.query.spaces.findFirst({
		where: eq(spaces.publicId, publicId),
	});

	return result?.id;
};
