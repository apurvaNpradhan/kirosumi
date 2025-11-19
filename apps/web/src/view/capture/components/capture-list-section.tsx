import type { SelectCapture } from "@kirosumi/db/schema/capture";
import Fuse from "fuse.js";
import { ChevronDown, Plus, Search, View, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useModal } from "@/store/modal.store";
import { CaptureItem } from "./capture-item";

export default function CaptureListSection({
	data,
}: {
	data: SelectCapture[];
}) {
	const [view, setView] = useState<"List" | "Timeline">("List");
	const [search, setSearch] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const { openModal } = useModal();
	const fuse = new Fuse(data, {
		keys: ["title", "description"],
	});
	const filteredData = useMemo(() => {
		if (!search.trim()) return data;

		const lowerSearch = search.toLowerCase();
		return fuse.search(lowerSearch).map((result) => result.item);
	}, [data, search, fuse]);

	const { today, yesterday, earlier } = useMemo(() => {
		return groupCapturesByDate(filteredData);
	}, [filteredData]);

	const resultCount = filteredData.length;

	return (
		<div className="flex flex-col space-y-6">
			<div className="flex items-center justify-between border-b pb-3">
				<h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">
					{search
						? `${resultCount} result${resultCount !== 1 ? "s" : ""}`
						: `${data.length} Captures`}
				</h2>

				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<View className="mr-2 h-4 w-4" />
								{view}
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onSelect={() => setView("List")}>
								List View
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => setView("Timeline")}>
								Timeline View
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<div className="relative flex items-center">
						<div className="hidden items-center gap-2 sm:flex">
							{isSearching ? (
								<div className="flex items-center gap-2">
									<Input
										autoFocus
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										placeholder="Search captures..."
										className="w-64"
										onKeyDown={(e) =>
											e.key === "Escape" && setIsSearching(false)
										}
									/>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => {
											setSearch("");
											setIsSearching(false);
										}}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							) : (
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setIsSearching(true)}
								>
									<Search className="h-4 w-4" />
								</Button>
							)}
						</div>

						<Popover>
							<PopoverTrigger asChild>
								<Button variant="ghost" size="icon" className="sm:hidden">
									<Search className="h-4 w-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80" side="bottom" align="end">
								<div className="flex flex-col gap-3">
									<Input
										autoFocus
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										placeholder="Search captures..."
										className="w-full"
									/>
									<div className="flex justify-between text-sm">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												setSearch("");
											}}
										>
											Clear
										</Button>
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>
					<Button size="sm" onClick={() => openModal("CREATE_CAPTURE")}>
						<Plus className="mr-2 h-4 w-4" />
						Add
					</Button>
				</div>
			</div>

			{search && filteredData.length === 0 && (
				<div className="py-12 text-center">
					<p className="text-muted-foreground">
						No captures found matching "<strong>{search}</strong>"
					</p>
					<Button
						variant="link"
						onClick={() => {
							setSearch("");
							setIsSearching(false);
						}}
						className="mt-2"
					>
						Clear search
					</Button>
				</div>
			)}

			{view === "List" ? (
				<div className="space-y-2">
					{filteredData.map((capture) => (
						<CaptureItem key={capture.id} capture={capture} view="List" />
					))}
				</div>
			) : (
				<div className="space-y-8">
					{today.length > 0 && (
						<section>
							<h3 className="mb-3 font-semibold text-foreground text-sm">
								Today
							</h3>
							<div className="space-y-2 border-primary/20 border-l-2 pl-4">
								{today.map((c) => (
									<CaptureItem key={c.id} capture={c} view="Timeline" />
								))}
							</div>
						</section>
					)}

					{yesterday.length > 0 && (
						<section>
							<h3 className="mb-3 font-semibold text-foreground text-sm">
								Yesterday
							</h3>
							<div className="space-y-2 border-primary/20 border-l-2 pl-4">
								{yesterday.map((c) => (
									<CaptureItem key={c.id} capture={c} view="Timeline" />
								))}
							</div>
						</section>
					)}

					{earlier.length > 0 && (
						<section>
							<h3 className="mb-3 font-semibold text-foreground text-sm">
								Earlier
							</h3>
							<div className="space-y-2 border-primary/20 border-l-2 pl-4">
								{earlier.map((c) => (
									<CaptureItem key={c.id} capture={c} view="Timeline" />
								))}
							</div>
						</section>
					)}

					{search &&
						today.length === 0 &&
						yesterday.length === 0 &&
						earlier.length === 0 &&
						filteredData.length > 0 && (
							<p className="text-center text-muted-foreground">
								All matching results are from different dates.
							</p>
						)}
				</div>
			)}
		</div>
	);
}

function groupCapturesByDate(captures: SelectCapture[]) {
	const today: SelectCapture[] = [];
	const yesterday: SelectCapture[] = [];
	const earlier: SelectCapture[] = [];

	const now = new Date();
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterdayStart = new Date(todayStart);
	yesterdayStart.setDate(yesterdayStart.getDate() - 1);

	for (const cap of captures) {
		const created = new Date(cap.createdAt);
		if (created >= todayStart) {
			today.push(cap);
		} else if (created >= yesterdayStart) {
			yesterday.push(cap);
		} else {
			earlier.push(cap);
		}
	}

	return { today, yesterday, earlier };
}
