import { Stack } from "expo-router";
import { AuthProvider } from "@/providers/auth-provider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ title: "Đăng nhập" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="project/[id]" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
