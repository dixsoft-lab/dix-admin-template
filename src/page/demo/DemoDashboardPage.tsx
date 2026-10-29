import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/component/ui/Badge";
import { SegmentedControl } from "@/component/ui/SegmentedControl";
import { Skeleton } from "@/component/ui/Skeleton";
import { Button } from "@/component/ui/Button";
import { HorizontalBar } from "@/component/ui/HorizontalBar";
import { HorizontalBarChart } from "@/component/ui/HorizontalBarChart";
import { StatCard } from "@/component/ui/StatCard";
import { VerticalBarChart } from "@/component/ui/VerticalBarChart";
import { routePath } from "@/route/route-paths";
import { useDemoLoading } from "./useDemoLoading";

type DashboardRange = "week" | "month" | "all";
type RankingMetric = "views" | "completion" | "participation";
type DashboardMetric =
	| {
			readonly label: string;
			readonly value: string;
			readonly unit: string;
			readonly detail: string;
	  }
	| {
			readonly label: string;
			readonly itemList: readonly {
				readonly label: string;
				readonly value: string;
			}[];
	  };
type RankingRow = {
	readonly id: string;
	readonly title: string;
	readonly views: number;
	readonly completion: number;
	readonly participation: number;
	readonly commentCount: number;
};

const rangeOptionList: readonly {
	readonly value: DashboardRange;
	readonly label: string;
}[] = [
	{ value: "week", label: "최근 7일" },
	{ value: "month", label: "최근 30일" },
	{ value: "all", label: "전체" },
];

const rowList: readonly RankingRow[] = [
	{
		id: "A045",
		title: "처음 사용하는 관리자를 위한 안내",
		views: 4,
		completion: 0,
		participation: 0,
		commentCount: 0,
	},
	{
		id: "A021",
		title: "계정 설정 시작하기",
		views: 3,
		completion: 0,
		participation: 0,
		commentCount: 0,
	},
	{
		id: "A026",
		title: "팀 업무 흐름 정리",
		views: 3,
		completion: 100,
		participation: 0,
		commentCount: 0,
	},
	{
		id: "A025",
		title: "서비스 활용 가이드",
		views: 2,
		completion: 0,
		participation: 0,
		commentCount: 0,
	},
];

const departmentActivityItemList = [
	{
		id: "marketing-intelligence",
		label: "마케팅인텔리전스 ...",
		value: 100,
		displayValue: "1/1 · 100%",
		ariaLabel: "마케팅인텔리전스 부서 가입 계정 활성률",
	},
	{
		id: "mi-planning",
		label: "MI기획팀",
		value: 66.67,
		displayValue: "2/3 · 66.67%",
		ariaLabel: "MI기획팀 가입 계정 활성률",
	},
	{
		id: "partner",
		label: "협력사",
		value: 0,
		displayValue: "0/9 · 0%",
		ariaLabel: "협력사 가입 계정 활성률",
	},
	{
		id: "other",
		label: "기타",
		value: 0,
		displayValue: "0/0 · 0%",
		ariaLabel: "기타 가입 계정 활성률",
	},
] as const;

const weeklyReturnItemList = [
	{
		id: "w0",
		label: "W0",
		value: 100,
		tone: "primary",
	},
	{
		id: "w1",
		label: "W1",
		value: 33.33,
		tone: "secondary",
	},
	{ id: "w2", label: "W2", value: 0, tone: "muted" },
	{ id: "w3", label: "W3", value: 0, tone: "muted" },
	{ id: "w4", label: "W4", value: 0, tone: "muted" },
	{ id: "w5", label: "W5", value: 0, tone: "muted" },
] as const;

const metricValue = (row: RankingRow, metric: RankingMetric) => row[metric];

