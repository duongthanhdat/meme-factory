import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { apiFetch } from "@/lib/api";
import type { WalletBalanceResponse } from "@/types/models";
import { Button, Card, InputField, Screen, StatRow, Subtle, Title } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function WalletScreen() {
  const [wallet, setWallet] = useState<WalletBalanceResponse | null>(null);
  const [amount, setAmount] = useState("100000");
  const [loading, setLoading] = useState(false);
  const [topup, setTopup] = useState<{ qrUrl: string; description: string; amount: number } | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<WalletBalanceResponse>("/api/wallet/balance");
      setWallet(data);
    } catch (error) {
      Alert.alert("Không thể tải ví", error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const createTopup = async () => {
    try {
      const data = await apiFetch<{ qrUrl: string; description: string; amount: number }>("/api/wallet/create-topup", {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount) }),
      });
      setTopup(data);
      void load();
    } catch (error) {
      Alert.alert("Không thể tạo đơn nạp", error instanceof Error ? error.message : "Có lỗi xảy ra");
    }
  };

  return (
    <Screen>
      <Card>
        <Title right={<Button variant="ghost" onPress={() => void load()}>{loading ? "..." : "Làm mới"}</Button>}>Ví cá nhân</Title>
        <StatRow label="Số dư" value={formatCurrency(wallet?.balance || 0)} />
        <StatRow label="Points" value={wallet?.points || 0} />
      </Card>

      <Card>
        <Title>Tạo đơn nạp tiền</Title>
        <InputField label="Số tiền" value={amount} onChangeText={setAmount} placeholder="100000" />
        <Button onPress={() => void createTopup()}>Tạo QR chuyển khoản</Button>
        {topup ? (
          <>
            <Subtle>Nội dung chuyển khoản: {topup.description}</Subtle>
            <Image source={{ uri: topup.qrUrl }} style={{ width: "100%", height: 260, borderRadius: 20 }} resizeMode="contain" />
          </>
        ) : null}
      </Card>

      <Card>
        <Title>Lịch sử gần đây</Title>
        {(wallet?.transactions || []).slice(0, 20).map((item) => (
          <View key={item.id} style={{ gap: 4, borderBottomWidth: 1, borderBottomColor: "#f4f4f5", paddingBottom: 10 }}>
            <StatRow label={item.type} value={item.amount} />
            <Text selectable style={{ color: "#18181b" }}>{item.description || "Không có mô tả"}</Text>
            <Subtle>{formatDate(item.created_at)}</Subtle>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
