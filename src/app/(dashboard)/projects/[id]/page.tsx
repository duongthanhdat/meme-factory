"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProject, useCharacters, useMemes } from "@/lib/use-store";
import Sidebar from "@/components/layout/sidebar";
import Card, { CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Users, Image, Zap, TrendingUp, Plus, ArrowRight, UserPlus, Trash2 } from "lucide-react";
import { POINT_PACKAGES, formatVND } from "@/lib/point-pricing";

interface ProjectMember {
  user_id: string;
  email: string;
  role: string;
  is_owner: boolean;
}

interface ProjectWalletTransaction {
  id: string;
  amount: number;
  type: "topup" | "payment" | "refund";
  description: string | null;
  created_at: string;
}

export default function ProjectOverviewPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

  const { project, loading: projLoading } = useProject(projectId);
  const { characters, loading: charsLoading } = useCharacters(projectId);
  const { memes, loading: memesLoading } = useMemes(projectId);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberBusy, setMemberBusy] = useState(false);
  const [projectPoints, setProjectPoints] = useState(0);
  const [projectTx, setProjectTx] = useState<ProjectWalletTransaction[]>([]);
  const [walletBusy, setWalletBusy] = useState(false);

  const loading = projLoading || charsLoading || memesLoading;

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      const data = await res.json();
      if (!res.ok) return;
      setMembers(data.members || []);
      setIsOwner(Boolean(data.isOwner));
    } catch {
      // ignore
    }
  };

  const fetchProjectWallet = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/wallet`);
      const data = await res.json();
      if (!res.ok) return;
      setProjectPoints(Number(data.points || 0));
      setProjectTx((data.transactions || []) as ProjectWalletTransaction[]);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!projectId) return;
    fetchMembers();
    fetchProjectWallet();
  }, [projectId]);

  const addMember = async () => {
    const email = memberEmail.trim();
    if (!email) return;
    setMemberBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || "Không thể thêm thành viên");
      } else {
        setMemberEmail("");
        fetchMembers();
      }
    } finally {
      setMemberBusy(false);
    }
  };

  const removeMember = async (userId: string) => {
    const ok = window.confirm("Xoá thành viên này khỏi dự án?");
    if (!ok) return;
    setMemberBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || "Không thể xoá thành viên");
      } else {
        fetchMembers();
      }
    } finally {
      setMemberBusy(false);
    }
  };

  const topupProjectWallet = async (packageId: string) => {
    setWalletBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || "Không thể nạp ví dự án");
      } else {
        fetchProjectWallet();
      }
    } finally {
      setWalletBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar projectId={projectId} />
        <main className="ml-0 md:ml-64 flex-1 p-4 pt-16 md:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 th-bg-tertiary rounded-lg" />
            <div className="grid grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => <div key={i} className="h-28 th-bg-card rounded-2xl" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <p className="th-text-tertiary">Không tìm thấy dự án</p>
      </div>
    );
  }

  const weekMemes = memes.filter((m) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(m.created_at) > weekAgo;
  });

  const stats = [
    { label: "Nhân vật", value: characters.length, icon: Users, color: "violet" },
    { label: "Meme đã tạo", value: memes.length, icon: Image, color: "blue" },
    { label: "Tuần này", value: weekMemes.length, icon: TrendingUp, color: "green" },
  ];

  return (
    <div className="flex">
      <Sidebar projectId={projectId} projectName={project.name} />
      <main className="ml-0 md:ml-64 flex-1 p-4 pt-16 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold th-text-primary">{project.name}</h1>
          {project.description && <p className="th-text-tertiary mt-1">{project.description}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                  background: stat.color === "green" ? "var(--success-light)" : "var(--accent-light)"
                }}>
                  <stat.icon size={22} style={{
                    color: stat.color === "green" ? "var(--success)" : "var(--accent)"
                  }} />
                </div>
                <div>
                  <p className="text-2xl font-bold th-text-primary">{stat.value}</p>
                  <p className="text-sm th-text-tertiary">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-8">
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold th-text-primary">Ví dự án</h2>
                <span className="text-sm th-text-muted">{projectPoints.toLocaleString("vi-VN")} pts</span>
              </div>

              {isOwner && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {POINT_PACKAGES.slice(0, 4).map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => topupProjectWallet(pkg.id)}
                      disabled={walletBusy}
                      className="p-3 rounded-xl border text-left th-bg-hover disabled:opacity-60"
                      style={{ borderColor: "var(--border-primary)" }}
                    >
                      <p className="text-xs font-semibold th-text-primary">{pkg.name}</p>
                      <p className="text-xs th-text-muted">+{pkg.points} pts</p>
                      <p className="text-xs th-text-secondary mt-1">{formatVND(pkg.price)}</p>
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {projectTx.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "var(--bg-tertiary)" }}>
                    <div>
                      <p className="text-sm th-text-primary">{tx.description || tx.type}</p>
                      <p className="text-xs th-text-muted">{new Date(tx.created_at).toLocaleString("vi-VN")}</p>
                    </div>
                    <span className="text-sm font-semibold th-text-primary">{tx.type === "payment" ? "-" : "+"}{tx.amount} pts</span>
                  </div>
                ))}
                {projectTx.length === 0 && (
                  <p className="text-sm th-text-muted">Chưa có giao dịch ví dự án.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <Card hover onClick={() => router.push(`/projects/${projectId}/generate`)}>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Zap size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold th-text-primary">Tạo Meme mới</h3>
                  <p className="text-sm th-text-tertiary">Nhập ý tưởng và để AI làm phép</p>
                </div>
              </div>
              <ArrowRight size={18} className="th-text-muted" />
            </CardContent>
          </Card>

          <Card hover onClick={() => router.push(`/projects/${projectId}/characters`)}>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <Plus size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold th-text-primary">Quản lý nhân vật</h3>
                  <p className="text-sm th-text-tertiary">Thêm hoặc chỉnh sửa nhân vật và biểu cảm</p>
                </div>
              </div>
              <ArrowRight size={18} className="th-text-muted" />
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold th-text-primary">Thành viên dự án</h2>
                <span className="text-xs th-text-muted">{members.length} người</span>
              </div>

              {isOwner && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Nhập email để thêm vào dự án"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl text-sm th-bg-card th-text-primary"
                    style={{ border: "1px solid var(--border-primary)" }}
                  />
                  <Button onClick={addMember} disabled={!memberEmail.trim() || memberBusy}>
                    <UserPlus size={14} /> Thêm thành viên
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                {members.map((m) => (
                  <div
                    key={m.user_id}
                    className="flex items-center justify-between rounded-xl px-3 py-2"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <div>
                      <p className="text-sm th-text-primary">{m.email}</p>
                      <p className="text-xs th-text-muted">{m.is_owner ? "Owner" : "Member"}</p>
                    </div>
                    {isOwner && !m.is_owner && (
                      <button
                        onClick={() => removeMember(m.user_id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                        style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}
                        disabled={memberBusy}
                      >
                        <Trash2 size={12} /> Xoá
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Characters preview */}
        {characters.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold th-text-primary">Nhân vật</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push(`/projects/${projectId}/characters`)}>
                Xem tất cả <ArrowRight size={14} />
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {characters.slice(0, 6).map((char) => (
                <Link key={char.id} href={`/projects/${projectId}/characters/${char.id}`} className="flex-shrink-0 w-24 text-center group">
                  <div className="w-20 h-20 mx-auto th-bg-tertiary rounded-2xl overflow-hidden mb-2 flex items-center justify-center text-2xl font-bold th-text-muted transition-transform group-hover:scale-105 group-hover:ring-2 th-ring-accent">
                    {(char.avatar_url || char.poses[0]?.image_url) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={(char.avatar_url || char.poses[0]?.image_url)!} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                      char.name[0]?.toUpperCase()
                    )}
                  </div>
                  <p className="text-xs th-text-secondary truncate">{char.name}</p>
                  <p className="text-xs th-text-muted">{char.poses.length} biểu cảm</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent memes */}
        {memes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold th-text-primary">Meme gần đây</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push(`/projects/${projectId}/gallery`)}>
                Xem tất cả <ArrowRight size={14} />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {memes.slice(0, 6).map((meme) => (
                <Card key={meme.id} hover>
                  <div className="aspect-square th-bg-tertiary rounded-t-2xl overflow-hidden flex items-center justify-center">
                    {meme.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={meme.image_url} alt={(meme.generated_content as { headline?: string })?.headline || meme.original_idea} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Image size={24} className="mx-auto th-text-muted mb-2" />
                        <p className="text-xs th-text-tertiary line-clamp-2">
                          {(meme.generated_content as { headline?: string })?.headline || meme.original_idea}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs th-text-tertiary truncate">{meme.original_idea}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
