import { CONFIG } from 'src/config-global';

import { TaxView } from 'src/sections/tax/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Taxes - ${CONFIG.appName}`}</title>

      <TaxView />
    </>
  );
}