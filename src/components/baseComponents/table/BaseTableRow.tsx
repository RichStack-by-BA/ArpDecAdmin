import type { TableRowProps } from '@mui/material/TableRow';
import TableRow from '@mui/material/TableRow';

export type BaseTableRowProps = TableRowProps;

export function BaseTableRow(props: BaseTableRowProps) {
  return <TableRow {...props} />;
}
