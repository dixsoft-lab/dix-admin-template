import type { ReactNode } from "react";

export type AsyncStateProps = {
	readonly state: "loading" | "empty" | "error" | "success";
	readonly loading: ReactNode;
	readonly empty: ReactNode;
	readonly error: ReactNode;
	readonly children: ReactNode;
};

export const AsyncState = ({
	state,
	loading,
	empty,
	error,
	children,
}: AsyncStateProps) => {
	switch (state) {
		case "loading":
			return (
				<div className="dix-async-state" role="status" aria-busy="true">
					{loading}
				</div>
			);
		case "empty":
			return (
				<div className="dix-async-state" role="status">
					{empty}
				</div>
			);
		case "error":
			return (
				<div className="dix-async-state" role="alert">
					{error}
				</div>
			);
		case "success":
			return <>{children}</>;
		default: {
			const unreachable: never = state;
			return unreachable;
		}
	}
};
