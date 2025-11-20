import type { DialogProps } from '@mui/material/Dialog';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export interface BaseDialogProps extends DialogProps {}

export function BaseDialog({ children, ...props }: BaseDialogProps) {
  return <Dialog {...props}>{children}</Dialog>;
}

BaseDialog.Title = DialogTitle;
BaseDialog.Content = DialogContent;
BaseDialog.Actions = DialogActions;
