import * as itemRepo from "@kirosumi/db/repository/item.repo";
import * as projectsRepo from "@kirosumi/db/repository/project.repo";
import * as spacesRepo from "@kirosumi/db/repository/space.repo";
import { InsertItem, SelectItem, UpdateItem } from "@kirosumi/db/schema/item";
import { publicIds } from "@kirosumi/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "..";

export const itemRouter = router({
	all: protectedProcedure
		.input(
			z.object({
				spacePublicId: z.string().optional(),
				kind: z.enum(["task", "note", "capture", "scratch"]).optional(),
				includeCompleted: z.boolean().default(false),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			let spaceId: number | undefined;

			if (input.spacePublicId) {
				spaceId = await spacesRepo.getIdByPublicId(input.spacePublicId);
				if (!spaceId) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Space not found",
					});
				}
			}

			return itemRepo.getAll({
				userId,
				spaceId,
				kind: input.kind,
				includeCompleted: input.includeCompleted,
			});
		}),

	inbox: protectedProcedure
		.input(z.object({ spacePublicId: z.string() }))
		.query(async ({ ctx, input }) => {
			const spaceId = await spacesRepo.getIdByPublicId(input.spacePublicId);
			if (!spaceId) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Space not found",
				});
			}

			return itemRepo.getInboxItems(spaceId, ctx.session.user.id);
		}),

	byProject: protectedProcedure
		.input(
			z.object({
				projectPublicId: z.string(),
				includeCompleted: z.boolean().default(false),
			}),
		)
		.query(async ({ ctx, input }) => {
			const projectId = await projectsRepo.getIdByPublicId(
				input.projectPublicId,
			);
			if (!projectId) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			return itemRepo.getByProjectId(
				projectId,
				ctx.session.user.id,
				input.includeCompleted,
			);
		}),

	byId: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.query(async ({ ctx, input }) => {
			const item = await itemRepo.getByPublicId(
				input.publicId,
				ctx.session.user.id,
			);
			if (!item) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Item not found",
				});
			}
			return item;
		}),

	create: protectedProcedure
		.input(
			InsertItem.extend({
				spacePublicId: z.string().optional(),
				projectPublicId: z.string().optional(),
			}).omit({
				publicId: true,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const { spacePublicId, projectPublicId, ...data } = input;
				let spaceId: number | undefined;
				if (spacePublicId) {
					spaceId = await spacesRepo.getIdByPublicId(spacePublicId);
					if (!spaceId) {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: "Space not found",
						});
					}
				}
				let projectId: number | undefined;
				if (projectPublicId) {
					projectId = await projectsRepo.getIdByPublicId(projectPublicId);
					if (!projectId) {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: "Project not found",
						});
					}
				}
				const result = await itemRepo.create({
					...data,
					userId: ctx.session.user.id,
					spaceId,
					publicId: publicIds.item(),
					projectId,
				});

				if (!result) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create item",
					});
				}

				return result;
			} catch (e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `${e}`,
				});
			}
		}),
	update: protectedProcedure
		.input(
			UpdateItem.extend({
				publicId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { publicId, ...data } = input;

			const existing = await itemRepo.getByPublicId(
				publicId,
				ctx.session.user.id,
			);
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Item not found",
				});
			}

			const result = await itemRepo.update({
				...data,
				id: existing.id,
				userId: ctx.session.user.id,
			});

			if (!result) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update item",
				});
			}

			return result;
		}),

	toggleComplete: protectedProcedure
		.input(
			z.object({
				publicId: z.string(),
				completed: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await itemRepo.getByPublicId(
				input.publicId,
				ctx.session.user.id,
			);
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Item not found",
				});
			}

			const completed = input.completed ?? !existing.isCompleted;

			const result = await itemRepo.complete({
				id: existing.id,
				userId: ctx.session.user.id,
				completed,
			});

			if (!result) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update completion status",
				});
			}

			return result;
		}),

	delete: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await itemRepo.getByPublicId(
				input.publicId,
				ctx.session.user.id,
			);
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Item not found",
				});
			}

			const result = await itemRepo.softDelete({
				id: existing.id,
				userId: ctx.session.user.id,
			});

			if (!result) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to delete item",
				});
			}

			return result;
		}),
});
