import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/(authenticated)/capture/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const trpc = useTRPC();
	const privateData = useQuery(trpc.privateData.queryOptions());

	return (
		<div>
			<h1>Dashboard</h1>
			<p>API: {privateData.data?.message}</p>
		</div>
	);
}
