import { useState } from "react";
import { useOverlay } from "@/component/overlay/useOverlay";
import { Badge } from "@/component/ui/Badge";
import { Button } from "@/component/ui/Button";
import { DataTable } from "@/component/ui/DataTable";
import { SegmentedControl } from "@/component/ui/SegmentedControl";
import { Skeleton } from "@/component/ui/Skeleton";
import { useDemoLoading } from "./useDemoLoading";

type ModerationState = "pending" | "kept" | "hidden";
type ModerationRecord = {
	readonly id: string;
	readonly story: string;
	readonly author: string;
	readonly comment: string;
	readonly reason: string;
	readonly reportedAt: string;
	readonly state: ModerationState;
};

const initialRecordList: readonly ModerationRecord[] = [
	{
		id: "R-208",
		story: "헤리티지를 잇는 사람들",
		author: "Mina Park",
		comment: "이 글의 출처를 더 확인할 수 있을까요?",
		reason: "신고 누적",
		reportedAt: "2026.10.28 16:40",
		state: "pending",
	},
	{
		id: "R-207",
		story: "차는 골프백보다…",
		author: "익명 사용자",
		comment: "부적절한 표현이 포함된 댓글입니다.",
		reason: "부적절한 표현",
		reportedAt: "2026.10.28 14:12",
		state: "pending",
	},
	{
		id: "R-203",
		story: "리팩터링 테스트",
		author: "BW LEE",
		comment: "좋은 관점 공유 감사합니다.",
		reason: "스팸 의심",
		reportedAt: "2026.10.27 10:06",
		state: "kept",
	},
	{
		id: "R-198",
		story: "Feel the Terrain",
		author: "daeun lee",
		comment: "개인정보가 포함된 댓글입니다.",
		reason: "개인정보 노출",
		reportedAt: "2026.10.26 09:22",
		state: "hidden",
	},
];
const filterOptionList = [
	{ value: "all", label: "전체" },
	{ value: "pending", label: "검토 대기" },
	{ value: "kept", label: "유지" },
	{ value: "hidden", label: "숨김" },
] as const;
const stateLabel: Record<ModerationState, string> = {
	pending: "검토 대기",
	kept: "유지",
	hidden: "숨김",
};
const stateTone: Record<ModerationState, "warning" | "neutral" | "danger"> = {
	pending: "warning",
	kept: "neutral",
	hidden: "danger",
};

