import { CONFIG } from 'src/config-global';

import { AddPolicyView } from 'src/sections/policy/view/add-policy-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Add Policy - ${CONFIG.appName}`}</title>

      <AddPolicyView />
    </>
  );
}
