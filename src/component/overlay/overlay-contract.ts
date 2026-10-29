import type { ReactNode } from "react";

export type ModalOptions = {
	readonly title: string;
	readonly size?: "default" | "wide";
	readonly layout?: "default" | "segmented";
	readonly description?: string;
	readonly content: ReactNode;
	readonly footer?: ReactNode;
	readonly isPending?: boolean;
	readonly closeLabel?: string;
};

export type ModalController = {
	readonly close: () => void;
	readonly update: (option: Partial<ModalOptions>) => void;
};

export type ToastOptions = {
	readonly message: string;
	readonly tone?: "info" | "success" | "error";
	readonly durationMs?: number;
};

export type ToastController = { readonly dismiss: () => void };

export type OverlayApi = {
	readonly openModal: (option: ModalOptions) => ModalController;
	readonly showToast: (option: ToastOptions) => ToastController;
};

export type ActiveModal = {
	readonly id: symbol;
	readonly option: ModalOptions;
	readonly opener: HTMLElement | null;
	readonly controller: ModalController;
};

export type ActiveToast = {
	readonly id: symbol;
	readonly option: ToastOptions;
	readonly controller: ToastController;
};
