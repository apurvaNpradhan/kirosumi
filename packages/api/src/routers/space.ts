import * as spacesRepo from "@kirosumi/db/repository/space.repo";
import { InsertSpace, UpdateSpace } from "@kirosumi/db/schema/space";
import { publicIds } from "@kirosumi/shared";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { protectedProcedure, router } from "..";

export const spaceRouter = router({
	creatDefaultSpace: protectedProcedure.mutation(async ({ ctx }) => {
		try {
			const userId = ctx.session.user.id;
			return spacesRepo.createDefaultSpaces(userId);
		} catch (e) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: `${e}`,
			});
		}
	}),
	all: protectedProcedure.query(async ({ ctx }) => {
		const spaces = await spacesRepo.getAll({ userId: ctx.session.user.id });
		return spaces;
	}),
	defaultSpace: protectedProcedure.query(async ({ ctx }) => {
		const space = await spacesRepo.getDefaultSpace(ctx.session.user.id);
		return space;
	}),
	byId: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const space = await spacesRepo.getByPublicId(
				input.id,
				ctx.session.user.id,
			);

			if (!space)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Space not found",
				});

			return space;
		}),
	create: protectedProcedure
		.input(InsertSpace.omit({ publicId: true }))
		.mutation(async ({ ctx, input }) => {
			try {
				const result = await spacesRepo.create({
					...input,
					userId: ctx.session.user.id,
					publicId: publicIds.space(),
				});

				if (!result)
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create space",
					});

				return result;
			} catch (e) {
				console.log(e);
			}
		}),

	update: protectedProcedure
		.input(
			UpdateSpace.extend({
				publicId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await spacesRepo.getByPublicId(
				input.publicId,
				ctx.session.user.id,
			);

			if (!existing)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Space not found",
				});

			const result = await spacesRepo.update({
				...input,
				id: existing.id,
				userId: ctx.session.user.id,
			});

			if (!result)
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update space",
				});

			return result;
		}),
});
