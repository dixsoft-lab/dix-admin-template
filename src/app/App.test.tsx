import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { App } from "./App";
it("독립 앱의 기본 화면을 렌더링한다", () => {
	const html = renderToStaticMarkup(<App />);
	expect(html).toContain("<main>");
	expect(html).toContain("Admin Template");
});
