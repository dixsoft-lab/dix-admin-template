import { useContext } from "react";

import { OverlayContext } from "./overlay-context";
import { OverlayConfigurationError } from "./overlay-error";

export const useOverlay = () => {
	const overlay = useContext(OverlayContext);
	if (!overlay) throw new OverlayConfigurationError("missing-provider");
	return overlay;
};
