import type { TableContainerProps } from '@mui/material/TableContainer';
import TableContainer from '@mui/material/TableContainer';

export type BaseTableContainerProps = TableContainerProps;

export function BaseTableContainer(props: BaseTableContainerProps) {
  return <TableContainer {...props} />;
}
