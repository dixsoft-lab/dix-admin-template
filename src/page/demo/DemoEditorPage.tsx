import {
	useEffect,
	useId,
	useState,
	type FormEvent,
	type KeyboardEvent,
} from "react";
import { Link, useParams } from "react-router-dom";
import { useOverlay } from "@/component/overlay/useOverlay";
import { Button } from "@/component/ui/Button";
import { ChipInput, type ChipValue } from "@/component/ui/ChipInput";
import { ChipInputOption } from "@/component/ui/ChipInputOption";
import { ChipInputOptionList } from "@/component/ui/ChipInputOptionList";
import { ChipSelect } from "@/component/ui/ChipSelect";
import { FormField } from "@/component/ui/FormField";
import { Input } from "@/component/ui/Input";
import { SectionRail } from "@/component/ui/SectionRail";
import { Skeleton } from "@/component/ui/Skeleton";
import { Breadcrumb } from "@/component/ui/breadcrumb/Breadcrumb";
import type { BreadcrumbState } from "@/component/ui/breadcrumb/breadcrumb-context";
import { routePath } from "@/route/route-paths";
import { useCompositionGuard } from "@/hook/useCompositionGuard";
import { useDemoLoading } from "./useDemoLoading";

const sectionIdList = [
	"package",
	"overview",
	"participation",
	"history",
] as const;
type SectionId = (typeof sectionIdList)[number];

const railItemList = [
	{ id: "package", label: "콘텐츠 패키지", state: "게시 전" },
	{ id: "overview", label: "개요", state: "완료" },
	{ id: "participation", label: "참여 항목", state: 2 },
	{ id: "history", label: "변경 이력", state: "현재" },
] as const;

const personCategoryOptionList = [
	{ value: "teen-male", label: "10대 남성" },
	{ value: "teen-female", label: "10대 여성" },
	{ value: "twenties-male", label: "20대 남성" },
	{ value: "twenties-female", label: "20대 여성" },
	{ value: "thirties-male", label: "30대 남성" },
	{ value: "thirties-female", label: "30대 여성" },
	{ value: "adult-male", label: "40대 남성" },
	{ value: "adult-female", label: "40대 여성" },
	{ value: "fifties-male", label: "50대 남성" },
	{ value: "fifties-female", label: "50대 여성" },
	{ value: "sixties-male", label: "60대 남성" },
	{ value: "sixties-female", label: "60대 여성" },
	{ value: "senior-male", label: "70대 남성" },
	{ value: "senior-female", label: "70대 여성" },
	{ value: "common", label: "공통" },
	{ value: "other", label: "기타" },
	{ value: "pet", label: "반려동물" },
] as const;

const storyTagOptionList = [
	{ value: "bof", label: "BoF", count: 8 },
	{ value: "guide", label: "가이드", count: 5 },
	{ value: "notice", label: "공지", count: 4 },
	{ value: "sound", label: "사운드", count: 3 },
] as const;

const cardClassName =
	"grid gap-5 rounded-xl border border-border bg-surface p-5";
const sectionHeadingClassName =
	"m-0 text-subtitle font-semibold tracking-[-0.02em]";

const genericEditorBreadcrumbState = {
	kind: "trail",
	itemList: [
		{ label: "대시보드", to: routePath.overview },
		{ label: "항목", to: routePath.list },
		{ label: "편집" },
	],
} satisfies BreadcrumbState;

