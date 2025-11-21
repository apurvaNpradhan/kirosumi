import type { SelectItem } from "@kirosumi/db/schema/item";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ItemStore {
	currentItem: SelectItem | null;
	setCurrentItem: (item: SelectItem | null) => void;
}

export const useItemStore = create<ItemStore>()(
	devtools((set) => ({
		currentItem: null,
		setCurrentItem: (item) => set({ currentItem: item }),
	})),
);
