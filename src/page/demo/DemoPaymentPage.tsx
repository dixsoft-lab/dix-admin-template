import {
	useEffect,
	useMemo,
	useRef,
	useState,
	type ComponentProps,
	type FormEvent,
} from "react";
import { useOverlay } from "@/component/overlay/useOverlay";
import { AsyncState } from "@/component/ui/AsyncState";
import { Badge } from "@/component/ui/Badge";
import { Button } from "@/component/ui/Button";
import { DataTable, type TableColumn } from "@/component/ui/DataTable";
import { DetailList } from "@/component/ui/DetailList";
import { FormField } from "@/component/ui/FormField";
import { Input } from "@/component/ui/Input";
import { PendingButton } from "@/component/ui/PendingButton";
import { Skeleton } from "@/component/ui/Skeleton";
import { StatCard } from "@/component/ui/StatCard";
import { demoLoadingDelayMs, useDemoLoading } from "./useDemoLoading";

type PaymentStatus = "paid" | "pending" | "failed";
type PaymentOrder = {
	readonly id: string;
	readonly paidAt: string;
	readonly userName: string;
	readonly email: string;
	readonly productId: string;
	readonly productName: string;
	readonly amount: number;
	readonly status: PaymentStatus;
};
type PaymentFilter = {
	readonly productId: string;
	readonly email: string;
	readonly status: PaymentStatus | "all";
};

const productList = [
	{ id: "general-donation", name: "General Donation" },
	{ id: "sunday-offering", name: "Sunday Offering" },
	{ id: "community-fund", name: "Community Fund" },
] as const;

const paymentSeedList: readonly Omit<PaymentOrder, "id">[] = [
	{
		paidAt: "Oct 28, 2026, 7:11 PM",
		userName: "BW LEE",
		email: "dix.bwlee0728@gmail.com",
		productId: "general-donation",
		productName: "General Donation",
		amount: 50,
		status: "pending",
	},
	{
		paidAt: "Oct 28, 2026, 4:05 PM",
		userName: "BW LEE",
		email: "dix.bwlee0728@gmail.com",
		productId: "general-donation",
		productName: "General Donation",
		amount: 1,
		status: "paid",
	},
	{
		paidAt: "Oct 28, 2026, 10:55 AM",
		userName: "daeun lee",
		email: "dix.delee@gmail.com",
		productId: "sunday-offering",
		productName: "Sunday Offering",
		amount: 50,
		status: "pending",
	},
	{
		paidAt: "Oct 27, 2026, 1:13 PM",
		userName: "owen owen",
		email: "owenkim1323@gmail.com",
		productId: "general-donation",
		productName: "General Donation",
		amount: 50,
		status: "paid",
	},
	{
		paidAt: "Oct 27, 2026, 12:41 PM",
		userName: "daeun lee",
		email: "dix.delee@gmail.com",
		productId: "sunday-offering",
		productName: "Sunday Offering",
		amount: 50,
		status: "pending",
	},
	{
		paidAt: "Oct 26, 2026, 5:27 PM",
		userName: "byungwoo Gdr",
		email: "extreme0728@gmail.com",
		productId: "general-donation",
		productName: "General Donation",
		amount: 50,
		status: "paid",
	},
	{
		paidAt: "Oct 26, 2026, 4:50 PM",
		userName: "BW LEE",
		email: "dix.bwlee0728@gmail.com",
		productId: "sunday-offering",
		productName: "Sunday Offering",
		amount: 100_000,
		status: "paid",
	},
	{
		paidAt: "Oct 26, 2026, 3:00 PM",
		userName: "owen owen",
		email: "owenkim1323@gmail.com",
		productId: "general-donation",
		productName: "General Donation",
		amount: 50,
		status: "paid",
	},
	{
		paidAt: "Oct 26, 2026, 2:54 PM",
		userName: "byungwoo Gdr",
		email: "extreme0728@gmail.com",
		productId: "general-donation",
		productName: "General Donation",
		amount: 50,
		status: "paid",
	},
	{
		paidAt: "Oct 25, 2026, 11:38 AM",
		userName: "Mina Park",
		email: "mina.park@example.com",
		productId: "community-fund",
		productName: "Community Fund",
		amount: 50,
		status: "failed",
	},
];

