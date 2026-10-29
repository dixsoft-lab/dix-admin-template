import { Fragment, type ReactNode } from "react";

export type DetailItem = {
	readonly key: string;
	readonly label: string;
	readonly value: ReactNode;
};

export const DetailList = ({
	itemList,
}: {
	readonly itemList: readonly DetailItem[];
}) => (
	<dl className="m-0 grid grid-cols-[minmax(120px,1fr)_3fr] max-[600px]:grid-cols-[minmax(90px,1fr)_2fr]">
		{itemList.map((item) => (
			<Fragment key={item.key}>
				<dt className="m-0 [overflow-wrap:anywhere] border-b border-border bg-surface-muted p-4 text-text-muted max-[600px]:p-3">
					{item.label}
				</dt>
				<dd className="m-0 [overflow-wrap:anywhere] border-b border-border p-4 max-[600px]:p-3">
					{item.value}
				</dd>
			</Fragment>
		))}
	</dl>
);
