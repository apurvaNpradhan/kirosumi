import { Edit, Home, NotebookPenIcon, Search } from "lucide-react";
import { useEffect } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useModal } from "@/store/modal.store";
import { Button } from "../ui/button";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

interface Items {
	title: string;
	icon: any;
	url?: string;
	Action?: () => void;
	isActive?: boolean;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const data = {
		navMain: [
			{
				title: "Home",
				url: "/home",
				icon: Home,
				isActive: true,
			},
			{
				title: "Scratchpad",
				url: "/scratchpad",
				icon: NotebookPenIcon,
			},
		],
		navSecondary: [],
	};
	const { openModal } = useModal();
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "q" || e.key === "Q") {
				const active = document.activeElement;
				const isTyping =
					active instanceof HTMLInputElement ||
					active instanceof HTMLTextAreaElement;
				if (!isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
					e.preventDefault();
					openModal("CREATE_SCRATCH");
				}
			}
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);
	return (
		<Sidebar
			variant="sidebar"
			collapsible="icon"
			className="border-r-0"
			{...props}
		>
			<SidebarHeader className="flex flex-row items-center">
				<NavUser />
				<Button variant="secondary" size={"icon"} className="ml-auto p-1">
					<Search />
				</Button>
				<Button
					variant="outline"
					size={"icon"}
					className="ml-auto p-1"
					onClick={() => openModal("CREATE_SCRATCH")}
				>
					<Edit />
				</Button>
			</SidebarHeader>

			<div className="flex flex-col space-y-2">
				<NavMain items={data.navMain} />
			</div>
			<SidebarContent />
			<SidebarRail />
		</Sidebar>
	);
}