const dashboardMetricList = (
	range: DashboardRange,
): readonly DashboardMetric[] => {
	if (range === "month")
		return [
			{
				label: "검수 대기",
				value: "7",
				unit: "건",
				detail: "가장 오래된 건 18일 경과",
			},
			{
				label: "주간 활성 인원",
				value: "8",
				unit: "명",
				detail: "최근 30일 기준",
			},
			{
				label: "유저스토리",
				itemList: [
					{ label: "게시 중", value: "16" },
					{ label: "작성 중", value: "7" },
					{ label: "검수 요청", value: "7" },
				],
			},
			{
				label: "평균 완료율",
				value: "24",
				unit: "%",
				detail: "지난 기간보다 4% 증가",
			},
			{
				label: "응답률",
				value: "12",
				unit: "%",
				detail: "최근 30일 응답 18건",
			},
			{
				label: "사용자 참여 비율",
				value: "36",
				unit: "%",
				detail: "활성 사용자 8명 중 3명",
			},
		];
	if (range === "all")
		return [
			{
				label: "검수 대기",
				value: "12",
				unit: "건",
				detail: "가장 오래된 건 24일 경과",
			},
			{
				label: "주간 활성 인원",
				value: "14",
				unit: "명",
				detail: "누적 활성 사용자",
			},
			{
				label: "유저스토리",
				itemList: [
					{ label: "게시 중", value: "23" },
					{ label: "작성 중", value: "29" },
					{ label: "검수 요청", value: "12" },
				],
			},
			{
				label: "평균 완료율",
				value: "31",
				unit: "%",
				detail: "전체 항목 평균",
			},
			{ label: "응답률", value: "18", unit: "%", detail: "전체 응답 64건" },
			{
				label: "사용자 참여 비율",
				value: "43",
				unit: "%",
				detail: "활성 사용자 14명 중 6명",
			},
		];
	return [
		{
			label: "검수 대기",
			value: "4",
			unit: "건",
			detail: "가장 오래된 건 12일 경과",
		},
		{
			label: "주간 활성 인원",
			value: "2",
			unit: "명",
			detail: "최근 7일 기준",
		},
		{
			label: "유저스토리",
			itemList: [
				{ label: "게시 중", value: "14" },
				{ label: "작성 중", value: "9" },
				{ label: "검수 요청", value: "4" },
			],
		},
		{ label: "평균 완료율", value: "20", unit: "%", detail: "최근 7일 기준" },
		{ label: "응답률", value: "0", unit: "%", detail: "도달 6건 중 응답 0건" },
		{
			label: "사용자 참여 비율",
			value: "0",
			unit: "%",
			detail: "대상 사용자 2명 중 참여 0명",
		},
	];
};

const DashboardSkeleton = () => (
	<div
		className="grid gap-3"
		aria-label="대시보드 데이터 불러오는 중"
		aria-busy="true"
	>
		<div
			className="
     grid grid-cols-3 gap-3 max-[1050px]:grid-cols-2
     max-[720px]:grid-cols-1
   "
		>
			{Array.from({ length: 6 }, (_, index) => (
				<div
					className="
       grid min-h-40 content-start gap-4
       rounded-xl border border-border bg-surface
       p-5
     "
					key={index}
				>
					<Skeleton className="h-4 w-28" />
					<Skeleton className="h-10 w-24" />
					<Skeleton className="h-3.5 w-40 max-w-full" />
				</div>
			))}
		</div>
		<section
			className="
     overflow-hidden rounded-xl border border-border
     bg-surface
   "
			aria-label="순위 표 불러오는 중"
		>
			<div
				className="
      flex min-h-14 items-center justify-between
      border-b border-border px-5 py-3
    "
			>
				<Skeleton className="h-5 w-36" />
				<Skeleton className="h-9 w-56 max-w-1/2" />
			</div>
			<div
				className="
      grid grid-cols-[48px_64px_minmax(120px,1fr)_120px_80px_80px_64px] gap-3 border-b
      border-border px-4 py-4 max-[720px]:min-w-180
    "
			>
				{Array.from({ length: 7 }, (_, index) => (
					<Skeleton className="h-3.5" key={`heading-${index}`} />
				))}
			</div>
			{Array.from({ length: 4 }, (_, rowIndex) => (
				<div
					className="
       grid grid-cols-[48px_64px_minmax(120px,1fr)_120px_80px_80px_64px] items-center gap-3
       border-b border-border px-4 py-4
       last:border-b-0 max-[720px]:min-w-180
     "
					key={rowIndex}
				>
					{Array.from({ length: 7 }, (_, columnIndex) => (
						<Skeleton
							className={columnIndex === 2 ? "h-4 w-4/5" : "h-3.5"}
							key={`${rowIndex}-${columnIndex}`}
						/>
					))}
				</div>
			))}
		</section>
		<div className="grid grid-cols-[minmax(0,1.6fr)_minmax(260px,0.8fr)] gap-3 max-[1050px]:grid-cols-1">
			<section
				className="
      grid min-h-56 content-start gap-5
      rounded-xl border border-border bg-surface
      p-5
    "
				aria-label="팀 활성률 불러오는 중"
			>
				<Skeleton className="h-5 w-40" />
				{Array.from({ length: 4 }, (_, index) => (
					<div
						className="grid grid-cols-[100px_minmax(0,1fr)_80px] items-center gap-3"
						key={index}
					>
						<Skeleton className="h-3.5" />
						<Skeleton className="h-2.5" />
						<Skeleton className="h-3.5" />
					</div>
				))}
			</section>
			<section
				className="
      grid min-h-56 content-start gap-5
      rounded-xl border border-border bg-surface
      p-5
    "
				aria-label="재방문율 불러오는 중"
			>
				<Skeleton className="h-5 w-32" />
				<div
					className="
       flex h-40 items-end justify-around
       gap-3 px-4
     "
				>
					{Array.from({ length: 6 }, (_, index) => (
						<Skeleton
							shape="bar"
							className="w-8"
							animationDelay={index * 90}
							key={index}
						/>
					))}
				</div>
			</section>
		</div>
		<p className="sr-only" role="status">
			예시 데이터를 불러오고 있습니다. 약 300밀리초 걸립니다.
		</p>
	</div>
);

