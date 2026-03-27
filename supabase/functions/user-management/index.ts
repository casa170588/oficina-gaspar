import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const adminClient = createClient(supabaseUrl, serviceRoleKey);

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "") || "usuario";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData.user) return json({ error: "Unauthorized" }, 401);

    const { action, id, nome, senha, nivel, avatar_url, permissoes } = await req.json();

    if (action === "create") {
      if (!nome || !senha) return json({ error: "Nome e senha são obrigatórios" }, 400);

      const loginSeed = `${slugify(nome)}.${crypto.randomUUID().slice(0, 6)}`;
      const generatedEmail = `${loginSeed}@oficina-blu.local`;

      const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
        email: generatedEmail,
        password: senha,
        email_confirm: true,
        user_metadata: { nome },
      });

      if (createError || !createdUser.user) {
        return json({ error: createError?.message || "Erro ao criar usuário" }, 400);
      }

      const { error: profileError } = await adminClient.from("profiles").insert({
        user_id: createdUser.user.id,
        nome,
        cpf: "",
        login: generatedEmail,
        nivel: nivel || "TÉCNICO",
        avatar_url: avatar_url || null,
        permissoes: permissoes || ["dashboard","os-veiculo","os-rastreamento","gerenciar-os","estoque","estoque-pneus","patio","frota-fixa","usuarios"],
      });

      if (profileError) {
        await adminClient.auth.admin.deleteUser(createdUser.user.id);
        return json({ error: profileError.message }, 400);
      }

      return json({ ok: true, generatedEmail });
    }

    if (action === "update") {
      if (!id) return json({ error: "ID do usuário é obrigatório" }, 400);

      const { data: profile, error: profileLookupError } = await adminClient
        .from("profiles")
        .select("user_id")
        .eq("id", id)
        .single();

      if (profileLookupError) return json({ error: profileLookupError.message }, 400);

      const { error: updateProfileError } = await adminClient
        .from("profiles")
        .update({
          ...(nome ? { nome } : {}),
          ...(nivel ? { nivel } : {}),
          ...(avatar_url !== undefined ? { avatar_url } : {}),
          ...(permissoes !== undefined ? { permissoes } : {}),
        })
        .eq("id", id);

      if (updateProfileError) return json({ error: updateProfileError.message }, 400);

      if (senha && profile.user_id) {
        const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(profile.user_id, {
          password: senha,
          user_metadata: nome ? { nome } : undefined,
        });

        if (updateAuthError) return json({ error: updateAuthError.message }, 400);
      }

      return json({ ok: true });
    }

    if (action === "delete") {
      if (!id) return json({ error: "ID do usuário é obrigatório" }, 400);

      const { data: profile, error: lookupError } = await adminClient
        .from("profiles")
        .select("user_id")
        .eq("id", id)
        .single();

      if (lookupError) return json({ error: lookupError.message }, 400);

      const { error: deleteProfileError } = await adminClient.from("profiles").delete().eq("id", id);
      if (deleteProfileError) return json({ error: deleteProfileError.message }, 400);

      if (profile.user_id) {
        const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(profile.user_id);
        if (deleteAuthError) return json({ error: deleteAuthError.message }, 400);
      }

      return json({ ok: true });
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return json({ error: message }, 500);
  }
});