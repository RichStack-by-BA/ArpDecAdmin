import type { AlertProps } from '@mui/material/Alert';
import Alert from '@mui/material/Alert';

export type BaseAlertProps = AlertProps;

export function BaseAlert(props: BaseAlertProps) {
  return <Alert {...props} />;
}
