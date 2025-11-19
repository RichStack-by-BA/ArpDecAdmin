import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';

export type BaseBoxProps = BoxProps & {
  component?: React.ElementType;
  src?: string;
  alt?: string;
};

export function BaseBox(props: BaseBoxProps) {
  return <Box {...props} />;
}
