import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/component/ui/Button";
import { StatCard } from "@/component/ui/StatCard";
import { routePath } from "@/route/route-paths";

type DashboardRange = "week" | "month" | "all";
type RankingMetric = "views" | "completion" | "participation";
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

const metricValue = (row: RankingRow, metric: RankingMetric) => row[metric];

const dashboardMetricList = (range: DashboardRange) => {
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
				label: "등록 항목",
				value: "23",
				unit: "",
				detail: "게시 중 16 · 작성 중 7",
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
				label: "등록 항목",
				value: "52",
				unit: "",
				detail: "게시 중 23 · 작성 중 29",
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
			label: "등록 항목",
			value: "23",
			unit: "",
			detail: "게시 중 14 · 작성 중 9",
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

const barWidth = (value: number, maxValue: number) =>
	`${Math.max(0, Math.min(100, (value / maxValue) * 100))}%`;

export const DemoDashboardPage = () => {
	const [range, setRange] = useState<DashboardRange>("week");
	const [rankingMetric, setRankingMetric] = useState<RankingMetric>("views");
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
			<header className="flex items-center justify-between gap-3 max-[720px]:items-start max-[720px]:flex-col">
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
					className="flex flex-wrap items-center justify-end gap-3 max-[720px]:w-full max-[720px]:justify-start"
					aria-label="대시보드 표시 설정"
				>
					<div
						className="inline-flex overflow-hidden rounded-md border border-border bg-surface"
						role="group"
						aria-label="조회 기간"
					>
						{rangeOptionList.map((option) => (
							<button
								key={option.value}
								type="button"
								aria-pressed={range === option.value}
								className={`min-h-10 border-r border-border px-3.5 py-2 font-sans text-body font-semibold transition-colors last:border-r-0 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-focus motion-reduce:transition-none ${range === option.value ? "bg-primary-strong text-on-primary" : "bg-transparent text-text-muted"}`}
								onClick={() => setRange(option.value)}
							>
								{option.label}
							</button>
						))}
					</div>
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

			<div
				className="grid grid-cols-3 gap-3 max-[1050px]:grid-cols-2 max-[720px]:grid-cols-1"
				aria-label={`${rangeTitle} 요약`}
			>
				{metricList.map((metric, index) => (
					<StatCard
						key={metric.label}
						className={index === 0 ? "border-primary" : ""}
						label={metric.label}
						value={
							<>
								{metric.value}
								{metric.unit && <small>{metric.unit}</small>}
							</>
						}
						detail={metric.detail}
					/>
				))}
			</div>

			<section
				className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface"
				aria-labelledby="demo-ranking-title"
			>
				<header className="flex min-h-14 items-center justify-between gap-3 border-b border-border px-5 py-2.5 max-[720px]:items-start max-[720px]:flex-col">
					<h2
						className="m-0 text-subtitle font-semibold tracking-[-0.02em]"
						id="demo-ranking-title"
					>
						항목별 상세 순위
					</h2>
					<div className="flex flex-wrap items-center justify-end gap-3 max-[720px]:w-full max-[720px]:justify-start">
						<div
							className="inline-flex overflow-hidden rounded-md border border-border bg-surface"
							role="group"
							aria-label="순위 기준"
						>
							{(
								[
									["views", "조회수"],
									["completion", "완료율"],
									["participation", "참여율"],
								] as const
							).map(([value, label]) => (
								<button
									key={value}
									type="button"
									aria-pressed={rankingMetric === value}
									className={`min-h-10 border-r border-border px-3.5 py-2 font-sans text-body font-semibold transition-colors last:border-r-0 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-focus motion-reduce:transition-none ${rankingMetric === value ? "bg-primary-strong text-on-primary" : "bg-transparent text-text-muted"}`}
									onClick={() => setRankingMetric(value)}
								>
									{label}
								</button>
							))}
						</div>
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
									className="border-b border-border px-4 py-3.5 text-caption font-semibold text-text-muted max-[720px]:px-3 max-[720px]:py-3"
									scope="col"
								>
									순위
								</th>
								<th
									className="border-b border-border px-4 py-3.5 text-caption font-semibold text-text-muted max-[720px]:px-3 max-[720px]:py-3"
									scope="col"
								>
									ID
								</th>
								<th
									className="border-b border-border px-4 py-3.5 text-caption font-semibold text-text-muted max-[720px]:px-3 max-[720px]:py-3"
									scope="col"
								>
									항목
								</th>
								<th
									className="border-b border-border px-4 py-3.5 text-caption font-semibold text-text-muted max-[720px]:px-3 max-[720px]:py-3"
									scope="col"
								>
									조회수
								</th>
								<th
									className="border-b border-border px-4 py-3.5 text-caption font-semibold text-text-muted max-[720px]:px-3 max-[720px]:py-3"
									scope="col"
								>
									완료율
								</th>
								<th
									className="border-b border-border px-4 py-3.5 text-caption font-semibold text-text-muted max-[720px]:px-3 max-[720px]:py-3"
									scope="col"
								>
									참여율
								</th>
								<th
									className="border-b border-border px-4 py-3.5 text-caption font-semibold text-text-muted max-[720px]:px-3 max-[720px]:py-3"
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
									<td className="border-b border-border px-4 py-3.5 text-text-muted tabular-nums max-[720px]:px-3 max-[720px]:py-3">
										{String(index + 1).padStart(2, "0")}
									</td>
									<td className="border-b border-border px-4 py-3.5 max-[720px]:px-3 max-[720px]:py-3">
										{row.id}
									</td>
									<th
										className="border-b border-border px-4 py-3.5 text-meta font-bold max-[720px]:px-3 max-[720px]:py-3"
										scope="row"
									>
										{row.title}
									</th>
									<td className="border-b border-border px-4 py-3.5 max-[720px]:px-3 max-[720px]:py-3">
										<div className="flex items-center gap-3">
											<span className="min-w-[18px] text-right tabular-nums">
												{row.views}
											</span>
											<span
												className="block h-2 w-[108px] overflow-hidden rounded-pill bg-surface-muted"
												role="progressbar"
												aria-label={`${row.title} 조회 비율`}
												aria-valuemin={0}
												aria-valuemax={100}
												aria-valuenow={Number.parseFloat(
													barWidth(row.views, maxViewCount),
												)}
											>
												<span
													className="block h-full rounded-pill bg-primary-strong"
													style={{ width: barWidth(row.views, maxViewCount) }}
												/>
											</span>
										</div>
									</td>
									<td className="border-b border-border px-4 py-3.5 max-[720px]:px-3 max-[720px]:py-3">
										{row.completion}%
									</td>
									<td className="border-b border-border px-4 py-3.5 max-[720px]:px-3 max-[720px]:py-3">
										{row.participation}%
									</td>
									<td className="border-b border-border px-4 py-3.5 max-[720px]:px-3 max-[720px]:py-3">
										{row.commentCount}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<div className="grid grid-cols-[minmax(0,1.6fr)_minmax(260px,0.8fr)] gap-3 max-[1050px]:grid-cols-1">
				<section
					className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface"
					aria-labelledby="demo-team-title"
				>
					<header className="flex min-h-14 items-center justify-between gap-3 border-b border-border px-5 py-2.5 max-[720px]:items-start max-[720px]:flex-col">
						<h2
							className="m-0 text-subtitle font-semibold tracking-[-0.02em]"
							id="demo-team-title"
						>
							팀별 사용자 활성률
						</h2>
						<span className="text-caption text-text-muted">예시 데이터</span>
					</header>
					<div className="grid gap-5 p-5">
						{[
							{ label: "운영팀", count: "1/1 · 100%", value: 100 },
							{ label: "제품팀", count: "1/3 · 33%", value: 33 },
							{ label: "지원팀", count: "0/9 · 0%", value: 0 },
						].map((item) => (
							<div
								className="grid grid-cols-[120px_minmax(0,1fr)_100px] items-center gap-3 text-meta max-[720px]:grid-cols-[84px_minmax(0,1fr)_80px] max-[720px]:gap-2"
								key={item.label}
							>
								<span>{item.label}</span>
								<div
									className="block h-2.5 w-full overflow-hidden rounded-pill bg-surface-muted"
									role="progressbar"
									aria-label={`${item.label} 활성률`}
									aria-valuemin={0}
									aria-valuemax={100}
									aria-valuenow={item.value}
								>
									<span
										className="block h-full rounded-pill bg-primary-strong"
										style={{ width: `${item.value}%` }}
									/>
								</div>
								<strong className="text-right tabular-nums">
									{item.count}
								</strong>
							</div>
						))}
					</div>
				</section>

				<section
					className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface"
					aria-labelledby="demo-return-title"
				>
					<header className="flex min-h-14 items-center justify-between gap-3 border-b border-border px-5 py-2.5 max-[720px]:items-start max-[720px]:flex-col">
						<h2
							className="m-0 text-subtitle font-semibold tracking-[-0.02em]"
							id="demo-return-title"
						>
							주차별 재방문율
						</h2>
						<span className="text-caption text-text-muted">최근 5주</span>
					</header>
					<div
						className="flex min-h-[184px] items-end justify-around border-b border-border px-6 pt-5"
						role="img"
						aria-label="주차별 재방문율 예시 그래프"
					>
						{[
							{ label: "1주", value: 52 },
							{ label: "2주", value: 37 },
							{ label: "3주", value: 28 },
							{ label: "4주", value: 42 },
							{ label: "5주", value: 34 },
						].map((item) => (
							<div
								className="flex h-[164px] flex-1 flex-col items-center justify-end gap-2 text-[11px] text-text-muted"
								key={item.label}
							>
								<span
									className="min-h-[2px] w-[min(48px,55%)] rounded-t-[6px] bg-primary-strong"
									style={{ height: `${item.value}%` }}
								/>
								<small>{item.label}</small>
							</div>
						))}
					</div>
				</section>
			</div>
		</section>
	);
};