const EditorHeader = ({
	isLoading,
	breadcrumbState,
	title,
	status,
	description,
}: {
	readonly isLoading: boolean;
	readonly breadcrumbState: BreadcrumbState;
	readonly title: string;
	readonly status: string;
	readonly description: string;
}) => {
	return (
		<>
			<div className="h-35 max-[720px]:hidden" aria-hidden="true" />
			<header
				id="story-editor-header"
				className="
      fixed top-0 right-8 left-66
      z-10 bg-canvas pt-6 pb-5
      shadow-[0_1px_0_var(--color-border)] max-[1360px]:right-6 max-[1360px]:left-58 max-[720px]:sticky
      max-[720px]:right-auto max-[720px]:left-auto max-[720px]:pt-3 max-[720px]:pb-3
    "
			>
				<Breadcrumb
					state={breadcrumbState}
					renderLink={({ to, label }) => <Link to={to}>{label}</Link>}
				/>
				<div
					className="
       mt-3 flex items-center justify-between
       gap-4 max-[720px]:mt-2 max-[720px]:items-start
     "
				>
					<div className="min-w-0">
						{isLoading ? (
							<>
								<h1 className="sr-only" id="story-editor-title">
									{title}
								</h1>
								<Skeleton className="h-7 w-72 max-w-full" />
							</>
						) : (
							<h1
								className="m-0 text-[21px] font-bold tracking-[-0.03em]"
								id="story-editor-title"
							>
								{title}
							</h1>
						)}
						<p className="mt-1 mb-0 text-meta text-text-muted">{description}</p>
					</div>
					<span
						className="
        shrink-0 rounded-pill border border-border
        bg-surface px-2.5 py-1 text-caption
        font-semibold text-text-muted
      "
					>
						{status}
					</span>
				</div>
			</header>
		</>
	);
};

const EditorPageSkeleton = () => (
	<div className="grid min-w-0 gap-5" aria-label="스토리 편집 화면 로딩">
		<section className={cardClassName} aria-label="개요 불러오는 중">
			<Skeleton className="h-5 w-24" />
			<Skeleton shape="block" className="h-20" />
			<Skeleton className="h-4 w-32" />
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-4 w-20" />
			<Skeleton className="h-10 w-full" />
		</section>
		<section className={cardClassName} aria-label="참여 항목 불러오는 중">
			<Skeleton className="h-5 w-36" />
			{Array.from({ length: 3 }, (_, index) => (
				<Skeleton key={index} shape="block" className="h-16" />
			))}
		</section>
	</div>
);

export type DemoEditorMode = "generic" | "create" | "edit";

