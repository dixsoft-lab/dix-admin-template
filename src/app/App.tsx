import { type ComponentType, lazy, Suspense } from "react";

import { StarterApp } from "@/app/starter/StarterApp";
import "@/style/tailwind.css";

// template-demo:loader:start
const demoBasePath = `${import.meta.env.BASE_URL.replace(/\/+$/, "")}/demo`;
const DevelopmentApp = import.meta.env.DEV
	? lazy(() =>
			import("@/app/demo/DemoApp").then(({ DemoApp }) => ({
				default: DemoApp,
			})),
		)
	: null;
// template-demo:loader:end

export type AppProps = {
	readonly consumer?: ComponentType;
};

export const App = ({ consumer: Consumer }: AppProps) => {
	if (Consumer) return <Consumer />;
	// template-demo:render:start
	if (import.meta.env.DEV && DevelopmentApp) {
		const isDemoPath =
			window.location.pathname === demoBasePath ||
			window.location.pathname.startsWith(`${demoBasePath}/`);
		if (isDemoPath)
			return (
				<Suspense fallback={null}>
					<DevelopmentApp />
				</Suspense>
			);
	}
	// template-demo:render:end
	if (import.meta.env.DEV) return <StarterApp />;
	return (
		<main role="alert">
			<h1>Admin 설정 오류</h1>
			<p>
				App의 consumer에 실제 Auth·Permission·Navigation·Brand adapter를 조립한
				앱을 주입해야 합니다.
			</p>
		</main>
	);
};
