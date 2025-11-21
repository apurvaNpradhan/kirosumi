import * as projectRepo from "@kirosumi/db/repository/project.repo";
import * as spacesRepo from "@kirosumi/db/repository/space.repo";
import { InsertProject, UpdateProject } from "@kirosumi/db/schema/project";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "..";

export const projectRouter = router({
	createDefaultProject: protectedProcedure
		.input(z.object({ defaultSpaceId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			return projectRepo.createDefaultProject(
				ctx.session.user.id,
				input.defaultSpaceId,
			);
		}),

	all: protectedProcedure.query(async ({ ctx }) => {
		return projectRepo.getAll({ userId: ctx.session.user.id });
	}),

	bySpaceId: protectedProcedure
		.input(z.object({ spacePublicId: z.string() }))
		.query(async ({ ctx, input }) => {
			const spaceId = await spacesRepo.getIdByPublicId(input.spacePublicId);
			if (!spaceId)
				throw new TRPCError({ code: "NOT_FOUND", message: "Space not found" });

			return projectRepo.getBySpaceId(spaceId, ctx.session.user.id);
		}),

	byId: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const project = await projectRepo.getByPublicId(
				input.id,
				ctx.session.user.id,
			);
			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}
			return project;
		}),

	create: protectedProcedure
		.input(
			InsertProject.extend({
				spacePublicId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { spacePublicId, ...data } = input;

			const spaceId = await spacesRepo.getIdByPublicId(spacePublicId);
			if (!spaceId)
				throw new TRPCError({ code: "NOT_FOUND", message: "Space not found" });

			const result = await projectRepo.create({
				...data,
				userId: ctx.session.user.id,
				spaceId,
			});

			if (!result) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create project",
				});
			}
			return result;
		}),

	update: protectedProcedure
		.input(UpdateProject.extend({ publicId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { publicId, ...data } = input;

			const existing = await projectRepo.getByPublicId(
				publicId,
				ctx.session.user.id,
			);
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			const result = await projectRepo.update({
				...data,
				id: existing.id,
				userId: ctx.session.user.id,
			});

			if (!result) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update project",
				});
			}
			return result;
		}),

	delete: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await projectRepo.getByPublicId(
				input.publicId,
				ctx.session.user.id,
			);
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			const result = await projectRepo.softDelete({
				id: existing.id,
				userId: ctx.session.user.id,
			});

			if (!result) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to delete project",
				});
			}
			return result;
		}),
});
