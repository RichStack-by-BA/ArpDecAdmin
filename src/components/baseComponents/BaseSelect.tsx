import type { SelectProps } from '@mui/material/Select';
import Select from '@mui/material/Select';

export type BaseSelectProps = SelectProps;

export function BaseSelect(props: BaseSelectProps) {
  return <Select {...props} />;
}
