import type { ReactNode } from "react";
import { useSelection } from "@/hook/useSelection";

export type TableColumn<Row> = {
	readonly key: string;
	readonly header: ReactNode;
	readonly render: (row: Row) => ReactNode;
	/** 고정 배치에서 칼럼 간 너비 비율. 하나라도 지정하면 고정 비율을 사용합니다. */
	readonly widthRatio?: number;
};
export type TableSelection<Row> = {
	readonly selectedKeyList: readonly string[];
	readonly onChange: (keyList: readonly string[]) => void;
	readonly label: string;
	readonly rowLabel: (row: Row) => string;
	/** 고정 비율 배치에서 선택 칼럼의 너비 비율. 기본값은 0.5입니다. */
	readonly widthRatio?: number;
};
export type DataTableProps<Row> = {
	readonly caption?: string;
	readonly ariaLabel?: string;
	readonly rowList: readonly Row[];
	readonly columnList: readonly TableColumn<Row>[];
	readonly rowKey: (row: Row) => string;
	readonly selection?: TableSelection<Row>;
	readonly pending?: boolean;
	readonly emptyLabel?: string;
};

export const DataTable = <Row,>({
	caption,
	ariaLabel,
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
	const hasFixedWidthRatio =
		selection?.widthRatio !== undefined ||
		columnList.some((column) => column.widthRatio !== undefined);
	const resolvedTableColumnWidthList = [
		...(selection
			? [{ key: "selection", widthRatio: selection.widthRatio ?? 0.5 }]
			: []),
		...columnList.map((column) => ({
			key: column.key,
			widthRatio: column.widthRatio ?? 1,
		})),
	].map((column) => ({
		...column,
		widthRatio:
			Number.isFinite(column.widthRatio) && column.widthRatio > 0
				? column.widthRatio
				: 1,
	}));
	const totalWidthRatio = resolvedTableColumnWidthList.reduce(
		(sum, column) => sum + column.widthRatio,
		0,
	);
	return (
		<div className="w-full overflow-x-auto">
			<table
				className={
					hasFixedWidthRatio
						? `
        w-full table-fixed border-collapse text-left
        aria-busy:opacity-60
      `
						: "w-full border-collapse text-left aria-busy:opacity-60"
				}
				aria-label={ariaLabel}
				aria-busy={pending || undefined}
			>
				{caption !== undefined && (
					<caption className="px-4 py-3 text-left font-semibold">
						{caption}
					</caption>
				)}
				{hasFixedWidthRatio && (
					<colgroup>
						{resolvedTableColumnWidthList.map((column) => (
							<col
								key={column.key}
								style={{
									width: `${(column.widthRatio / totalWidthRatio) * 100}%`,
								}}
							/>
						))}
					</colgroup>
				)}
				<thead>
					<tr>
						{selection && (
							<th
								className="
          border-b border-border bg-transparent px-4
          py-3 text-meta font-medium text-text-muted
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
          border-b border-border bg-transparent px-4
          py-3 text-meta font-medium text-text-muted
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
