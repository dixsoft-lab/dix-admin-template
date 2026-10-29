import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/component/ui/Badge";
import { Button } from "@/component/ui/Button";
import { DataTable } from "@/component/ui/DataTable";
import { Select } from "@/component/ui/Select";
import { SegmentedControl } from "@/component/ui/SegmentedControl";
import { Skeleton } from "@/component/ui/Skeleton";
import { routePath } from "@/route/route-paths";
import { useDemoLoading } from "../shared/useDemoLoading";

type StoryStatus = "all" | "draft" | "review" | "published" | "unpublished";
type Story = {
	readonly id: string;
	readonly title: string;
	readonly status: Exclude<StoryStatus, "all">;
	readonly owner: string;
	readonly updatedAt: string;
	readonly version: string;
};

const storyList: readonly Story[] = [
	{
		id: "H045",
		title: "리팩터링 테스트",
		status: "published",
		owner: "운영팀",
		updatedAt: "2026.10.28",
		version: "v2",
	},
	{
		id: "H021",
		title: "차는 골프백보다 은퇴 후 품위를 싣는다",
		status: "published",
		owner: "제품팀",
		updatedAt: "2026.10.27",
		version: "v3",
	},
	{
		id: "H026",
		title: "헤리티지를 잇는 사람들",
		status: "review",
		owner: "콘텐츠팀",
		updatedAt: "2026.10.26",
		version: "v1",
	},
	{
		id: "H025",
		title: "사업가의 차는 캘리그라피",
		status: "draft",
		owner: "운영팀",
		updatedAt: "2026.10.24",
		version: "—",
	},
	{
		id: "H084",
		title: "Feel the Terrain",
		status: "review",
		owner: "BW LEE",
		updatedAt: "2026.10.23",
		version: "—",
	},
];
const statusLabel: Record<Story["status"], string> = {
	published: "게시 중",
	draft: "작성 중",
	review: "검수 요청",
	unpublished: "게시 중단",
};
const statusTone: Record<
	Story["status"],
	"primary" | "neutral" | "warning" | "danger"
> = {
	published: "primary",
	draft: "neutral",
	review: "warning",
	unpublished: "danger",
};
const filterOptionList = [
	{ value: "all", label: "전체" },
	{ value: "draft", label: "작성 중" },
	{ value: "review", label: "검수 요청" },
	{ value: "published", label: "게시 중" },
	{ value: "unpublished", label: "게시 중단" },
] as const;
const storyOwnerList = [...new Set(storyList.map((story) => story.owner))];
const storyColumnWidthRatio = {
	id: 12,
	title: 44,
	version: 10,
	status: 18,
	action: 16,
} as const;
const storyColumnGridTemplate = Object.values(storyColumnWidthRatio)
	.map((ratio) => `${ratio}fr`)
	.join(" ");
const getStoryTextWidth = (text: string) => {
	const characterCount = [...text].length;
	if (characterCount >= 24) return "w-40";
	if (characterCount >= 16) return "w-32";
	if (characterCount >= 9) return "w-24";
	if (characterCount >= 5) return "w-16";
	if (characterCount >= 3) return "w-12";
	return "w-8";
};

const StoryListSkeleton = ({
	rowList,
}: {
	readonly rowList: readonly Story[];
}) => (
	<section
		className="
    overflow-hidden rounded-xl border border-border
    bg-surface
  "
		aria-label="유저스토리 목록 불러오는 중"
		aria-busy="true"
	>
		<span className="sr-only" role="status">
			유저스토리 데이터를 불러오고 있습니다.
		</span>
		<div
			className="grid border-b border-border py-4"
			style={{ gridTemplateColumns: storyColumnGridTemplate }}
		>
			{["ID", "유저스토리", "버전", "상태", "작업"].map((heading) => (
				<div
					className="
       min-w-0 px-4 text-meta font-medium
       text-text-muted
     "
					key={heading}
				>
					{heading}
				</div>
			))}
		</div>
		{rowList.map((story) => (
			<div
				className="
      grid items-center border-b border-border
      py-4 last:border-b-0
    "
				key={story.id}
				style={{ gridTemplateColumns: storyColumnGridTemplate }}
			>
				<div className="min-w-0 px-4">
					<Skeleton className="h-3.5 w-12" />
				</div>
				<div className="grid min-w-0 gap-1.5 px-4">
					<Skeleton className={`h-4 ${getStoryTextWidth(story.title)}`} />
					<Skeleton
						className={`h-3.5 ${getStoryTextWidth(`${story.owner} · ${story.updatedAt}`)}`}
					/>
				</div>
				<div className="min-w-0 px-4">
					<Skeleton className={`h-3.5 ${getStoryTextWidth(story.version)}`} />
				</div>
				<div className="min-w-0 px-4">
					<Skeleton className="h-5 w-20 rounded-pill" />
				</div>
				<div className="min-w-0 px-4">
					<Button
						variant="secondary"
						className="
        h-9 min-h-9! px-3 py-1.5
        text-[13px]
      "
						disabled
					>
						리포트
					</Button>
				</div>
			</div>
		))}
	</section>
);

