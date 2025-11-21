import type { PaginationProps } from '@mui/material/Pagination';
import Pagination from '@mui/material/Pagination';

export function BasePagination(props: PaginationProps) {
  return <Pagination {...props} />;
}
