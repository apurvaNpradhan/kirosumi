import * as statusRepo from "@kirosumi/db/repository/status.repo";
import { statusTypeEnum } from "@kirosumi/db/schema/status";
import { publicIds } from "@kirosumi/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "..";

export const statusRouter = router({
	allBySpaceId: protectedProcedure
		.input(z.object({ spaceId: z.number() }))
		.query(async ({ input, ctx }) => {
			const statuses = await statusRepo.getAllBySpaceId({
				spaceId: input.spaceId,
				userId: ctx.session.user.id,
			});

			return statuses;
		}),

	byId: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input, ctx }) => {
			const status = await statusRepo.getById(input.id, ctx.session.user.id);

			if (!status) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Status not found",
				});
			}

			return status;
		}),

	byPublicId: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.query(async ({ input, ctx }) => {
			const status = await statusRepo.getByPublicId(
				input.publicId,
				ctx.session.user.id,
			);

			if (!status) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Status not found",
				});
			}

			return status;
		}),

	create: protectedProcedure
		.input(
			z.object({
				spaceId: z.number(),
				name: z.string().min(1).max(100),
				color: z.string().optional(),
				type: statusTypeEnum,
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const result = await statusRepo.create({
				...input,
				publicId: publicIds.status(),
				userId: ctx.session.user.id,
			});

			if (!result) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create status",
				});
			}

			return result;
		}),

	update: protectedProcedure
		.input(
			z.object({
				publicId: z.string(),
				name: z.string().min(1).max(100).optional(),
				color: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await statusRepo.getByPublicId(
				input.publicId,
				ctx.session.user.id,
			);

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Status not found",
				});
			}

			const result = await statusRepo.update({
				id: existing.id,
				userId: ctx.session.user.id,
				...input,
			});

			if (!result) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update status",
				});
			}

			return result;
		}),

	softDelete: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const existing = await statusRepo.getByPublicId(
				input.publicId,
				ctx.session.user.id,
			);

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Status not found",
				});
			}

			const result = await statusRepo.softDelete({
				id: existing.id,
				userId: ctx.session.user.id,
				deletedAt: new Date(),
			});

			if (!result) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to delete status",
				});
			}

			return result;
		}),

	hardDelete: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const existing = await statusRepo.getByPublicId(
				input.publicId,
				ctx.session.user.id,
			);

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Status not found",
				});
			}

			const result = await statusRepo.hardDelete({
				id: existing.id,
				userId: ctx.session.user.id,
			});

			if (!result) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to delete status",
				});
			}

			return result;
		}),
});
