import type { PaperProps } from '@mui/material/Paper';
import Paper from '@mui/material/Paper';

export type BasePaperProps = PaperProps;

export function BasePaper(props: BasePaperProps) {
  return <Paper {...props} />;
}
