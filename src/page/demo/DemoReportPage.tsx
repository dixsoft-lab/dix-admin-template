import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/component/ui/Badge";
import { Button } from "@/component/ui/Button";
import { DataTable } from "@/component/ui/DataTable";
import { HorizontalBarChart } from "@/component/ui/HorizontalBarChart";
import { SegmentedControl } from "@/component/ui/SegmentedControl";
import { Skeleton } from "@/component/ui/Skeleton";
import { StatCard } from "@/component/ui/StatCard";
import { useOverlay } from "@/component/overlay/useOverlay";
import { routePath } from "@/route/route-paths";
import { useDemoLoading } from "./useDemoLoading";

type ReportKind =
	"stories" | "engagement" | "screens" | "departments" | "users" | "comments";
type ReportRow = {
	readonly id: string;
	readonly recordId?: string;
	readonly cellList: readonly string[];
};

const reportConfig = {
	stories: {
		title: "유저스토리 목록",
		countLabel: "전체 67건",
		metricList: [
			{ label: "게시 중", value: "23", detail: "전체 유저스토리" },
			{ label: "작성 중", value: "41", detail: "임시 저장 포함" },
			{ label: "검수 요청", value: "4", detail: "확인 대기" },
		],
		columnList: [
			"순위",
			"ID",
			"유저스토리",
			"담당",
			"조회수",
			"완독률",
			"참여율",
			"댓글",
		],
		rowList: [
			{
				id: "r1",
				recordId: "H045",
				cellList: [
					"01",
					"H045",
					"리팩터링 테스트",
					"운영팀",
					"4",
					"0%",
					"0%",
					"0",
				],
			},
			{
				id: "r2",
				recordId: "H021",
				cellList: [
					"02",
					"H021",
					"차는 골프백보다 은퇴 후 품위를 싣는다",
					"제품팀",
					"3",
					"0%",
					"0%",
					"0",
				],
			},
			{
				id: "r3",
				recordId: "H026",
				cellList: [
					"03",
					"H026",
					"헤리티지를 잇는 사람들",
					"콘텐츠팀",
					"3",
					"100%",
					"0%",
					"0",
				],
			},
			{
				id: "r4",
				recordId: "H025",
				cellList: [
					"04",
					"H025",
					"사업가의 차는 캘리그라피",
					"운영팀",
					"2",
					"0%",
					"0%",
					"0",
				],
			},
		],
	},
	engagement: {
		title: "참여 항목 응답률",
		countLabel: "전체 18개 항목",
		metricList: [
			{ label: "도달", value: "126", detail: "선택한 기간" },
			{ label: "응답", value: "38", detail: "A/B · Poll" },
			{ label: "평균 응답률", value: "30.16%", detail: "전체 참여 항목" },
		],
		columnList: [
			"스토리",
			"유형",
			"질문",
			"연결 화면",
			"회차",
			"도달",
			"응답",
			"응답률",
		],
		rowList: [
			{
				id: "e1",
				recordId: "H045",
				cellList: [
					"리팩터링 테스트",
					"A/B",
					"어떤 방식을 선호하나요?",
					"playbook",
					"1",
					"24",
					"12",
					"50%",
				],
			},
			{
				id: "e2",
				recordId: "H021",
				cellList: [
					"차는 골프백보다…",
					"Poll",
					"가장 중요한 가치는 무엇인가요?",
					"scenario-canvas",
					"1",
					"18",
					"8",
					"44.44%",
				],
			},
			{
				id: "e3",
				recordId: "H026",
				cellList: [
					"헤리티지를 잇는 사람들",
					"A/B",
					"다음 세대에 전할 것은?",
					"data-book",
					"2",
					"15",
					"3",
					"20%",
				],
			},
		],
	},
	screens: {
		title: "화면별 도달률",
		countLabel: "전체 67건",
		metricList: [
			{ label: "Cover", value: "94.2%", detail: "평균 도달률" },
			{ label: "Playbook", value: "72.6%", detail: "평균 도달률" },
			{ label: "Scenario canvas", value: "46.8%", detail: "평균 도달률" },
		],
		columnList: [
			"순위",
			"ID",
			"유저스토리",
			"cover",
			"playbook",
			"scenario-canvas",
			"data-book",
			"완독률",
		],
		rowList: [
			{
				id: "s1",
				recordId: "H045",
				cellList: [
					"01",
					"H045",
					"리팩터링 테스트",
					"100%",
					"82%",
					"44%",
					"20%",
					"20%",
				],
			},
			{
				id: "s2",
				recordId: "H021",
				cellList: [
					"02",
					"H021",
					"차는 골프백보다…",
					"100%",
					"76%",
					"35%",
					"18%",
					"18%",
				],
			},
			{
				id: "s3",
				recordId: "H026",
				cellList: [
					"03",
					"H026",
					"헤리티지를 잇는 사람들",
					"92%",
					"61%",
					"43%",
					"32%",
					"32%",
				],
			},
		],
	},
	departments: {
		title: "부서별 가입 계정 활성률",
		countLabel: "전체 7개 부서",
		metricList: [
			{ label: "가입 계정", value: "18", detail: "7개 부서" },
			{ label: "활성 인원", value: "11", detail: "선택한 기간" },
			{ label: "평균 활성률", value: "61.11%", detail: "부서별 집계" },
		],
		columnList: ["부서", "가입 계정", "활성 인원", "활성률"],
		rowList: [
			{ id: "d1", cellList: ["마케팅인텔리전스", "1", "1", "100%"] },
			{ id: "d2", cellList: ["MI기획팀", "3", "2", "66.67%"] },
			{ id: "d3", cellList: ["협력사", "9", "0", "0%"] },
			{ id: "d4", cellList: ["기타", "5", "3", "60%"] },
		],
	},
	users: {
		title: "활동 사용자",
		countLabel: "상위 10명",
		metricList: [
			{ label: "활동 사용자", value: "8명", detail: "선택한 기간" },
			{ label: "참여 횟수", value: "43회", detail: "A/B · Poll · 댓글" },
			{ label: "활동 부서", value: "5개", detail: "중복 제외" },
		],
		columnList: [
			"#",
			"이름",
			"부서",
			"A/B · 투표",
			"댓글",
			"합계",
			"최근 활동",
		],
		rowList: [
			{
				id: "u1",
				cellList: [
					"01",
					"BW LEE",
					"마케팅인텔리전스",
					"12",
					"4",
					"16",
					"1시간 전",
				],
			},
			{
				id: "u2",
				cellList: ["02", "daeun lee", "MI기획팀", "9", "3", "12", "어제"],
			},
			{
				id: "u3",
				cellList: ["03", "owen owen", "운영팀", "6", "2", "8", "2일 전"],
			},
		],
	},
	comments: {
		title: "인기 댓글",
		countLabel: "공감 수 상위 12건",
		metricList: [
			{ label: "댓글", value: "12건", detail: "선택한 기간" },
			{ label: "공감", value: "86회", detail: "댓글 반응" },
			{ label: "답글", value: "21회", detail: "댓글 대화" },
		],
		columnList: ["스토리", "댓글", "공감", "답글"],
		rowList: [
			{
				id: "c1",
				recordId: "H045",
				cellList: [
					"리팩터링 테스트",
					"이 관점이 정말 인상적이네요.",
					"18",
					"4",
				],
			},
			{
				id: "c2",
				recordId: "H021",
				cellList: [
					"차는 골프백보다…",
					"좋은 경험을 공유해 주셔서 감사합니다.",
					"12",
					"3",
				],
			},
			{
				id: "c3",
				recordId: "H026",
				cellList: [
					"헤리티지를 잇는 사람들",
					"다음 이야기도 기대됩니다.",
					"9",
					"2",
				],
			},
		],
	},
} satisfies Record<
	ReportKind,
	{
		title: string;
		countLabel: string;
		metricList: readonly { label: string; value: string; detail: string }[];
		columnList: readonly string[];
		rowList: readonly ReportRow[];
	}
