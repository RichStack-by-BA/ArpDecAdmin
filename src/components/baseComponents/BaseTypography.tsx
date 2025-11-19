import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';

export type BaseTypographyProps = TypographyProps;

export function BaseTypography(props: BaseTypographyProps) {
  return <Typography {...props} />;
}
