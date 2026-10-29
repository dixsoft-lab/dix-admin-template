import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useOverlay } from "@/component/overlay/useOverlay";
import { Badge } from "@/component/ui/Badge";
import { Button } from "@/component/ui/Button";
import { DataTable } from "@/component/ui/DataTable";
import { FormField } from "@/component/ui/FormField";
import { Input } from "@/component/ui/Input";
import { Skeleton } from "@/component/ui/Skeleton";
import { routePath } from "@/route/route-paths";
import { useDemoLoading } from "./useDemoLoading";

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
	"success" | "warning" | "neutral"
> = {
	활성: "success",
	"초대 대기": "warning",
	비활성: "neutral",
};

const AccountListSkeleton = () => (
	<section
		className="
    overflow-hidden rounded-xl border border-border
    bg-surface
  "
		aria-label="계정 목록 불러오는 중"
		aria-busy="true"
	>
		<div
			className="
     grid grid-cols-[90px_minmax(160px,1fr)_minmax(180px,1.3fr)_minmax(140px,1fr)_130px_110px] gap-4 border-b
     border-border bg-surface-muted px-5 py-4
     max-[820px]:min-w-215
   "
		>
			{Array.from({ length: 6 }, (_, index) => (
				<Skeleton className="h-4" key={index} />
			))}
		</div>
		{Array.from({ length: 5 }, (_, rowIndex) => (
			<div
				className="
      grid grid-cols-[90px_minmax(160px,1fr)_minmax(180px,1.3fr)_minmax(140px,1fr)_130px_110px] items-center gap-4
      border-b border-border px-5 py-5
      last:border-b-0 max-[820px]:min-w-215
    "
				key={rowIndex}
			>
				{Array.from({ length: 6 }, (_, columnIndex) => (
					<Skeleton className="h-4 w-full" key={columnIndex} />
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
					<select
						className="
        h-10 rounded-md border border-border-strong
        bg-surface px-3.5 text-body text-text
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus
      "
						value={state}
						onChange={(event) => setState(event.currentTarget.value)}
					>
						<option value="all">전체 상태</option>
						<option value="활성">활성</option>
						<option value="초대 대기">초대 대기</option>
						<option value="비활성">비활성</option>
					</select>
				</label>
			</section>
			{isLoading ? (
				<AccountListSkeleton />
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

export const DemoAccountCreatePage = () => {
	const isLoading = useDemoLoading("account-create");
	const { showToast } = useOverlay();
	const [created, setCreated] = useState(false);
	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setCreated(true);
		showToast({ message: "초대 이메일을 보냈습니다. (예시)", tone: "success" });
	};
	return (
		<section
			className="grid max-w-230 gap-5"
			aria-busy={isLoading || undefined}
		>
			<header>
				<h1 className="m-0 text-page-title font-bold">담당자 계정 발급</h1>
				<p className="mt-1 mb-0 text-meta text-text-muted">
					초대 메일을 받은 담당자가 비밀번호를 설정하면 계정이 활성화됩니다.
				</p>
			</header>
			{isLoading ? (
				<section
					className="
       grid gap-5 rounded-xl border
       border-border bg-surface p-6
     "
					aria-label="계정 발급 화면 불러오는 중"
					aria-busy="true"
				>
					{Array.from({ length: 6 }, (_, index) => (
						<div className="grid gap-2" key={index}>
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-10 w-full" />
						</div>
					))}
					<Skeleton className="h-10 w-28" />
				</section>
			) : (
				<div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(240px,0.8fr)]">
					<form
						className="
        grid gap-5 rounded-xl border
        border-border bg-surface p-6
      "
						onSubmit={submit}
					>
						<FormField
							label="회사"
							htmlFor="account-company"
							required
							hint="기존 회사 이름을 선택하거나 예시 이름을 입력합니다."
						>
							<Input
								id="account-company"
								list="account-company-list"
								placeholder="회사 이름"
								required
							/>
							<datalist id="account-company-list">
								<option value="기획팀" />
								<option value="제품팀" />
								<option value="협력사" />
							</datalist>
						</FormField>
						<FormField label="이메일" htmlFor="account-email" required>
							<Input
								id="account-email"
								type="email"
								placeholder="name@example.com"
								required
							/>
						</FormField>
						<FormField label="이름" htmlFor="account-name" required>
							<Input id="account-name" placeholder="담당자 이름" required />
						</FormField>
						<FormField label="직책" htmlFor="account-position">
							<Input id="account-position" placeholder="예: 콘텐츠 매니저" />
						</FormField>
						<div
							className="
         flex flex-wrap items-center justify-between
         gap-3 border-t border-border pt-5
       "
						>
							<Link
								className="font-semibold text-text-muted underline-offset-4 hover:underline"
								to={routePath.accountList}
							>
								목록으로
							</Link>
							<Button type="submit" disabled={created}>
								{created ? "초대 완료" : "초대 메일 보내기"}
							</Button>
						</div>
					</form>
					<aside
						className="
        grid content-start gap-3 rounded-xl
        border border-border bg-surface p-5
      "
					>
						<h2 className="m-0 text-subtitle font-semibold">초대 안내</h2>
						<p className="m-0 text-meta text-text-muted">
							담당자는 초대 메일에서 계정을 활성화합니다. 초대 링크는 일정 기간
							뒤 만료됩니다.
						</p>
						<Badge tone="neutral">예시 흐름</Badge>
					</aside>
				</div>
			)}
			{created && !isLoading && (
				<p className="m-0 text-meta text-positive" role="status">
					초대 메일 전송 상태를 표시한 예시입니다.
				</p>
			)}
		</section>
	);
};

export const DemoAccountAccessDeniedPage = () => (
	<section
		className="
    mx-auto grid min-h-[50dvh] max-w-140
    content-center justify-items-center gap-4 text-center
  "
	>
		<div
			className="
     grid size-14 place-items-center rounded-full
     bg-negative-surface text-xl font-bold text-negative
   "
			aria-hidden="true"
		>
			!
		</div>
		<h1 className="m-0 text-page-title font-bold">계정 관리 권한이 없습니다</h1>
		<p className="m-0 text-body text-text-muted">
			계정 발급과 권한 변경은 관리자 계정만 사용할 수 있습니다.
		</p>
		<div className="flex flex-wrap justify-center gap-3">
			<Link
				className="
      inline-flex h-10 items-center rounded-md
      border border-border-strong bg-surface px-4
      font-semibold text-text no-underline hover:bg-canvas
    "
				to={routePath.overview}
			>
				대시보드
			</Link>
			<Link
				className="
      inline-flex h-10 items-center rounded-md
      bg-primary px-4 font-semibold text-on-primary
      no-underline hover:bg-primary-hover
    "
				to={routePath.accountList}
			>
				계정 목록 예시
			</Link>
		</div>
	</section>
);
