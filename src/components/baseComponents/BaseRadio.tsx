import type { RadioProps } from '@mui/material/Radio';

import Radio from '@mui/material/Radio';

// ----------------------------------------------------------------------

export default function BaseRadio({ ...other }: RadioProps) {
  return <Radio {...other} />;
}
