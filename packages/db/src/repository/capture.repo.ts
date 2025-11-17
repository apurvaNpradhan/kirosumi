import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "..";
import {
	captures,
	type InsertCapture,
	type UpdateCapture,
} from "../schema/capture";

export const getAll = async (args: { createdBy: string }) => {
	const result = await db.query.captures.findMany({
		where: and(
			eq(captures.createdBy, args.createdBy),
			isNull(captures.deletedAt),
		),
		orderBy: desc(captures.createdAt),
	});

	return result;
};

export const getById = async (id: number, createdBy: string) => {
	const result = await db.query.captures.findFirst({
		where: and(
			eq(captures.id, id),
			eq(captures.createdBy, createdBy),
			isNull(captures.deletedAt),
		),
	});

	return result ?? null;
};

export const create = async (input: InsertCapture & { createdBy: string }) => {
	const [result] = await db
		.insert(captures)
		.values({
			...input,
		})
		.returning();

	return result;
};

export const update = async (
	input: UpdateCapture & { id: number; createdBy: string },
) => {
	const [result] = await db
		.update(captures)
		.set({
			...input,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(captures.id, input.id),
				eq(captures.createdBy, input.createdBy),
				isNull(captures.deletedAt),
			),
		)
		.returning();

	return result;
};

export const softDelete = async (args: {
	id: number;
	createdBy: string;
	deletedAt: Date;
}) => {
	const [result] = await db
		.update(captures)
		.set({
			deletedAt: args.deletedAt,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(captures.id, args.id),
				eq(captures.createdBy, args.createdBy),
				isNull(captures.deletedAt),
			),
		)
		.returning({
			id: captures.id,
			content: captures.title,
		});

	return result;
};

export const hardDelete = async (args: { id: number; createdBy: string }) => {
	const [result] = await db
		.delete(captures)
		.where(
			and(eq(captures.id, args.id), eq(captures.createdBy, args.createdBy)),
		)
		.returning({
			id: captures.id,
			content: captures.title,
		});

	return result;
};
