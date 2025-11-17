import type { TableHeadProps } from '@mui/material/TableHead';
import TableHead from '@mui/material/TableHead';

export type BaseTableHeadProps = TableHeadProps;

export function BaseTableHead(props: BaseTableHeadProps) {
  return <TableHead {...props} />;
}
