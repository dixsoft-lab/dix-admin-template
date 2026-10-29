import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/component/ui/Badge";
import { Button } from "@/component/ui/Button";
import { DataTable } from "@/component/ui/DataTable";
import { Input } from "@/component/ui/Input";
import { SegmentedControl } from "@/component/ui/SegmentedControl";
import { Skeleton } from "@/component/ui/Skeleton";
import { routePath } from "@/route/route-paths";
import { useDemoLoading } from "./useDemoLoading";

type StoryStatus = "all" | "published" | "draft" | "review";
type Story = {
	readonly id: string;
	readonly title: string;
	readonly status: Exclude<StoryStatus, "all">;
	readonly owner: string;
	readonly updatedAt: string;
	readonly viewCount: string;
};

const storyList: readonly Story[] = [
	{
		id: "H045",
		title: "리팩터링 테스트",
		status: "published",
		owner: "운영팀",
		updatedAt: "2026.10.28",
		viewCount: "4",
	},
	{
		id: "H021",
		title: "차는 골프백보다 은퇴 후 품위를 싣는다",
		status: "published",
		owner: "제품팀",
		updatedAt: "2026.10.27",
		viewCount: "3",
	},
	{
		id: "H026",
		title: "헤리티지를 잇는 사람들",
		status: "review",
		owner: "콘텐츠팀",
		updatedAt: "2026.10.26",
		viewCount: "3",
	},
	{
		id: "H025",
		title: "사업가의 차는 캘리그라피",
		status: "draft",
		owner: "운영팀",
		updatedAt: "2026.10.24",
		viewCount: "2",
	},
	{
		id: "H084",
		title: "Feel the Terrain",
		status: "review",
		owner: "BW LEE",
		updatedAt: "2026.10.23",
		viewCount: "1",
	},
];
const statusLabel: Record<Story["status"], string> = {
	published: "게시 중",
	draft: "작성 중",
	review: "검수 요청",
};
const statusTone: Record<Story["status"], "success" | "neutral" | "warning"> = {
	published: "success",
	draft: "neutral",
	review: "warning",
};
const filterOptionList = [
	{ value: "all", label: "전체" },
	{ value: "published", label: "게시 중" },
	{ value: "draft", label: "작성 중" },
	{ value: "review", label: "검수 요청" },
] as const;

const StoryListSkeleton = () => (
	<section
		className="
    overflow-hidden rounded-xl border border-border
    bg-surface
  "
		aria-label="유저스토리 목록 불러오는 중"
		aria-busy="true"
	>
		<div
			className="
     grid grid-cols-[80px_minmax(160px,1fr)_120px_120px_110px] gap-4 border-b
     border-border bg-surface-muted px-5 py-4
     max-[800px]:min-w-170
   "
		>
			{Array.from({ length: 5 }, (_, index) => (
				<Skeleton className="h-4" key={index} />
			))}
		</div>
		{Array.from({ length: 5 }, (_, rowIndex) => (
			<div
				className="
      grid grid-cols-[80px_minmax(160px,1fr)_120px_120px_110px] items-center gap-4
      border-b border-border px-5 py-5
      last:border-b-0 max-[800px]:min-w-170
    "
				key={rowIndex}
			>
				{Array.from({ length: 5 }, (_, columnIndex) => (
					<Skeleton
						className={columnIndex === 1 ? "h-4 w-4/5" : "h-4"}
						key={`${rowIndex}-${columnIndex}`}
					/>
				))}
			</div>
		))}
	</section>
);

