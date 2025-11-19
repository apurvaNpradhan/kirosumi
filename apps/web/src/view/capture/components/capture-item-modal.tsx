import type { SelectCapture } from "@kirosumi/db/schema/capture";
import { useMutation } from "@tanstack/react-query";
import type { JSONContent, TiptapEditorHTMLElement } from "@tiptap/core";
import {
	Archive,
	CheckCircleIcon,
	Kanban,
	LucidePaperclip,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import DescriptionEditor from "@/components/editor/description-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/router";
import { useModal } from "@/store/modal.store";
import { useTRPC } from "@/utils/trpc";

interface Props {
	data: SelectCapture | null;
}

export default function CaptureItemModal({ data }: Props) {
	const { openModal } = useModal();
	const trpc = useTRPC();

	const [title, setTitle] = useState(data?.title ?? "");
	const [description, setDescription] = useState(data?.description ?? "");

	useEffect(() => {
		if (data) {
			setTitle(data.title ?? "");
			setDescription(data.description ?? "");
		}
	}, [data]);

	const updateMutation = useMutation(
		trpc.capture.update.mutationOptions({
			onMutate: async (variables) => {
				const queryKey = trpc.capture.all.queryKey();
				await queryClient.cancelQueries({ queryKey });
				const previousCaptures = queryClient.getQueryData(queryKey);

				queryClient.setQueryData(
					queryKey,
					(old: any) =>
						old?.map((c: any) =>
							c.id === variables.id
								? {
										...c,
										title: variables.title ?? c.title,
										description: variables.description ?? c.description,
										updatedAt: new Date().toISOString(),
									}
								: c,
						) ?? previousCaptures,
				);

				return { previousCaptures };
			},
			onError: (err, _vars, ctx) => {
				if (ctx?.previousCaptures) {
					queryClient.setQueryData(
						trpc.capture.all.queryKey(),
						ctx.previousCaptures,
					);
				}
				toast.error(err.message || "Failed to update");
			},
			onSuccess: () => {
				toast.success("Saved");
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.capture.all.queryKey(),
				});
			},
		}),
	);

	const debouncedUpdateTitle = useDebouncedCallback((value: string) => {
		if (!data) return;
		updateMutation.mutate({ id: data.id, title: value });
	}, 400);

	const debouncedUpdateDescription = useDebouncedCallback(
		(value: JSONContent) => {
			if (!data) return;
			updateMutation.mutate({ id: data.id, description: value });
		},
		600,
	);

	const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setTitle(value);
		debouncedUpdateTitle(value);
	};

	const handleDescriptionChange = (
		// e: React.ChangeEvent<TiptapEditorHTMLElement>,
		description: JSONContent,
	) => {
		setDescription(description);
		debouncedUpdateDescription(description);
	};

	if (!data) {
		return null;
	}

	return (
		<ScrollArea className="flex h-full flex-col space-y-2 overflow-y-hidden px-6 pb-2">
			<Textarea
				value={title}
				onChange={handleTitleChange}
				className="h-auto resize-none border-0 p-0 font-bold text-xl shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-xl dark:bg-transparent"
				placeholder="Untitled"
			/>

			<DescriptionEditor
				content={description as JSONContent}
				onChange={handleDescriptionChange}
			/>

			<div className="mt-5 flex flex-col space-y-2">
				<span className="font-medium text-foreground/70 text-sm">
					Convert to
				</span>
				<div className="flex flex-row flex-wrap items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => openModal("CONVERT_CAPTURE_TO_TASK")}
					>
						<CheckCircleIcon className="mr-2 h-4 w-4" />
						Task
					</Button>
					<Button variant="outline" size="sm">
						<Kanban className="mr-2 h-4 w-4" />
						Project
					</Button>
					<Button variant="outline" size="sm">
						<LucidePaperclip className="mr-2 h-4 w-4" />
						Document
					</Button>

					<Button variant="outline" size="sm">
						<Archive className="mr-2 h-4 w-4" />
						Archive
					</Button>
				</div>
			</div>
		</ScrollArea>
	);
}
