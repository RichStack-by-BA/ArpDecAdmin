import type { FormControlLabelProps } from '@mui/material/FormControlLabel';
import FormControlLabel from '@mui/material/FormControlLabel';

export type BaseFormControlLabelProps = FormControlLabelProps;

export function BaseFormControlLabel(props: BaseFormControlLabelProps) {
  return <FormControlLabel {...props} />;
}
