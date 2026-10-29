import { useState } from "react";
import { Input } from "@/component/ui/Input";
import { FormField } from "@/component/ui/FormField";
import { PendingButton } from "@/component/ui/PendingButton";
import { Skeleton } from "@/component/ui/Skeleton";
import type { DemoFormState } from "./demo-record";
import { useDemoLoading } from "./useDemoLoading";

export type DemoFormPageProps = {
	readonly state: DemoFormState;
	readonly onSubmit: (name: string, simulateError: boolean) => void;
};

export const DemoFormPage = ({ state, onSubmit }: DemoFormPageProps) => {
	const [name, setName] = useState("");
	const [simulateError, setSimulateError] = useState(false);
	const isLoading = useDemoLoading("create");
	return (
		<section
			className="
     grid gap-4 p-6 [&_h1]:m-0
     [&_p]:m-0
   "
		>
			<h1 className="text-page-title font-bold">새 항목</h1>
			{isLoading ? (
				<div
					className="grid max-w-120 gap-4"
					aria-label="새 항목 입력 화면 불러오는 중"
					aria-busy="true"
				>
					<span className="sr-only" role="status">
						300ms 뒤 입력 화면이 표시됩니다.
					</span>
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-4 w-40" />
					<Skeleton className="h-10 w-24" />
				</div>
			) : (
				<>
					<form
						className="grid max-w-120 gap-4"
						onSubmit={(event) => {
							event.preventDefault();
							if (name.trim()) onSubmit(name.trim(), simulateError);
						}}
					>
						<FormField label="이름" htmlFor="demo-name" required>
							<Input
								id="demo-name"
								value={name}
								required
								maxLength={100}
								disabled={state === "pending"}
								onChange={(event) => setName(event.target.value)}
							/>
						</FormField>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={simulateError}
								disabled={state === "pending"}
								onChange={(event) => setSimulateError(event.target.checked)}
							/>
							저장 오류 시뮬레이션
						</label>
						<PendingButton type="submit" pending={state === "pending"}>
							저장
						</PendingButton>
					</form>
					{state === "pending" && <p role="status">저장 중입니다.</p>}
					{state === "error" && (
						<p role="alert">
							예제 저장에 실패했습니다. 오류 시뮬레이션을 해제하고 다시
							시도하세요.
						</p>
					)}
					{state === "success" && <p role="status">항목을 저장했습니다.</p>}
				</>
			)}
		</section>
	);
};