export const DemoStoryListPage = () => {
	const isLoading = useDemoLoading("story-list");
	const navigate = useNavigate();
	const [status, setStatus] = useState<StoryStatus>("all");
	const [view, setView] = useState("all");
	const [owner, setOwner] = useState("all");
	const filteredStoryList = useMemo(
		() =>
			storyList.filter((story) => {
				const matchesStatus = status === "all" || story.status === status;
				const matchesOwner = owner === "all" || story.owner === owner;
				return (
					matchesStatus &&
					matchesOwner &&
					(view === "all" || story.title.toLocaleLowerCase().includes(view))
				);
			}),
		[owner, status, view],
	);
	const columnList = [
		{
			key: "id",
			header: "ID",
			widthRatio: storyColumnWidthRatio.id,
			render: (row: Story) => (
				<span className="font-mono text-meta">{row.id}</span>
			),
		},
		{
			key: "title",
			header: "유저스토리",
			widthRatio: storyColumnWidthRatio.title,
			render: (row: Story) => (
				<span className="grid gap-0.5">
					<Link
						className="
        font-semibold text-text no-underline hover:text-primary-strong
        hover:underline
      "
						to={routePath.content(row.id)}
					>
						{row.title}
					</Link>
					<span className="text-meta text-text-muted">
						{row.owner} · {row.updatedAt}
					</span>
				</span>
			),
		},
		{
			key: "version",
			header: "버전",
			widthRatio: storyColumnWidthRatio.version,
			render: (row: Story) => row.version,
		},
		{
			key: "status",
			header: "상태",
			widthRatio: storyColumnWidthRatio.status,
			render: (row: Story) => (
				<Badge tone={statusTone[row.status]}>{statusLabel[row.status]}</Badge>
			),
		},
		{
			key: "action",
			header: "작업",
			widthRatio: storyColumnWidthRatio.action,
			render: (row: Story) => (
				<Button
					variant="secondary"
					className="
       h-9 min-h-9! px-3 py-1.5
       text-[13px]
     "
					onClick={() => navigate(routePath.detailAnalytics(row.id))}
				>
					리포트
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
				<h1 className="m-0 text-page-title font-bold tracking-[-0.03em]">
					유저스토리 관리
				</h1>
			</header>
			<section
				className="
      flex flex-wrap items-end gap-2
      border-b border-border pb-4
    "
				aria-label="유저스토리 필터"
			>
				<label className="grid min-w-36 gap-1.5">
					<span className="text-meta font-medium text-text-muted">뷰</span>
					<Select
						aria-label="유저스토리 뷰"
						value={view}
						onChange={(event) => setView(event.currentTarget.value)}
					>
						<option value="all">전체 뷰</option>
						<option value="terrain">Terrain</option>
						<option value="사람">사람</option>
					</Select>
				</label>
				<SegmentedControl
					ariaLabel="유저스토리 상태"
					optionList={filterOptionList}
					value={status}
					onChange={setStatus}
				/>
				<label className="grid min-w-36 gap-1.5">
					<span className="text-meta font-medium text-text-muted">담당자</span>
					<Select
						aria-label="유저스토리 담당자"
						value={owner}
						onChange={(event) => setOwner(event.currentTarget.value)}
					>
						<option value="all">담당자: 전체</option>
						{storyOwnerList.map((storyOwner) => (
							<option key={storyOwner} value={storyOwner}>
								{storyOwner}
							</option>
						))}
					</Select>
				</label>
				<Link
					className="
       ml-auto inline-flex h-10 items-center
       justify-center rounded-md bg-primary px-4
       font-medium text-on-primary no-underline hover:bg-primary-hover
     "
					to={routePath.contentCreate}
				>
					＋ 신규 업로드
				</Link>
			</section>
			{isLoading ? (
				<StoryListSkeleton rowList={filteredStoryList} />
			) : (
				<div
					className="
       min-w-0 overflow-hidden rounded-xl border
       border-border bg-surface
     "
				>
					<DataTable
						ariaLabel="유저스토리 목록"
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
