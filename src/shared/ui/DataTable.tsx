import type { ReactNode } from "react";
import { useSelection } from "@admin/shared/lib";

export type TableColumn<Row> = {
	readonly key: string;
	readonly header: ReactNode;
	readonly render: (row: Row) => ReactNode;
};
export type TableSelection<Row> = {
	readonly selectedKeyList: readonly string[];
	readonly onChange: (keyList: readonly string[]) => void;
	readonly label: string;
	readonly rowLabel: (row: Row) => string;
};
export type DataTableProps<Row> = {
	readonly caption: string;
	readonly rowList: readonly Row[];
	readonly columnList: readonly TableColumn<Row>[];
	readonly rowKey: (row: Row) => string;
	readonly selection?: TableSelection<Row>;
	readonly pending?: boolean;
	readonly emptyLabel?: string;
};

export const DataTable = <Row,>({
	caption,
	rowList,
	columnList,
	rowKey,
	selection,
	pending,
	emptyLabel = "표시할 항목이 없습니다.",
}: DataTableProps<Row>) => {
	const { selectedKeySet, isAllSelected, isPartlySelected, toggle, toggleAll } =
		useSelection({
			keyList: rowList.map(rowKey),
			selectedKeyList: selection?.selectedKeyList ?? [],
			onChange: (keyList) => selection?.onChange(keyList),
		});
	return (
		<div className="dix-table-scroll">
			<table className="dix-table" aria-busy={pending || undefined}>
				<caption>{caption}</caption>
				<thead>
					<tr>
						{selection && (
							<th scope="col">
								<input
									type="checkbox"
									aria-label={selection.label}
									disabled={pending || rowList.length === 0}
									checked={isAllSelected}
									ref={(element) => {
										if (element) element.indeterminate = isPartlySelected;
									}}
									onChange={toggleAll}
								/>
							</th>
						)}
						{columnList.map((column) => (
							<th key={column.key} scope="col">
								{column.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rowList.map((row) => {
						const key = rowKey(row);
						return (
							<tr
								key={key}
								data-selected={selectedKeySet.has(key) || undefined}
							>
								{selection && (
									<td>
										<input
											type="checkbox"
											aria-label={selection.rowLabel(row)}
											checked={selectedKeySet.has(key)}
											disabled={pending}
											onChange={() => toggle(key)}
										/>
									</td>
								)}
								{columnList.map((column) => (
									<td key={column.key}>{column.render(row)}</td>
								))}
							</tr>
						);
					})}
					{rowList.length === 0 && (
						<tr>
							<td colSpan={columnList.length + (selection ? 1 : 0)}>
								{emptyLabel}
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};
