import { CONFIG } from 'src/config-global';

import { AddTaxView } from 'src/sections/tax/view/add-tax-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Add Tax - ${CONFIG.appName}`}</title>

      <AddTaxView />
    </>
  );
}