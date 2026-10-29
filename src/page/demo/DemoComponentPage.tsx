import {
	useEffect,
	useRef,
	useState,
	type KeyboardEvent,
	type ReactNode,
} from "react";
import { useOverlay } from "@/component/overlay/useOverlay";
import { AsyncState } from "@/component/ui/AsyncState";
import { Badge } from "@/component/ui/Badge";
import { Button } from "@/component/ui/Button";
import { ChipInput, type ChipValue } from "@/component/ui/ChipInput";
import { Combobox } from "@/component/ui/Combobox";
import { DataTable } from "@/component/ui/DataTable";
import { DesignSystemProvider } from "@/component/ui/DesignSystemProvider";
import { DetailList } from "@/component/ui/DetailList";
import { Dropzone } from "@/component/ui/Dropzone";
import { FormField } from "@/component/ui/FormField";
import { Input } from "@/component/ui/Input";
import { PendingButton } from "@/component/ui/PendingButton";
import { RemovableChip } from "@/component/ui/RemovableChip";
import { SegmentedControl } from "@/component/ui/SegmentedControl";
import { Skeleton } from "@/component/ui/Skeleton";
import { StatCard } from "@/component/ui/StatCard";

type ExampleSectionProps = {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly children: ReactNode;
};

const ExampleSection = ({
	id,
	title,
	description,
	children,
}: ExampleSectionProps) => (
	<section
		className="grid gap-5 rounded-xl border border-border bg-surface p-6 max-[720px]:p-4"
		aria-labelledby={id}
	>
		<header className="grid gap-1 border-b border-border pb-4">
			<h2
				className="m-0 text-subtitle font-semibold tracking-[-0.02em]"
				id={id}
			>
				{title}
			</h2>
			<p className="m-0 text-meta text-text-muted">{description}</p>
		</header>
		<div className="grid gap-5">{children}</div>
	</section>
);

const rowList = [
	{ id: "item-1", name: "운영 가이드", status: "게시 중", owner: "운영팀" },
	{ id: "item-2", name: "계정 시작하기", status: "검수 대기", owner: "제품팀" },
	{ id: "item-3", name: "도움말 업데이트", status: "작성 중", owner: "지원팀" },
] as const;

const comboboxOptionList = [
	{ value: "published", label: "게시 중" },
	{ value: "review", label: "검수 대기" },
	{ value: "draft", label: "작성 중" },
	{ value: "archived", label: "보관됨", disabled: true },
] as const;

const initialChipList: readonly ChipValue[] = [
	{ value: "guide", label: "가이드", removeLabel: "가이드 제거" },
	{ value: "notice", label: "공지", removeLabel: "공지 제거" },
];

type AsyncDemoState = "loading" | "empty" | "error" | "success";
type TableDemoState = "ready" | "pending" | "empty";
type ViewValue = "all" | "published" | "draft";

