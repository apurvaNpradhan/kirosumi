import { Maximize2, Minimize2 } from "lucide-react";
import { VisuallyHidden } from "radix-ui";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useModal } from "@/store/modal.store";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";

interface Props {
	children: React.ReactNode;
	modalSize?: "sm" | "md" | "lg" | "fullscreen";
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
	allowMaximize?: boolean;
}

const Modal: React.FC<Props> = ({
	children,
	header,
	onClose,
	closeOnClickOutside,
	headerShown,
	dialogHeader = {
		title: "",
		description: "",
	},
	isVisible,
	modalSize = "fullscreen",
	positionFromTop = "none",
	allowMaximize = true,
}) => {
	const {
		isOpen,
		closeModal,
		closeOnClickOutside: modalCloseOnClickOutside,
	} = useModal();

	const [isMaximized, setIsMaximized] = useState(false);

	const shouldShow = isVisible ?? isOpen;
	const shouldCloseOnClickOutside =
		closeOnClickOutside ?? modalCloseOnClickOutside;

	const modalSizeMap = {
		sm: "max-w-[400px] max-h-[500px]",
		md: "max-w-[550px] max-h-[650px]",
		lg: "max-w-[800px] max-h-[800px]",
		fullscreen: "max-w-[calc(100vw-80px)] max-h-[calc(100vh-80px)]",
	};

	const maximizedClass = "max-w-[calc(100vw-16px)] max-h-[calc(100vh-16px)]";

	const positionFromTopMap = {
		none: "",
		sm: "mt-[12vh]",
		md: "mt-[25vh]",
		lg: "mt-[50vh]",
	};

	const OnClose = async () => {
		closeModal();
		setIsMaximized(false);
		await new Promise((resolve) => setTimeout(resolve, 150));
		onClose?.();
	};

	const toggleMaximize = () => {
		setIsMaximized(!isMaximized);
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
						!isMaximized && positionFromTopMap[positionFromTop],
						isMaximized ? maximizedClass : modalSizeMap[modalSize],
						"flex flex-col overflow-y-hidden p-0 transition-all duration-200",
					)}
				>
					<DialogHeader className="relative flex flex-shrink-0 flex-row items-center justify-between px-2">
						{allowMaximize && (
							<Button
								type="button"
								variant="ghost"
								onClick={toggleMaximize}
								className="z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
								aria-label={isMaximized ? "Minimize" : "Maximize"}
							>
								{isMaximized ? (
									<Minimize2 className="h-4 w-4" />
								) : (
									<Maximize2 className="h-4 w-4" />
								)}
							</Button>
						)}
						{header}
					</DialogHeader>
					<div className="flex-1 overflow-auto">{children}</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Modal;
