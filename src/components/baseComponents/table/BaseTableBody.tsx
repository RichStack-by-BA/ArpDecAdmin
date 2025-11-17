import type { TableBodyProps } from '@mui/material/TableBody';
import TableBody from '@mui/material/TableBody';

export type BaseTableBodyProps = TableBodyProps;

export function BaseTableBody(props: BaseTableBodyProps) {
  return <TableBody {...props} />;
}
