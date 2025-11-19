import type { InputLabelProps } from '@mui/material/InputLabel';
import InputLabel from '@mui/material/InputLabel';

export type BaseInputLabelProps = InputLabelProps;

export function BaseInputLabel(props: BaseInputLabelProps) {
  return <InputLabel {...props} />;
}
