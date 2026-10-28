import type { InputProps } from "./design-system-contract";
import { useDesignSystem } from "./useDesignSystem";

export const Input = (props: InputProps) => {
	const Component = useDesignSystem().Input;
	return <Component {...props} />;
};
