import { CONFIG } from 'src/config-global';

import { OfferView } from 'src/sections/offer/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Offers - ${CONFIG.appName}`}</title>

      <OfferView />
    </>
  );
}
