import {
	useContext,
	useLayoutEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { OverlayContext } from "./overlay-context";
import { OverlayConfigurationError } from "./overlay-error";
import { ModalView } from "./ModalView";
import { ToastView } from "./ToastView";
import { useOverlayState } from "./useOverlayState";

const hostOwnerMap = new WeakMap<HTMLElement, symbol>();

export type OverlayProviderProps = {
	readonly children: ReactNode;
	readonly portalRoot?: HTMLElement | null;
};

export const OverlayProvider = ({
	children,
	portalRoot,
}: OverlayProviderProps) => {
	const parent = useContext(OverlayContext);
	const anchorRef = useRef<HTMLSpanElement>(null);
	const ownerRef = useRef(Symbol("overlay-host"));
	const [container, setContainer] = useState<HTMLElement | null>(null);
	const { api, modal, toast } = useOverlayState();

	useLayoutEffect(() => {
		const target =
			portalRoot ?? anchorRef.current?.closest("[data-theme-root]");
		const themeRoot = target?.closest("[data-theme-root]");
		if (
			!(target instanceof HTMLElement) ||
			!(themeRoot instanceof HTMLElement)
		) {
			throw new OverlayConfigurationError("missing-theme-root");
		}
		if (hostOwnerMap.has(themeRoot))
			throw new OverlayConfigurationError("duplicate-host");
		const owner = ownerRef.current;
		hostOwnerMap.set(themeRoot, owner);
		setContainer(target);
		return () => {
			if (hostOwnerMap.get(themeRoot) === owner) hostOwnerMap.delete(themeRoot);
		};
	}, [portalRoot]);

	if (parent) throw new OverlayConfigurationError("nested-provider");

	let surface = <ToastView toast={toast} />;
	if (modal) {
		surface = (
			<ModalView modal={modal}>
				<ToastView toast={toast} />
			</ModalView>
		);
	}
	return (
		<OverlayContext value={api}>
			{children}
			<span ref={anchorRef} hidden aria-hidden="true" />
			{container &&
				createPortal(<div data-overlay-host="">{surface}</div>, container)}
		</OverlayContext>
	);
};
