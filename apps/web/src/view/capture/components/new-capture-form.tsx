import { InsertCapture } from "@kirosumi/db/schema/capture";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ListFilterIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useModal } from "@/store/modal.store";
import { useTRPC } from "@/utils/trpc";

export default function NewCaptureForm() {
	const { closeModal } = useModal();
	const trpc = useTRPC();
	const { refetch: refetchCaptures } = useQuery(
		trpc.capture.all.queryOptions(),
	);
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
			},
			onError: (err) => {
				toast.error(err.message);
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
		} as z.input<typeof InsertCapture>,
		validators: {
			onDynamic: InsertCapture,
			onDynamicAsyncDebounceMs: 300,
		},
		onSubmit: async ({ value }) => {
			await createMutation.mutateAsync(value);
		},
		onSubmitInvalid: ({ formApi }) => {
			const errorMap = formApi.state.errorMap.onDynamic;
			const firstErrorField = Object.keys(errorMap || {}).find(
				(name) => errorMap?.[name],
			);
			if (firstErrorField) {
				const input = document.querySelector(
					`input[name="${firstErrorField}"], button[name="${firstErrorField}"]`,
				) as HTMLInputElement | HTMLButtonElement | null;
				input?.focus();
			}
		},
	});

	useEffect(() => {
		const titleElement = document.querySelector<HTMLElement>("title-input");
		titleElement?.focus();
	}, []);
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="flex h-full flex-col space-y-2 px-6 pb-5"
		>
			<form.Field name="title">
				{(field) => (
					<div className="flex flex-1 flex-col gap-1">
						<Input
							id="title-input"
							name={field.name}
							placeholder="New Capture"
							type="text"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							aria-invalid={!!field.state.meta.errors.length}
						/>
						{field.state.meta.errors.map((error, _i) => (
							<p key={error?.message} className="mt-1 text-destructive text-sm">
								{error?.message}
							</p>
						))}
					</div>
				)}
			</form.Field>
			{showDescription && (
				<form.Field name="description">
					{(field) => (
						<div className="flex flex-1 flex-col gap-1">
							<Textarea
								id="capture-description"
								name={field.name}
								placeholder="Add details..."
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={!!field.state.meta.errors.length}
							/>
							{field.state.meta.errors.map((error, _i) => (
								<p
									key={error?.message}
									className="mt-1 text-destructive text-sm"
								>
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>
			)}
			<div className="flex justify-between py-2">
				<Button
					variant="secondary"
					onClick={() => setShowDescription(!showDescription)}
					type="button"
				>
					<ListFilterIcon className="text-muted-foreground" />
				</Button>
				<form.Subscribe
					selector={(state) => ({
						isSubmitting: state.isSubmitting,
						canSubmit: state.canSubmit,
						values: state.values,
					})}
				>
					{({ isSubmitting, canSubmit, values }) => (
						<div className="flex flex-row items-center gap-2">
							<Button
								variant="secondary"
								onClick={() => {
									closeModal();
									form.reset();
								}}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								disabled={isSubmitting || !canSubmit || !values.title.trim()}
							>
								{isSubmitting ? (
									<>
										<Spinner />
										Saving
									</>
								) : (
									"Save"
								)}
							</Button>
						</div>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
