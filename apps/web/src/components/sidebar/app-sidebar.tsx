import { Boxes, BoxesIcon, BoxIcon, HouseIcon, Search } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
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
			{ title: "Search", url: "#", icon: Search },
			{
				title: "Home",
				url: "/home",
				icon: HouseIcon,
				isActive: true,
			},
			{
				title: "Spaces",
				url: "/spaces",
				icon: BoxesIcon,
			},
			{
				title: "Projects",
				url: "/projects",
				icon: BoxIcon,
			},
			{
				title: "Spaces-2",
				url: "/space-2",
				icon: Boxes,
			},
		],
		navSecondary: [],
	};

	return (
		<Sidebar
			variant="sidebar"
			collapsible="icon"
			className="border-r-0"
			{...props}
		>
			<SidebarHeader>
				<NavUser />
				<NavMain items={data.navMain} />
			</SidebarHeader>

			<SidebarContent />
			<SidebarRail />
		</Sidebar>
	);
}
