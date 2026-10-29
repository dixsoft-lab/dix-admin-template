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
				<div
					className="
       grid min-h-35 place-items-center p-6
       text-center text-text-muted
     "
					role="status"
					aria-busy="true"
				>
					{loading}
				</div>
			);
		case "empty":
			return (
				<div
					className="
       grid min-h-35 place-items-center p-6
       text-center text-text-muted
     "
					role="status"
				>
					{empty}
				</div>
			);
		case "error":
			return (
				<div
					className="
       grid min-h-35 place-items-center p-6
       text-center text-negative
     "
					role="alert"
				>
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
