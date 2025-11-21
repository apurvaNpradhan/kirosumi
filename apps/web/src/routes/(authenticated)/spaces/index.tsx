import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "@/components/header";
import Container from "@/components/layouts/container";
import MainLayout from "@/components/layouts/main-layout";
import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/(authenticated)/spaces/")({
	component: RouteComponent,
});

function RouteComponent() {
	const trpc = useTRPC();
	const { data, isPending } = useQuery(trpc.space.all.queryOptions());
	if (isPending) return <div>Loading...</div>;
	if (!data) return null;
	return (
		<MainLayout header={<Header />}>
			<Container>
				{data.map((space) => (
					<Link
						to={"/spaces/$id"}
						params={{ id: space.publicId }}
						key={space.id}
					>
						<span>{space.name}</span>
					</Link>
				))}
			</Container>
		</MainLayout>
	);
}
