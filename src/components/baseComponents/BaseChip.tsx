import type { ChipProps } from '@mui/material/Chip';
import Chip from '@mui/material/Chip';

export type BaseChipProps = ChipProps;

export function BaseChip(props: BaseChipProps) {
  return <Chip {...props} />;
}