const paymentOrderList: readonly PaymentOrder[] = Array.from(
	{ length: 37 },
	(_, index) => ({
		...paymentSeedList[index % paymentSeedList.length],
		id: `KP-${1045 - index}`,
	}),
);

const initialFilter: PaymentFilter = {
	productId: "all",
	email: "",
	status: "all",
};
const paymentPageSize = 10;

const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

const getStatusTone = (status: PaymentStatus) => {
	if (status === "paid") return "success" as const;
	if (status === "pending") return "neutral" as const;
	return "danger" as const;
};

const formatStatus = (status: PaymentStatus) => status.toUpperCase();

const PaymentSelect = ({
	children,
	className = "",
	...props
}: ComponentProps<"select">) => (
	<div className="relative">
		<select
			{...props}
			className={`
     h-10 w-full appearance-none rounded-md
     border border-border bg-surface px-3.5
     pr-10 font-sans text-body text-text
     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus
     ${className}`}
		>
			{children}
		</select>
		<svg
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.7"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="
     pointer-events-none absolute top-1/2 right-3.5
     size-4 -translate-y-1/2 text-text-muted
   "
			aria-hidden="true"
		>
			<path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
		</svg>
	</div>
);

const PaymentTableSkeleton = () => (
	<div className="w-full overflow-x-auto" aria-hidden="true">
		<div className="min-w-215">
			<div
				className="
      grid grid-cols-[1.05fr_1.4fr_1.3fr_0.8fr_0.75fr_0.45fr] gap-4 border-b
      border-border bg-surface-muted px-4 py-3
    "
			>
				{Array.from({ length: 6 }, (_, index) => (
					<Skeleton key={`heading-${index}`} shape="line" className="h-3.5" />
				))}
			</div>
			{Array.from({ length: 5 }, (_, rowIndex) => (
				<div
					key={`row-${rowIndex}`}
					className="
       grid grid-cols-[1.05fr_1.4fr_1.3fr_0.8fr_0.75fr_0.45fr] items-center gap-4
       border-b border-border px-4 py-4
     "
				>
					{Array.from({ length: 6 }, (_, columnIndex) => (
						<Skeleton
							key={`cell-${rowIndex}-${columnIndex}`}
							shape="line"
							className={columnIndex === 1 ? "h-4" : "h-3.5"}
						/>
					))}
				</div>
			))}
		</div>
	</div>
);

const PaymentMetricSkeleton = () => (
	<section
		className="
    grid grid-cols-1 gap-4 sm:grid-cols-2
    2xl:grid-cols-4
  "
		aria-label="결제 요약 불러오는 중"
		aria-busy="true"
	>
		{["Total", "Orders", "Pending", "Refund"].map((label) => (
			<StatCard
				key={label}
				label={label}
				value={<Skeleton className="h-8 w-36 max-w-full" />}
			/>
		))}
	</section>
);

const MetricIcon = ({
	kind,
}: {
	readonly kind: "total" | "orders" | "pending" | "refund";
}) => {
	const pathByKind = {
		total: (
			<>
				<path d="M12 2v20" />
				<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
			</>
		),
		orders: (
			<>
				<path d="m3 17 6-6 4 4 8-9" />
				<path d="M15 6h6v6" />
			</>
		),
		pending: (
			<>
				<circle cx="12" cy="12" r="9" />
				<path d="M12 7v5l3 2" />
			</>
		),
		refund: (
			<>
				<path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" />
				<path d="M3 3v5h5" />
			</>
		),
	};
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-5"
			aria-hidden="true"
		>
			{pathByKind[kind]}
		</svg>
	);
};

const MetricValue = ({
	kind,
	value,
}: {
	readonly kind: "total" | "orders" | "pending" | "refund";
	readonly value: string;
}) => (
	<span className="inline-flex items-center gap-4">
		<span
			className="
     grid size-12 shrink-0 place-items-center
     rounded-full bg-surface-muted text-primary-strong
   "
		>
			<MetricIcon kind={kind} />
		</span>
		<span className="text-3xl font-bold leading-none text-text">{value}</span>
	</span>
);

