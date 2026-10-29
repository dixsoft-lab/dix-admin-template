import type { ReactNode } from "react";
import { useSelection } from "@/hook/useSelection";

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
		<div className="w-full overflow-x-auto">
			<table
				className="w-full border-collapse text-left aria-busy:opacity-60"
				aria-busy={pending || undefined}
			>
				<caption className="px-0 py-3 text-left font-semibold">
					{caption}
				</caption>
				<thead>
					<tr>
						{selection && (
							<th
								className="
          border-b border-border bg-surface-muted px-4
          py-3 text-meta font-semibold text-text-muted
        "
								scope="col"
							>
								<input
									className="size-4 accent-primary"
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
							<th
								key={column.key}
								className="
          border-b border-border bg-surface-muted px-4
          py-3 text-meta font-semibold text-text-muted
        "
								scope="col"
							>
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
								className="data-selected:bg-surface-muted"
							>
								{selection && (
									<td className="border-b border-border px-4 py-3">
										<input
											className="size-4 accent-primary"
											type="checkbox"
											aria-label={selection.rowLabel(row)}
											checked={selectedKeySet.has(key)}
											disabled={pending}
											onChange={() => toggle(key)}
										/>
									</td>
								)}
								{columnList.map((column) => (
									<td
										key={column.key}
										className="border-b border-border px-4 py-3"
									>
										{column.render(row)}
									</td>
								))}
							</tr>
						);
					})}
					{rowList.length === 0 && (
						<tr>
							<td
								className="border-b border-border px-4 py-3"
								colSpan={columnList.length + (selection ? 1 : 0)}
							>
								{emptyLabel}
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};
