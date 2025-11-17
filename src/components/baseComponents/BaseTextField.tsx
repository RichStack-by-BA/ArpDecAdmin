import type { TextFieldProps } from '@mui/material/TextField';
import TextField from '@mui/material/TextField';

export type BaseTextFieldProps = TextFieldProps;

export function BaseTextField(props: BaseTextFieldProps) {
  return <TextField {...props} />;
}
