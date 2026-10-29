import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useOverlay } from "@/component/overlay/useOverlay";
import { Badge } from "@/component/ui/Badge";
import { Button } from "@/component/ui/Button";
import { FormField } from "@/component/ui/FormField";
import { Input } from "@/component/ui/Input";
import { SegmentedControl } from "@/component/ui/SegmentedControl";
import { Skeleton } from "@/component/ui/Skeleton";
import { routePath } from "@/route/route-paths";
import { useDemoLoading } from "../shared/useDemoLoading";

const reviewModeOptionList = [
	{ value: "submission", label: "신규 검수 요청" },
	{ value: "version", label: "게시본 업데이트 검수" },
] as const;

export const DemoReviewPage = () => {
	const { recordId = "H084" } = useParams<{ recordId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const mode =
		searchParams.get("mode") === "submission" ? "submission" : "version";
	const isLoading = useDemoLoading(`${recordId}-${mode}`);
	const [reviewNote, setReviewNote] = useState("");
	const { openModal, showToast } = useOverlay();
	const chooseMode = (value: "submission" | "version") =>
		setSearchParams({ mode: value });
	const openDecision = (decision: "승인" | "반려") =>
		openModal({
			layout: "segmented",
			title: `${decision} 확인`,
			description: `${recordId} · Feel the Terrain`,
			descriptionVariant: "title",
			content: (
				<p className="m-0 text-body">
					검수 {decision} 처리를 진행하는 예시입니다. 실제 스토리 상태는
					변경되지 않습니다.
				</p>
			),
			footer: (
				<Button
					variant={decision === "반려" ? "danger" : "primary"}
					onClick={() =>
						showToast({
							message: `검수 ${decision} 예시를 확인했습니다.`,
							tone: decision === "승인" ? "success" : "error",
						})
					}
				>
					{decision}
				</Button>
			),
		});
	const title =
		mode === "submission"
			? `검수 요청 · ${recordId}`
			: `검수 · ${recordId} 업데이트`;

	return (
		<section className="grid gap-5" aria-busy={isLoading || undefined}>
			<header
				className="
      flex flex-wrap items-end justify-between
      gap-4
    "
			>
				<div>
					<div
						className="
        mb-2 flex flex-wrap items-center
        gap-2
      "
					>
						<Link
							className="
         text-meta font-semibold text-text-muted no-underline
         hover:text-primary-strong hover:underline
       "
							to={routePath.contentList}
						>
							유저스토리 관리
						</Link>
						<span aria-hidden="true" className="text-text-subtle">
							/
						</span>
						<Badge tone="warning">
							{isLoading ? (
								<Skeleton className="inline-block h-3 w-12 align-middle" />
							) : (
								"검수 대기"
							)}
						</Badge>
					</div>
					<h1 className="m-0 text-page-title font-bold">{title}</h1>
					<p className="mt-1 mb-0 text-meta text-text-muted">
						{isLoading ? (
							<Skeleton className="inline-block h-3.5 w-24 align-middle" />
						) : (
							"Feel the Terrain"
						)}
						· 제출된 패키지와 변경 내용을 확인합니다.
					</p>
				</div>
				<Link
					className="font-semibold text-primary-strong underline-offset-4 hover:underline"
					to={routePath.content(recordId)}
				>
					스토리 편집 화면
				</Link>
			</header>
			<SegmentedControl
				ariaLabel="검수 화면 유형"
				optionList={reviewModeOptionList}
				value={mode}
				onChange={chooseMode}
			/>
			{isLoading ? (
				<div
					className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.7fr)]"
					aria-label="검수 화면 불러오는 중"
					aria-busy="true"
				>
					<p className="sr-only" role="status">
						검수 데이터를 불러오고 있습니다.
					</p>
					<div className="grid gap-5">
						<section
							className="
         grid gap-4 rounded-xl border
         border-border bg-surface p-5
       "
						>
							<div
								className="
          flex flex-wrap items-center justify-between
          gap-3
        "
							>
								<h2 className="m-0 text-subtitle font-semibold">
									{mode === "submission"
										? "신규 제출 패키지"
										: "게시본과 제출본 비교"}
								</h2>
								<Badge tone="neutral">
									버전{" "}
									{isLoading ? (
										<Skeleton className="inline-block h-3 w-4 align-middle" />
									) : (
										"3"
									)}
								</Badge>
							</div>
							<div
								className="
          flex flex-wrap items-center gap-4
          rounded-lg border border-border bg-canvas
          p-4
        "
							>
								<div
									className="
           grid size-16 shrink-0 place-items-center
           rounded-md bg-primary-soft text-meta font-bold
           text-primary-strong
         "
								>
									ZIP
								</div>
								<div className="grid min-w-0 flex-1 gap-2">
									<Skeleton className="h-4 w-48 max-w-full" />
									<Skeleton className="h-3.5 w-40 max-w-full" />
								</div>
								<Button
									variant="secondary"
									disabled
									onClick={() =>
										showToast({
											message: "미리보기는 예시 화면에서 열리지 않습니다.",
										})
									}
								>
									미리보기
								</Button>
							</div>
							{mode === "version" && (
								<div className="grid gap-3 sm:grid-cols-2">
									<div
										className="
            grid gap-2 rounded-md border
            border-border p-4
          "
									>
										<span className="text-meta text-text-muted">
											게시 중인 버전
										</span>
										<Skeleton className="h-4 w-32" />
										<span className="text-meta">현재 사용자에게 노출 중</span>
									</div>
									<div
										className="
            grid gap-2 rounded-md border
            border-primary bg-primary-soft p-4
          "
									>
										<span className="text-meta text-primary-strong">
											제출 버전
										</span>
										<Skeleton className="h-4 w-32" />
										<span className="inline-flex items-center gap-1 text-meta">
											변경 요청 <Skeleton className="h-3.5 w-4" />회
										</span>
									</div>
								</div>
							)}
						</section>
						<section
							className="
         grid gap-4 rounded-xl border
         border-border bg-surface p-5
       "
						>
							<h2 className="m-0 text-subtitle font-semibold">
								{mode === "submission" ? "제출 요약" : "변경 메모"}
							</h2>
							<div className="grid gap-2" aria-label="요약 데이터 불러오는 중">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
							</div>
							<div
								className="
          grid gap-3 border-t border-border
          pt-4 sm:grid-cols-3
        "
							>
								<div className="grid content-start gap-2">
									<span className="text-meta text-text-muted">태그</span>
									<div className="flex gap-2">
										<Skeleton className="h-6 w-12 rounded-pill" />
										<Skeleton className="h-6 w-20 rounded-pill" />
									</div>
								</div>
								<div className="grid content-start gap-2">
									<span className="text-meta text-text-muted">참여 항목</span>
									<span className="inline-flex items-center gap-1 font-semibold">
										<Skeleton className="h-4 w-4" />개 연결
									</span>
								</div>
								<div className="grid content-start gap-2">
									<span className="text-meta text-text-muted">검수 요청</span>
									<Skeleton className="h-4 w-24" />
								</div>
							</div>
						</section>
						<section
							className="
         grid gap-4 rounded-xl border
         border-border bg-surface p-5
       "
						>
							<h2 className="m-0 text-subtitle font-semibold">확인 항목</h2>
							{[
								"패키지 미리보기 확인",
								"요약과 태그 확인",
								"뷰 카테고리와 좌표 확인",
								"참여 항목 연결 확인",
							].map((label) => (
								<label
									className="
           flex items-center gap-3 border-b
           border-border pb-3 last:border-0 last:pb-0
         "
									key={label}
								>
									<input
										className="size-4 accent-primary"
										type="checkbox"
										disabled
									/>
									{label}
								</label>
							))}
						</section>
					</div>
					<section
						className="
        grid content-start gap-4 rounded-xl
        border border-border bg-surface p-5
      "
					>
						<h2 className="m-0 text-subtitle font-semibold">검수 판정</h2>
						<FormField
							label="검수 의견"
							htmlFor="review-note-loading"
							hint="반려 시 작성자에게 전달할 의견을 입력합니다."
						>
							<Input
								id="review-note-loading"
								value={reviewNote}
								disabled
								placeholder="확인 의견"
								readOnly
							/>
						</FormField>
						<p className="m-0 text-meta text-text-muted">
							승인하면 게시 가능 상태가 되고, 반려하면 수정 의견과 함께
							작성자에게 돌아갑니다.
						</p>
						<div
							className="
         grid gap-2 border-t border-border
         pt-4
       "
						>
							<Button disabled>승인</Button>
							<Button variant="danger" disabled>
								반려
							</Button>
							<Link
								className="
          py-2 text-center font-semibold text-text-muted
          underline-offset-4 hover:underline
        "
								to={routePath.contentList}
							>
								목록으로 돌아가기
							</Link>
						</div>
					</section>
				</div>
			) : (
				<div
					className="
       grid min-w-0 items-start gap-5
       lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.7fr)]
     "
				>
					<div className="grid min-w-0 gap-5">
						<section
							className="
         grid gap-4 rounded-xl border
         border-border bg-surface p-5
       "
						>
							<div
								className="
          flex flex-wrap items-center justify-between
          gap-3
        "
							>
								<h2 className="m-0 text-subtitle font-semibold">
									{mode === "submission"
										? "신규 제출 패키지"
										: "게시본과 제출본 비교"}
								</h2>
								<Badge tone="neutral">버전 3</Badge>
							</div>
							<div
								className="
          flex flex-wrap items-center gap-4
          rounded-lg border border-border bg-canvas
          p-4
        "
							>
								<div
									className="
           grid size-16 shrink-0 place-items-center
           rounded-md bg-primary-soft text-meta font-bold
           text-primary-strong
         "
								>
									ZIP
								</div>
								<div className="min-w-0 flex-1">
									<strong className="block truncate">
										{recordId}_package_v3.zip
									</strong>
									<p className="mt-1 mb-0 text-meta text-text-muted">
										768 × 768 · 53KB · 제출 2026.10.28 15:40
									</p>
								</div>
								<Button
									variant="secondary"
									onClick={() =>
										showToast({
											message: "미리보기는 예시 화면에서 열리지 않습니다.",
										})
									}
								>
									미리보기
								</Button>
							</div>
							{mode === "version" && (
								<div className="grid gap-3 sm:grid-cols-2">
									<div
										className="
            grid gap-2 rounded-md border
            border-border p-4
          "
									>
										<span className="text-meta text-text-muted">
											게시 중인 버전
										</span>
										<strong>v2 · 2026.10.14</strong>
										<span className="text-meta">현재 사용자에게 노출 중</span>
									</div>
									<div
										className="
            grid gap-2 rounded-md border
            border-primary bg-primary-soft p-4
          "
									>
										<span className="text-meta text-primary-strong">
											제출 버전
										</span>
										<strong>v3 · 2026.10.28</strong>
										<span className="text-meta">변경 요청 3회</span>
									</div>
								</div>
							)}
						</section>
						<section
							className="
         grid gap-4 rounded-xl border
         border-border bg-surface p-5
       "
						>
							<h2 className="m-0 text-subtitle font-semibold">
								{mode === "submission" ? "제출 요약" : "변경 메모"}
							</h2>
							<p className="m-0 text-body leading-relaxed">
								노면의 변화가 전하는 소리와 감각을 체험합니다. 참여 항목과 화면
								연결이 검수 대상입니다.
							</p>
							<div
								className="
          grid gap-3 border-t border-border
          pt-4 sm:grid-cols-3
        "
							>
								<div>
									<span className="text-meta text-text-muted">태그</span>
									<div className="mt-2 flex flex-wrap gap-2">
										<Badge tone="primary">BoF</Badge>
										<Badge tone="neutral">아웃도어</Badge>
									</div>
								</div>
								<div>
									<span className="text-meta text-text-muted">참여 항목</span>
									<strong className="mt-2 block">2개 연결</strong>
								</div>
								<div>
									<span className="text-meta text-text-muted">검수 요청</span>
									<strong className="mt-2 block">2026.10.28</strong>
								</div>
							</div>
						</section>
						<section
							className="
         grid gap-4 rounded-xl border
         border-border bg-surface p-5
       "
						>
							<h2 className="m-0 text-subtitle font-semibold">확인 항목</h2>
							{[
								"패키지 미리보기 확인",
								"요약과 태그 확인",
								"뷰 카테고리와 좌표 확인",
								"참여 항목 연결 확인",
							].map((label) => (
								<label
									className="
           flex items-center gap-3 border-b
           border-border pb-3 last:border-0 last:pb-0
         "
									key={label}
								>
									<input className="size-4 accent-primary" type="checkbox" />
									{label}
								</label>
							))}
						</section>
					</div>
					<aside
						className="
        sticky top-5 grid gap-4
        rounded-xl border border-border bg-surface
        p-5
      "
					>
						<h2 className="m-0 text-subtitle font-semibold">검수 판정</h2>
						<FormField
							label="검수 의견"
							htmlFor="review-note"
							hint="반려 시 작성자에게 전달할 의견을 입력합니다."
						>
							<Input
								id="review-note"
								value={reviewNote}
								onChange={(event) => setReviewNote(event.currentTarget.value)}
								placeholder="확인 의견"
							/>
						</FormField>
						<p className="m-0 text-meta text-text-muted">
							승인하면 게시 가능 상태가 되고, 반려하면 수정 의견과 함께
							작성자에게 돌아갑니다.
						</p>
						<div
							className="
         grid gap-2 border-t border-border
         pt-4
       "
						>
							<Button onClick={() => openDecision("승인")}>승인</Button>
							<Button variant="danger" onClick={() => openDecision("반려")}>
								반려
							</Button>
							<Link
								className="
          py-2 text-center font-semibold text-text-muted
          underline-offset-4 hover:underline
        "
								to={routePath.contentList}
							>
								목록으로 돌아가기
							</Link>
						</div>
					</aside>
				</div>
			)}
		</section>
	);
};
