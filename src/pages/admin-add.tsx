import { CONFIG } from 'src/config-global';

import { AddAdminView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Add Admin - ${CONFIG.appName}`}</title>

      <AddAdminView />
    </>
  );
}
