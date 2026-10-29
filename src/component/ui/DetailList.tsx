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
	<dl className="dix-detail-list">
		{itemList.map((item) => (
			<Fragment key={item.key}>
				<dt>{item.label}</dt>
				<dd>{item.value}</dd>
			</Fragment>
		))}
	</dl>
);
