import type { SwitchProps } from '@mui/material/Switch';
import Switch from '@mui/material/Switch';

export type BaseSwitchProps = SwitchProps;

export function BaseSwitch(props: BaseSwitchProps) {
  return <Switch {...props} />;
}