>;

const reportGroupList: readonly {
	readonly label: string;
	readonly kindList: readonly ReportKind[];
}[] = [
	{ label: "콘텐츠", kindList: ["stories", "engagement", "screens"] },
	{ label: "사람", kindList: ["departments", "users"] },
	{ label: "반응", kindList: ["comments"] },
];
const reportKindLabel: Record<ReportKind, string> = {
	stories: "유저스토리 목록",
	engagement: "참여 항목 응답률",
	screens: "화면별 도달률",
	departments: "부서별 활성률",
	users: "활동 사용자",
	comments: "인기 댓글",
};
const periodOptionList = [
	{ value: "7d", label: "최근 7일" },
	{ value: "30d", label: "최근 30일" },
	{ value: "all", label: "전체" },
] as const;

const ReportSkeleton = () => (
	<div className="grid gap-5" aria-label="리포트 불러오는 중" aria-busy="true">
		<div className="grid gap-4 md:grid-cols-3">
			{Array.from({ length: 3 }, (_, index) => (
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
					<Skeleton className="h-3.5 w-40" />
				</section>
			))}
		</div>
		<section
			className="
     overflow-hidden rounded-xl border border-border
     bg-surface
   "
		>
			<div
				className="
      flex justify-between border-b border-border
      px-5 py-4
    "
			>
				<Skeleton className="h-5 w-36" />
				<Skeleton className="h-5 w-20" />
			</div>
			{Array.from({ length: 5 }, (_, rowIndex) => (
				<div
					className="
       grid grid-cols-4 gap-4 border-b
       border-border px-5 py-5 last:border-b-0
     "
					key={rowIndex}
				>
					{Array.from({ length: 4 }, (_, columnIndex) => (
						<Skeleton
							className="h-4 w-full"
							key={`${rowIndex}-${columnIndex}`}
						/>
					))}
				</div>
			))}
		</section>
	</div>
);

