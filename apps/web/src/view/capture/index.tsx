import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
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
import CaptureListSection from "./components/capture-list-section";

export default function CapturePage() {
	const trpc = useTRPC();
	const { data = [], isPending } = useQuery(trpc.capture.all.queryOptions());
	if (isPending) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (data.length === 0) {
		return <EmptyCaptureView />;
	}

	return (
		<div className="flex flex-col space-y-6">
			<h1 className="font-bold text-4xl">My Captures</h1>
			<CaptureListSection data={data} />
		</div>
	);
}

function EmptyCaptureView() {
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
					Quick Capture
				</Button>
			</EmptyContent>
		</Empty>
	);
}
