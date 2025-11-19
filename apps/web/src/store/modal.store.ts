import { create } from "zustand";
import { devtools } from "zustand/middleware";

const ModalContentTypes = [
	"CREATE_CAPTURE",
	"CAPTURE_DETAILS",
	"CONVERT_CAPTURE_TO_TASK",
	null,
] as const;
type ModalContentType = (typeof ModalContentTypes)[number];

interface ModalState {
	contentType: Exclude<ModalContentType, null>;
	entityId?: string;
	entityLabel?: string;
	closeOnClickOutside?: boolean;
}

interface ModalStore {
	modalStack: ModalState[];
	modalStates: Record<string, any>;

	openModal: (
		contentType: Exclude<ModalContentType, null>,
		entityId?: string,
		entityLabel?: string,
		closeOnClickOutside?: boolean,
	) => void;
	closeModal: () => void;
	closeModals: (count: number) => void;
	clearAllModals: () => void;

	setModalState: (modalType: string, state: any) => void;
	getModalState: (modalType: string) => any;
	clearModalState: (modalType: string) => void;
	clearAllModalStates: () => void;
}

export const useModalStore = create<ModalStore>()(
	devtools(
		(set, get) => ({
			modalStack: [],
			modalStates: {},

			openModal: (
				contentType,
				entityId,
				entityLabel,
				closeOnClickOutside = true,
			) => {
				const newModal: ModalState = {
					contentType,
					entityId,
					entityLabel,
					closeOnClickOutside,
				};

				set((state) => {
					const last = state.modalStack[state.modalStack.length - 1];
					const isDuplicate =
						last &&
						last.contentType === contentType &&
						last.entityId === entityId &&
						last.entityLabel === entityLabel;

					if (isDuplicate) return state; // prevent duplicate modals

					return { modalStack: [...state.modalStack, newModal] };
				});
			},

			closeModal: () => {
				set((state) => ({
					modalStack:
						state.modalStack.length <= 1 ? [] : state.modalStack.slice(0, -1),
				}));
			},

			closeModals: (count) => {
				set((state) => ({
					modalStack: state.modalStack.slice(
						0,
						Math.max(0, state.modalStack.length - count),
					),
				}));
			},

			clearAllModals: () => set({ modalStack: [] }),

			setModalState: (modalType, state) =>
				set((prev) => ({
					modalStates: { ...prev.modalStates, [modalType]: state },
				})),

			getModalState: (modalType) => get().modalStates[modalType],

			clearModalState: (modalType) =>
				set((state) => {
					const { [modalType]: _, ...rest } = state.modalStates;
					return { modalStates: rest };
				}),

			clearAllModalStates: () => set({ modalStates: {} }),
		}),
		{ name: "ModalStore" },
	),
);

export const useModal = () => {
	const modalStack = useModalStore((state) => state.modalStack);
	const currentModal = modalStack[modalStack.length - 1];

	return {
		isOpen: modalStack.length > 0,
		currentModal,
		modalContentType: currentModal?.contentType ?? null,
		entityId: currentModal?.entityId ?? "",
		entityLabel: currentModal?.entityLabel ?? "",
		closeOnClickOutside: currentModal?.closeOnClickOutside ?? true,
		openModal: useModalStore((state) => state.openModal),
		closeModal: useModalStore((state) => state.closeModal),
		closeModals: useModalStore((state) => state.closeModals),
		clearAllModals: useModalStore((state) => state.clearAllModals),
		setModalState: useModalStore((state) => state.setModalState),
		getModalState: useModalStore((state) => state.getModalState),
		clearModalState: useModalStore((state) => state.clearModalState),
		clearAllModalStates: useModalStore((state) => state.clearAllModalStates),
	};
};
