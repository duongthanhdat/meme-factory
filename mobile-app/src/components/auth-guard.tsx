import type { PropsWithChildren } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/providers/auth-provider";

export function AuthGuard({ children }: PropsWithChildren) {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f4f4f5" }}>
        <ActivityIndicator size="large" color="#6d28d9" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return children;
}
