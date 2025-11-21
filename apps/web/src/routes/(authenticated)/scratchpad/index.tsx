import { createFileRoute } from "@tanstack/react-router";
import Container from "@/components/layout/container";
import MainLayout from "@/components/layout/main-layout";
import { ThemeToggle } from "@/components/theme-toggle";
import Scratchpad from "@/view/scratchpad";

export const Route = createFileRoute("/(authenticated)/scratchpad/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Scratchpad />
		</>
	);
}
