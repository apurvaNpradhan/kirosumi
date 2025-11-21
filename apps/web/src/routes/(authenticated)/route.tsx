import type { SelectCapture } from "@kirosumi/db/schema/capture";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
	Archive,
	ArrowLeft,
	CheckCircle,
	Ellipsis,
	Kanban,
	LucidePaperclip,
} from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/modal";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/router";
import { useCaptureStore } from "@/store/capture.store";
import { useModal } from "@/store/modal.store";
import { useTRPC } from "@/utils/trpc";
import CaptureItemModal from "@/view/capture/components/capture-item-modal";
import NewCaptureForm from "@/view/capture/components/new-capture-form";
import NewScratchForm from "@/view/scratchpad/components/new-scratchpad-form";

export const Route = createFileRoute("/(authenticated)")({
	component: RouteComponent,
	beforeLoad: async () => {
		if (typeof window === "undefined") return;
		const session = await authClient.getSession();

		if (!session) {
			throw redirect({ to: "/login" });
		}

		console.log(session);
		return { session };
	},
});

function RouteComponent() {
	const { modalContentType, isOpen, closeModals, closeModal } = useModal();
	const { currentItem, setCurrentItem } = useItemStore();
	const trpc = useTRPC();
	const { data } = useQuery(trpc.space.all.queryOptions());
	const RenderModalContent = () => {
		return (
			<>
				<Modal
					isVisible={isOpen && modalContentType === "CREATE_SCRATCH"}
					headerShown={false}
					closeOnClickOutside={true}
					modalSize="lg"
					allowMaximize={false}
				>
					<NewScratchForm />
				</Modal>
				<Modal
					isVisible={isOpen && modalContentType === "SCRATCH_DETAILS"}
					dialogHeader={{
						title: `${currentItem?.name}'s detail`,
						description: "View and edit the details of this scratchpad",
					}}
					closeOnClickOutside={true}
					modalSize="lg"
					allowMaximize={false}
					onClose={() => setCurrentItem(null)}
				>
					<div>
						<ScratchDetail data={currentItem} />
					</div>
				</Modal>
			</>
		);
	};
	return (
		<>
			<Outlet />
			{RenderModalContent()}
		</>
	);
}

function ConvertToTaskModalHeader({ capture }: { capture: SelectCapture }) {
	const { closeModal } = useModal();
	return (
		<DialogHeader className="flex flex-row px-2 py-1">
			<DialogTitle className="flex flex-row items-center space-x-1">
				<Button variant="ghost" size="icon" onClick={closeModal}>
					<ArrowLeft />
				</Button>
			</DialogTitle>
		</DialogHeader>
	);
}
function _NewCaptureHeader() {
	return (
		<DialogHeader className="px-6 pt-4">
			<DialogTitle>New Capture</DialogTitle>
		</DialogHeader>
	);
}
function CaptureDetailModalHeader() {
	const { closeModal } = useModal();
	const { currentCapture } = useCaptureStore();
	const trpc = useTRPC();
	const deleteMutation = useMutation(
		trpc.capture.softDelete.mutationOptions({
			onMutate: async (variables) => {
				const queryKey = trpc.capture.all.queryKey();
				await queryClient.cancelQueries({ queryKey });
				const previousCaptures = queryClient.getQueryData(queryKey);
				queryClient.setQueryData(queryKey, (old) => {
					return old?.filter((c) => c.id !== variables.id) || previousCaptures;
				});
				return { previousCaptures };
			},
			onError: (err, _vars, ctx) => {
				if (ctx?.previousCaptures) {
					queryClient.setQueryData(
						trpc.capture.all.queryKey(),
						ctx.previousCaptures,
					);
				}
				toast.error(err.message);
			},
			onSuccess: () => {
				toast.success("Deleted!");
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.capture.all.queryKey(),
				});
			},
		}),
	);
	const handleDelete = () => {
		deleteMutation.mutate({ id: currentCapture?.id });
		closeModal();
	};

	return (
		<div className="flex flex-row items-center gap-2">
			<DropdownMenu>
				<DropdownMenuTrigger>
					<Button variant="ghost" size="icon">
						<Ellipsis />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Convert to</DropdownMenuLabel>
					<DropdownMenuGroup>
						<DropdownMenuItem>
							<CheckCircle className="mr-2 h-4 w-4" />
							Task
						</DropdownMenuItem>
						<DropdownMenuItem>
							<Kanban className="mr-2 h-4 w-4" />
							Project
						</DropdownMenuItem>
						<DropdownMenuItem>
							<LucidePaperclip className="mr-2 h-4 w-4" />
							Document
						</DropdownMenuItem>
						<DropdownMenuItem>
							<Archive className="mr-2 h-4 w-4" />
							Archive
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuItem variant="destructive" onClick={handleDelete}>
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

import type { SelectSpace } from "@kirosumi/db/schema/space";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useItemStore } from "@/store/item.store";
import ScratchDetail from "@/view/scratchpad/components/scratch-detail";

export default function ProjectSelect({
	data,
	onChange,
}: {
	data: SelectSpace[];
	onChange: (value: string) => void;
}) {
	const defaultProject = data?.find((p) => p.isDefault);

	return (
		<Select
			defaultValue={defaultProject?.publicId}
			onValueChange={(value) => onChange(value)}
		>
			<SelectTrigger className="w-[200px]">
				<SelectValue placeholder="Select Project" />
			</SelectTrigger>

			<SelectContent>
				{data?.map((p) => (
					<SelectItem key={p.publicId} value={p.publicId}>
						{p.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
