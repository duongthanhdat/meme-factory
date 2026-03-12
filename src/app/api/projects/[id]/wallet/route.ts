import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { POINT_PACKAGES } from "@/lib/point-pricing";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveProject(projectRef: string) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const query = supabase.from("projects").select("id, user_id, name").limit(1);
  const { data: project } = isUuid(projectRef)
    ? await query.eq("id", projectRef).maybeSingle()
    : await query.eq("slug", projectRef).maybeSingle();

  if (!project) {
    return { error: NextResponse.json({ error: "Project not found" }, { status: 404 }) };
  }

  return { user, project };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resolved = await resolveProject(id);
  if ("error" in resolved) return resolved.error;

  const { project } = resolved;
  const supabase = await createServerSupabase();

  const { data: wallet } = await supabase
    .from("project_wallets")
    .select("points")
    .eq("project_id", project.id)
    .maybeSingle();

  const { data: transactions } = await supabase
    .from("project_transactions")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return NextResponse.json({
    project_id: project.id,
    points: wallet?.points ?? 0,
    transactions: transactions ?? [],
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resolved = await resolveProject(id);
  if ("error" in resolved) return resolved.error;

  const { user, project } = resolved;
  if (user.id !== project.user_id) {
    return NextResponse.json({ error: "Chỉ owner mới được nạp ví dự án" }, { status: 403 });
  }

  const body = await req.json();
  const packageId = String(body?.packageId || "");
  const pkg = POINT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) {
    return NextResponse.json({ error: "Gói không hợp lệ" }, { status: 400 });
  }

  const { data: result, error } = await supabaseAdmin.rpc("atomic_buy_project_points", {
    _project_id: project.id,
    _owner_user_id: user.id,
    _price: pkg.price,
    _points_to_add: pkg.points,
    _description: `Nạp ví dự án ${project.name}: gói ${pkg.name} (+${pkg.points} points)`,
  });

  if (error) {
    return NextResponse.json({ error: "Lỗi nạp ví dự án" }, { status: 500 });
  }

  if (!result?.success) {
    if (result?.error === "Insufficient balance") {
      return NextResponse.json(
        {
          error: `Số dư cá nhân không đủ. Cần ${pkg.price.toLocaleString("vi-VN")}đ, hiện có ${Number(result?.balance ?? 0).toLocaleString("vi-VN")}đ`,
          code: "INSUFFICIENT_BALANCE",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: result?.error || "Không thể nạp ví dự án" }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    project_points: result.project_points,
    balance: result.balance,
    package: { id: pkg.id, name: pkg.name, points: pkg.points, price: pkg.price },
  });
}
