import { CONFIG } from 'src/config-global';

import { CustomerView } from 'src/sections/customer/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Customers - ${CONFIG.appName}`}</title>

      <CustomerView />
    </>
  );
}
