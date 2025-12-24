// import { useEffect } from 'react';

import { useSelector } from 'react-redux';

// ----------------------------------------------------------------------

// import { useNavigate } from 'react-router-dom';
import { CONFIG } from 'src/config-global';
import { AdminView } from 'src/sections/admin/view';

export default function Page() {
  // Route protection should be handled by route guards (ProtectedRoute/PublicRoute)
  return (
    <>
      <title>{`Admins - ${CONFIG.appName}`}</title>
      <AdminView />
    </>
  );
}