export const DemoEditorPage = ({
	mode = "generic",
}: {
	readonly mode?: DemoEditorMode;
}) => {
	const params = useParams<{ recordId?: string }>();
	const isCreate = mode === "create";
	const recordId =
		mode === "generic"
			? (params.recordId ?? "H084")
			: (params.recordId ?? "H084");
	const pageTitle = isCreate
		? "신규 유저스토리"
		: `${recordId} · Feel the Terrain`;
	const pageDescription = isCreate
		? "패키지와 개요를 등록하고 참여 항목을 연결합니다."
		: "패키지를 올리고 참여 항목을 연결합니다.";
	const breadcrumbState: BreadcrumbState =
		mode === "generic"
			? genericEditorBreadcrumbState
			: {
					kind: "trail",
					itemList: [
						{ label: "대시보드", to: routePath.overview },
						{ label: "유저스토리 관리", to: routePath.contentList },
						{ label: isCreate ? "신규 등록" : "편집" },
					],
				};
	const isLoading = useDemoLoading(`${mode}-${recordId}`);
	const { showToast, openModal } = useOverlay();
	const [activeSection, setActiveSection] = useState<SectionId>(
		isCreate ? "package" : "overview",
	);
	const [summary, setSummary] = useState(() =>
		isCreate ? "" : "노면의 변화가 전하는 소리와 감각을 체험합니다.",
	);
	const [tagList, setTagList] = useState<readonly ChipValue[]>(() =>
		isCreate ? [] : [{ value: "bof", label: "BoF", removeLabel: "BoF 제거" }],
	);
	const [tagInputValue, setTagInputValue] = useState("");
	const tagInputId = useId();
	const tagSuggestionId = useId();
	const tagInputComposition = useCompositionGuard();
	const [isCubeEnabled, setIsCubeEnabled] = useState(!isCreate);
	const [isPersonViewEnabled, setIsPersonViewEnabled] = useState(!isCreate);
	const [coordinateList, setCoordinateList] = useState(() =>
		isCreate ? { x: "", y: "", z: "" } : { x: "6", y: "4", z: "3" },
	);
	const [personCategoryList, setPersonCategoryList] = useState<
		readonly ChipValue[]
	>(() =>
		isCreate
			? []
			: [
					{
						value: "adult-male",
						label: "40대 남성",
						removeLabel: "40대 남성 제거",
					},
				],
	);

	useEffect(() => {
		if (isLoading) return;
		const sectionElementList = sectionIdList.flatMap((id) => {
			const element = document.getElementById(id);
			return element ? [{ id, element }] : [];
		});
		if (sectionElementList.length === 0) return;
		let frame: number | null = null;
		const updateActiveSection = () => {
			frame = null;
			const isAtPageBottom =
				window.scrollY > 0 &&
				document.documentElement.scrollHeight -
					window.innerHeight -
					window.scrollY <=
					2;
			if (isAtPageBottom) {
				setActiveSection(sectionElementList.at(-1)?.id ?? "history");
				return;
			}
			const headerHeight =
				document.getElementById("story-editor-header")?.getBoundingClientRect()
					.height ?? 0;
			const isMobile =
				window.matchMedia?.("(max-width: 720px)").matches ?? false;
			const railHeight = isMobile
				? (document.getElementById("story-editor-rail")?.getBoundingClientRect()
						.height ?? 0)
				: 0;
			const activationY = headerHeight + railHeight + 16;
			let currentSectionId = sectionElementList[0]?.id ?? "package";
			for (const section of sectionElementList) {
				if (section.element.getBoundingClientRect().top > activationY) break;
				currentSectionId = section.id;
			}
			setActiveSection(currentSectionId);
		};
		const scheduleActiveSectionUpdate = () => {
			if (frame === null) {
				frame = window.requestAnimationFrame(updateActiveSection);
			}
		};
		window.addEventListener("scroll", scheduleActiveSectionUpdate, {
			passive: true,
		});
		window.addEventListener("resize", scheduleActiveSectionUpdate);
		const resizeObserver =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver(scheduleActiveSectionUpdate);
		for (const section of sectionElementList) {
			resizeObserver?.observe(section.element);
		}
		const header = document.getElementById("story-editor-header");
		const rail = document.getElementById("story-editor-rail");
		if (header) resizeObserver?.observe(header);
		if (rail) resizeObserver?.observe(rail);
		scheduleActiveSectionUpdate();
		return () => {
			window.removeEventListener("scroll", scheduleActiveSectionUpdate);
			window.removeEventListener("resize", scheduleActiveSectionUpdate);
			resizeObserver?.disconnect();
			if (frame !== null) window.cancelAnimationFrame(frame);
		};
	}, [isLoading]);

	const selectSection = (id: string) => {
		if (!sectionIdList.includes(id as SectionId)) return;
		const sectionId = id as SectionId;
		setActiveSection(sectionId);
		const section = document.getElementById(sectionId);
		if (!section) return;
		const headerHeight =
			document.getElementById("story-editor-header")?.getBoundingClientRect()
				.height ?? 0;
		const isMobile = window.matchMedia?.("(max-width: 720px)").matches ?? false;
		const railHeight = isMobile
			? (document.getElementById("story-editor-rail")?.getBoundingClientRect()
					.height ?? 0)
			: 0;
		const prefersReducedMotion =
			window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
		window.scrollTo({
			top:
				window.scrollY +
				section.getBoundingClientRect().top -
				(headerHeight + railHeight + 16),
			behavior: prefersReducedMotion ? "instant" : "smooth",
		});
	};

	const addTag = (rawValue: string) => {
		const label = rawValue.trim();
		if (label === "") return;
		const value = label.toLowerCase().replaceAll(" ", "-");
		if (tagList.some((tag) => tag.value === value)) return;
		setTagList((current) => [
			...current,
			{ value, label, removeLabel: `${label} 제거` },
		]);
		setTagInputValue("");
	};
	const handleTagInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter" || tagInputComposition.isComposing(event)) return;
		if (event.currentTarget.value.trim() === "") return;
		event.preventDefault();
		addTag(event.currentTarget.value);
	};
	const tagQuery = tagInputValue.trim();
	const hasExactStoryTag = storyTagOptionList.some(
		(option) =>
			option.label.toLocaleLowerCase() === tagQuery.toLocaleLowerCase(),
	);
	const tagSuggestionView = tagQuery ? (
		<ChipInputOptionList
			anchorId={tagInputId}
			id={tagSuggestionId}
			label="기존 태그 추천"
			header={<>“{tagQuery}” 입력 중 — 기존 태그</>}
		>
			{storyTagOptionList
				.filter(
					(option) =>
						option.label
							.toLocaleLowerCase()
							.includes(tagQuery.toLocaleLowerCase()) &&
						!tagList.some((tag) => tag.value === option.value),
				)
				.map((option) => (
					<ChipInputOption
						key={option.value}
						detail={`${option.count}개 스토리`}
						onClick={() => addTag(option.label)}
					>
						{option.label}
					</ChipInputOption>
				))}
			{!hasExactStoryTag && (
				<ChipInputOption tone="muted" onClick={() => addTag(tagInputValue)}>
					＋ “{tagQuery}” 새로 추가
				</ChipInputOption>
			)}
		</ChipInputOptionList>
	) : null;

	const handleSave = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		showToast({
			message: isCreate
				? "신규 등록 내용을 저장했습니다. (예시)"
				: "개요가 저장되었습니다. (예시)",
			tone: "success",
		});
	};

	const openDeleteConfirmation = () => {
		openModal({
			layout: "segmented",
			title: `${recordId} · Feel the Terrain 을(를) 삭제합니다`,
			description: "예시 화면입니다. 삭제 요청이나 저장은 수행하지 않습니다.",
			content: (
				<div
					className="
       rounded-md border border-border bg-canvas
       px-4 py-3 text-meta leading-[1.6]
       text-text-muted
     "
				>
					화면 상호작용을 확인하기 위한 모달입니다. 제품 데이터에는 영향을 주지
					않습니다.
				</div>
			),
			footer: (
				<Button
					variant="danger"
					onClick={() =>
						showToast({ message: "예시 화면에서는 삭제하지 않습니다." })
					}
				>
					삭제
				</Button>
			),
		});
	};

	return (
		<section
			className="relative grid gap-5"
			aria-labelledby="story-editor-title"
			aria-busy={isLoading || undefined}
		>
			<EditorHeader
				isLoading={isLoading}
				breadcrumbState={breadcrumbState}
				title={pageTitle}
				status={isCreate ? "작성 중" : "게시 전"}
				description={pageDescription}
			/>
			<SectionRail
				id="story-editor-rail"
				label="스토리 편집 구역"
				itemList={railItemList}
				activeId={activeSection}
				onSelect={selectSection}
				className="
      fixed top-39 left-66 z-2
      max-h-[calc(100dvh-180px)] w-49 overflow-y-auto max-[1360px]:left-58
      max-[720px]:sticky max-[720px]:top-0 max-[720px]:left-auto max-[720px]:z-5
      max-[720px]:w-auto max-[720px]:max-h-none max-[720px]:overflow-visible max-[720px]:bg-canvas
      max-[720px]:py-2 [&_li]:px-4 [&_li]:py-2.5 [&_li]:text-body
    "
			/>
			<div
				className="
      grid min-w-0 grid-cols-[196px_minmax(0,1fr)] gap-5
      max-[960px]:grid-cols-[minmax(150px,196px)_minmax(0,1fr)] max-[960px]:gap-4 max-[720px]:grid-cols-1
    "
			>
				<div className="max-[720px]:hidden" aria-hidden="true" />
				{isLoading ? (
					<EditorPageSkeleton />
				) : (
					<form className="grid min-w-0 gap-5" onSubmit={handleSave}>
						<section
							id="package"
							className={`${cardClassName} scroll-mt-40`}
							aria-labelledby="story-package-title"
						>
							<div
								className="
          flex flex-wrap items-center justify-between
          gap-3
        "
							>
								<div>
									<h2
										className={sectionHeadingClassName}
										id="story-package-title"
									>
										콘텐츠 패키지
									</h2>
									<p className="mt-1 mb-0 text-meta text-text-muted">
										현재 파일의 메타데이터와 교체 동작을 확인합니다.
									</p>
								</div>
								{!isCreate && (
									<Button
										variant="secondary"
										type="button"
										onClick={openDeleteConfirmation}
									>
										삭제 확인
									</Button>
								)}
							</div>
							{isCreate ? (
								<div
									className="
           grid min-h-40 place-items-center rounded-lg
           border border-dashed border-border-strong bg-canvas
           p-6 text-center
         "
								>
									<div className="grid justify-items-center gap-2">
										<strong>콘텐츠 패키지를 선택하세요</strong>
										<p className="m-0 text-meta text-text-muted">
											ZIP 파일을 선택하거나 이 영역에 끌어 놓으세요. 파일은
											업로드되지 않습니다.
										</p>
										<Button
											variant="secondary"
											type="button"
											onClick={() =>
												showToast({
													message: "파일 업로드는 예시에서 수행하지 않습니다.",
												})
											}
										>
											파일 선택
										</Button>
									</div>
								</div>
							) : (
								<div
									className="
           flex flex-wrap items-center gap-4
           rounded-lg border border-border bg-surface
           px-3 py-3
         "
								>
									<div
										className="
            grid size-16 shrink-0 place-items-center
            rounded-md bg-surface-muted text-meta font-semibold
            text-primary-strong
          "
									>
										ZIP
									</div>
									<div className="min-w-0 flex-1">
										<strong className="block truncate">
											H043_thumbnail.jpg
										</strong>
										<p className="mt-1 mb-0 text-meta text-text-muted">
											768 × 768 · 53KB
										</p>
									</div>
									<Button variant="secondary" type="button">
										교체
									</Button>
								</div>
							)}
						</section>

						<section
							id="overview"
							className={`${cardClassName} scroll-mt-40`}
							aria-labelledby="story-overview-title"
						>
							<h2 className={sectionHeadingClassName} id="story-overview-title">
								개요
							</h2>
							<FormField label="한 줄 요약 — 60자 이내" htmlFor="story-summary">
								<Input
									id="story-summary"
									maxLength={60}
									value={summary}
									onChange={(event) => setSummary(event.currentTarget.value)}
								/>
							</FormField>
							<FormField
								label="태그 — 최소 1개 · 최대 50개"
								htmlFor={tagInputId}
							>
								<ChipInput
									label="스토리 태그"
									suggestionList={tagSuggestionView}
									valueList={tagList}
									onRemoveValue={(value) =>
										setTagList((current) =>
											current.filter((tag) => tag.value !== value),
										)
									}
									input={
										<input
											aria-label="태그 입력"
											aria-autocomplete="list"
											aria-controls={tagSuggestionId}
											aria-expanded={tagQuery.length > 0}
											autoComplete="off"
											id={tagInputId}
											maxLength={100}
											placeholder="태그 입력..."
											value={tagInputValue}
											onChange={(event) =>
												setTagInputValue(event.currentTarget.value)
											}
											onCompositionStart={
												tagInputComposition.handleCompositionStart
											}
											onCompositionEnd={(event) => {
												tagInputComposition.handleCompositionEnd();
												setTagInputValue(event.currentTarget.value);
											}}
											onKeyDown={handleTagInputKeyDown}
										/>
									}
								/>
							</FormField>
							<div className="rounded-md border border-border bg-canvas">
								<h3
									className="
           m-0 border-b border-border px-4
           py-3 text-body font-semibold
         "
								>
									노출 위치 — 카테고리 · 뷰 · 좌표
								</h3>
								<div className="grid gap-4 p-4">
									<label className="flex items-center gap-3 font-semibold">
										<input
											checked={isCubeEnabled}
											className="size-4 accent-primary"
											id="story-cube-enabled"
											type="checkbox"
											onChange={(event) =>
												setIsCubeEnabled(event.currentTarget.checked)
											}
										/>
										All · 큐브 뷰{" "}
										<span
											className="
             rounded-pill border border-border px-2
             py-0.5 text-caption font-medium text-text-muted
           "
										>
											6 × 6 × 6
										</span>
									</label>
									{isCubeEnabled && (
										<div
											className="
             flex flex-wrap items-center gap-2
             pl-7
           "
										>
											<span className="mr-1 text-meta text-text-muted">
												좌표
											</span>
											{(["x", "y", "z"] as const).map((axis) => (
												<Input
													aria-label={`${axis.toUpperCase()} 좌표`}
													className="
               h-9! w-16! rounded-md border-border-strong
               bg-surface px-2 py-0 text-center
               font-mono text-body tabular-nums
             "
													key={axis}
													max={6}
													min={1}
													type="number"
													value={coordinateList[axis]}
													onChange={(event) =>
														setCoordinateList((current) => ({
															...current,
															[axis]: event.currentTarget.value,
														}))
													}
												/>
											))}
											<span className="text-meta text-text-subtle">
												x · y · z (1–6)
											</span>
										</div>
									)}
									<div className="border-t border-border pt-4">
										<label className="flex items-center gap-3 font-semibold">
											<input
												checked={isPersonViewEnabled}
												className="size-4 accent-primary"
												id="story-person-view-enabled"
												type="checkbox"
												onChange={(event) =>
													setIsPersonViewEnabled(event.currentTarget.checked)
												}
											/>
											인물 뷰{" "}
											<span
												className="
              rounded-pill border border-border px-2
              py-0.5 text-caption font-medium text-text-muted
            "
											>
												카테고리 {personCategoryOptionList.length}종
											</span>
										</label>
										{isPersonViewEnabled ? (
											<div className="mt-3 grid gap-3 pl-7">
												<p className="m-0 text-meta text-text-muted">
													카테고리 — 최소 1개 · 최대 3개
												</p>
												<ChipSelect
													label="인물 카테고리"
													placeholder="카테고리 선택..."
													valueList={personCategoryList}
													optionList={personCategoryOptionList}
													onChange={(valueList) =>
														setPersonCategoryList(valueList.slice(0, 3))
													}
												/>
												<p className="m-0 text-meta text-text-subtle">
													나선 안에서의 순서는 최신순 자동입니다 — 자리를 직접
													정하지 않습니다.
												</p>
											</div>
										) : (
											<p
												className="
              mt-2 mb-0 pl-7 text-meta
              text-text-muted
            "
											>
												뷰를 켜면 설정할 수 있습니다.
											</p>
										)}
									</div>
								</div>
							</div>
						</section>

						<section
							id="participation"
							className={`${cardClassName} scroll-mt-40`}
							aria-labelledby="story-participation-title"
						>
							<div className="flex items-center justify-between gap-3">
								<h2
									className={sectionHeadingClassName}
									id="story-participation-title"
								>
									참여 항목
								</h2>
								<span className="text-meta text-text-muted">2개</span>
							</div>
							{["A/B 선택", "Poll 응답"].map((name) => (
								<div
									className="
           flex items-center justify-between gap-3
           rounded-md border border-border px-4
           py-3
         "
									key={name}
								>
									<div>
										<strong className="block">{name}</strong>
										<span className="mt-1 block text-meta text-text-muted">
											연결 섹션 · 질문 보기
										</span>
									</div>
									<Button variant="secondary" type="button">
										수정
									</Button>
								</div>
							))}
						</section>

						<section
							id="history"
							className={`${cardClassName} scroll-mt-40`}
							aria-labelledby="story-history-title"
						>
							<div className="flex items-center justify-between gap-3">
								<h2
									className={sectionHeadingClassName}
									id="story-history-title"
								>
									변경 이력
								</h2>
								<span className="text-meta text-text-muted">현재</span>
							</div>
							<p className="m-0 text-body text-text-muted">
								초안 · 2026. 10. 28. · 예시 관리자
							</p>
						</section>

						<footer
							className="
         flex flex-wrap items-center justify-between
         gap-3 border-t border-border py-4
       "
						>
							<p className="m-0 text-meta text-text-muted">
								저장할 변경 사항이 있습니다.
							</p>
							<div className="flex flex-wrap gap-2">
								{isCreate && (
									<Button
										variant="secondary"
										type="button"
										onClick={() =>
											showToast({ message: "검수 요청을 준비했습니다. (예시)" })
										}
									>
										검수 요청
									</Button>
								)}
								<Button type="submit">
									{isCreate ? "신규 등록" : "개요 저장"}
								</Button>
							</div>
						</footer>
					</form>
				)}
			</div>
		</section>
	);
};
