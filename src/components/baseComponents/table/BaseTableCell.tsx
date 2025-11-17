import type { TableCellProps } from '@mui/material/TableCell';
import TableCell from '@mui/material/TableCell';

export type BaseTableCellProps = TableCellProps;

export function BaseTableCell(props: BaseTableCellProps) {
  return <TableCell {...props} />;
}
