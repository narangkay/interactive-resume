import { type AppType } from "next/app";
import { Analytics } from "@vercel/analytics/react";

import { api } from "~/utils/api";
import { QueryClient, QueryClientProvider } from "react-query";

import "~/styles/globals.css";

const queryClient = new QueryClient();

const MyApp: AppType = ({ Component, pageProps }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const AnyComponent = Component as any;
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AnyComponent {...pageProps} />
      </QueryClientProvider>
      <Analytics />
    </>
  );
};

export default api.withTRPC(MyApp);
