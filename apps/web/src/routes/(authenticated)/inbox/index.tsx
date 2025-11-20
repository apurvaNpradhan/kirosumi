import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/(authenticated)/inbox/")({
	component: RouteComponent,
});

function RouteComponent() {
	const trpc = useTRPC();
	const { data, isPending } = useQuery(trpc.space.defaultSpace.queryOptions());
	if (isPending) return <div>Loading...</div>;
	return (
		<div>
			{data?.name}
			<div className="flex flex-col space-y-2">
				<span>Statuses</span>
				{data?.statuses.map((status) => (
					<div key={status.id} className="flex flex-row items-center gap-2">
						<div
							className="h-2 w-2 rounded-full"
							style={{ backgroundColor: status?.color ?? "#f6d860" }}
						/>
						{status?.name}
					</div>
				))}
			</div>
		</div>
	);
}
