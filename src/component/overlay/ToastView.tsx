import type { ActiveToast } from "./overlay-contract";

export const ToastView = ({
	toast,
}: {
	readonly toast: ActiveToast | null;
}) => {
	const tone = toast?.option.tone ?? "info";
	const message = toast?.option.message ?? "";
	const isMultiline = message.includes("\n");
	return (
		<div
			className={`
     fixed bottom-21.5 left-1/2 z-overlay
     inline-flex max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-y-auto
     whitespace-pre-line rounded-xl border border-border
     bg-surface px-6 py-3 text-text
     shadow-[0_12px_32px_rgb(7_28_82/16%)] transition-[opacity,transform] duration-200 ease-ui
     motion-reduce:duration-[0.01ms]
     ${
				isMultiline
					? `
       pointer-events-auto w-max max-h-[50vh] items-start
       text-left text-[17px] wrap-anywhere
     `
					: "pointer-events-none w-max items-center text-body"
			} leading-[1.4] font-semibold tracking-[-0.01em] ${toast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
			data-toast-host=""
			role="status"
			aria-live="polite"
			aria-atomic="true"
			aria-hidden={!toast}
		>
			<span className="sr-only">{tone === "error" ? "오류: " : ""}</span>
			{message}
		</div>
	);
};
