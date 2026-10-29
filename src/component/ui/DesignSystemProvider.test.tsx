import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { DesignSystemProvider } from "./DesignSystemProvider";
import { Input } from "./Input";
import { Skeleton } from "./Skeleton";
import type { DesignSystemComponentMap } from "./design-system-contract";
import { DesignSystemConfigurationError } from "./design-system-error";
import { resolveDesignSystem } from "./resolve-design-system";
import * as fixtureComponent from "./fixture/provider-package/index.js";

const component = fixtureComponent satisfies DesignSystemComponentMap;

it("embedded 기본 구현이 native 속성과 의미를 유지한다", () => {
	const html = renderToStaticMarkup(
		<>
			<Button disabled variant="danger">
				삭제
			</Button>
			<Input aria-label="이름" defaultValue="샘플" />
			<Badge tone="success">완료</Badge>
			<Badge tone="primary">게시 중</Badge>
			<Badge tone="quiet">비활성</Badge>
			<Skeleton shape="circle" className="size-10" animationDelay={80} />
		</>,
	);
	expect(html).toContain('type="button"');
	expect(html).toContain('disabled=""');
	expect(html).toContain('aria-label="이름"');
	expect(html).toContain('value="샘플"');
	expect(html).toContain("bg-surface-muted text-positive");
	expect(html).toContain("bg-primary-soft text-primary-strong");
	expect(html).toContain("bg-surface text-text-subtle");
	expect(html).toContain("size-10");
	expect(html).toContain("rounded-full");
	expect(html).toContain("--animation-delay:80ms");
});

it.each(["external", "workspace"] as const)(
	"%s 구현을 facade의 네 component에 전달한다",
	(mode) => {
		const html = renderToStaticMarkup(
			<DesignSystemProvider selection={{ mode, component }}>
				<Button variant="secondary">저장</Button>
				<Input aria-label="검색" />
				<Badge tone="primary">게시 중</Badge>
				<Skeleton shape="block" />
			</DesignSystemProvider>,
		);
		expect(html.match(/data-provider="fixture"/g)).toHaveLength(4);
		expect(html).toContain('data-variant="secondary"');
		expect(html).toContain('data-tone="primary"');
		expect(html).toContain('data-shape="block"');
	},
);

it("provider 중첩은 해당 React subtree에만 적용된다", () => {
	const html = renderToStaticMarkup(
		<DesignSystemProvider selection={{ mode: "external", component }}>
			<Button>외부</Button>
			<DesignSystemProvider selection={{ mode: "embedded" }}>
				<Button>내부</Button>
			</DesignSystemProvider>
		</DesignSystemProvider>,
	);
	expect(html.match(/data-provider="fixture"/g)).toHaveLength(1);
	expect(html.match(/bg-primary text-on-primary/g)).toHaveLength(1);
});

it("지원하지 않는 provider mode를 명확히 거부한다", () => {
	expect(() =>
		Reflect.apply(resolveDesignSystem, undefined, [{ mode: "invalid" }]),
	).toThrowError(DesignSystemConfigurationError);
	expect(() =>
		Reflect.apply(resolveDesignSystem, undefined, [{ mode: "invalid" }]),
	).toThrowError("invalid-provider");
});

it("외부 module의 누락 export 이름을 진단한다", () => {
	expect(() =>
		Reflect.apply(resolveDesignSystem, undefined, [
			{
				mode: "external",
				component: { Button: component.Button },
			},
		]),
	).toThrowError("external provider의 Input export가 필요합니다.");
});
