import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const AnyComponent = Component as any;
  return <AnyComponent {...pageProps} />;
};

export default api.withTRPC(MyApp);
