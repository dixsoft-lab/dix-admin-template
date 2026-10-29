import type { ReactNode } from "react";
import type { AuthAdapter } from "@/contract/authentication/auth-adapter";
import type { AuthenticatedUser } from "@/contract/authentication/authenticated-user";
import { Button } from "@/component/ui/Button";

type AuthBoundaryProps = {
	readonly auth: AuthAdapter;
	readonly children: (user: AuthenticatedUser) => ReactNode;
};

export const AuthBoundary = ({
	auth,
	children: renderAuthenticated,
}: AuthBoundaryProps) => {
	const { state, isActionPending = false } = auth;
	switch (state.kind) {
		case "loading":
			return (
				<section
					className="
       grid min-h-dvh content-center justify-items-center
       p-6 text-center text-text-muted
     "
					role="status"
				>
					로그인 상태를 확인하고 있습니다.
				</section>
			);
		case "anonymous":
			return (
				<section
					className="
       grid min-h-dvh content-center justify-items-center
       p-6 text-center
     "
					aria-labelledby="auth-boundary-title"
				>
					<h1
						className="m-0 text-page-title font-bold"
						id="auth-boundary-title"
					>
						관리자 로그인
					</h1>
					<p className="my-3">관리 화면에 접근하려면 로그인해 주세요.</p>
					<Button
						type="button"
						onClick={auth.login}
						disabled={isActionPending}
						aria-busy={isActionPending}
					>
						로그인
					</Button>
				</section>
			);
		case "error":
			return (
				<section
					className="
       grid min-h-dvh content-center justify-items-center
       p-6 text-center
     "
				>
					<p role="alert">{state.message}</p>
					{auth.retry && (
						<Button
							type="button"
							onClick={auth.retry}
							disabled={isActionPending}
							aria-busy={isActionPending}
						>
							다시 시도
						</Button>
					)}
				</section>
			);
		case "authenticated":
			return renderAuthenticated(state.user);
		default:
			return state satisfies never;
	}
};
