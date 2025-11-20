import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/header";
import Container from "@/components/layouts/container";
import MainLayout from "@/components/layouts/main-layout";

export const Route = createFileRoute("/(authenticated)/spaces/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<MainLayout header={<Header />}>
			<Container>Hello "/(authenticated)/spaces/"!</Container>
		</MainLayout>
	);
}
