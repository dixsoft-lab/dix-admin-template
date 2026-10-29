import { createContext } from "react";
import type { DesignSystemComponentMap } from "./design-system-contract";
import { embeddedDesignSystem } from "./embedded";

export const DesignSystemContext =
	createContext<DesignSystemComponentMap>(embeddedDesignSystem);
