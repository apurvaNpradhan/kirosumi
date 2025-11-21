import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import Header from "@/components/header";
import Container from "@/components/layout/container";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useModal } from "@/store/modal.store";
import { useTRPC } from "@/utils/trpc";
import CaptureListSection from "../capture/components/capture-list-section";

export default function InboxPage() {
	const trpc = useTRPC();
	const { data, isPending } = useQuery(trpc.space.defaultSpace.queryOptions());
	if (isPending) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}
	if (data?.items) {
		return <EmptyInboxView />;
	}
	return (
		<div className="flex flex-col space-y-6">
			<h1 className="font-bold text-4xl">My inbox</h1>
		</div>
	);
}

function EmptyInboxView() {
	const { openModal } = useModal();

	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>Nothing captured yet.</EmptyTitle>
				<EmptyDescription>
					Start capturing ideas, links, notes, or anything worth remembering.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={() => openModal("CREATE_CAPTURE")}>
					<Plus className="mr-2 h-4 w-4" />
					Capture now
				</Button>
			</EmptyContent>
		</Empty>
	);
}
