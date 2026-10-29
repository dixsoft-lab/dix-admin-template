import type { ReactNode } from "react";
import { LoginPage } from "@/page/login/LoginPage";

type DemoLoginPageProps = {
	readonly onLogin: () => void;
	readonly brandLogo: ReactNode;
};

export const DemoLoginPage = ({ onLogin, brandLogo }: DemoLoginPageProps) => (
	<LoginPage
		onLogin={onLogin}
		brandLogo={brandLogo}
		description="L1 제작사 또는 L2 관리자 계정으로 로그인해 주세요."
		footnote="로컬 demo 세션입니다. 입력값은 인증 서버로 전송되지 않습니다."
	/>
);
