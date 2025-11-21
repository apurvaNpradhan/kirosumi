import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/header";
import Container from "@/components/layout/container";
import MainLayout from "@/components/layout/main-layout";
import { useTRPC } from "@/utils/trpc";
import InboxPage from "@/view/inbox";

export const Route = createFileRoute("/(authenticated)/inbox/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<MainLayout header={<Header />}>
			<Container>
				<InboxPage />
			</Container>
		</MainLayout>
	);
}
