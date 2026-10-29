// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Dropzone } from "./Dropzone";

afterEach(cleanup);

it("선택한 파일을 upload 없이 소비자 callback으로 전달한다", () => {
	// Given: native file input과 consumer callback을 사용한다.
	const onFileChange = vi.fn();
	const file = new File(["example"], "example.txt", { type: "text/plain" });
	render(<Dropzone label="파일 선택" onFileChange={onFileChange} />);
	// When: 파일을 선택한다.
	fireEvent.change(screen.getByLabelText("파일 선택"), {
		target: { files: [file] },
	});
	// Then: 파일 자체를 전달하며 input은 다음 선택을 받을 수 있다.
	expect(onFileChange).toHaveBeenCalledExactlyOnceWith([file]);
	expect(screen.getByLabelText<HTMLInputElement>("파일 선택").value).toBe("");
});

it("disabled dropzone은 끌어온 파일을 소비자에게 전달하지 않는다", () => {
	// Given: 비활성 file control이다.
	const onFileChange = vi.fn();
	const { container } = render(
		<Dropzone disabled label="파일 선택" onFileChange={onFileChange} />,
	);
	// When: file을 drop한다.
	const target = container.querySelector(".dix-dropzone");
	if (target === null) throw new Error("dropzone이 렌더링되지 않았습니다.");
	fireEvent.drop(target, {
		dataTransfer: { files: [new File(["a"], "a.txt")] },
	});
	// Then: callback을 호출하지 않는다.
	expect(onFileChange).not.toHaveBeenCalled();
});
