import { Link } from "react-router-dom";
import { routePath } from "@/route/route-paths";

export const DemoNotFoundPage = () => (
	<section
		className="
    mx-auto grid min-h-[50dvh] max-w-140
    content-center justify-items-center gap-4 text-center
  "
	>
		<p
			className="
     m-0 text-[64px] leading-none font-bold
     tracking-[-0.06em] text-primary-strong
   "
		>
			404
		</p>
		<h1 className="m-0 text-page-title font-bold">페이지를 찾을 수 없습니다</h1>
		<p className="m-0 text-body text-text-muted">
			주소가 변경되었거나 존재하지 않는 페이지입니다.
		</p>
		<Link
			className="
     inline-flex h-10 items-center rounded-md
     bg-primary px-4 font-semibold text-on-primary
     no-underline hover:bg-primary-hover
   "
			to={routePath.overview}
		>
			대시보드로 이동
		</Link>
	</section>
);
