import type { SelectCapture } from "@kirosumi/db/schema/capture";
import { useMutation } from "@tanstack/react-query";
import {
	Archive,
	CheckCircleIcon,
	Kanban,
	LucidePaperclip,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/router";
import { useTRPC } from "@/utils/trpc";

interface Props {
	data: SelectCapture | null;
}

export default function CaptureItemModal({ data }: Props) {
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

	const debouncedUpdateDescription = useDebouncedCallback((value: string) => {
		if (!data) return;
		updateMutation.mutate({ id: data.id, description: value });
	}, 600);

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setTitle(value);
		debouncedUpdateTitle(value);
	};

	const handleDescriptionChange = (
		e: React.ChangeEvent<HTMLTextAreaElement>,
	) => {
		const value = e.target.value;
		setDescription(value);
		debouncedUpdateDescription(value);
	};

	if (!data) {
		return null;
	}

	return (
		<div className="flex flex-col space-y-2 px-6 pb-2">
			<Input
				value={title}
				onChange={handleTitleChange}
				className="h-auto border-0 p-0 font-bold text-xl shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-xl dark:bg-transparent"
				placeholder="Untitled"
			/>

			<Textarea
				value={description}
				onChange={handleDescriptionChange}
				className="resize-none border-0 p-0 text-muted-foreground text-sm leading-relaxed shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
				placeholder="Add a description..."
				rows={4}
			/>

			<div className="mt-5 flex flex-col space-y-2">
				<span className="font-medium text-foreground/70 text-sm">
					Convert to
				</span>
				<div className="flex flex-row flex-wrap items-center gap-2">
					<Button variant="outline" size="sm">
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
		</div>
	);
}
