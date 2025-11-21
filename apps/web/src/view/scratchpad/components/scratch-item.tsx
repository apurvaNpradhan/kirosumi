import type { SelectItem } from "@kirosumi/db/schema/item";
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
import { useItemStore } from "@/store/item.store";
import { useModal } from "@/store/modal.store";
import { useTRPC } from "@/utils/trpc";
export function ScratchItem({
	item,
	view = "List",
}: {
	item: SelectItem & { kind: "scratch" };
	view?: "List" | "Timeline";
}) {
	const { openModal } = useModal();
	const { setCurrentItem } = useItemStore();
	const handleOpenDetails = () => {
		setCurrentItem(item);
		openModal("SCRATCH_DETAILS");
	};

	const handleActionClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	const trpc = useTRPC();

	const deleteMutation = useMutation(
		trpc.item.delete.mutationOptions({
			onMutate: async ({ publicId }) => {
				const queryKey = trpc.item.all.queryKey();
				await queryClient.cancelQueries({ queryKey });
				const previousItems = queryClient.getQueryData(queryKey);

				queryClient.setQueryData(queryKey, (old: any) =>
					old?.filter((i: SelectItem) => i.publicId !== publicId),
				);

				return { previousItems };
			},
			onError: (err, _vars, context) => {
				if (context?.previousItems) {
					queryClient.setQueryData(
						trpc.item.all.queryKey(),
						context.previousItems,
					);
				}
				toast.error(err.message || "Failed to delete scratch");
			},
			onSuccess: () => {
				toast.success("Scratch deleted");
			},
			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: trpc.item.all.queryKey() });
			},
		}),
	);

	return (
		<div className="group relative flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1 transition-all hover:bg-primary/5">
			<div
				role={"none"}
				className="flex min-w-0 flex-1 flex-col space-y-1 pr-8"
				onClick={handleOpenDetails}
			>
				<h3 className="truncate font-medium text-foreground text-lg">
					{item.name}
				</h3>

				{/*{item.content && (
          <p className="text-muted-foreground text-xs line-clamp-2">
            {getReadableContent(item.content as JSONContent)}
          </p>
        )}
*/}
				{/*{view === "List" && <TimeAgo date={item.updatedAt ?? item.createdAt} />}*/}
			</div>

			{/* Actions Dropdown */}
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

				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel>Convert to</DropdownMenuLabel>
					<DropdownMenuGroup>
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								openModal("CONVERT_CAPTURE_TO_TASK");
							}}
						>
							<CheckCircle className="mr-2 h-4 w-4" />
							Task
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								// openModal("CONVERT_CAPTURE_TO_TASK", {
								//   item,
								//   targetKind: "project",
								// });
							}}
						>
							<Kanban className="mr-2 h-4 w-4" />
							Project
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								// openModal("CONVERT_CAPTURE_TO_TASK", {
								//   item,
								//   targetKind: "note",
								// });
							}}
						>
							<LucidePaperclip className="mr-2 h-4 w-4" />
							Note
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								// archive logic
								toast("Archiving coming soon...");
							}}
						>
							<Archive className="mr-2 h-4 w-4" />
							Archive
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuItem
						variant="destructive"
						onClick={(e) => {
							e.stopPropagation();
							deleteMutation.mutate({ publicId: item.publicId });
						}}
						disabled={deleteMutation.isPending}
					>
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

// Helper: Show relative time (Today → nothing, Yesterday → "Yesterday", else date)
function TimeAgo({ date }: { date: string | Date | null }) {
	if (!date) return null;
	const d = new Date(date);

	if (isToday(d)) return null;
	if (isYesterday(d))
		return <span className="text-muted-foreground text-xs">Yesterday</span>;

	return (
		<span className="text-muted-foreground text-xs">
			{format(d, "MMM d, yyyy")}
		</span>
	);
}

// Extract plain text from Tiptap JSONContent
function getReadableContent(
	json: JSONContent | null | undefined,
	maxLength = 180,
): string {
	if (!json || !json.content) return "";

	let text = "";

	function walk(node: JSONContent) {
		if (node.text) {
			text += node.text + " ";
		}
		if (Array.isArray(node.content)) {
			node.content.forEach(walk);
		}
	}

	json.content.forEach(walk);

	const clean = text.trim().replace(/\s+/g, " ");
	return clean.length > maxLength
		? clean.slice(0, maxLength).replace(/\s+\S*$/, "") + "…"
		: clean;
}
