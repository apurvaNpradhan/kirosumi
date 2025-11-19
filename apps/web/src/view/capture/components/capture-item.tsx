import type { SelectCapture } from "@kirosumi/db/schema/capture";
import { useMutation } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/core";
import { format, isToday, isYesterday } from "date-fns";
import {
	Archive,
	CheckCircle,
	Ellipsis,
	Kanban,
	LucidePaperclip,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { queryClient } from "@/router";
import { useCaptureStore } from "@/store/capture.store";
import { useModal } from "@/store/modal.store";
import { useTRPC } from "@/utils/trpc";

export function CaptureItem({
	capture,
	view,
}: {
	capture: SelectCapture;
	view?: "List" | "Timeline";
}) {
	const { setCurrentCapture } = useCaptureStore();
	const { openModal } = useModal();

	const handleOpenDetails = () => {
		setCurrentCapture(capture);
		openModal("CAPTURE_DETAILS");
	};

	const handleActionClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};
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

	return (
		<div className="group relative flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 transition-all hover:bg-primary/5">
			<div
				role="none"
				className="flex min-w-0 flex-1 flex-col space-y-1 pr-8"
				onClick={handleOpenDetails}
			>
				<h3 className="truncate font-medium text-foreground">
					{capture.title}
				</h3>
				{capture.description && (
					<p className="text-muted-foreground text-xs">
						{getReadableDescription(capture.description as JSONContent)}
					</p>
				)}
				{view === "List" && (
					<TimeAgo date={capture.updatedAt ?? capture.createdAt} />
				)}
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger asChild onClick={handleActionClick}>
					<Button
						variant="ghost"
						size="icon"
						className="-translate-y-1/2 absolute top-1/2 right-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
					>
						<Ellipsis className="h-4 w-4" />
						<span className="sr-only">Open actions</span>
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
					<DropdownMenuItem
						variant="destructive"
						onClick={() =>
							deleteMutation.mutate({
								id: capture.id,
							})
						}
					>
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

function TimeAgo({ date }: { date: string | Date }) {
	const d = new Date(date);
	const today = isToday(d);
	const yesterday = isYesterday(d);

	if (today) {
		return null;
	}
	if (yesterday) {
		return <span className="text-muted-foreground text-xs">Yesterday</span>;
	}
	return (
		<span className="text-muted-foreground text-xs">
			{format(d, "MMM d, yyyy")}
		</span>
	);
}

function getReadableDescription(
	json: JSONContent | null | undefined,
	maxLength = 200,
): string {
	if (!json) return "";

	const content = (json as any)?.json?.content || json.content || [];

	let result = "";

	function extractTextFromNode(node: JSONContent): string {
		if (!node) return "";
		if (node.type === "text") {
			return node.text || "";
		}
		if (node.content && Array.isArray(node.content)) {
			return node.content.map(extractTextFromNode).join("");
		}
		return "";
	}
	if (!result) {
		result = extractTextFromNode({ content });
	}
	const clean = result.replace(/\s+/g, " ").trim();

	if (clean.length <= maxLength) return clean;
	return clean.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}
