import { describe, expect, it } from "vitest";
import { matchPath } from "react-router-dom";
import { routePath, routerBasename } from "./route-paths";

describe("앱 내부 경로", () => {
	it("동적 식별자를 등록 pattern에 맞는 경로로 만든다", () => {
		const path = routePath.detail("entry-7");
		expect(path).toBe("/item/entry-7");
		expect(matchPath(routePath.detailPattern, path)?.params).toEqual({
			itemId: "entry-7",
		});
	});

	it("배포 basename을 앱 내부 경로에 포함하지 않는다", () => {
		expect(routerBasename).toBe("/");
		expect(routePath.overview).toBe("/overview");
		expect(routePath.component).toBe("/component");
		expect(routePath.detail("entry-7")).not.toContain("/admin/");
	});
});
