import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Header from "@/components/Header";

import type { AuthContext } from "../auth";
import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
  auth: AuthContext;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Header />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <Outlet />
      </div>
      <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
    </>
  ),
});
