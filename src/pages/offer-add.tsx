import { CONFIG } from 'src/config-global';

import { AddOfferView } from 'src/sections/offer/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Add Offer - ${CONFIG.appName}`}</title>

      <AddOfferView />
    </>
  );
}