export const DemoComponentPage = () => {
	const { openModal, showToast } = useOverlay();
	const [comboboxValue, setComboboxValue] = useState<string | null>("draft");
	const [comboboxInput, setComboboxInput] = useState("작성 중");
	const [chipList, setChipList] = useState(initialChipList);
	const [chipInput, setChipInput] = useState("");
	const [isStandaloneChipVisible, setIsStandaloneChipVisible] = useState(true);
	const [viewValue, setViewValue] = useState<ViewValue>("all");
	const [fileNameList, setFileNameList] = useState<readonly string[]>([]);
	const [isButtonPending, setIsButtonPending] = useState(false);
	const [asyncState, setAsyncState] = useState<AsyncDemoState>("success");
	const [tableState, setTableState] = useState<TableDemoState>("ready");
	const [selectedKeyList, setSelectedKeyList] = useState<readonly string[]>([]);
	const pendingTimerRef = useRef<number | null>(null);

	useEffect(
		() => () => {
			if (pendingTimerRef.current !== null)
				window.clearTimeout(pendingTimerRef.current);
		},
		[],
	);

	const startPendingAction = () => {
		if (pendingTimerRef.current !== null)
			window.clearTimeout(pendingTimerRef.current);
		setIsButtonPending(true);
		pendingTimerRef.current = window.setTimeout(() => {
			pendingTimerRef.current = null;
			setIsButtonPending(false);
			showToast({
				message: "대기 상태 예시가 완료되었습니다.",
				tone: "success",
				durationMs: 0,
			});
		}, 900);
	};

	const addChip = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter" || chipInput.trim() === "") return;
		event.preventDefault();
		const label = chipInput.trim();
		const value = label.toLowerCase().replaceAll(" ", "-");
		if (chipList.some((item) => item.value === value)) return;
		setChipList((current) => [
			...current,
			{ value, label, removeLabel: `${label} 제거` },
		]);
		setChipInput("");
	};

	const displayRowList = tableState === "empty" ? [] : rowList;
	const optionLabel = comboboxOptionList.find(
		(option) => option.value === comboboxValue,
	)?.label;

	return (
		<DesignSystemProvider selection={{ mode: "embedded" }}>
			<section className="grid max-w-7xl gap-6 p-6 max-[720px]:p-4">
				<header className="grid gap-2">
					<h1 className="m-0 text-page-title font-bold">공통 컴포넌트</h1>
					<p className="m-0 max-w-3xl text-meta text-text-muted">
						실제 제공되는 UI를 조작해 기본·선택·오류·대기 상태를 확인합니다.
						모든 값은 브라우저 안에서만 바뀌는 예시입니다.
					</p>
				</header>

				<ExampleSection
					id="primitive-example"
					title="기본 UI"
					description="Button, Badge, Input, Skeleton, StatCard와 embedded DesignSystemProvider"
				>
					<div className="grid gap-3">
						<h3 className="m-0 text-meta font-semibold">Button variant</h3>
						<div className="flex flex-wrap gap-3">
							<Button variant="primary">Primary</Button>
							<Button variant="secondary">Secondary</Button>
							<Button variant="danger">Danger</Button>
							<Button disabled>Disabled</Button>
						</div>
					</div>

					<div className="grid gap-3">
						<h3 className="m-0 text-meta font-semibold">Badge tone</h3>
						<div className="flex flex-wrap gap-2">
							<Badge>Neutral</Badge>
							<Badge tone="success">Success</Badge>
							<Badge tone="warning">Warning</Badge>
							<Badge tone="danger">Danger</Badge>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-3">
						<FormField
							label="기본 Input"
							htmlFor="example-input"
							hint="일반 입력과 도움말 연결"
						>
							<Input
								id="example-input"
								aria-describedby="example-input-hint"
								defaultValue="입력할 수 있습니다"
							/>
						</FormField>
						<FormField
							label="오류 Input"
							htmlFor="example-input-error"
							error="오류 메시지와 invalid 상태"
						>
							<Input
								id="example-input-error"
								aria-invalid="true"
								aria-describedby="example-input-error-error"
								defaultValue="확인이 필요합니다"
							/>
						</FormField>
						<FormField label="비활성 Input" htmlFor="example-input-disabled">
							<Input
								id="example-input-disabled"
								disabled
								defaultValue="수정할 수 없습니다"
							/>
						</FormField>
					</div>

					<div className="grid gap-3">
						<h3 className="m-0 text-meta font-semibold">Skeleton shape</h3>
						<div className="grid max-w-2xl gap-4 rounded-md border border-border p-4">
							<Skeleton shape="line" className="w-2/3" />
							<Skeleton shape="block" />
							<Skeleton shape="bar" />
							<Skeleton shape="circle" className="size-10" />
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<StatCard
							label="지표 카드"
							value="24"
							detail="상세 텍스트가 있는 예시"
						/>
						<StatCard label="상세 없는 카드" value="8" />
					</div>
				</ExampleSection>

				<ExampleSection
					id="form-example"
					title="입력과 선택"
					description="Combobox 키보드 탐색, ChipInput 삭제·추가, SegmentedControl, Dropzone 파일 선택"
				>
					<div className="grid gap-5 lg:grid-cols-2">
						<Combobox
							label="항목 상태 검색"
							optionList={comboboxOptionList}
							value={comboboxValue}
							inputValue={comboboxInput}
							onInputChange={(value) => {
								setComboboxInput(value);
								setComboboxValue(null);
							}}
							onChange={(value) => {
								setComboboxValue(value);
								const label = comboboxOptionList.find(
									(option) => option.value === value,
								)?.label;
								if (label) setComboboxInput(label);
							}}
						/>
						<div className="grid content-start gap-3">
							<p className="m-0 text-meta text-text-muted">
								선택값: <strong>{optionLabel ?? "선택 안 됨"}</strong>
							</p>
							<SegmentedControl
								label="목록 보기"
								value={viewValue}
								optionList={[
									{ value: "all", label: "전체" },
									{ value: "published", label: "게시 중" },
									{ value: "draft", label: "작성 중" },
								]}
								onChange={setViewValue}
							/>
							<p className="m-0 text-meta text-text-muted">
								선택값: <strong>{viewValue}</strong>
							</p>
						</div>
					</div>

					<div className="grid gap-2">
						<h3 className="m-0 text-meta font-semibold">ChipInput</h3>
						<ChipInput
							label="예시 태그"
							valueList={chipList}
							onRemoveValue={(value) =>
								setChipList((current) =>
									current.filter((chip) => chip.value !== value),
								)
							}
							input={
								<input
									className="min-w-32 flex-1 border-0 bg-transparent p-1 text-body outline-none"
									aria-label="태그 추가"
									placeholder="태그를 입력하고 Enter"
									value={chipInput}
									onChange={(event) => setChipInput(event.target.value)}
									onKeyDown={addChip}
								/>
							}
						/>
						<p className="m-0 text-meta text-text-muted">
							태그를 지우거나 새 태그를 추가해 보세요.
						</p>
					</div>
					<div className="grid gap-3">
						<h3 className="m-0 text-meta font-semibold">RemovableChip</h3>
						<div className="flex items-center gap-2">
							{isStandaloneChipVisible ? (
								<RemovableChip
									label="독립 Chip"
									removeLabel="독립 Chip 제거"
									onRemove={() => setIsStandaloneChipVisible(false)}
								/>
							) : (
								<Button onClick={() => setIsStandaloneChipVisible(true)}>
									Chip 복원
								</Button>
							)}
						</div>
					</div>

					<div className="grid gap-3">
						<Dropzone
							label="파일 선택"
							accept=".txt,.md,.pdf"
							multiple
							hint="파일을 선택하거나 이 영역에 끌어 놓으세요. 파일은 업로드되지 않습니다."
							onFileChange={(fileList) =>
								setFileNameList(fileList.map((file) => file.name))
							}
						/>
						<p className="m-0 text-meta text-text-muted" aria-live="polite">
							{fileNameList.length > 0
								? `선택한 파일: ${fileNameList.join(", ")}`
								: "선택한 파일이 없습니다."}
						</p>
					</div>
				</ExampleSection>

				<ExampleSection
					id="state-example"
					title="비동기 상태와 대기"
					description="PendingButton의 비활성·spinner와 AsyncState의 loading·empty·error·success"
				>
					<div className="grid gap-3">
						<h3 className="m-0 text-meta font-semibold">PendingButton</h3>
						<div className="flex flex-wrap items-center gap-3">
							<PendingButton
								pending={isButtonPending}
								onClick={startPendingAction}
							>
								{isButtonPending ? "처리 중" : "1초 대기 동작"}
							</PendingButton>
							<span className="text-meta text-text-muted">
								버튼을 누르면 잠시 비활성화됩니다.
							</span>
						</div>
					</div>

					<div className="grid gap-3">
						<h3 className="m-0 text-meta font-semibold">AsyncState</h3>
						<div
							className="flex flex-wrap gap-2"
							aria-label="AsyncState 예시 상태"
						>
							<Button onClick={() => setAsyncState("success")}>
								성공 보기
							</Button>
							<Button onClick={() => setAsyncState("loading")}>
								로딩 보기
							</Button>
							<Button onClick={() => setAsyncState("empty")}>
								빈 상태 보기
							</Button>
							<Button onClick={() => setAsyncState("error")}>오류 보기</Button>
						</div>
						<AsyncState
							state={asyncState}
							loading={
								<div className="grid w-full max-w-xl gap-3">
									<Skeleton shape="line" />
									<Skeleton shape="line" className="w-2/3" />
								</div>
							}
							empty="표시할 예시 데이터가 없습니다."
							error={
								<div className="grid justify-items-center gap-2">
									<p className="m-0">예시 오류 상태입니다.</p>
									<Button onClick={() => setAsyncState("success")}>
										다시 시도
									</Button>
								</div>
							}
						>
							<div className="flex items-center gap-2">
								<Badge tone="success">Success</Badge>
								<span>데이터를 표시하고 있습니다.</span>
							</div>
						</AsyncState>
					</div>
				</ExampleSection>

				<ExampleSection
					id="data-example"
					title="데이터 표시"
					description="DataTable의 전체·개별 선택·pending·empty, DetailList, StatCard"
				>
					<div className="grid gap-3">
						<div className="flex flex-wrap gap-2" aria-label="표 예시 상태">
							<Button onClick={() => setTableState("ready")}>표 복원</Button>
							<Button onClick={() => setTableState("pending")}>
								갱신 중 보기
							</Button>
							<Button onClick={() => setTableState("empty")}>빈 표 보기</Button>
						</div>
						<DataTable
							caption="공통 DataTable 예시"
							rowList={displayRowList}
							rowKey={(row) => row.id}
							pending={tableState === "pending"}
							emptyLabel="이 상태에는 표시할 행이 없습니다."
							selection={{
								selectedKeyList,
								onChange: setSelectedKeyList,
								label: "모든 행 선택",
								rowLabel: (row) => `${row.name} 선택`,
							}}
							columnList={[
								{ key: "name", header: "이름", render: (row) => row.name },
								{ key: "status", header: "상태", render: (row) => row.status },
								{ key: "owner", header: "담당", render: (row) => row.owner },
							]}
						/>
						<p className="m-0 text-meta text-text-muted" aria-live="polite">
							선택한 행: {selectedKeyList.length}개
						</p>
					</div>

					<div className="grid gap-4 lg:grid-cols-2">
						<div className="grid gap-3">
							<h3 className="m-0 text-meta font-semibold">DetailList</h3>
							<DetailList
								itemList={[
									{ key: "id", label: "식별자", value: "ITEM-024" },
									{
										key: "status",
										label: "상태",
										value: <Badge tone="success">게시 중</Badge>,
									},
									{ key: "owner", label: "담당", value: "운영팀" },
								]}
							/>
						</div>
						<div className="grid content-start gap-3">
							<h3 className="m-0 text-meta font-semibold">선택 상태</h3>
							<p className="m-0 text-meta text-text-muted">
								SegmentedControl에서 선택한 목록 보기:{" "}
								<strong>{viewValue}</strong>
							</p>
							<p className="m-0 text-meta text-text-muted">
								Combobox에서 선택한 상태:{" "}
								<strong>{optionLabel ?? "선택 안 됨"}</strong>
							</p>
						</div>
					</div>
				</ExampleSection>

				<ExampleSection
					id="overlay-example"
					title="Modal과 Toast"
					description="OverlayProvider와 useOverlay로 열리는 native dialog·상태 알림"
				>
					<div className="flex flex-wrap gap-3">
						<Button
							onClick={() =>
								openModal({
									title: "Modal 예시",
									description: "Escape, 닫기 버튼, focus 복귀를 확인하세요.",
									content: (
										<p className="m-0">
											이 내용은 예시이며 서버 요청이나 저장을 하지 않습니다.
										</p>
									),
									footer: (
										<Button
											variant="secondary"
											onClick={() =>
												showToast({
													message: "Modal 안의 동작을 실행했습니다.",
													tone: "success",
													durationMs: 0,
												})
											}
										>
											확인 알림 표시
										</Button>
									),
								})
							}
						>
							Modal 열기
						</Button>
						<Button
							onClick={() =>
								showToast({
									message: "정보 알림입니다. 닫기 버튼으로 지울 수 있습니다.",
									tone: "info",
									durationMs: 0,
								})
							}
						>
							Info Toast
						</Button>
						<Button
							onClick={() =>
								showToast({
									message: "성공 알림입니다.",
									tone: "success",
									durationMs: 0,
								})
							}
						>
							Success Toast
						</Button>
						<Button
							variant="danger"
							onClick={() =>
								showToast({
									message: "오류 알림입니다.",
									tone: "error",
									durationMs: 0,
								})
							}
						>
							Error Toast
						</Button>
					</div>
				</ExampleSection>
			</section>
		</DesignSystemProvider>
	);
};
