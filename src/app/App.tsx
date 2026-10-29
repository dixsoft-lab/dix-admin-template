import { lazy, Suspense, type ComponentType } from "react";
import "@admin/component/design-system/styles.css";
import "@admin/component/ui/ui.css";

const DevelopmentApp = import.meta.env.DEV
	? lazy(() =>
			import("./demo/DemoApp").then(({ DemoApp }) => ({ default: DemoApp })),
		)
	: null;

export type AppProps = {
	readonly consumer?: ComponentType;
};

export const App = ({ consumer: Consumer }: AppProps) => {
	if (Consumer) return <Consumer />;
	if (import.meta.env.DEV && DevelopmentApp) {
		return (
			<Suspense fallback={<p role="status">앱 준비 중</p>}>
				<DevelopmentApp />
			</Suspense>
		);
	}
	return (
		<main role="alert">
			<h1>Admin 설정 오류</h1>
			<p>
				Production에서는 App의 consumer에 실제 Auth·Permission·Navigation·Brand
				adapter를 조립한 앱을 주입해야 합니다. Demo는 development 전용입니다.
			</p>
		</main>
	);
};
