import { Link } from "react-router-dom";
import { Button } from "@/component/ui/Button";
import { AsyncState } from "@/component/ui/AsyncState";
import { DataTable } from "@/component/ui/DataTable";
import { routePath } from "@/route/route-paths";
import type { DemoListState, DemoRecord } from "./demo-record";

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
	<section className="grid max-w-7xl gap-4 p-6 [&_h1]:m-0 [&_p]:m-0">
		<h1 className="text-page-title font-bold">항목 목록</h1>
		<p>브라우저 메모리에서만 동작하는 예제입니다. 새로고침하면 초기화됩니다.</p>
		<Link
			className="text-primary underline-offset-4 hover:underline"
			to={routePath.create}
		>
			새 항목 만들기
		</Link>
		<div className="flex flex-wrap gap-3" aria-label="목록 상태 예제">
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
							<Link to={routePath.detail(row.id)}>{row.name}</Link>
						),
					},
					{ key: "id", header: "ID", render: (row) => row.id },
				]}
			/>
		</AsyncState>
	</section>
);
