import { createContext } from "react";

import type { OverlayApi } from "./overlay-contract";

export const OverlayContext = createContext<OverlayApi | null>(null);
