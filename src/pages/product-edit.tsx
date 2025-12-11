import { CONFIG } from 'src/config-global';

import { EditProductView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Edit Product - ${CONFIG.appName}`}</title>

      <EditProductView />
    </>
  );
}
