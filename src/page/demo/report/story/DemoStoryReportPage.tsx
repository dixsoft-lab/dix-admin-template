import { Link, useParams } from "react-router-dom";
import { Badge } from "@/component/ui/Badge";
import { Button } from "@/component/ui/Button";
import { HorizontalBarChart } from "@/component/ui/HorizontalBarChart";
import { Skeleton } from "@/component/ui/Skeleton";
import { StatCard } from "@/component/ui/StatCard";
import { routePath } from "@/route/route-paths";
import { useDemoLoading } from "../../shared/useDemoLoading";

const sectionList = [
	{ id: "cover", label: "Cover", value: 100 },
	{ id: "playbook", label: "Playbook", value: 82 },
	{ id: "canvas", label: "Scenario canvas", value: 44 },
	{ id: "data-book", label: "Data book", value: 20 },
] as const;

const getSectionLabelSkeletonWidth = (label: string) => {
	const characterCount = [...label].length;
	if (characterCount >= 14) return "w-32";
	if (characterCount >= 9) return "w-24";
	if (characterCount >= 6) return "w-20";
	return "w-12";
};

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
					<h1 className="m-0 text-page-title font-bold">
						{isLoading ? (
							<Skeleton className="inline-block h-8 w-48 align-middle" />
						) : (
							"리팩터링 테스트"
						)}
					</h1>
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
					<p className="sr-only" role="status">
						스토리 리포트 데이터를 불러오고 있습니다.
					</p>
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<StatCard
							label="조회수"
							value={<Skeleton className="h-8 w-12" />}
							detail="최근 7일"
						/>
						<StatCard
							label="완독률"
							value={<Skeleton className="h-8 w-20" />}
							detail={
								<span className="inline-flex items-center gap-1">
									읽기 완료 <Skeleton className="h-3.5 w-5" />명
								</span>
							}
						/>
						<StatCard
							label="참여율"
							value={<Skeleton className="h-8 w-24" />}
							detail={
								<span className="inline-flex items-center gap-1">
									참여 사용자 <Skeleton className="h-3.5 w-5" />명
								</span>
							}
						/>
						<StatCard
							label="댓글"
							value={<Skeleton className="h-8 w-12" />}
							detail="등록된 댓글"
						/>
					</div>
					<div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)]">
						<section
							className="
         min-w-0 overflow-hidden rounded-xl border
         border-border bg-surface
       "
						>
							<header
								className="
          flex min-h-14 items-center justify-between
          gap-3 border-b border-border px-5
          py-2.5
        "
							>
								<div
									className="
           flex min-w-0 flex-wrap items-center
           gap-2
         "
								>
									<h2 className="m-0 text-subtitle font-semibold">
										화면별 도달률
									</h2>
									<Badge tone="neutral">최근 7일</Badge>
								</div>
							</header>
							<div className="grid gap-5 p-5">
								{sectionList.map((section) => (
									<div
										className="
            grid grid-cols-[120px_minmax(0,1fr)_100px] items-center gap-3
            text-meta
          "
										key={section.id}
									>
										{isLoading ? (
											<Skeleton
												className={`h-3.5 ${getSectionLabelSkeletonWidth(section.label)}`}
											/>
										) : (
											<span className="truncate">{section.label}</span>
										)}
										<Skeleton className="h-2.5 w-full rounded-pill" />
										<Skeleton className="h-4 w-14 justify-self-end" />
									</div>
								))}
							</div>
						</section>
						<section
							className="
         grid content-start gap-4 rounded-xl
         border border-border bg-surface p-5
       "
						>
							<div className="flex items-center justify-between gap-3">
								<h2 className="m-0 text-subtitle font-semibold">참여 항목</h2>
								<Badge tone="warning">
									{isLoading ? (
										<Skeleton className="inline-block h-3 w-12 align-middle" />
									) : (
										"검수 요청"
									)}
								</Badge>
							</div>
							<div
								className="
          grid gap-1 border-b border-border
          pb-4
        "
							>
								<strong className="inline-flex items-center gap-1">
									{isLoading ? <Skeleton className="h-4 w-8" /> : "A/B"}
									<span>· 참여 유형</span>
								</strong>
								<p className="m-0 text-meta text-text-muted">
									{isLoading ? (
										<Skeleton className="h-3.5 w-40" />
									) : (
										"어떤 방식을 선호하나요?"
									)}
								</p>
							</div>
							<dl
								className="
          m-0 grid grid-cols-3 gap-3
          text-meta
        "
							>
								{[
									{ label: "도달", className: "w-8" },
									{ label: "응답", className: "w-8" },
									{ label: "응답률", className: "w-12" },
								].map((item) => (
									<div key={item.label}>
										<dt className="text-text-muted">{item.label}</dt>
										<dd className="mt-1 mb-0">
											<Skeleton className={`h-4 ${item.className}`} />
										</dd>
									</div>
								))}
							</dl>
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
								<dd className="mt-1 mb-0">
									<Skeleton className="h-4 w-16" />
								</dd>
							</div>
							<div>
								<dt className="text-meta text-text-muted">상태</dt>
								<dd className="mt-1 mb-0">
									<Skeleton className="h-6 w-20 rounded-pill" />
								</dd>
							</div>
						</dl>
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
									<Badge tone="primary">게시 중</Badge>
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
