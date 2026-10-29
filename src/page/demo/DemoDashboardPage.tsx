import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@admin/component/design-system";
import { StatCard } from "@admin/component/ui";
import { adminRoutePath } from "@admin/route";
import "./demo-dashboard.css";

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
		<section
			className="dix-demo-dashboard"
			aria-labelledby="demo-dashboard-title"
		>
			<header className="dix-demo-dashboard-header">
				<div>
					<h1 id="demo-dashboard-title">대시보드</h1>
					<p>관리 현황을 한눈에 확인하세요.</p>
				</div>
				<div
					className="dix-demo-dashboard-actions"
					aria-label="대시보드 표시 설정"
				>
					<div
						className="dix-demo-segmented"
						role="group"
						aria-label="조회 기간"
					>
						{rangeOptionList.map((option) => (
							<button
								key={option.value}
								type="button"
								aria-pressed={range === option.value}
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

			<p className="dix-demo-data-note">
				화면 예시 · 실제 서비스 데이터가 아닙니다.
			</p>

			<div className="dix-demo-metric-grid" aria-label={`${rangeTitle} 요약`}>
				{metricList.map((metric) => (
					<StatCard
						key={metric.label}
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

			<section className="dix-demo-panel" aria-labelledby="demo-ranking-title">
				<header className="dix-demo-panel-header">
					<h2 id="demo-ranking-title">항목별 상세 순위</h2>
					<div className="dix-demo-panel-actions">
						<div
							className="dix-demo-segmented"
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
									onClick={() => setRankingMetric(value)}
								>
									{label}
								</button>
							))}
						</div>
						<Link to={adminRoutePath.list}>
							전체 52건 보기 <span aria-hidden="true">→</span>
						</Link>
					</div>
				</header>
				<div className="dix-demo-table-scroll">
					<table className="dix-demo-ranking-table">
						<caption>예시 항목의 조회수와 참여 지표</caption>
						<thead>
							<tr>
								<th scope="col">순위</th>
								<th scope="col">ID</th>
								<th scope="col">항목</th>
								<th scope="col">조회수</th>
								<th scope="col">완료율</th>
								<th scope="col">참여율</th>
								<th scope="col">댓글</th>
							</tr>
						</thead>
						<tbody>
							{sortedRowList.map((row, index) => (
								<tr key={row.id}>
									<td className="dix-demo-rank-number">
										{String(index + 1).padStart(2, "0")}
									</td>
									<td>{row.id}</td>
									<th scope="row">{row.title}</th>
									<td>
										<div className="dix-demo-view-cell">
											<span>{row.views}</span>
											<span
												className="dix-demo-view-bar"
												role="progressbar"
												aria-label={`${row.title} 조회 비율`}
												aria-valuemin={0}
												aria-valuemax={100}
												aria-valuenow={Number.parseFloat(
													barWidth(row.views, maxViewCount),
												)}
											>
												<span
													style={{ width: barWidth(row.views, maxViewCount) }}
												/>
											</span>
										</div>
									</td>
									<td>{row.completion}%</td>
									<td>{row.participation}%</td>
									<td>{row.commentCount}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<div className="dix-demo-chart-grid">
				<section className="dix-demo-panel" aria-labelledby="demo-team-title">
					<header className="dix-demo-panel-header">
						<h2 id="demo-team-title">팀별 사용자 활성률</h2>
						<span className="dix-demo-panel-tag">예시 데이터</span>
					</header>
					<div className="dix-demo-bar-list">
						{[
							{ label: "운영팀", count: "1/1 · 100%", value: 100 },
							{ label: "제품팀", count: "1/3 · 33%", value: 33 },
							{ label: "지원팀", count: "0/9 · 0%", value: 0 },
						].map((item) => (
							<div className="dix-demo-bar-row" key={item.label}>
								<span>{item.label}</span>
								<div
									className="dix-demo-chart-track"
									role="progressbar"
									aria-label={`${item.label} 활성률`}
									aria-valuemin={0}
									aria-valuemax={100}
									aria-valuenow={item.value}
								>
									<span style={{ width: `${item.value}%` }} />
								</div>
								<strong>{item.count}</strong>
							</div>
						))}
					</div>
				</section>

				<section className="dix-demo-panel" aria-labelledby="demo-return-title">
					<header className="dix-demo-panel-header">
						<h2 id="demo-return-title">주차별 재방문율</h2>
						<span className="dix-demo-panel-tag">최근 5주</span>
					</header>
					<div
						className="dix-demo-week-chart"
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
							<div className="dix-demo-week-bar" key={item.label}>
								<span style={{ height: `${item.value}%` }} />
								<small>{item.label}</small>
							</div>
						))}
					</div>
				</section>
			</div>
		</section>
	);
};
