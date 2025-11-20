import { CONFIG } from 'src/config-global';

import { AddCategoryView } from 'src/sections/category/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Add Category - ${CONFIG.appName}`}</title>

      <AddCategoryView />
    </>
  );
}