const orderColumnList: readonly TableColumn<PaymentOrder>[] = [
	{
		key: "paid-at",
		header: "Paid at",
		render: (order) => (
			<time className="whitespace-nowrap text-text-muted">{order.paidAt}</time>
		),
	},
	{
		key: "user",
		header: "User",
		render: (order) => (
			<span className="grid gap-0.5">
				<span className="font-semibold text-text">{order.userName}</span>
				<span className="font-mono text-meta text-text-muted">
					{order.email}
				</span>
			</span>
		),
	},
	{
		key: "product",
		header: "Product",
		render: (order) => (
			<span className="whitespace-nowrap">{order.productName}</span>
		),
	},
	{
		key: "amount",
		header: <span className="block text-right">Amount</span>,
		render: (order) => (
			<span
				className="
      block whitespace-nowrap text-right font-semibold
      tabular-nums
    "
			>
				{currencyFormatter.format(order.amount)}
			</span>
		),
	},
	{
		key: "status",
		header: "Status",
		render: (order) => (
			<Badge
				tone={getStatusTone(order.status)}
				className={`rounded-pill px-3! py-1.5 text-caption ${order.status === "paid" ? "border-transparent! bg-positive! text-on-positive!" : order.status === "failed" ? "border-transparent! bg-negative! text-on-negative!" : ""}`}
			>
				{formatStatus(order.status)}
			</Badge>
		),
	},
];

