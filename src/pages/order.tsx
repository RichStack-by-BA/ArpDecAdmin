import { CONFIG } from 'src/config-global';
import { OrdersView } from 'src/sections/order/view';

export default function Page() {
  return (
    <>
      <title>{`Orders - ${CONFIG.appName}`}</title>
      <OrdersView />
    </>
  );
}
