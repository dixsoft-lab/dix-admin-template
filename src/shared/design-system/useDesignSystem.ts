import { useContext } from "react";
import { DesignSystemContext } from "./design-system-context";

export const useDesignSystem = () => useContext(DesignSystemContext);
