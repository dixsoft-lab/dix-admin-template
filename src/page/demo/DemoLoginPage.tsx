import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/component/ui/Button";

type DemoLoginPageProps = {
	readonly onLogin: () => void;
	readonly brandLogo: ReactNode;
};

export const DemoLoginPage = ({ onLogin, brandLogo }: DemoLoginPageProps) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onLogin();
	};

	return (
		<main
			data-theme-root=""
			className="
     flex min-h-dvh flex-col items-center
     justify-center gap-4 bg-auth-canvas px-4
     pt-8 pb-18 font-sans text-body
     leading-normal text-text max-[480px]:justify-start max-[480px]:px-3
     max-[480px]:pt-5
   "
		>
			<section
				className="
      w-full max-w-95 rounded-2xl bg-surface
      px-6 pt-6 pb-8 shadow-[0_2px_8px_rgb(26_26_26/8%)]
      max-[480px]:rounded-lg max-[480px]:px-4 max-[480px]:pt-5 max-[480px]:pb-6
    "
			>
				<div className="text-center">
					{brandLogo}
					<h1
						className="
        m-0 text-dialog-title leading-none font-medium
        tracking-normal
      "
					>
						관리자 로그인
					</h1>
					<p
						className="
        mt-2 mb-0 text-meta leading-[1.6]
        text-text-secondary
      "
					>
						L1 제작사 또는 L2 관리자 계정으로 로그인해 주세요.
					</p>
				</div>
				<form className="mt-5 flex flex-col gap-3" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-1.5">
						<label
							className="text-caption leading-[1.35] font-bold"
							htmlFor="demo-login-email"
						>
							이메일
						</label>
						<input
							autoComplete="username"
							autoCapitalize="none"
							className="
         h-11 w-full rounded-[4px] border
         border-auth-border bg-surface px-4 py-3
         text-body leading-[1.35] text-text outline-none
         transition-colors duration-150 placeholder:text-text-muted hover:border-border-strong
         focus:border-text disabled:cursor-not-allowed disabled:bg-canvas disabled:text-text-muted
       "
							id="demo-login-email"
							required
							type="email"
							value={email}
							onChange={(event) => setEmail(event.currentTarget.value)}
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<label
							className="text-caption leading-[1.35] font-bold"
							htmlFor="demo-login-password"
						>
							비밀번호
						</label>
						<div className="relative">
							<input
								autoComplete="current-password"
								className="
          h-11 w-full rounded-[4px] border
          border-auth-border bg-surface px-4 py-3
          pr-16 text-body leading-[1.35] text-text
          outline-none transition-colors duration-150 placeholder:text-text-muted
          hover:border-border-strong focus:border-text disabled:cursor-not-allowed disabled:bg-canvas
          disabled:text-text-muted
        "
								id="demo-login-password"
								required
								placeholder="비밀번호 입력"
								type={isPasswordVisible ? "text" : "password"}
								value={password}
								onChange={(event) => setPassword(event.currentTarget.value)}
							/>
							<button
								aria-label={`비밀번호 ${isPasswordVisible ? "숨김" : "표시"}`}
								aria-pressed={isPasswordVisible}
								className="
          absolute top-1/2 right-1.5 -translate-y-1/2
          cursor-pointer border-0 bg-transparent px-2
          py-1.5 text-caption font-medium text-primary
          hover:underline hover:underline-offset-1 focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-focus
        "
								type="button"
								onClick={() => setIsPasswordVisible((current) => !current)}
							>
								{isPasswordVisible ? "숨기기" : "표시"}
							</button>
						</div>
					</div>
					<Button
						className="
        mt-2 h-11 w-full rounded-[4px]
        px-6 py-3 text-meta tracking-[0.7px]
        uppercase
      "
						type="submit"
					>
						로그인
					</Button>
				</form>
			</section>
			<p
				className="
      m-0 text-center text-caption leading-[1.6]
      text-text-muted
    "
			>
				로컬 demo 세션입니다. 입력값은 인증 서버로 전송되지 않습니다.
			</p>
			<p
				className="
      m-0 text-center text-caption leading-[1.6]
      text-text-muted
    "
			>
				<a
					className="text-inherit no-underline hover:text-text hover:underline"
					href="#support"
				>
					고객 지원
				</a>
				<span className="mx-1.5 text-text-subtle">·</span>
				<a
					className="text-inherit no-underline hover:text-text hover:underline"
					href="#terms"
				>
					이용약관
				</a>
				<span className="mx-1.5 text-text-subtle">·</span>
				<a
					className="text-inherit no-underline hover:text-text hover:underline"
					href="#privacy"
				>
					개인정보 처리방침
				</a>
			</p>
		</main>
	);
};
