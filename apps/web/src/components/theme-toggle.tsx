import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/theme-provider";
export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};
	return (
		<Button
			variant="outline"
			size="icon"
			onClick={toggleTheme}
			className="rounded-full"
		>
			<Sun
				className={cn(
					"absolute h-6 w-6 transition-all duration-300",
					theme !== "dark"
						? "rotate-0 scale-100 opacity-100"
						: "rotate-90 scale-0 opacity-0",
				)}
			/>
			<Moon
				className={cn(
					"absolute h-6 w-6 transition-all duration-300",
					theme === "dark"
						? "rotate-0 scale-100 opacity-100"
						: "-rotate-90 scale-0 opacity-0",
				)}
			/>{" "}
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
