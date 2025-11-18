import { VisuallyHidden } from "radix-ui";
import { cn } from "@/lib/utils";
import { useModal } from "@/store/modal.store";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";

interface Props {
	children: React.ReactNode;
	modalSize?: "sm" | "md" | "lg";
	dialogHeader?: {
		title: string;
		description?: string;
	};
	header?: React.ReactNode;
	headerShown?: boolean;
	onClose?: () => void;
	positionFromTop?: "sm" | "md" | "lg" | "none";
	isVisible?: boolean;
	closeOnClickOutside?: boolean;
}

const Modal: React.FC<Props> = ({
	children,
	header,
	onClose,
	closeOnClickOutside,
	dialogHeader = {
		title: "",
		description: "",
	},
	isVisible,
	modalSize = "sm",
	positionFromTop = "none",
}) => {
	const {
		isOpen,
		closeModal,
		closeOnClickOutside: modalCloseOnClickOutside,
	} = useModal();

	const shouldShow = isVisible ?? isOpen;
	const shouldCloseOnClickOutside =
		closeOnClickOutside ?? modalCloseOnClickOutside;

	const modalSizeMap = {
		sm: "max-w-[400px]",
		md: "max-w-[550px]",
		lg: "max-w-[800px]",
	};

	const positionFromTopMap = {
		none: "",
		sm: "mt-[12vh]",
		md: "mt-[25vh]",
		lg: "mt-[50vh]",
	};
	const OnClose = async () => {
		closeModal();
		await new Promise((resolve) => setTimeout(resolve, 150));
		onClose?.();
	};
	return (
		<div className={cn(!shouldShow && "hidden")}>
			<Dialog
				open={shouldShow}
				onOpenChange={shouldCloseOnClickOutside ? OnClose : () => null}
			>
				<DialogContent
					showCloseButton={!shouldCloseOnClickOutside}
					className={cn(
						positionFromTopMap[positionFromTop],
						modalSizeMap[modalSize],
						"p-0",
					)}
				>
					{header ? (
						header
					) : (
						<DialogHeader>
							<DialogTitle>{dialogHeader.title}</DialogTitle>
							<DialogDescription>{dialogHeader.description}</DialogDescription>
						</DialogHeader>
					)}
					{children}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Modal;