export const DemoStoryListPage = () => {
	const isLoading = useDemoLoading("story-list");
	const [status, setStatus] = useState<StoryStatus>("all");
	const [query, setQuery] = useState("");
	const [view, setView] = useState("all");
	const filteredStoryList = useMemo(
		() =>
			storyList.filter((story) => {
				const matchesStatus = status === "all" || story.status === status;
				const normalizedQuery = query.trim().toLocaleLowerCase();
				const matchesQuery =
					normalizedQuery.length === 0 ||
					`${story.id} ${story.title} ${story.owner}`
						.toLocaleLowerCase()
						.includes(normalizedQuery);
				return (
					matchesStatus &&
					matchesQuery &&
					(view === "all" || story.title.toLocaleLowerCase().includes(view))
				);
			}),
		[query, status, view],
	);
	const columnList = [
		{
			key: "id",
			header: "ID",
			render: (row: Story) => (
				<span className="font-mono text-meta">{row.id}</span>
			),
		},
		{
			key: "title",
			header: "유저스토리",
			render: (row: Story) => (
				<Link
					className="
       font-semibold text-text no-underline hover:text-primary-strong
       hover:underline
     "
					to={routePath.content(row.id)}
				>
					{row.title}
				</Link>
			),
		},
		{ key: "owner", header: "담당", render: (row: Story) => row.owner },
		{
			key: "status",
			header: "상태",
			render: (row: Story) => (
				<Badge tone={statusTone[row.status]}>{statusLabel[row.status]}</Badge>
			),
		},
		{
			key: "updatedAt",
			header: "수정일",
			render: (row: Story) => row.updatedAt,
		},
		{
			key: "viewCount",
			header: "조회수",
			render: (row: Story) => (
				<span className="tabular-nums">{row.viewCount}</span>
			),
		},
		{
			key: "action",
			header: "작업",
			render: (row: Story) => (
				<Link
					className="font-semibold text-primary-strong underline-offset-4 hover:underline"
					to={routePath.detailAnalytics(row.id)}
				>
					리포트
				</Link>
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
					<h1 className="m-0 text-page-title font-bold">유저스토리 관리</h1>
					<p className="mt-1 mb-0 text-meta text-text-muted">
						등록된 유저스토리와 검수 상태를 관리합니다.
					</p>
				</div>
				<Link
					className="
       inline-flex h-10 items-center justify-center
       rounded-md bg-primary px-4 font-semibold
       text-on-primary no-underline hover:bg-primary-hover
     "
					to={routePath.contentCreate}
				>
					＋ 신규 업로드
				</Link>
			</header>
			<section
				className="
      flex flex-wrap items-center gap-4
      rounded-xl border border-border bg-surface
      p-4
    "
				aria-label="유저스토리 필터"
			>
				<SegmentedControl
					ariaLabel="유저스토리 상태"
					optionList={filterOptionList}
					value={status}
					onChange={setStatus}
				/>
				<label
					className="
       grid min-w-55 flex-1 gap-1.5
       text-meta font-semibold text-text-muted
     "
				>
					<span>검색</span>
					<Input
						aria-label="유저스토리 검색"
						placeholder="ID 또는 제목"
						value={query}
						onChange={(event) => setQuery(event.currentTarget.value)}
					/>
				</label>
				<label
					className="
       grid min-w-40 gap-1.5 text-meta
       font-semibold text-text-muted
     "
				>
					<span>뷰</span>
					<select
						className="
        h-10 rounded-md border border-border-strong
        bg-surface px-3.5 text-body text-text
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus
      "
						value={view}
						onChange={(event) => setView(event.currentTarget.value)}
					>
						<option value="all">전체 뷰</option>
						<option value="terrain">Terrain</option>
						<option value="사람">사람</option>
					</select>
				</label>
			</section>
			{isLoading ? (
				<StoryListSkeleton />
			) : (
				<div
					className="
       min-w-0 overflow-hidden rounded-xl border
       border-border bg-surface
     "
				>
					<DataTable
						caption={`유저스토리 목록 · ${filteredStoryList.length}건`}
						rowList={filteredStoryList}
						rowKey={(story) => story.id}
						columnList={columnList}
						emptyLabel="현재 조건에 해당하는 유저스토리가 없습니다."
					/>
				</div>
			)}
			<p className="m-0 text-meta text-text-muted">
				예시 데이터입니다. 편집·신규 등록 화면의 입력은 실제 서버에 저장되지
				않습니다.
			</p>
		</section>
	);
};
