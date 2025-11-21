import type { SelectItem } from "@kirosumi/db/schema/item";
import { useMutation } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/core";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import DescriptionEditor from "@/components/editor/description-editor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/router";
import { useModal } from "@/store/modal.store";
import { useTRPC } from "@/utils/trpc";

interface Props {
	data: SelectItem | null;
}

export default function ScratchDetail({ data }: Props) {
	const { openModal } = useModal();
	const trpc = useTRPC();

	const [name, setName] = useState(data?.name ?? "");
	const [content, setContent] = useState<JSONContent | null>(
		(data?.content as JSONContent) ?? null,
	);

	useEffect(() => {
		if (data) {
			setName(data.name ?? "");
			setContent((data.content as JSONContent) ?? null);
		}
	}, [data]);

	const updateMutation = useMutation(
		trpc.item.update.mutationOptions({
			onMutate: async (variables) => {
				const queryKey = trpc.item.all.queryKey();
				await queryClient.cancelQueries({ queryKey });

				const previousItems = queryClient.getQueryData(queryKey);

				queryClient.setQueryData(
					queryKey,
					(old: any) =>
						old?.map((i: any) =>
							i.publicId === variables.publicId
								? {
										...i,
										name: variables.name ?? i.name,
										content: variables.content ?? i.content,
										updatedAt: new Date().toISOString(),
									}
								: i,
						) ?? previousItems,
				);

				return { previousItems };
			},
			onError: (err, _vars, ctx) => {
				if (ctx?.previousItems) {
					queryClient.setQueryData(trpc.item.all.queryKey(), ctx.previousItems);
				}
				toast.error(err.message || "Failed to update");
			},
			onSuccess: () => {},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.item.all.queryKey(),
				});
			},
		}),
	);

	const debouncedUpdateName = useDebouncedCallback((value: string) => {
		if (!data) return;
		updateMutation.mutate({ publicId: data.publicId, name: value });
	}, 600);

	const debouncedUpdateContent = useDebouncedCallback(
		(value: JSONContent | null) => {
			if (!data) return;
			updateMutation.mutate({ publicId: data.publicId, content: value });
		},
		900,
	);

	const handleNameChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setName(value);
		debouncedUpdateName(value);
	};

	const handleContentChange = (value: JSONContent) => {
		setContent(value);
		debouncedUpdateContent(value);
	};

	if (!data) return null;

	return (
		<ScrollArea className="flex h-full flex-col space-y-2 overflow-y-hidden px-6 pb-2">
			<Textarea
				value={name}
				onChange={handleNameChange}
				className="h-auto resize-none border-0 p-0 font-bold text-xl shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-xl dark:bg-transparent"
				placeholder="Untitled item"
			/>

			<DescriptionEditor
				content={content as JSONContent}
				onChange={handleContentChange}
			/>
		</ScrollArea>
	);
}
