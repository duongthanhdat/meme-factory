import { Tabs } from "expo-router";
import { AuthGuard } from "@/components/auth-guard";

export default function TabsLayout() {
  return (
    <AuthGuard>
      <Tabs screenOptions={{ headerTitleStyle: { fontWeight: "700" } }}>
        <Tabs.Screen name="projects" options={{ title: "Dự án" }} />
        <Tabs.Screen name="invitations" options={{ title: "Lời mời" }} />
        <Tabs.Screen name="wallet" options={{ title: "Ví" }} />
        <Tabs.Screen name="profile" options={{ title: "Tài khoản" }} />
      </Tabs>
    </AuthGuard>
  );
}
