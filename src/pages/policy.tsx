import { CONFIG } from 'src/config-global';

import { PolicyView } from 'src/sections/policy/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Policies - ${CONFIG.appName}`}</title>

      <PolicyView />
    </>
  );
}
