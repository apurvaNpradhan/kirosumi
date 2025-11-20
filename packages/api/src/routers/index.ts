import { protectedProcedure, publicProcedure, router } from "../index";
import { captureRouter } from "./capture";
import { spaceRouter } from "./space";
import { statusRouter } from "./status";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	capture: captureRouter,
	space: spaceRouter,
	status: statusRouter,
});
export type AppRouter = typeof appRouter;