export const DemoModerationPage = () => {
	const isLoading = useDemoLoading("moderation");
	const [recordList, setRecordList] =
		useState<readonly ModerationRecord[]>(initialRecordList);
	const [filter, setFilter] =
		useState<(typeof filterOptionList)[number]["value"]>("pending");
	const { openModal, showToast } = useOverlay();
	const visibleRecordList =
		filter === "all"
			? recordList
			: recordList.filter((record) => record.state === filter);
	const updateState = (recordId: string, state: ModerationState) => {
		setRecordList((current) =>
			current.map((record) =>
				record.id === recordId ? { ...record, state } : record,
			),
		);
		showToast({
			message:
				state === "hidden"
					? "댓글을 숨김 처리했습니다."
					: "검토 결과를 저장했습니다.",
			tone: "success",
		});
	};
	const openRecord = (record: ModerationRecord) =>
		openModal({
			layout: "segmented",
			title: `댓글 신고 · ${record.id}`,
			description: `${record.story} · ${record.author}`,
			content: (
				<div className="grid gap-4">
					<div
						className="
        rounded-md border border-border bg-canvas
        p-4
      "
					>
						<p className="m-0 text-meta text-text-muted">신고 사유</p>
						<strong className="mt-1 block">{record.reason}</strong>
					</div>
					<blockquote
						className="
        m-0 rounded-md border border-border
        bg-surface p-4 text-body
      "
					>
						{record.comment}
					</blockquote>
					<p className="m-0 text-meta text-text-muted">
						예시 화면입니다. 모더레이션 서버 요청은 실행하지 않습니다.
					</p>
				</div>
			),
			footer: (
				<div className="flex flex-wrap justify-end gap-2">
					<Button
						variant="secondary"
						onClick={() => updateState(record.id, "kept")}
					>
						유지
					</Button>
					<Button
						variant="danger"
						onClick={() => updateState(record.id, "hidden")}
					>
						숨김 처리
					</Button>
				</div>
			),
		});
	const columnList = [
		{
			key: "reportedAt",
			header: "신고 시각",
			render: (record: ModerationRecord) => record.reportedAt,
		},
		{
			key: "story",
			header: "유저스토리",
			render: (record: ModerationRecord) => (
				<span className="font-semibold">{record.story}</span>
			),
		},
		{
			key: "author",
			header: "작성자",
			render: (record: ModerationRecord) => record.author,
		},
		{
			key: "reason",
			header: "신고 사유",
			render: (record: ModerationRecord) => record.reason,
		},
		{
			key: "comment",
			header: "댓글 내용",
			render: (record: ModerationRecord) => (
				<span className="block max-w-md truncate">{record.comment}</span>
			),
		},
		{
			key: "state",
			header: "상태",
			render: (record: ModerationRecord) => (
				<Badge tone={stateTone[record.state]}>{stateLabel[record.state]}</Badge>
			),
		},
		{
			key: "action",
			header: "작업",
			render: (record: ModerationRecord) => (
				<Button variant="secondary" onClick={() => openRecord(record)}>
					검토
				</Button>
			),
		},
	];

	return (
		<section className="grid gap-5" aria-busy={isLoading || undefined}>
			<header
				className="
      flex flex-wrap items-end justify-between
      gap-4
    "
			>
				<div>
					<h1 className="m-0 text-page-title font-bold">모더레이션</h1>
					<p className="mt-1 mb-0 text-meta text-text-muted">
						신고된 댓글과 처리 상태를 확인합니다.
					</p>
				</div>
				<Badge tone="warning">
					{recordList.filter((record) => record.state === "pending").length}건
					대기
				</Badge>
			</header>
			<div
				className="
      flex flex-wrap items-center justify-between
      gap-4 rounded-xl border border-border
      bg-surface p-4
    "
			>
				<SegmentedControl
					ariaLabel="신고 상태"
					optionList={filterOptionList}
					value={filter}
					onChange={setFilter}
				/>
				<span className="text-meta text-text-muted">
					신고 댓글 {visibleRecordList.length}건
				</span>
			</div>
			{isLoading ? (
				<section
					className="
       overflow-hidden rounded-xl border border-border
       bg-surface
     "
					aria-label="모더레이션 목록 불러오는 중"
					aria-busy="true"
				>
					<div
						className="
        grid grid-cols-6 gap-4 border-b
        border-border bg-surface-muted px-5 py-4
      "
					>
						{Array.from({ length: 6 }, (_, index) => (
							<Skeleton className="h-4" key={index} />
						))}
					</div>
					{Array.from({ length: 5 }, (_, index) => (
						<div
							className="
         grid grid-cols-6 gap-4 border-b
         border-border px-5 py-5 last:border-b-0
       "
							key={index}
						>
							{Array.from({ length: 6 }, (_, column) => (
								<Skeleton className="h-4 w-full" key={column} />
							))}
						</div>
					))}
				</section>
			) : (
				<div
					className="
       min-w-0 overflow-hidden rounded-xl border
       border-border bg-surface
     "
				>
					<DataTable
						caption="신고된 댓글"
						rowList={visibleRecordList}
						rowKey={(record) => record.id}
						columnList={columnList}
						emptyLabel="현재 상태의 신고가 없습니다."
					/>
				</div>
			)}
			<p className="m-0 text-meta text-text-muted">
				예시 데이터이며 검토 결과는 브라우저 메모리에만 유지됩니다.
			</p>
		</section>
	);
};
