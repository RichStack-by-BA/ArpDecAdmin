import type { TableProps } from '@mui/material/Table';
import Table from '@mui/material/Table';

export type BaseTableProps = TableProps;

export function BaseTable(props: BaseTableProps) {
  return <Table {...props} />;
}
