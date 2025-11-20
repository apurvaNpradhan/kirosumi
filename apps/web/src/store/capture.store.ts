import type { SelectCapture } from "@kirosumi/db/schema/capture";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface CaptureStore {
	currentCapture: SelectCapture;
	setCurrentCapture: (capture: SelectCapture | null) => void;
}

export const useCaptureStore = create<CaptureStore>()(
	devtools((set, _get) => ({
		currentCapture: null,
		setCurrentCapture: (capture: SelectCapture) =>
			set({ currentCapture: capture }),
	})),
);
