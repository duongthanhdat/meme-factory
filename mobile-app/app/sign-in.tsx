import { useState } from "react";
import { Alert, Text } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/providers/auth-provider";
import { Button, Card, InputField, Screen, Subtle, Title } from "@/components/ui";

export default function SignInPage() {
  const { session, signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  if (session) {
    return <Redirect href="/(tabs)/projects" />;
  }

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (isSignUp) {
        await signUp(email.trim(), password);
        Alert.alert("Đăng ký thành công", "Kiểm tra email để xác nhận tài khoản nếu Supabase yêu cầu.");
      } else {
        await signIn(email.trim(), password);
      }
    } catch (error) {
      Alert.alert("Không thể tiếp tục", error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Card>
        <Title>AIDA Mobile</Title>
        <Subtle>Dùng chung database và tài khoản với website, tập trung vào toàn bộ flow vận hành fanpage trên điện thoại.</Subtle>
      </Card>

      <Card>
        <InputField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
        <InputField label="Mật khẩu" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
        <Button onPress={handleSubmit} loading={loading}>{isSignUp ? "Tạo tài khoản" : "Đăng nhập"}</Button>
        <Text selectable onPress={() => setIsSignUp((value) => !value)} style={{ color: "#6d28d9", textAlign: "center", fontWeight: "600" }}>
          {isSignUp ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
        </Text>
      </Card>
    </Screen>
  );
}
