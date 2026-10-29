import { describe, expect, it } from "vitest";
import { matchPath } from "react-router-dom";
import { adminRoutePath, adminRouterBasename } from "./index";

describe("앱 내부 경로", () => {
	it("동적 식별자를 등록 pattern에 맞는 경로로 만든다", () => {
		const path = adminRoutePath.detail("entry-7");
		expect(path).toBe("/item/entry-7");
		expect(matchPath(adminRoutePath.detailPattern, path)?.params).toEqual({
			itemId: "entry-7",
		});
	});

	it("배포 basename을 앱 내부 경로에 포함하지 않는다", () => {
		expect(adminRouterBasename).toBe("/");
		expect(adminRoutePath.overview).toBe("/overview");
		expect(adminRoutePath.detail("entry-7")).not.toContain("/admin/");
	});
});
