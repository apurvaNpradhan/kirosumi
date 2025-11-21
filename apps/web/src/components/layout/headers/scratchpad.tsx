import { Ellipsis, LayoutDashboardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Header() {
	return (
		<div className="flex justify-between px-2 py-1">
			<SidebarTrigger />
			<div className="space-x-2">
				<Button variant={"ghost"} size={"icon"}>
					<LayoutDashboardIcon className="text-muted-foreground" />
				</Button>
				<Button variant={"ghost"} size={"icon"}>
					<Ellipsis className="text-muted-foreground" />
				</Button>
			</div>
		</div>
	);
}
