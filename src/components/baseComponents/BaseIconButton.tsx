import type { IconButtonProps } from '@mui/material/IconButton';
import IconButton from '@mui/material/IconButton';

export type BaseIconButtonProps = IconButtonProps;

export function BaseIconButton(props: BaseIconButtonProps) {
  return <IconButton {...props} />;
}
