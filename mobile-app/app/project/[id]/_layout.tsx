import { Stack } from "expo-router";
import { AuthGuard } from "@/components/auth-guard";

export default function ProjectLayout() {
  return (
    <AuthGuard>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Dự án" }} />
        <Stack.Screen name="generate" options={{ title: "Tạo Meme" }} />
        <Stack.Screen name="gallery" options={{ title: "Bộ sưu tập" }} />
        <Stack.Screen name="characters" options={{ title: "Nhân vật" }} />
        <Stack.Screen name="members" options={{ title: "Thành viên" }} />
        <Stack.Screen name="wallet" options={{ title: "Ví dự án" }} />
      </Stack>
    </AuthGuard>
  );
}
