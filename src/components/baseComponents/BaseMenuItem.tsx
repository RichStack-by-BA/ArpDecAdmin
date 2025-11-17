import type { MenuItemProps } from '@mui/material/MenuItem';
import MenuItem from '@mui/material/MenuItem';

export type BaseMenuItemProps = MenuItemProps;

export function BaseMenuItem(props: BaseMenuItemProps) {
  return <MenuItem {...props} />;
}
