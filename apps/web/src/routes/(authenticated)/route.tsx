import type { SelectCapture } from "@kirosumi/db/schema/capture";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
	Archive,
	ArrowLeft,
	CheckCircle,
	Ellipsis,
	Kanban,
	LucidePaperclip,
	Maximize,
	Pencil,
	Trash,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/header";
import Modal from "@/components/modal";
import { Badge } from "@/components/ui/badge";
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
import { getUser } from "@/functions/get-user";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/router";
import { useCaptureStore } from "@/store/capture.store";
import { useModal } from "@/store/modal.store";
import { useTRPC } from "@/utils/trpc";
import CaptureItemModal from "@/view/capture/components/capture-item-modal";
import NewCaptureForm from "@/view/capture/components/new-capture-form";

export const Route = createFileRoute("/(authenticated)")({
	component: RouteComponent,
	beforeLoad: async () => {
		if (typeof window === "undefined") return;
		const session = await getUser();
		if (!session?.session) {
			throw redirect({ to: "/login" });
		}

		return { session };
	},
});

function RouteComponent() {
	const { modalContentType, isOpen, closeModals, closeModal } = useModal();
	const { currentCapture, setCurrentCapture } = useCaptureStore();
	const RenderModalContent = () => {
		return (
			<>
				<Modal
					isVisible={isOpen && modalContentType === "CREATE_CAPTURE"}
					headerShown={false}
					closeOnClickOutside={true}
					modalSize="lg"
					allowMaximize={false}
				>
					<NewCaptureForm />
				</Modal>
				<Modal
					header={<CaptureDetailModalHeader />}
					modalSize="lg"
					onClose={() => setCurrentCapture(null)}
					isVisible={isOpen && modalContentType === "CAPTURE_DETAILS"}
					closeOnClickOutside={true}
				>
					<CaptureItemModal data={currentCapture} />
				</Modal>
				<Modal
					closeOnClickOutside={true}
					modalSize="lg"
					isVisible={isOpen && modalContentType === "CONVERT_CAPTURE_TO_TASK"}
					header={<ConvertToTaskModalHeader capture={currentCapture} />}
				>
					<div className="flex flex-col space-y-2 px-6 pb-2">
						<div className="flex flex-col justify-start gap-2">
							<Label>Task Name</Label>
							<Input defaultValue={currentCapture?.title} className="w-full" />
						</div>
						<Button
							className=""
							variant={"ghost"}
							onClick={() => closeModals(2)}
						>
							Close
						</Button>
						<Button variant="outline" size="sm" onClick={() => closeModals(2)}>
							On Submit
						</Button>
					</div>
				</Modal>
			</>
		);
	};
	return (
		<>
			<div className="flex h-screen flex-col">
				<Header />
				<Outlet />
			</div>
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
function NewCaptureHeader() {
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
