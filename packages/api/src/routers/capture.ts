import * as captureRepo from "@kirosumi/db/repository/capture.repo";
import { InsertCapture, UpdateCapture } from "@kirosumi/db/schema";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { protectedProcedure, router } from "..";
import drizzleError from "../errors/drizzle-error";

export const captureRouter = router({
	all: protectedProcedure.query(async ({ ctx }) => {
		try {
			return await captureRepo.getAll({
				createdBy: ctx.session.user.id,
			});
		} catch (err) {
			throw drizzleError(err, "Failed to fetch captures");
		}
	}),

	byId: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			try {
				const capture = await captureRepo.getById(
					input.id,
					ctx.session.user.id,
				);

				if (!capture) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Capture not found",
					});
				}

				return capture;
			} catch (err) {
				throw drizzleError(err, "Failed to fetch capture");
			}
		}),

	create: protectedProcedure
		.input(InsertCapture)
		.mutation(async ({ ctx, input }) => {
			try {
				const result = await captureRepo.create({
					...input,
					createdBy: ctx.session.user.id,
				});

				if (!result) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create capture",
					});
				}

				return result;
			} catch (err) {
				throw drizzleError(err, "Unable to create capture");
			}
		}),

	update: protectedProcedure
		.input(UpdateCapture.extend({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			try {
				const existing = await captureRepo.getById(
					input.id,
					ctx.session.user.id,
				);

				if (!existing) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Capture not found",
					});
				}

				const result = await captureRepo.update({
					...input,
					createdBy: ctx.session.user.id,
				});

				if (!result) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to update capture",
					});
				}

				return result;
			} catch (err) {
				throw drizzleError(err, "Unable to update capture");
			}
		}),

	softDelete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			try {
				const result = await captureRepo.softDelete({
					id: input.id,
					createdBy: ctx.session.user.id,
					deletedAt: new Date(),
				});

				if (!result) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to delete capture",
					});
				}

				return result;
			} catch (err) {
				throw drizzleError(err, "Unable to delete capture");
			}
		}),

	hardDelete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			try {
				const result = await captureRepo.hardDelete({
					id: input.id,
					createdBy: ctx.session.user.id,
				});

				if (!result) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to permanently delete capture",
					});
				}

				return result;
			} catch (err) {
				throw drizzleError(err, "Unable to permanently delete capture");
			}
		}),
});
