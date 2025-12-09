import type { RadioGroupProps } from '@mui/material/RadioGroup';

import RadioGroup from '@mui/material/RadioGroup';

// ----------------------------------------------------------------------

export default function BaseRadioGroup({ ...other }: RadioGroupProps) {
  return <RadioGroup {...other} />;
}
