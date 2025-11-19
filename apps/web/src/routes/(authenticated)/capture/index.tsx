import { createFileRoute } from "@tanstack/react-router";
import Container from "@/components/container";
import CapturePage from "@/view/capture";

export const Route = createFileRoute("/(authenticated)/capture/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Container className="px-2">
			<CapturePage />
		</Container>
	);
}