export const DemoPaymentPage = () => {
	const { openModal } = useOverlay();
	const [draftProductId, setDraftProductId] = useState("all");
	const [draftEmail, setDraftEmail] = useState("");
	const [draftStatus, setDraftStatus] =
		useState<PaymentFilter["status"]>("all");
	const [appliedFilter, setAppliedFilter] = useState(initialFilter);
	const [pageNumber, setPageNumber] = useState(1);
	const [isSearching, setIsSearching] = useState(false);
	const isInitialLoading = useDemoLoading("payment");
	const isDataLoading = isInitialLoading || isSearching;
	const timerRef = useRef<number | null>(null);

	useEffect(
		() => () => {
			if (timerRef.current !== null) window.clearTimeout(timerRef.current);
		},
		[],
	);

	const filteredOrderList = useMemo(() => {
		const normalizedEmail = appliedFilter.email.trim().toLowerCase();
		return paymentOrderList.filter((order) => {
			const matchesProduct =
				appliedFilter.productId === "all" ||
				order.productId === appliedFilter.productId;
			const matchesEmail =
				normalizedEmail.length === 0 ||
				order.email.toLowerCase().includes(normalizedEmail);
			const matchesStatus =
				appliedFilter.status === "all" || order.status === appliedFilter.status;
			return matchesProduct && matchesEmail && matchesStatus;
		});
	}, [appliedFilter]);

	const pageCount = Math.max(
		1,
		Math.ceil(filteredOrderList.length / paymentPageSize),
	);
	const visibleOrderList = filteredOrderList.slice(
		(pageNumber - 1) * paymentPageSize,
		pageNumber * paymentPageSize,
	);
	const firstVisibleOrder =
		filteredOrderList.length === 0 ? 0 : (pageNumber - 1) * paymentPageSize + 1;
	const lastVisibleOrder = Math.min(
		pageNumber * paymentPageSize,
		filteredOrderList.length,
	);
	const tableState = isDataLoading
		? "loading"
		: filteredOrderList.length === 0
			? "empty"
			: "success";

	const scheduleDataLoad = (commit: () => void) => {
		if (timerRef.current !== null) window.clearTimeout(timerRef.current);
		setIsSearching(true);
		timerRef.current = window.setTimeout(() => {
			timerRef.current = null;
			commit();
			setIsSearching(false);
		}, demoLoadingDelayMs);
	};

	const handleSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		scheduleDataLoad(() => {
			setAppliedFilter({
				productId: draftProductId,
				email: draftEmail,
				status: draftStatus,
			});
			setPageNumber(1);
		});
	};

	const handleResetFilters = () => {
		setDraftProductId("all");
		setDraftEmail("");
		setDraftStatus("all");
		scheduleDataLoad(() => {
			setAppliedFilter(initialFilter);
			setPageNumber(1);
		});
	};

	const handlePageChange = (nextPageNumber: number) => {
		scheduleDataLoad(() => setPageNumber(nextPageNumber));
	};

	const openOrderDetails = (order: PaymentOrder) => {
		openModal({
			title: "Payment details",
			description: `Order ${order.id}`,
			content: (
				<DetailList
					itemList={[
						{ key: "paid-at", label: "Paid at", value: order.paidAt },
						{ key: "user", label: "User", value: order.userName },
						{ key: "email", label: "Email", value: order.email },
						{ key: "product", label: "Product", value: order.productName },
						{
							key: "amount",
							label: "Amount",
							value: currencyFormatter.format(order.amount),
						},
						{
							key: "status",
							label: "Status",
							value: formatStatus(order.status),
						},
					]}
				/>
			),
		});
	};

	const openProductList = () => {
		openModal({
			title: "Products",
			description: "Sample products connected to this payment list.",
			content: (
				<ul
					className="
       m-0 grid list-none gap-3
       p-0
     "
				>
					{productList.map((product) => (
						<li
							key={product.id}
							className="
         flex items-center justify-between gap-4
         rounded-md border border-border px-4
         py-3
       "
						>
							<span className="font-semibold">{product.name}</span>
							<Badge tone="neutral">Sample</Badge>
						</li>
					))}
				</ul>
			),
		});
	};

	const columnList: readonly TableColumn<PaymentOrder>[] = [
		...orderColumnList,
		{
			key: "actions",
			header: <span className="block text-right">Actions</span>,
			render: (order) => (
				<span className="flex justify-end">
					<Button
						variant="secondary"
						className="
        size-9 min-h-9! rounded-full border-0!
        bg-transparent! px-0 py-0 text-text-muted!
        hover:bg-surface-muted!
      "
						aria-label={`View payment ${order.id}`}
						onClick={() => openOrderDetails(order)}
					>
						<svg
							viewBox="0 0 24 24"
							fill="currentColor"
							className="size-4"
							aria-hidden="true"
						>
							<circle cx="12" cy="5" r="1.7" />
							<circle cx="12" cy="12" r="1.7" />
							<circle cx="12" cy="19" r="1.7" />
						</svg>
					</Button>
				</span>
			),
		},
	];

	return (
		<section
			className="grid max-w-360 gap-6"
			aria-labelledby="payment-page-title"
		>
			<header
				className="
      flex flex-wrap items-center justify-between
      gap-4
    "
			>
				<div className="grid gap-1">
					<h1
						className="m-0 text-page-title font-bold tracking-[-0.02em]"
						id="payment-page-title"
					>
						Payment
					</h1>
					<p className="m-0 text-meta text-text-muted">
						View payment activity and order status.
					</p>
				</div>
				<span
					className="
       rounded-pill border border-primary/30 bg-surface
       px-3 py-1 text-caption font-semibold
       text-primary-strong
     "
				>
					Demo data
				</span>
			</header>

			{isDataLoading ? (
				<PaymentMetricSkeleton />
			) : (
				<section
					className="
       grid grid-cols-1 gap-4 sm:grid-cols-2
       2xl:grid-cols-4
     "
					aria-label="Payment summary"
				>
					<StatCard
						label="Total"
						value={<MetricValue kind="total" value="$100,251.00" />}
					/>
					<StatCard
						label="Orders"
						value={<MetricValue kind="orders" value="37" />}
					/>
					<StatCard
						label="Pending"
						value={<MetricValue kind="pending" value="$650.00" />}
					/>
					<StatCard
						label="Refund"
						value={<MetricValue kind="refund" value="$0.00" />}
					/>
				</section>
			)}

			<form
				className="
      grid grid-cols-1 items-end gap-4
      sm:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_minmax(220px,1.25fr)_minmax(160px,1fr)_auto_auto]
    "
				aria-label="Search payments"
				onSubmit={handleSearch}
			>
				<FormField label="Product" htmlFor="payment-product-filter">
					<PaymentSelect
						id="payment-product-filter"
						value={draftProductId}
						onChange={(event) => setDraftProductId(event.target.value)}
					>
						<option value="all">All products</option>
						{productList.map((product) => (
							<option key={product.id} value={product.id}>
								{product.name}
							</option>
						))}
					</PaymentSelect>
				</FormField>
				<FormField label="Email" htmlFor="payment-email-filter">
					<Input
						id="payment-email-filter"
						name="email"
						placeholder="Email address"
						type="search"
						value={draftEmail}
						onChange={(event) => setDraftEmail(event.target.value)}
					/>
				</FormField>
				<FormField label="Status" htmlFor="payment-status-filter">
					<PaymentSelect
						id="payment-status-filter"
						value={draftStatus}
						onChange={(event) =>
							setDraftStatus(event.target.value as PaymentFilter["status"])
						}
					>
						<option value="all">All statuses</option>
						<option value="paid">Paid</option>
						<option value="pending">Pending</option>
						<option value="failed">Failed</option>
					</PaymentSelect>
				</FormField>
				<PendingButton type="submit" pending={isDataLoading}>
					Search
				</PendingButton>
				<Button variant="secondary" type="button" onClick={openProductList}>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="size-4"
						aria-hidden="true"
					>
						<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
						<path d="m4.5 7.5 7.5 4.3 7.5-4.3M12 12v9" />
					</svg>
					Products
				</Button>
			</form>

			<section
				className="
      overflow-hidden rounded-xl border border-border
      bg-surface
    "
				aria-label="Payment transactions"
				aria-busy={isDataLoading || undefined}
			>
				<div
					className="
       [&_caption]:sr-only [&_th]:whitespace-nowrap [&_th]:uppercase [&_tr:hover>td]:bg-canvas
       [&_td]:align-middle [&_td]:text-meta [&_table]:min-w-215
     "
				>
					<AsyncState
						state={tableState}
						loading={
							<div className="w-full p-4">
								<span className="sr-only">Loading payments</span>
								<PaymentTableSkeleton />
							</div>
						}
						empty={
							<div className="grid justify-items-center gap-2 py-10">
								<h2 className="m-0 text-subtitle font-semibold">
									No payments found.
								</h2>
								<p className="m-0 text-meta text-text-muted">
									Try changing your search filters.
								</p>
								<Button variant="secondary" onClick={handleResetFilters}>
									Reset filters
								</Button>
							</div>
						}
						error={<p>Payments could not be loaded. Try again.</p>}
					>
						<DataTable
							caption="Payment transactions"
							rowList={visibleOrderList}
							columnList={columnList}
							rowKey={(order) => order.id}
							emptyLabel="No payments match the selected filters."
						/>
					</AsyncState>
				</div>
			</section>

			{filteredOrderList.length > 0 && !isDataLoading && (
				<nav
					className="
       flex flex-wrap items-center justify-between
       gap-3
     "
					aria-label="Payment list pages"
				>
					<p className="m-0 text-meta text-text-muted" aria-live="polite">
						Showing {firstVisibleOrder}–{lastVisibleOrder} of{" "}
						{filteredOrderList.length} payments
					</p>
					<div className="flex gap-2">
						<Button
							variant="secondary"
							disabled={pageNumber === 1}
							aria-label="Previous payment page"
							onClick={() => handlePageChange(Math.max(1, pageNumber - 1))}
						>
							Previous
						</Button>
						<span
							className="
         inline-flex min-h-10 items-center px-2
         text-meta tabular-nums text-text-muted
       "
							aria-current="page"
						>
							Page {pageNumber} of {pageCount}
						</span>
						<Button
							variant="secondary"
							disabled={pageNumber >= pageCount}
							aria-label="Next payment page"
							onClick={() =>
								handlePageChange(Math.min(pageCount, pageNumber + 1))
							}
						>
							Next
						</Button>
					</div>
				</nav>
			)}
		</section>
	);
};
