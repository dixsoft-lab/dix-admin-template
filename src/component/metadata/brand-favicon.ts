const faviconTypeByExtension: Readonly<Record<string, string>> = {
	avif: "image/avif",
	gif: "image/gif",
	ico: "image/x-icon",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	svg: "image/svg+xml",
	webp: "image/webp",
};

const svgPaintPropertyList = [
	"clip-rule",
	"color",
	"display",
	"dominant-baseline",
	"fill",
	"fill-opacity",
	"fill-rule",
	"font-family",
	"font-size",
	"font-style",
	"font-weight",
	"letter-spacing",
	"opacity",
	"paint-order",
	"shape-rendering",
	"stop-color",
	"stop-opacity",
	"stroke",
	"stroke-dasharray",
	"stroke-dashoffset",
	"stroke-linecap",
	"stroke-linejoin",
	"stroke-opacity",
	"stroke-width",
	"text-anchor",
	"text-rendering",
	"transform",
	"vector-effect",
	"visibility",
	"width",
	"height",
] as const;

const getImageType = (source: string): string | undefined => {
	if (source.startsWith("data:image/svg+xml")) return "image/svg+xml";
	const path = source.split(/[?#]/, 1)[0]?.toLowerCase() ?? "";
	const extension = path.slice(path.lastIndexOf(".") + 1);
	return faviconTypeByExtension[extension];
};

const serializeSvgLogo = (svg: SVGSVGElement): string => {
	const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
	const svgStyle = window.getComputedStyle(svg);
	const sourceElementList = [svg, ...svg.querySelectorAll<SVGElement>("*")];
	const clonedElementList = [
		clonedSvg,
		...clonedSvg.querySelectorAll<SVGElement>("*"),
	];

	for (const [index, clonedElement] of clonedElementList.entries()) {
		const sourceElement = sourceElementList[index];
		if (!sourceElement) continue;

		const computedStyle = window.getComputedStyle(sourceElement);
		for (const property of svgPaintPropertyList) {
			const value = computedStyle.getPropertyValue(property);
			if (value) clonedElement.style.setProperty(property, value);
		}
		clonedElement.removeAttribute("class");
	}

	if (!clonedSvg.hasAttribute("xmlns"))
		clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	if (svgStyle.width) clonedSvg.setAttribute("width", svgStyle.width);
	if (svgStyle.height) clonedSvg.setAttribute("height", svgStyle.height);

	return new XMLSerializer().serializeToString(clonedSvg);
};

export const syncBrandFavicon = (
	document: Document,
	logoElement: HTMLElement | null,
): void => {
	const faviconSelector = "link[data-brand-favicon]";
	const existingLink =
		document.head.querySelector<HTMLLinkElement>(faviconSelector);
	const image = logoElement?.querySelector("img");
	const svg = logoElement?.querySelector("svg");
	let href: string | undefined;
	let type: string | undefined;
	let sizes: string | undefined;

	if (image) {
		href = image.currentSrc || image.src;
		type = getImageType(href);
		if (type === "image/svg+xml") sizes = "any";
		else if (image.naturalWidth > 0 && image.naturalHeight > 0)
			sizes = `${image.naturalWidth}x${image.naturalHeight}`;
	} else if (svg) {
		href = `data:image/svg+xml,${encodeURIComponent(serializeSvgLogo(svg))}`;
		type = "image/svg+xml";
		sizes = "any";
	}

	if (!href) {
		existingLink?.remove();
		return;
	}

	const link = existingLink ?? document.createElement("link");
	link.rel = "icon";
	link.setAttribute("data-brand-favicon", "");
	link.href = href;
	if (type) link.type = type;
	else link.removeAttribute("type");
	if (sizes) link.setAttribute("sizes", sizes);
	else link.removeAttribute("sizes");
	if (!existingLink) document.head.append(link);
};
