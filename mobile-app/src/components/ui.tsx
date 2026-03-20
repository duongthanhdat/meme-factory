import type { PropsWithChildren, ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

export function Screen({ children }: PropsWithChildren) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
      style={{ flex: 1, backgroundColor: "#f4f4f5" }}
    >
      {children}
    </ScrollView>
  );
}

export function Card({ children }: PropsWithChildren) {
  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: "#e4e4e7",
      }}
    >
      {children}
    </View>
  );
}

export function Title({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <Text selectable style={{ fontSize: 22, fontWeight: "700", color: "#18181b", flex: 1 }}>{children}</Text>
      {right}
    </View>
  );
}

export function Subtle({ children }: PropsWithChildren) {
  return <Text selectable style={{ color: "#71717a", lineHeight: 20 }}>{children}</Text>;
}

export function Button({
  children,
  onPress,
  variant = "primary",
  disabled,
  loading,
}: PropsWithChildren<{ onPress?: () => void; variant?: "primary" | "secondary" | "ghost"; disabled?: boolean; loading?: boolean }>) {
  const backgroundColor = variant === "primary" ? "#6d28d9" : variant === "secondary" ? "#18181b" : "#ffffff";
  const color = variant === "ghost" ? "#18181b" : "#ffffff";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        minHeight: 48,
        borderRadius: 16,
        backgroundColor,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        borderWidth: variant === "ghost" ? 1 : 0,
        borderColor: "#d4d4d8",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {loading ? <ActivityIndicator color={color} /> : <Text style={{ color, fontWeight: "700" }}>{children}</Text>}
    </Pressable>
  );
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text selectable style={{ fontSize: 13, color: "#52525b", fontWeight: "600" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        style={{
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#d4d4d8",
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 14 : 12,
          minHeight: multiline ? 96 : 48,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

export function StatRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
      <Text selectable style={{ color: "#71717a" }}>{label}</Text>
      <Text selectable style={{ color: "#18181b", fontWeight: "700", fontVariant: ["tabular-nums"] }}>{value}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: active ? "#ede9fe" : "#ffffff",
        borderWidth: 1,
        borderColor: active ? "#7c3aed" : "#d4d4d8",
      }}
    >
      <Text selectable style={{ color: active ? "#6d28d9" : "#18181b", fontSize: 12, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <Text selectable style={{ fontSize: 16, fontWeight: "700", color: "#18181b" }}>{title}</Text>
      <Subtle>{description}</Subtle>
    </Card>
  );
}
