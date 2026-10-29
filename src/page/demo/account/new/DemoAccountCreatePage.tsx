import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useOverlay } from "@/component/overlay/useOverlay";
import { Badge } from "@/component/ui/Badge";
import { Button } from "@/component/ui/Button";
import { FormField } from "@/component/ui/FormField";
import { Input } from "@/component/ui/Input";
import { routePath } from "@/route/route-paths";

export const DemoAccountCreatePage = () => {
	const { showToast } = useOverlay();
	const [created, setCreated] = useState(false);
	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setCreated(true);
		showToast({ message: "초대 이메일을 보냈습니다. (예시)", tone: "success" });
	};
	return (
		<section className="grid w-full gap-5">
			<header>
				<h1 className="m-0 text-page-title font-bold">담당자 계정 발급</h1>
				<p className="mt-1 mb-0 text-meta text-text-muted">
					초대 메일을 받은 담당자가 비밀번호를 설정하면 계정이 활성화됩니다.
				</p>
			</header>
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
						담당자는 초대 메일에서 계정을 활성화합니다. 초대 링크는 일정 기간 뒤
						만료됩니다.
					</p>
					<Badge tone="neutral">예시 흐름</Badge>
				</aside>
			</div>
			{created && (
				<p className="m-0 text-meta text-positive" role="status">
					초대 메일 전송 상태를 표시한 예시입니다.
				</p>
			)}
		</section>
	);
};
