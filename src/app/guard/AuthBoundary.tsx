import type { ReactNode } from "react";
import type { AuthAdapter } from "@admin/feature/auth";
import type { CurrentAccount } from "@admin/entity/current-account";
import { Button } from "@admin/shared/design-system";

type AuthBoundaryProps = {
	readonly auth: AuthAdapter;
	readonly children: (account: CurrentAccount) => ReactNode;
};

export const AuthBoundary = ({
	auth,
	children: renderAuthenticated,
}: AuthBoundaryProps) => {
	const { state, isActionPending = false } = auth;
	switch (state.kind) {
		case "loading":
			return (
				<section className="dix-admin-auth-state" role="status">
					로그인 상태를 확인하고 있습니다.
				</section>
			);
		case "anonymous":
			return (
				<section
					className="dix-admin-auth-state"
					aria-labelledby="dix-admin-auth-title"
				>
					<h1 id="dix-admin-auth-title">관리자 로그인</h1>
					<p>관리 화면에 접근하려면 로그인해 주세요.</p>
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
				<section className="dix-admin-auth-state">
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
			return renderAuthenticated(state.account);
		default:
			return state satisfies never;
	}
};
