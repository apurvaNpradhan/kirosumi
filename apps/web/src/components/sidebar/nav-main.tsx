import { Link } from "@tanstack/react-router";
import { type PiIcon, Search } from "lucide-react";
import { useIsRouteActive } from "@/utils/is-route-active";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url?: string;
		icon: typeof PiIcon;
		isActive?: boolean;
		Action?: () => void;
	}[];
}) {
	const isActive = useIsRouteActive;
	return (
		<SidebarMenu>
			{items.map((item) => (
				<SidebarMenuItem key={item.title}>
					<SidebarMenuButton
						asChild
						isActive={item.url ? isActive(item.url) : item.isActive}
						onClick={item.Action}
					>
						{item.url ? (
							<Link to={item.url}>
								<item.icon className="text-muted-foreground" />
								<span>{item.title}</span>
							</Link>
						) : (
							<div>
								<item.icon className="text-muted-foreground" />
								<span className="hover:cursor-pointer">{item.title}</span>
							</div>
						)}
					</SidebarMenuButton>
				</SidebarMenuItem>
			))}
		</SidebarMenu>
	);
}
