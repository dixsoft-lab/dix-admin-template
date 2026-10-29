// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BreadcrumbProvider } from "./BreadcrumbProvider";
import { BreadcrumbSlot } from "./BreadcrumbSlot";

afterEach(cleanup);

it("consumer link와 현재 위치를 context slot에서 렌더링한다", () => {
	// Given: consumer가 route와 link renderer를 제공한다.
	// When: shell 위치에서 slot을 렌더링한다.
	render(
		<BreadcrumbProvider
			state={{
				kind: "trail",
				itemList: [{ label: "목록", to: "/sample" }, { label: "상세" }],
			}}
			renderLink={({ to, label }) => (
				<a href={to} data-consumer-link>
					{label}
				</a>
			)}
		>
			<BreadcrumbSlot />
		</BreadcrumbProvider>,
	);
	// Then: consumer link를 사용하고 마지막 위치를 알린다.
	expect(
		screen
			.getByRole("link", { name: "목록" })
			.hasAttribute("data-consumer-link"),
	).toBe(true);
	expect(screen.getByText("상세").getAttribute("aria-current")).toBe("page");
});
