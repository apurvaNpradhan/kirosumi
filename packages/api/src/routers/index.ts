import { protectedProcedure, publicProcedure, router } from "../index";
import { captureRouter } from "./capture";

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
});
export type AppRouter = typeof appRouter;