export const DemoReportPage = () => {
	const { kind: routeKind = "stories" } = useParams<{ kind: string }>();
	const kind = (
		routeKind in reportConfig ? routeKind : "stories"
	) as ReportKind;
	const config = reportConfig[kind];
	const isLoading = useDemoLoading(kind);
	const { showToast } = useOverlay();
	const [period, setPeriod] =
		useState<(typeof periodOptionList)[number]["value"]>("7d");
	const columnList = config.columnList.map((header, index) => ({
		key: `${kind}-${index}`,
		header,
		render: (row: ReportRow) => {
			const value = row.cellList[index] ?? "—";
			if (
				((kind === "stories" && index === 2) ||
					(kind === "comments" && index === 0)) &&
				row.recordId
			)
				return (
					<Link
						className="
        font-semibold text-text no-underline hover:text-primary-strong
        hover:underline
      "
						to={routePath.detailAnalytics(row.recordId)}
					>
						{value}
					</Link>
				);
			if (
				(kind === "engagement" || kind === "screens") &&
				index === (kind === "engagement" ? 0 : 2) &&
				row.recordId
			)
				return (
					<Link
						className="
        font-semibold text-text no-underline hover:text-primary-strong
        hover:underline
      "
						to={routePath.detailAnalytics(row.recordId)}
					>
						{value}
					</Link>
				);
			return value;
		},
	}));
	const departmentChartItemList = config.rowList.map((row) => ({
		id: row.id,
		label: row.cellList[0] ?? "부서",
		value: Number((row.cellList.at(-1) ?? "0").replace("%", "")),
		displayValue:
			row.cellList.slice(1, 3).join("/") + ` · ${row.cellList.at(-1)}`,
	}));

	return (
		<section className="grid gap-5" aria-busy={isLoading || undefined}>
			<header
				className="
      flex flex-wrap items-end justify-between
      gap-4
    "
			>
				<div>
					<h1 className="m-0 text-page-title font-bold">{config.title}</h1>
					<p className="mt-1 mb-0 text-meta text-text-muted">
						선택한 기간의 관리자 리포트 예시입니다.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<SegmentedControl
						ariaLabel="리포트 기간"
						optionList={periodOptionList}
						value={period}
						onChange={setPeriod}
					/>
					<Button
						variant="secondary"
						onClick={() =>
							showToast({ message: "예시 리포트를 준비했습니다." })
						}
					>
						내보내기
					</Button>
				</div>
			</header>
			<div
				className="
      grid min-w-0 grid-cols-[minmax(150px,184px)_minmax(0,1fr)] gap-5
      max-[960px]:grid-cols-1
    "
			>
				<nav
					className="
       h-fit rounded-xl border border-border
       bg-surface p-3 max-[960px]:overflow-x-auto
     "
					aria-label="리포트 종류"
				>
					<div
						className="
        grid gap-4 max-[960px]:flex max-[960px]:min-w-max
        max-[960px]:gap-5
      "
					>
						{reportGroupList.map((group) => (
							<section className="grid gap-1" key={group.label}>
								<h2
									className="
           m-0 px-2 py-1 text-caption
           font-bold tracking-[0.06em] text-text-subtle
         "
								>
									{group.label}
								</h2>
								<ul
									className="
           m-0 grid list-none gap-1
           p-0 max-[960px]:flex
         "
								>
									{group.kindList.map((item) => (
										<li key={item}>
											<Link
												aria-current={item === kind ? "page" : undefined}
												className="
              block rounded-md px-2 py-2
              text-meta font-semibold text-text-muted no-underline
              hover:bg-canvas hover:text-text aria-[current=page]:bg-primary-soft aria-[current=page]:text-primary-strong
            "
												to={routePath.analytics(item)}
											>
												{reportKindLabel[item]}
											</Link>
										</li>
									))}
								</ul>
							</section>
						))}
					</div>
				</nav>
				<div className="grid min-w-0 content-start gap-5">
					{isLoading ? (
						<ReportSkeleton />
					) : (
						<>
							<div className="grid gap-4 sm:grid-cols-3">
								{config.metricList.map((metric, index) => (
									<StatCard
										className={index === 0 ? "min-h-32" : "min-h-32"}
										key={metric.label}
										label={metric.label}
										value={metric.value}
										detail={metric.detail}
									/>
								))}
							</div>
							{kind === "departments" && (
								<HorizontalBarChart
									title="부서별 계정 활성률"
									itemList={departmentChartItemList}
									maxValue={100}
								/>
							)}
							<section
								className="
          min-w-0 overflow-hidden rounded-xl border
          border-border bg-surface
        "
							>
								<header
									className="
           flex flex-wrap items-center justify-between
           gap-3 border-b border-border px-5
           py-3
         "
								>
									<div className="flex flex-wrap items-center gap-2">
										<h2 className="m-0 text-subtitle font-semibold">
											{config.title}
										</h2>
										<Badge tone="neutral">예시 데이터</Badge>
									</div>
									<span className="text-meta text-text-muted">
										{config.countLabel}
									</span>
								</header>
								<DataTable
									caption={`${config.title} 목록`}
									rowList={config.rowList}
									rowKey={(row) => row.id}
									columnList={columnList}
								/>
							</section>
						</>
					)}
				</div>
			</div>
		</section>
	);
};
