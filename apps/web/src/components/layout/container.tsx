import type React from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
	children: React.ReactNode;
	className?: string;

	variant?: "center" | "full";
};

const Container = ({
	children,
	className,
	variant = "center",
}: ContainerProps) => {
	return (
		<div
			className={cn(
				"flex flex-1 flex-col",

				variant === "center" && "mx-auto mt-10 w-full max-w-4xl",
				variant === "full" && "w-full",

				className,
			)}
		>
			{children}
		</div>
	);
};

export default Container;
