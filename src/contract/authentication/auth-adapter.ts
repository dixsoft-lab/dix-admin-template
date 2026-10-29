import type { AuthenticatedUser } from "./authenticated-user";

export type AuthState =
	| { readonly kind: "loading" }
	| { readonly kind: "anonymous" }
	| { readonly kind: "authenticated"; readonly user: AuthenticatedUser }
	| { readonly kind: "error"; readonly message: string };

export interface AuthAdapter {
	readonly state: AuthState;
	readonly isActionPending?: boolean;
	readonly login: () => void;
	readonly logout: () => void;
	readonly retry?: () => void;
}
