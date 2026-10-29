import { Link } from "react-router-dom";
import { routePath } from "@/route/route-paths";

export const DemoAccountAccessDeniedPage = () => (
	<section
		className="
    grid w-full min-h-[50dvh] content-center
    justify-items-center
  "
	>
		<div
			className="
     grid w-full max-w-140 justify-items-center
     gap-4 text-center
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
			<h1 className="m-0 text-page-title font-bold">
				계정 관리 권한이 없습니다
			</h1>
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
		</div>
	</section>
);
