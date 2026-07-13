import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    if (typeof window !== "undefined") {
      // This project currently has one manually created Supabase account.
      // If more users are added later, replace this with an admin role check.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && location.pathname !== "/admin/login") {
        throw redirect({
          to: "/admin/login",
        });
      }
      
      if (session && location.pathname === "/admin/login") {
        throw redirect({ to: "/admin" });
      }
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return <Outlet />;
}
