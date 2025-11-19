import type { CardProps } from '@mui/material/Card';
import Card from '@mui/material/Card';

export type BaseCardProps = CardProps;

export function BaseCard(props: BaseCardProps) {
  return <Card {...props} />;
}
