import type { SelectItem } from "@kirosumi/db/schema/item";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Container from "@/components/layout/container";
import Header from "@/components/layout/headers/scratchpad";
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
import { ScratchItem } from "./components/scratch-item";

export default function Scratchpad() {
	const trpc = useTRPC();
	const { data, isPending } = useQuery(
		trpc.item.all.queryOptions({
			kind: "scratch",
		}),
	);
	if (isPending) return <Spinner />;
	return (
		<MainLayout header={<Header />}>
			<Container>
				<div className="flex flex-col space-y-1">
					<h1 className="font-bold text-4xl">Scratchpad</h1>
					{data?.length !== 0 && (
						<span className="text-muted-foreground">
							{data?.length} scratch
						</span>
					)}
				</div>
				{data?.length ? <Scratches items={data} /> : <NoScratches />}
			</Container>
		</MainLayout>
	);
}

function Scratches(props: { items: SelectItem[] }) {
	const { items } = props;
	const { openModal } = useModal();
	return (
		<div className="mt-5 flex flex-col items-start space-y-2">
			{items.map((item) => (
				<ScratchItem key={item.id} item={item} />
			))}
			<Button
				className=""
				size={"sm"}
				variant={"ghost"}
				onClick={() => {
					openModal("CREATE_SCRATCH");
				}}
			>
				<Plus className="mr-2 h-4 w-4" />
				Add a scratch
			</Button>
		</div>
	);
}

function NoScratches() {
	const { openModal } = useModal();

	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>Scratchbox is Empty.</EmptyTitle>
				<EmptyDescription>
					Start by adding items you can scratch at later.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={() => openModal("CREATE_SCRATCH")}>
					<Plus className="mr-2 h-4 w-4" />
					Start Scratching
				</Button>
			</EmptyContent>
		</Empty>
	);
}
