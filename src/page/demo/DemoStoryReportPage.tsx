import { Link, useParams } from "react-router-dom";
import { Badge } from "@/component/ui/Badge";
import { Button } from "@/component/ui/Button";
import { HorizontalBarChart } from "@/component/ui/HorizontalBarChart";
import { Skeleton } from "@/component/ui/Skeleton";
import { StatCard } from "@/component/ui/StatCard";
import { routePath } from "@/route/route-paths";
import { useDemoLoading } from "./useDemoLoading";

const sectionList = [
	{ id: "cover", label: "Cover", value: 100 },
	{ id: "playbook", label: "Playbook", value: 82 },
	{ id: "canvas", label: "Scenario canvas", value: 44 },
	{ id: "data-book", label: "Data book", value: 20 },
] as const;

export const DemoStoryReportPage = () => {
	const { recordId = "H045" } = useParams<{ recordId: string }>();
	const isLoading = useDemoLoading(recordId);

	return (
		<section className="grid gap-5" aria-busy={isLoading || undefined}>
			<header
				className="
      flex flex-wrap items-end justify-between
      gap-4
    "
			>
				<div>
					<div
						className="
        mb-2 flex flex-wrap items-center
        gap-2
      "
					>
						<Link
							className="
         text-meta font-semibold text-text-muted no-underline
         hover:text-primary-strong hover:underline
       "
							to={routePath.analytics("stories")}
						>
							유저스토리 리포트
						</Link>
						<span aria-hidden="true" className="text-text-subtle">
							/
						</span>
						<Badge tone="neutral">{recordId}</Badge>
					</div>
					<h1 className="m-0 text-page-title font-bold">리팩터링 테스트</h1>
					<p className="mt-1 mb-0 text-meta text-text-muted">
						스토리별 조회와 참여 흐름을 확인합니다.
					</p>
				</div>
				<Button variant="secondary" onClick={() => window.print()}>
					인쇄
				</Button>
			</header>
			{isLoading ? (
				<div
					className="grid gap-5"
					aria-label="스토리 리포트 불러오는 중"
					aria-busy="true"
				>
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						{Array.from({ length: 4 }, (_, index) => (
							<section
								className="
          grid min-h-32 content-start gap-3
          rounded-xl border border-border bg-surface
          p-5
        "
								key={index}
							>
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-8 w-32" />
							</section>
						))}
					</div>
					<section
						className="
        grid min-h-60 content-start gap-5
        rounded-xl border border-border bg-surface
        p-5
      "
					>
						<Skeleton className="h-5 w-40" />
						{sectionList.map((section) => (
							<Skeleton className="h-4 w-full" key={section.id} />
						))}
					</section>
				</div>
			) : (
				<>
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<StatCard label="조회수" value="4" detail="최근 7일" />
						<StatCard label="완독률" value="20%" detail="읽기 완료 1명" />
						<StatCard label="참여율" value="33.33%" detail="참여 사용자 2명" />
						<StatCard label="댓글" value="0" detail="등록된 댓글" />
					</div>
					<div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)]">
						<HorizontalBarChart
							title="화면별 도달률"
							headerMeta={<Badge tone="neutral">최근 7일</Badge>}
							itemList={sectionList.map((item) => ({
								...item,
								displayValue: `${item.value}%`,
							}))}
						/>
						<section
							className="
         grid content-start gap-4 rounded-xl
         border border-border bg-surface p-5
       "
						>
							<div className="flex items-center justify-between gap-3">
								<h2 className="m-0 text-subtitle font-semibold">참여 항목</h2>
								<Badge tone="warning">검수 요청</Badge>
							</div>
							<div
								className="
          grid gap-1 border-b border-border
          pb-4
        "
							>
								<strong>A/B · 참여 유형</strong>
								<p className="m-0 text-meta text-text-muted">
									어떤 방식을 선호하나요?
								</p>
							</div>
							<dl
								className="
          m-0 grid grid-cols-3 gap-3
          text-meta
        "
							>
								<div>
									<dt className="text-text-muted">도달</dt>
									<dd className="mt-1 mb-0 font-semibold">24</dd>
								</div>
								<div>
									<dt className="text-text-muted">응답</dt>
									<dd className="mt-1 mb-0 font-semibold">12</dd>
								</div>
								<div>
									<dt className="text-text-muted">응답률</dt>
									<dd className="mt-1 mb-0 font-semibold">50%</dd>
								</div>
							</dl>
							<Link
								className="font-semibold text-primary-strong underline-offset-4 hover:underline"
								to={routePath.analytics("engagement")}
							>
								참여 항목 리포트 보기
							</Link>
						</section>
					</div>
					<section
						className="
        grid gap-3 rounded-xl border
        border-border bg-surface p-5
      "
					>
						<h2 className="m-0 text-subtitle font-semibold">스토리 정보</h2>
						<dl className="m-0 grid gap-3 sm:grid-cols-3">
							<div>
								<dt className="text-meta text-text-muted">ID</dt>
								<dd className="mt-1 mb-0 font-semibold">{recordId}</dd>
							</div>
							<div>
								<dt className="text-meta text-text-muted">담당</dt>
								<dd className="mt-1 mb-0 font-semibold">운영팀</dd>
							</div>
							<div>
								<dt className="text-meta text-text-muted">상태</dt>
								<dd className="mt-1 mb-0">
									<Badge tone="success">게시 중</Badge>
								</dd>
							</div>
						</dl>
						<Link
							className="
         w-fit font-semibold text-primary-strong underline-offset-4
         hover:underline
       "
							to={routePath.content(recordId)}
						>
							유저스토리 편집 화면 열기
						</Link>
					</section>
				</>
			)}
		</section>
	);
};
