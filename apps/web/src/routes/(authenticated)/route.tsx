import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Ellipsis, Maximize, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/header";
import Modal from "@/components/modal";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { queryClient } from "@/router";
import { useCaptureStore } from "@/store/capture.store";
import { useModal } from "@/store/modal.store";
import { useTRPC } from "@/utils/trpc";
import CaptureItemModal from "@/view/capture/components/capture-item-modal";
import NewCaptureForm from "@/view/capture/components/new-capture-form";

export const Route = createFileRoute("/(authenticated)")({
	component: RouteComponent,
});

function RouteComponent() {
	const { modalContentType, isOpen } = useModal();
	const { currentCapture, setCurrentCapture } = useCaptureStore();
	const RenderModalContent = () => {
		return (
			<>
				<Modal
					isVisible={isOpen && modalContentType === "CREATE_CAPTURE"}
					closeOnClickOutside={true}
					header={<NewCaptureHeader />}
				>
					<NewCaptureForm />
				</Modal>
				<Modal
					header={<CaptureDetailModalHeader />}
					onClose={() => setCurrentCapture(null)}
					isVisible={isOpen && modalContentType === "CAPTURE_DETAILS"}
					closeOnClickOutside={true}
				>
					<CaptureItemModal data={currentCapture} />
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
		<DialogHeader className="flex flex-row items-center justify-end px-2 py-1">
			<div className="flex flex-row items-center gap-2">
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Button variant="ghost" size="icon">
							<Ellipsis />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuGroup>
							<DropdownMenuItem variant="destructive" onClick={handleDelete}>
								<Trash className="text-muted-foreground" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</DialogHeader>
	);
}
