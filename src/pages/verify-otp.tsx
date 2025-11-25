import { CONFIG } from 'src/config-global';

import { VerifyOtpView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Verify OTP - ${CONFIG.appName}`}</title>

      <VerifyOtpView />
    </>
  );
}
