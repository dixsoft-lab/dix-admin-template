import { useId, useRef, type ReactNode } from "react";
import { Button } from "@/component/ui/Button";
import type { ActiveModal } from "./overlay-contract";
import { containDialogFocus } from "./dialog-focus";
import { useDialogLifecycle } from "./useDialogLifecycle";

type ModalViewProps = {
	readonly modal: ActiveModal;
	readonly children: ReactNode;
};

export const ModalView = ({ modal, children }: ModalViewProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const labelId = useId();
	const { option, controller, opener } = modal;
	const isSegmented = option.layout === "segmented";
	useDialogLifecycle(dialogRef, opener, modal.id);
	return (
		<dialog
			ref={dialogRef}
			className={`m-auto max-h-[calc(100dvh-3rem)] ${isSegmented || option.size === "wide" ? "w-[min(32.5rem,calc(100vw-3rem))]" : "w-[min(28.75rem,calc(100vw-3rem))]"}
     max-w-[calc(100vw-3rem)] rounded-2xl border-0 bg-surface
     font-sans text-body leading-normal tracking-[-0.01em]
     text-text shadow-overlay animate-overlay-enter backdrop:bg-backdrop
     backdrop:backdrop-blur-[6px] focus:outline-none motion-reduce:animate-none
     ${isSegmented ? "flex flex-col overflow-hidden p-0" : "overflow-auto p-6"}`}
			data-overlay-surface=""
			aria-modal="true"
			aria-labelledby={`${labelId}-title`}
			aria-describedby={
				option.description ? `${labelId}-description` : undefined
			}
			aria-busy={option.isPending || undefined}
			tabIndex={-1}
			onKeyDown={containDialogFocus}
			onCancel={(event) => {
				event.preventDefault();
				controller.close();
			}}
			onClose={(event) => {
				// cleanup 뒤 재열린 dialog에 이전 close event가 늦게 도착할 수 있다.
				if (event.currentTarget.open) return;
				if (option.isPending) {
					event.currentTarget.showModal();
					return;
				}
				controller.close();
			}}
			onClick={(event) => {
				if (event.target !== event.currentTarget) return;
				const bound = event.currentTarget.getBoundingClientRect();
				const outside =
					event.clientX < bound.left ||
					event.clientX > bound.right ||
					event.clientY < bound.top ||
					event.clientY > bound.bottom;
				if (outside) controller.close();
			}}
		>
			<header
				className={`flex items-start gap-2 ${
					isSegmented
						? `
        shrink-0 border-b border-border px-8
        py-6
      `
						: ""
				}`}
			>
				<div className="min-w-0">
					<h2
						className="
        m-0 min-w-0 text-[17px] leading-[1.4]
        font-bold tracking-[-0.03em]
      "
						id={`${labelId}-title`}
					>
						{option.title}
					</h2>
					{option.description && !isSegmented && (
						<p
							id={`${labelId}-description`}
							className="mt-1 mb-0 text-meta text-text-muted"
						>
							{option.description}
						</p>
					)}
				</div>
				<button
					className="
       -mt-1 -mr-1 ml-auto grid
       size-8 shrink-0 cursor-pointer place-items-center
       rounded-md border-0 bg-transparent px-1.5
       py-0.5 text-[18px] text-text-subtle hover:bg-canvas
       hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus
       disabled:cursor-not-allowed disabled:opacity-60
     "
					aria-label={option.closeLabel ?? "닫기"}
					disabled={option.isPending}
					type="button"
					onClick={controller.close}
				>
					<span aria-hidden="true">✕</span>
				</button>
			</header>
			{isSegmented ? (
				<div
					className="
       min-h-0 flex-1 overflow-y-auto px-8
       py-6 text-body leading-[1.6]
     "
				>
					{option.description && (
						<p
							id={`${labelId}-description`}
							className="
         mt-0 mb-4 text-meta leading-[1.6]
         text-text-muted
       "
						>
							{option.description}
						</p>
					)}
					{option.content}
				</div>
			) : (
				option.content
			)}
			{option.footer != null && (
				<footer
					className={`flex justify-end gap-2 ${
						isSegmented
							? `
         shrink-0 border-t border-border px-8
         py-5
       `
							: "mt-4"
					}`}
				>
					{option.footer}
				</footer>
			)}
			{children}
		</dialog>
	);
};