export const DemoDashboardPage = () => {
	const [range, setRange] = useState<DashboardRange>("week");
	const [rankingMetric, setRankingMetric] = useState<RankingMetric>("views");
	const isLoading = useDemoLoading(range);
	const metricList = dashboardMetricList(range);
	const sortedRowList = [...rowList].sort(
		(first, second) =>
			metricValue(second, rankingMetric) - metricValue(first, rankingMetric),
	);
	const maxViewCount = Math.max(...rowList.map(({ views }) => views), 1);
	const rangeTitle = rangeOptionList.find(
		(option) => option.value === range,
	)?.label;

	return (
		<section className="grid gap-4" aria-labelledby="demo-dashboard-title">
			<header
				className="
      flex items-center justify-between gap-3
      max-[720px]:items-start max-[720px]:flex-col
    "
			>
				<div>
					<h1
						className="m-0 text-page-title font-bold tracking-[-0.03em]"
						id="demo-dashboard-title"
					>
						대시보드
					</h1>
					<p className="mt-1 text-meta text-text-muted">
						관리 현황을 한눈에 확인하세요.
					</p>
				</div>
				<div
					className="
       flex flex-wrap items-center justify-end
       gap-3 max-[720px]:w-full max-[720px]:justify-start
     "
					aria-label="대시보드 표시 설정"
				>
					<SegmentedControl
						ariaLabel="조회 기간"
						value={range}
						optionList={rangeOptionList}
						onChange={setRange}
					/>
					<Button
						variant="secondary"
						type="button"
						onClick={() => window.print()}
					>
						인쇄
					</Button>
				</div>
			</header>

			<p className="-mt-2 justify-self-end text-caption text-text-muted">
				화면 예시 · 실제 서비스 데이터가 아닙니다.
			</p>

			{isLoading ? (
				<DashboardSkeleton />
			) : (
				<>
					<div
						className="
        grid grid-cols-3 gap-3 max-[1050px]:grid-cols-2
        max-[720px]:grid-cols-1
      "
						aria-label={`${rangeTitle} 요약`}
					>
						{metricList.map((metric, index) => (
							<StatCard
								key={metric.label}
								className={index === 0 ? "border-primary" : ""}
								label={metric.label}
								value={
									"itemList" in metric ? (
										<div
											className="
             flex min-h-13 items-end gap-3
             max-[720px]:gap-2
           "
										>
											{metric.itemList.map((item, itemIndex) => (
												<div
													className="
               flex min-w-0 items-center gap-3
               max-[720px]:gap-2
             "
													key={item.label}
												>
													{itemIndex > 0 && (
														<span
															aria-hidden="true"
															className="
                 mb-1 h-8 w-px shrink-0
                 bg-border
               "
														/>
													)}
													<div className="min-w-0">
														<strong
															className={`
                 block font-(family-name:--num) text-[28px] leading-[1.2]
                 tracking-[-0.02em] max-[720px]:text-page-title
                 ${itemIndex > 0 ? "text-text-muted" : "text-text"}`}
														>
															{item.value}
														</strong>
														<span
															className="
                 block whitespace-nowrap text-caption font-normal
                 text-text-subtle
               "
														>
															{item.label}
														</span>
													</div>
												</div>
											))}
										</div>
									) : (
										<>
											{metric.value}
											{metric.unit && <small>{metric.unit}</small>}
										</>
									)
								}
								detail={"detail" in metric ? metric.detail : undefined}
							/>
						))}
					</div>

					<section
						className="
        min-w-0 overflow-hidden rounded-xl border
        border-border bg-surface
      "
						aria-labelledby="demo-ranking-title"
					>
						<header
							className="
         flex min-h-14 items-center justify-between
         gap-3 border-b border-border px-5
         py-2.5 max-[720px]:items-start max-[720px]:flex-col
       "
						>
							<h2
								className="m-0 text-subtitle font-semibold tracking-[-0.02em]"
								id="demo-ranking-title"
							>
								항목별 상세 순위
							</h2>
							<div
								className="
          flex flex-wrap items-center justify-end
          gap-3 max-[720px]:w-full max-[720px]:justify-start
        "
							>
								<SegmentedControl
									ariaLabel="순위 기준"
									size="sm"
									value={rankingMetric}
									optionList={[
										{ value: "views", label: "조회수" },
										{ value: "completion", label: "완료율" },
										{ value: "participation", label: "참여율" },
									]}
									onChange={setRankingMetric}
								/>
								<Link
									className="font-bold text-text no-underline hover:text-primary"
									to={routePath.list}
								>
									전체 52건 보기 <span aria-hidden="true">→</span>
								</Link>
							</div>
						</header>
						<div className="w-full overflow-x-auto">
							<table className="w-full border-collapse text-left whitespace-nowrap">
								<caption className="sr-only">
									예시 항목의 조회수와 참여 지표
								</caption>
								<thead>
									<tr>
										<th
											className="
             border-b border-border px-4 py-3.5
             text-caption font-semibold text-text-muted max-[720px]:px-3
             max-[720px]:py-3
           "
											scope="col"
										>
											순위
										</th>
										<th
											className="
             border-b border-border px-4 py-3.5
             text-caption font-semibold text-text-muted max-[720px]:px-3
             max-[720px]:py-3
           "
											scope="col"
										>
											ID
										</th>
										<th
											className="
             border-b border-border px-4 py-3.5
             text-caption font-semibold text-text-muted max-[720px]:px-3
             max-[720px]:py-3
           "
											scope="col"
										>
											항목
										</th>
										<th
											className="
             border-b border-border px-4 py-3.5
             text-caption font-semibold text-text-muted max-[720px]:px-3
             max-[720px]:py-3
           "
											scope="col"
										>
											조회수
										</th>
										<th
											className="
             border-b border-border px-4 py-3.5
             text-caption font-semibold text-text-muted max-[720px]:px-3
             max-[720px]:py-3
           "
											scope="col"
										>
											완료율
										</th>
										<th
											className="
             border-b border-border px-4 py-3.5
             text-caption font-semibold text-text-muted max-[720px]:px-3
             max-[720px]:py-3
           "
											scope="col"
										>
											참여율
										</th>
										<th
											className="
             border-b border-border px-4 py-3.5
             text-caption font-semibold text-text-muted max-[720px]:px-3
             max-[720px]:py-3
           "
											scope="col"
										>
											댓글
										</th>
									</tr>
								</thead>
								<tbody>
									{sortedRowList.map((row, index) => (
										<tr
											className="last:[&>td]:border-b-0 last:[&>th]:border-b-0"
											key={row.id}
										>
											<td
												className="
              border-b border-border px-4 py-3.5
              text-text-muted tabular-nums max-[720px]:px-3 max-[720px]:py-3
            "
											>
												{String(index + 1).padStart(2, "0")}
											</td>
											<td
												className="
              border-b border-border px-4 py-3.5
              max-[720px]:px-3 max-[720px]:py-3
            "
											>
												{row.id}
											</td>
											<th
												className="
              border-b border-border px-4 py-3.5
              text-meta font-bold max-[720px]:px-3 max-[720px]:py-3
            "
												scope="row"
											>
												{row.title}
											</th>
											<td
												className="
              border-b border-border px-4 py-3.5
              max-[720px]:px-3 max-[720px]:py-3
            "
											>
												<div className="flex items-center gap-3">
													<span className="min-w-4.5 text-right tabular-nums">
														{row.views}
													</span>
													<HorizontalBar
														label={`${row.title} 조회 비율`}
														value={row.views}
														maxValue={maxViewCount}
														valueText={`${row.views}회 조회`}
														size="sm"
														trackWidth={108}
													/>
												</div>
											</td>
											<td
												className="
              border-b border-border px-4 py-3.5
              max-[720px]:px-3 max-[720px]:py-3
            "
											>
												{row.completion}%
											</td>
											<td
												className="
              border-b border-border px-4 py-3.5
              max-[720px]:px-3 max-[720px]:py-3
            "
											>
												{row.participation}%
											</td>
											<td
												className="
              border-b border-border px-4 py-3.5
              max-[720px]:px-3 max-[720px]:py-3
            "
											>
												{row.commentCount}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</section>

					<div className="grid grid-cols-[minmax(0,1.6fr)_minmax(260px,0.8fr)] gap-3 max-[1050px]:grid-cols-1">
						<HorizontalBarChart
							title="부서별 가입 계정 활성률"
							headerMeta={<Badge tone="quiet">L2</Badge>}
							headerAction={
								<Link
									className="text-text no-underline hover:text-primary"
									to={routePath.list}
								>
									전체 7개 부서 <span aria-hidden="true">→</span>
								</Link>
							}
							itemList={departmentActivityItemList}
						/>

						<VerticalBarChart
							title="주차별 재방문율"
							headerMeta="W0 코호트"
							valueFormatter={(value) => `${value}%`}
							itemList={weeklyReturnItemList}
						/>
					</div>
				</>
			)}
		</section>
	);
};
