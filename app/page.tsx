import { redirect } from "next/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const user = await getAuthUser(supabase);

  if (user) {
    redirect("/protected");
  }

  redirect("/auth/login");
}