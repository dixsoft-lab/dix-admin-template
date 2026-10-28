import { Link } from "react-router-dom";
import { Button } from "@admin/shared/design-system";
import { AsyncState, DataTable } from "@admin/shared/ui";
import { adminRoutePath } from "@admin/shared/routing";
import type { DemoListState, DemoRecord } from "../model/demo-record";

export type DemoListPageProps = {
	readonly state: DemoListState;
	readonly recordList: readonly DemoRecord[];
	readonly onStateChange: (state: DemoListState) => void;
};

export const DemoListPage = ({
	state,
	recordList,
	onStateChange,
}: DemoListPageProps) => (
	<section className="dix-demo-page">
		<h1>항목 목록</h1>
		<p>브라우저 메모리에서만 동작하는 예제입니다. 새로고침하면 초기화됩니다.</p>
		<Link to={adminRoutePath.create}>새 항목 만들기</Link>
		<div className="dix-demo-action" aria-label="목록 상태 예제">
			<Button onClick={() => onStateChange("loading")}>로딩 보기</Button>
			<Button onClick={() => onStateChange("empty")}>빈 목록 보기</Button>
			<Button onClick={() => onStateChange("error")}>오류 보기</Button>
			<Button onClick={() => onStateChange("success")}>목록 복원</Button>
		</div>
		<AsyncState
			state={state}
			loading="항목을 불러오는 중입니다."
			empty="표시할 항목이 없습니다."
			error={
				<>
					<p>예제 오류가 발생했습니다.</p>
					<Button onClick={() => onStateChange("success")}>다시 시도</Button>
				</>
			}
		>
			<DataTable
				caption="예제 항목"
				rowList={recordList}
				rowKey={(row) => row.id}
				columnList={[
					{
						key: "name",
						header: "이름",
						render: (row) => (
							<Link to={adminRoutePath.detail(row.id)}>{row.name}</Link>
						),
					},
					{ key: "id", header: "ID", render: (row) => row.id },
				]}
			/>
		</AsyncState>
	</section>
);
