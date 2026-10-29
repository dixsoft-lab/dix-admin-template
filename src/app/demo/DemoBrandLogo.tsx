export const DemoBrandLogo = ({
	className = "h-8 w-8",
}: {
	readonly className?: string;
}) => (
	<svg
		viewBox="0 0 32 32"
		className={className}
		aria-hidden="true"
		focusable="false"
	>
		<rect x="1" y="1" width="30" height="30" rx="9" className="fill-primary" />
		<path
			d="M9 8h7a8 8 0 0 1 0 16H9V8Zm5 4v8h2a4 4 0 0 0 0-8h-2Z"
			className="fill-white"
			fillRule="evenodd"
			clipRule="evenodd"
		/>
		<circle cx="24" cy="8" r="3" className="fill-positive" />
	</svg>
);
