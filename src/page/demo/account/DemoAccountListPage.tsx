import { useState } from "react";
import { Link } from "react-router-dom";
import { useOverlay } from "@/component/overlay/useOverlay";
import { Badge } from "@/component/ui/Badge";
import { Button } from "@/component/ui/Button";
import { DataTable, type TableColumn } from "@/component/ui/DataTable";
import { FormField } from "@/component/ui/FormField";
import { Input } from "@/component/ui/Input";
import { Select } from "@/component/ui/Select";
import { Skeleton } from "@/component/ui/Skeleton";
import { routePath } from "@/route/route-paths";
import { useDemoLoading } from "../shared/useDemoLoading";

type Account = {
	readonly id: string;
	readonly name: string;
	readonly email: string;
	readonly company: string;
	readonly role: "담당자" | "관리자";
	readonly state: "활성" | "초대 대기" | "비활성";
};
const accountList: readonly Account[] = [
	{
		id: "A-1008",
		name: "BW LEE",
		email: "dix.bwlee0728@gmail.com",
		company: "운영본부",
		role: "관리자",
		state: "활성",
	},
	{
		id: "A-1007",
		name: "daeun lee",
		email: "dix.delee@gmail.com",
		company: "기획팀",
		role: "담당자",
		state: "활성",
	},
	{
		id: "A-1006",
		name: "owen owen",
		email: "owenkim1323@gmail.com",
		company: "제품팀",
		role: "담당자",
		state: "초대 대기",
	},
	{
		id: "A-1005",
		name: "Mina Park",
		email: "mina.park@example.com",
		company: "협력사",
		role: "담당자",
		state: "비활성",
	},
];
const accountStateTone: Record<
	Account["state"],
	"primary" | "warning" | "neutral"
> = {
	활성: "primary",
	"초대 대기": "warning",
	비활성: "neutral",
};

const AccountListSkeleton = ({
	columnList,
	rowCount,
}: {
	readonly columnList: readonly TableColumn<Account>[];
	readonly rowCount: number;
}) => (
	<section
		className="
    overflow-hidden rounded-xl border border-border
    bg-surface
  "
		aria-label="계정 목록 불러오는 중"
		aria-busy="true"
	>
		<span className="sr-only" role="status">
			계정 데이터를 불러오고 있습니다.
		</span>
		<div
			className="
     border-b border-border px-5 py-3
     font-semibold
   "
		>
			계정 목록 · <Skeleton className="inline-block h-3.5 w-8 align-middle" />명
		</div>
		<div
			className="
     grid grid-cols-[90px_minmax(160px,1fr)_minmax(180px,1.3fr)_minmax(140px,1fr)_130px_110px] gap-4 border-b
     border-border bg-surface-muted px-5 py-4
     max-[820px]:min-w-215
   "
		>
			{columnList.map((column) => (
				<div className="text-meta font-medium text-text-muted" key={column.key}>
					{column.header}
				</div>
			))}
		</div>
		{Array.from({ length: rowCount }, (_, rowIndex) => (
			<div
				className="
      grid grid-cols-[90px_minmax(160px,1fr)_minmax(180px,1.3fr)_minmax(140px,1fr)_130px_110px] items-center gap-4
      border-b border-border px-5 py-5
      last:border-b-0 max-[820px]:min-w-215
    "
				key={rowIndex}
			>
				{columnList.map((column) => (
					<div className="min-w-0" key={column.key}>
						{column.key === "action" ? (
							<Button variant="secondary" disabled>
								상세
							</Button>
						) : (
							<Skeleton className="h-4 w-full" />
						)}
					</div>
				))}
			</div>
		))}
	</section>
);

