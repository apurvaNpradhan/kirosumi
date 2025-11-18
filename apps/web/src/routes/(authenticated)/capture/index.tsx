import { createFileRoute } from "@tanstack/react-router";
import Container from "@/components/container";
import CapturePage from "@/view/capture";

export const Route = createFileRoute("/(authenticated)/capture/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Container>
			<CapturePage />
		</Container>
	);
}
