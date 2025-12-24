// import { useEffect } from 'react';

import { useSelector } from 'react-redux';

// ----------------------------------------------------------------------

// import { useNavigate } from 'react-router-dom';
import { CONFIG } from 'src/config-global';
import { AddAdminView } from 'src/sections/admin/view';

export default function Page() {
  // Route protection should be handled by route guards (ProtectedRoute/PublicRoute)
  return (
    <>
      <title>{`Add Admin - ${CONFIG.appName}`}</title>
      <AddAdminView />
    </>
  );
}