export const DemoAccountListPage = () => {
	const isLoading = useDemoLoading("account-list");
	const { showToast } = useOverlay();
	const [query, setQuery] = useState("");
	const [state, setState] = useState("all");
	const visibleAccountList = accountList.filter((account) => {
		const normalizedQuery = query.trim().toLocaleLowerCase();
		return (
			(state === "all" || account.state === state) &&
			`${account.name} ${account.email} ${account.company}`
				.toLocaleLowerCase()
				.includes(normalizedQuery)
		);
	});
	const columnList = [
		{
			key: "id",
			header: "ID",
			render: (account: Account) => (
				<span className="font-mono text-meta">{account.id}</span>
			),
		},
		{
			key: "name",
			header: "계정",
			render: (account: Account) => (
				<div>
					<strong className="block">{account.name}</strong>
					<span className="text-meta text-text-muted">{account.email}</span>
				</div>
			),
		},
		{
			key: "company",
			header: "소속",
			render: (account: Account) => account.company,
		},
		{
			key: "role",
			header: "권한",
			render: (account: Account) => (
				<Badge tone={account.role === "관리자" ? "primary" : "neutral"}>
					{account.role}
				</Badge>
			),
		},
		{
			key: "state",
			header: "상태",
			render: (account: Account) => (
				<Badge tone={accountStateTone[account.state]}>{account.state}</Badge>
			),
		},
		{
			key: "action",
			header: "작업",
			render: (account: Account) => (
				<Button
					variant="secondary"
					onClick={() =>
						showToast({ message: `${account.name} 계정 예시입니다.` })
					}
				>
					상세
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
					<h1 className="m-0 text-page-title font-bold">계정 · 권한</h1>
					<p className="mt-1 mb-0 text-meta text-text-muted">
						관리자 계정과 소속, 권한 상태를 확인합니다.
					</p>
				</div>
				<Link
					className="
       inline-flex h-10 items-center justify-center
       rounded-md bg-primary px-4 font-semibold
       text-on-primary no-underline hover:bg-primary-hover
     "
					to={routePath.accountCreate}
				>
					담당자 계정 발급
				</Link>
			</header>
			<section className="grid gap-4 sm:grid-cols-3">
				<div
					className="
       rounded-xl border border-border bg-surface
       p-5
     "
				>
					<p className="m-0 text-meta font-semibold text-text-muted">
						전체 계정
					</p>
					<strong className="mt-2 block text-metric">18</strong>
				</div>
				<div
					className="
       rounded-xl border border-border bg-surface
       p-5
     "
				>
					<p className="m-0 text-meta font-semibold text-text-muted">활성</p>
					<strong className="mt-2 block text-metric">15</strong>
				</div>
				<div
					className="
       rounded-xl border border-border bg-surface
       p-5
     "
				>
					<p className="m-0 text-meta font-semibold text-text-muted">
						초대 대기
					</p>
					<strong className="mt-2 block text-metric">3</strong>
				</div>
			</section>
			<section
				className="
      flex flex-wrap items-end gap-4
      rounded-xl border border-border bg-surface
      p-4
    "
				aria-label="계정 필터"
			>
				<label
					className="
       grid min-w-55 flex-1 gap-1.5
       text-meta font-semibold text-text-muted
     "
				>
					<span>이름·이메일·소속</span>
					<Input
						placeholder="검색"
						value={query}
						onChange={(event) => setQuery(event.currentTarget.value)}
					/>
				</label>
				<label
					className="
       grid min-w-37.5 gap-1.5 text-meta
       font-semibold text-text-muted
     "
				>
					<span>계정 상태</span>
					<Select
						value={state}
						onChange={(event) => setState(event.currentTarget.value)}
					>
						<option value="all">전체 상태</option>
						<option value="활성">활성</option>
						<option value="초대 대기">초대 대기</option>
						<option value="비활성">비활성</option>
					</Select>
				</label>
			</section>
			{isLoading ? (
				<AccountListSkeleton
					columnList={columnList}
					rowCount={visibleAccountList.length}
				/>
			) : (
				<div
					className="
       min-w-0 overflow-hidden rounded-xl border
       border-border bg-surface
     "
				>
					<DataTable
						caption={`계정 목록 · ${visibleAccountList.length}명`}
						rowList={visibleAccountList}
						rowKey={(account) => account.id}
						columnList={columnList}
						emptyLabel="조건에 맞는 계정이 없습니다."
					/>
				</div>
			)}
			<p className="m-0 text-meta text-text-muted">
				계정과 권한은 예시 데이터이며 제품 인증·권한 서버와 연결되지 않습니다.
			</p>
		</section>
	);
};
