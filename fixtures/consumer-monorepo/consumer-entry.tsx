import { createRoot } from "react-dom/client";
import { App } from "@admin/app/App";
import {
	Badge,
	Button,
	DesignSystemProvider,
	Input,
	Skeleton,
	type DesignSystemSelection,
} from "@admin/shared/design-system";
// 검증 스크립트가 mode별 정적 package import를 이 위치에 추가한다.
/* PROVIDER_IMPORT */

const selection: DesignSystemSelection = /* PROVIDER_SELECTION */ {
	mode: "embedded",
};

const Consumer = () => (
	<DesignSystemProvider selection={selection}>
		<main
			className="dix-admin-theme"
			data-consumer={import.meta.env.VITE_CONSUMER_MARKER}
		>
			<Button>저장</Button>
			<Input aria-label="이름" />
			<Badge>대기</Badge>
			<Skeleton />
		</main>
	</DesignSystemProvider>
);

const root = document.getElementById("root");
if (!root) throw new Error("consumer root가 없습니다.");
createRoot(root).render(<App consumer={Consumer} />);
