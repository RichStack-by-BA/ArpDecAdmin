import { useEffect } from 'react';

import { useSelector } from 'react-redux';

// ----------------------------------------------------------------------

import { useNavigate } from 'react-router-dom';
import { CONFIG } from 'src/config-global';
import { AdminView } from 'src/sections/admin/view';

export default function Page() {
  const { userDetails } = useSelector((state: any) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (userDetails && userDetails?.user?.role !== 'super_admin') {
      navigate('/', { replace: true });
    }
  }, [userDetails, navigate]);

  if (!userDetails || userDetails?.user?.role !== 'super_admin') {
    return null;
  }

  return (
    <>
      <title>{`Admins - ${CONFIG.appName}`}</title>
      <AdminView />
    </>
  );
}
