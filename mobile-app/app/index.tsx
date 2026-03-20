import { Redirect } from "expo-router";
import { useAuth } from "@/providers/auth-provider";

export default function IndexPage() {
  const { loading, session } = useAuth();

  if (loading) return null;
  return <Redirect href={session ? "/(tabs)/projects" : "/sign-in"} />;
}
