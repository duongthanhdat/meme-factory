import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveProjectAndUser(projectRef: string) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const query = supabase.from("projects").select("id, user_id").limit(1);
  const { data: project } = isUuid(projectRef)
    ? await query.eq("id", projectRef).maybeSingle()
    : await query.eq("slug", projectRef).maybeSingle();

  if (!project) {
    return { error: NextResponse.json({ error: "Project not found" }, { status: 404 }) };
  }

  return { supabase, user, project };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resolved = await resolveProjectAndUser(id);
  if ("error" in resolved) return resolved.error;

  const { user, project } = resolved;

  const { data: memberships } = await supabaseAdmin
    .from("project_members")
    .select("user_id, role, created_at")
    .eq("project_id", project.id)
    .order("created_at", { ascending: true });

  const ids = [project.user_id, ...(memberships || []).map((m) => m.user_id)];
  const uniqueIds = [...new Set(ids)];

  const users = await Promise.all(
    uniqueIds.map(async (uid) => {
      const { data } = await supabaseAdmin.auth.admin.getUserById(uid);
      return {
        user_id: uid,
        email: data.user?.email || "N/A",
      };
    })
  );

  const emailById = Object.fromEntries(users.map((u) => [u.user_id, u.email]));

  const owner = {
    user_id: project.user_id,
    email: emailById[project.user_id] || "N/A",
    role: "owner",
    is_owner: true,
  };

  const members = (memberships || [])
    .filter((m) => m.user_id !== project.user_id)
    .map((m) => ({
      user_id: m.user_id,
      email: emailById[m.user_id] || "N/A",
      role: m.role,
      is_owner: false,
    }));

  return NextResponse.json({
    isOwner: user.id === project.user_id,
    members: [owner, ...members],
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resolved = await resolveProjectAndUser(id);
  if ("error" in resolved) return resolved.error;

  const { user, project } = resolved;
  if (user.id !== project.user_id) {
    return NextResponse.json({ error: "Chỉ owner mới được thêm thành viên" }, { status: 403 });
  }

  const body = await req.json();
  const email = String(body?.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Thiếu email" }, { status: 400 });
  }

  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const target = users.users.find((u) => (u.email || "").toLowerCase() === email);

  if (!target) {
    return NextResponse.json({ error: "Không tìm thấy user với email này" }, { status: 404 });
  }

  if (target.id === project.user_id) {
    return NextResponse.json({ error: "Owner đã có quyền sẵn" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("project_members").upsert(
    {
      project_id: project.id,
      user_id: target.id,
      role: "member",
      invited_by: user.id,
    },
    { onConflict: "project_id,user_id" }
  );

  if (error) {
    return NextResponse.json({ error: "Không thể thêm thành viên" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resolved = await resolveProjectAndUser(id);
  if ("error" in resolved) return resolved.error;

  const { user, project } = resolved;
  if (user.id !== project.user_id) {
    return NextResponse.json({ error: "Chỉ owner mới được xoá thành viên" }, { status: 403 });
  }

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Thiếu userId" }, { status: 400 });
  }
  if (userId === project.user_id) {
    return NextResponse.json({ error: "Không thể xoá owner" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("project_members")
    .delete()
    .eq("project_id", project.id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: "Không thể xoá thành viên" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
