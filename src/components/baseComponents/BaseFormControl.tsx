import type { FormControlProps } from '@mui/material/FormControl';
import FormControl from '@mui/material/FormControl';

export type BaseFormControlProps = FormControlProps;

export function BaseFormControl(props: BaseFormControlProps) {
  return <FormControl {...props} />;
}
