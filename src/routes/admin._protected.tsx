import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { supabase } from "@/lib/supabase";

export const getAuthenticatedSupabaseUser = createServerFn({ method: "GET" }).handler(async () => {
  const request = getWebRequest();
  if (!request) return null;
  
  const cookieHeader = request.headers.get("cookie");
  const match = cookieHeader?.match(/sb-access-token=([^;]+)/);
  const token = match ? match[1] : null;
  
  if (!token) return null;
  
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  
  return data.user;
});

export const Route = createFileRoute("/admin/_protected")({
  beforeLoad: async ({ location }) => {
    // Run the server-side validation using the secure cookie parser
    const user = await getAuthenticatedSupabaseUser();
    
    if (!user) {
      throw redirect({
        to: "/admin/login",
      });
    }
  },
  component: AdminProtectedLayout,
});

function AdminProtectedLayout() {
  return <Outlet />;
}
