import type { CircularProgressProps } from '@mui/material/CircularProgress';
import CircularProgress from '@mui/material/CircularProgress';

export type BaseCircularProgressProps = CircularProgressProps;

export function BaseCircularProgress(props: BaseCircularProgressProps) {
  return <CircularProgress {...props} />;
}
