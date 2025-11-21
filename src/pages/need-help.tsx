import { CONFIG } from 'src/config-global';

import { NeedHelpView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Need Help - ${CONFIG.appName}`}</title>

      <NeedHelpView />
    </>
  );
}
