import { Alert, Text } from "react-native";
import { useAuth } from "@/providers/auth-provider";
import { Button, Card, Screen, Title } from "@/components/ui";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <Card>
        <Title>Tài khoản</Title>
        <Text selectable style={{ fontSize: 16, fontWeight: "600", color: "#18181b" }}>{user?.email || "Chưa đăng nhập"}</Text>
      </Card>

      <Card>
        <Button variant="secondary" onPress={() => void signOut().catch((error) => Alert.alert("Không thể đăng xuất", error.message))}>Đăng xuất</Button>
      </Card>
    </Screen>
  );
}
