import { CONFIG } from 'src/config-global';

import { OverviewAnalyticsView as DashboardView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Dashboard - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="Manage your Arpan Decores inventory, orders, and customers with our comprehensive admin dashboard"
      />
      <meta name="keywords" content="arpan decores,home decor,furniture,interior design,admin dashboard,inventory management,order management,customer management,ecommerce admin" />

      <DashboardView />
    </>
  );
}
