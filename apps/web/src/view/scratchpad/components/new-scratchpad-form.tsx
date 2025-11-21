import type { InsertItem } from "@kirosumi/db/schema/item";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/core";
import { useEffect, useRef, useState } from "react"; // ← added useRef
import { toast } from "sonner";
import DescriptionEditor from "@/components/editor/description-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useModal } from "@/store/modal.store";
import { useTRPC } from "@/utils/trpc";

export default function NewScratchForm() {
	const { closeModal } = useModal();
	const trpc = useTRPC();

	const [name, setName] = useState("");
	const [content, setContent] = useState<JSONContent | null>(null);
	const [addMore, setAddMore] = useState(false);

	const titleInputRef = useRef<HTMLInputElement>(null);

	const { refetch: refetchItems } = useQuery(
		trpc.item.all.queryOptions({
			kind: "scratch",
		}),
	);

	const createMutation = useMutation(
		trpc.item.create.mutationOptions({
			onSuccess: async (newItem) => {
				if (!newItem) {
					toast.error("Failed to create scratch");
					return;
				}

				toast.success("Scratch created!");
				await refetchItems();

				if (!addMore) {
					closeModal();
					return;
				}

				setName("");
				setContent(null);

				setTimeout(() => {
					titleInputRef.current?.focus();
				}, 0);
			},
			onError: (err) => {
				toast.error(err.message ?? "Failed to create scratch");
			},
		}),
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			toast.error("Title is required");
			return;
		}
		createMutation.mutate({
			name: name.trim(),
			content: content ?? undefined,
			kind: "scratch",
		});
	};

	const handleCancel = () => {
		closeModal();
	};
	useEffect(() => {
		const timer = setTimeout(() => titleInputRef.current?.focus(), 100);
		return () => clearTimeout(timer);
	}, []);

	return (
		<form onSubmit={handleSubmit} className="flex h-full flex-col px-6 pb-5">
			<div className="mb-4">
				<Input
					ref={titleInputRef}
					id="scratch-title-input"
					placeholder="Scratch title..."
					className="h-auto border-none px-0 font-semibold text-2xl shadow-none outline-none focus-visible:ring-0 md:text-xl dark:bg-transparent"
					value={name}
					onChange={(e) => setName(e.target.value)}
					autoFocus
				/>
			</div>

			<div className="flex-1 overflow-hidden">
				<DescriptionEditor
					content={content as JSONContent}
					onChange={setContent}
				/>
			</div>

			<div className="mt-6 flex justify-end gap-3 border-t pt-4">
				<div className="flex items-center space-x-2">
					<Switch
						id="add-more"
						checked={addMore}
						onCheckedChange={setAddMore}
					/>
					<Label htmlFor="add-more">Add more</Label>
				</div>

				<Button
					type="button"
					variant="secondary"
					onClick={handleCancel}
					disabled={createMutation.isPending}
				>
					Cancel
				</Button>

				<Button
					type="submit"
					disabled={createMutation.isPending || !name.trim()}
				>
					{createMutation.isPending ? (
						<>
							<Spinner className="mr-2" />
							Saving...
						</>
					) : (
						"Save Scratch"
					)}
				</Button>
			</div>
		</form>
	);
}
