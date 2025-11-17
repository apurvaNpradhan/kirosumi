import { TRPCError } from "@trpc/server";

export default function drizzleError(
	error: unknown,
	fallbackMessage = "Database error",
) {
	if (error instanceof TRPCError) throw error;
	const err = error as any;
	if (err?.code === "23505") {
		throw new TRPCError({
			code: "CONFLICT",
			message: err?.detail || "Duplicate value violates unique constraint",
		});
	}
	if (err?.code === "23503") {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Invalid reference. Related record does not exist.",
		});
	}
	if (err?.code === "23502") {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Missing required field",
		});
	}
	if (err?.code === "23514") {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Value does not satisfy database constraints",
		});
	}
	if (err?.code === "22003") {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Numeric value out of range",
		});
	}
	throw new TRPCError({
		code: "INTERNAL_SERVER_ERROR",
		message: fallbackMessage,
		cause: err,
	});
}
