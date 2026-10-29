import type { ButtonProps } from "./design-system-contract";
import { useDesignSystem } from "./useDesignSystem";

export const Button = (props: ButtonProps) => {
	const Component = useDesignSystem().Button;
	return <Component {...props} />;
};
