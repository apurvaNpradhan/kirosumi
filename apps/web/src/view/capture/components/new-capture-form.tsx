import { useMutation, useQuery } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/core";
import { ListFilterIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DescriptionEditor from "@/components/editor/description-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useModal } from "@/store/modal.store";
import { useTRPC } from "@/utils/trpc";

export default function NewCaptureForm() {
	const { closeModal } = useModal();
	const trpc = useTRPC();
	const { refetch: refetchCaptures } = useQuery(
		trpc.capture.all.queryOptions(),
	);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState<JSONContent | null>(null);
	const [showDescription, setShowDescription] = useState(false);

	const createMutation = useMutation(
		trpc.capture.create.mutationOptions({
			onSuccess: async (board) => {
				if (!board) {
					toast.error("Failed to create capture");
					return;
				}

				await refetchCaptures();
				closeModal();
				setTitle("");
				setDescription(null);
			},
			onError: (err) => {
				toast.error(err.message);
			},
		}),
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!title.trim()) {
			toast.error("Title is required");
			return;
		}

		createMutation.mutate({
			title,
			description,
		});
	};

	const handleCancel = () => {
		closeModal();
		setTitle("");
		setDescription(null);
	};

	useEffect(() => {
		const titleElement =
			document.querySelector<HTMLInputElement>("#title-input");
		titleElement?.focus();
	}, []);

	return (
		<form
			onSubmit={handleSubmit}
			className="flex h-full flex-col space-y-4 px-6 pb-5"
		>
			<div className="flex flex-1 flex-col gap-1">
				<Input
					id="title-input"
					autoFocus
					name="title"
					placeholder="New Capture"
					className="h-auto w-full overflow-hidden text-ellipsis whitespace-normal border-none px-0 font-semibold shadow-none outline-none focus-visible:ring-0 md:text-xl dark:bg-transparent"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>
			</div>

			{showDescription && (
				<div className="flex flex-1 flex-col gap-1">
					<DescriptionEditor
						content={description as JSONContent}
						onChange={setDescription}
					/>
				</div>
			)}

			<div className="flex justify-between py-2">
				<Button
					variant="secondary"
					onClick={() => setShowDescription(!showDescription)}
					type="button"
				>
					<ListFilterIcon className="text-muted-foreground" />
				</Button>

				<div className="flex flex-row items-center gap-2">
					<Button
						variant="secondary"
						onClick={handleCancel}
						disabled={createMutation.isPending}
						type="button"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={createMutation.isPending || !title.trim()}
					>
						{createMutation.isPending ? (
							<>
								<Spinner />
								Saving
							</>
						) : (
							"Save"
						)}
					</Button>
				</div>
			</div>
		</form>
	);
}
