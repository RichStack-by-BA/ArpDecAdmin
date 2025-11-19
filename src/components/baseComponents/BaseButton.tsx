import type { ButtonProps } from '@mui/material/Button';
import Button from '@mui/material/Button';

export type BaseButtonProps = ButtonProps;

export function BaseButton(props: BaseButtonProps) {
  return <Button {...props} />;
}
