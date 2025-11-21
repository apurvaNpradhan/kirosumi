import type { InsertItem } from "@kirosumi/db/schema/item";
import { publicIds } from "@kirosumi/shared/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/header";
import Container from "@/components/layout/container";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/(authenticated)/spaces/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	const trpc = useTRPC();
	const { id } = Route.useParams();
	const { data, isPending } = useQuery(
		trpc.space.byId.queryOptions({
			id,
		}),
	);
	const inboxTask = {
		kind: "task" as const,
		name: "New Task",
		publicId: publicIds.task(),
		priority: 2,
		statusId: data?.statuses[0].id,
	} as InsertItem;

	const mutation = useMutation(trpc.item.create.mutationOptions());

	const handleGenerateTask = async () => {
		await mutation.mutateAsync({
			name: inboxTask.name,
			publicId: inboxTask.publicId,
			kind: "task",
			spacePublicId: data?.publicId || id,
			statusId: data?.statuses[0].id,
			projectPublicId: data?.projects[0].publicId,
		});
	};
	if (isPending) return <div>Loading...</div>;
	if (!data) return null;
	return (
		<MainLayout header={<Header />}>
			<Container>
				<h1>{data.name}</h1>
				<span>Statues</span>
				{data.statuses.map((status) => (
					<div key={status.id}>
						<span>{status.name}</span>
					</div>
				))}
				<div>
					<h2>Projects</h2>
					{data.projects.map((project) => (
						<div key={project.id}>
							<span>{project.name}</span>
							<span>Project Task</span>
							{project.items.map((item) => {
								return (
									<div key={item.id}>
										<span>{item.name}</span>
										<span>{item.status?.name}</span>
									</div>
								);
							})}
						</div>
					))}
				</div>
				<div className="flex flex-col items-center">
					<span>Tasks</span>
					<Button onClick={handleGenerateTask}>Generate Task</Button>
					{data.items.map((item) => {
						return (
							<div key={item.id}>
								<span>{item.name}</span>
								<span>{item.status?.name}</span>
							</div>
						);
					})}
				</div>
			</Container>
		</MainLayout>
	);
}
