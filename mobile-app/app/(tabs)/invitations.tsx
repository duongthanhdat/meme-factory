import { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { apiFetch } from "@/lib/api";
import type { ProjectInvitation } from "@/types/models";
import { Button, Card, EmptyState, Screen, Subtle, Title } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function InvitationsScreen() {
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ invitations: ProjectInvitation[] }>("/api/projects/invitations");
      setInvitations(data.invitations || []);
    } catch (error) {
      Alert.alert("Không thể tải lời mời", error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const respond = async (invitationId: string, action: "accept" | "reject") => {
    try {
      await apiFetch("/api/projects/invitations", {
        method: "POST",
        body: JSON.stringify({ invitationId, action }),
      });
      void load();
    } catch (error) {
      Alert.alert("Không thể cập nhật lời mời", error instanceof Error ? error.message : "Có lỗi xảy ra");
    }
  };

  return (
    <Screen>
      <Card>
        <Title right={<Button variant="ghost" onPress={() => void load()}>{loading ? "..." : "Làm mới"}</Button>}>Lời mời dự án</Title>
        <Subtle>Nhận lời mời trên web hay mobile đều đồng bộ ngay vì dùng chung database.</Subtle>
      </Card>

      {invitations.length === 0 ? <EmptyState title="Không có lời mời" description="Khi được thêm vào dự án, bạn sẽ thấy lời mời ở đây." /> : null}

      {invitations.map((invitation) => (
        <Card key={invitation.id}>
          <Title>{invitation.project_name}</Title>
          <Subtle>Mời bởi {invitation.invited_by_email}</Subtle>
          <Subtle>{formatDate(invitation.created_at)}</Subtle>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}><Button onPress={() => void respond(invitation.id, "accept")}>Chấp nhận</Button></View>
            <View style={{ flex: 1 }}><Button variant="ghost" onPress={() => void respond(invitation.id, "reject")}>Từ chối</Button></View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
