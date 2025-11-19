import type { GridProps } from '@mui/material/Grid';
import Grid from '@mui/material/Grid';

export type BaseGridProps = GridProps;

export function BaseGrid(props: BaseGridProps) {
  return <Grid {...props} />;
}
