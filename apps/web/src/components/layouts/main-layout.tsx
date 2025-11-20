import React from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "../sidebar/app-sidebar";
import { Sidebar, SidebarHeader, SidebarProvider } from "../ui/sidebar";

interface MainLayoutProps {
	children: React.ReactNode;
	className?: string;
	header?: React.ReactNode;
	headersNumber?: 1 | 2;
}

const isEmptyHeader = (header: React.ReactNode | undefined): boolean => {
	if (!header) return true;
	if (React.isValidElement(header) && header.type === React.Fragment) {
		const props = header.props as { children?: React.ReactNode };
		if (!props.children) return true;
		if (Array.isArray(props.children) && props.children.length === 0)
			return true;
	}
	return false;
};

export default function MainLayout({
	children,
	header,
	headersNumber = 1,
	className,
}: MainLayoutProps) {
	const height = {
		1: "h-[calc(100svh-40px)] lg:h-[calc(100svh-56px)]",
		2: "h-[calc(100svh-60px)] lg:h-[calc(100svh-76px)]",
	};

	return (
		<div className="flex h-svh">
			<SidebarProvider>
				<Sidebar>
					<SidebarHeader>Kirosumi</SidebarHeader>
					<AppSidebar />
				</Sidebar>
				<div className="flex flex-1 flex-col overflow-hidden">
					{header}
					<div
						className={cn(
							"flex-1 overflow-auto bg-container p-2 lg:p-4",
							isEmptyHeader(header)
								? "h-full"
								: height[headersNumber as keyof typeof height],
							className,
						)}
					>
						{children}
					</div>
				</div>
			</SidebarProvider>
		</div>
	);
}
