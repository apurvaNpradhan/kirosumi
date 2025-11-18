import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/header";
import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<Header />
			Kirosumi
		</div>
	);
}
