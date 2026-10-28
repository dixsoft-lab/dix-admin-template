import type { CurrentAccount } from "@admin/entity/current-account";

export type AuthState =
	| { readonly kind: "loading" }
	| { readonly kind: "anonymous" }
	| { readonly kind: "authenticated"; readonly account: CurrentAccount }
	| { readonly kind: "error"; readonly message: string };

export interface AuthAdapter {
	readonly state: AuthState;
	readonly isActionPending?: boolean;
	readonly login: () => void;
	readonly logout: () => void;
	readonly retry?: () => void;
}
