import { CONFIG } from 'src/config-global';

import { AddProductView } from 'src/sections/product/view/add-product-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Add Product - ${CONFIG.appName}`}</title>

      <AddProductView />
    </>
  );
}
