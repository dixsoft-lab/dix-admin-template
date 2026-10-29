import { Link } from "react-router-dom";
import { Badge } from "@/component/ui/Badge";
import { DetailList } from "@/component/ui/DetailList";
import { Skeleton } from "@/component/ui/Skeleton";
import { routePath } from "@/route/route-paths";
import type { DemoRecord } from "../demo-record";
import { useDemoLoading } from "../../shared/useDemoLoading";

export type DemoDetailPageProps = {
	readonly itemId: string;
	readonly record: DemoRecord | undefined;
};

export const DemoDetailPage = ({ itemId, record }: DemoDetailPageProps) => {
	const isLoading = useDemoLoading(itemId);
	return (
		<section className="grid gap-4 [&_h1]:m-0 [&_p]:m-0">
			<h1 className="text-page-title font-bold">항목 상세</h1>
			{isLoading ? (
				<article
					className="
       grid max-w-3xl gap-5 rounded-xl
       border border-border bg-surface p-6
     "
					aria-label="항목 상세 불러오는 중"
					aria-busy="true"
				>
					<span className="sr-only" role="status">
						300ms 뒤 항목 상세가 표시됩니다.
					</span>
					<DetailList
						itemList={[
							{ key: "id", label: "ID", value: itemId },
							{
								key: "name",
								label: "이름",
								value: <Skeleton className="h-4 w-48 max-w-full" />,
							},
							{
								key: "status",
								label: "상태",
								value: <Skeleton className="h-6 w-20 rounded-pill" />,
							},
						]}
					/>
				</article>
			) : record ? (
				<article
					className="
       grid max-w-3xl gap-5 rounded-xl
       border border-border bg-surface p-6
     "
				>
					<DetailList
						itemList={[
							{ key: "id", label: "ID", value: record.id },
							{ key: "name", label: "이름", value: record.name },
							{
								key: "status",
								label: "상태",
								value: <Badge tone="neutral">작성 중</Badge>,
							},
						]}
					/>
					<Link
						className="w-fit text-primary underline-offset-4 hover:underline"
						to={routePath.list}
					>
						목록으로 돌아가기
					</Link>
				</article>
			) : (
				<p role="alert">항목을 찾을 수 없습니다.</p>
			)}
		</section>
	);
};
