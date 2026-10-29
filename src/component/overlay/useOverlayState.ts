import { useCallback, useEffect, useMemo, useState } from "react";
import type {
	ActiveModal,
	ActiveToast,
	ModalController,
	ModalOptions,
	ToastController,
	ToastOptions,
} from "./overlay-contract";

export const useOverlayState = () => {
	const [modal, setModal] = useState<ActiveModal | null>(null);
	const [toast, setToast] = useState<ActiveToast | null>(null);

	const openModal = useCallback((option: ModalOptions): ModalController => {
		const id = Symbol("modal");
		const focusedElement = document.activeElement;
		const opener =
			focusedElement instanceof HTMLElement ? focusedElement : null;
		const controller: ModalController = {
			close: () =>
				setModal((current) => {
					if (current?.id !== id || current.option.isPending) return current;
					return null;
				}),
			update: (patch) =>
				setModal((current) => {
					if (current?.id !== id) return current;
					return { ...current, option: { ...current.option, ...patch } };
				}),
		};
		setModal((current) => {
			// 진행 중인 modal을 새 요청으로 교체해 닫기 보호를 우회하지 않는다.
			if (current?.option.isPending) return current;
			return { id, option, opener: current?.opener ?? opener, controller };
		});
		return controller;
	}, []);

	const showToast = useCallback((option: ToastOptions): ToastController => {
		const id = Symbol("toast");
		const controller: ToastController = {
			dismiss: () =>
				setToast((current) => (current?.id === id ? null : current)),
		};
		setToast({ id, option, controller });
		return controller;
	}, []);

	useEffect(() => {
		if (!toast) return;
		const durationMs = toast.option.durationMs ?? 4_000;
		if (durationMs === 0) return;
		const timer = window.setTimeout(toast.controller.dismiss, durationMs);
		return () => window.clearTimeout(timer);
	}, [toast]);

	const api = useMemo(() => ({ openModal, showToast }), [openModal, showToast]);
	return { api, modal, toast };
};
