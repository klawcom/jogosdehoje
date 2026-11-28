// Supabase Edge Function: send-push-notifications
// Dispara notificações push Web Push (VAPID) para celulares mesmo com app fechado
// Pode ser executada via cron periodicamente (a cada 2 a 5 minutos)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC_KEY =
  Deno.env.get("VAPID_PUBLIC_KEY") ||
  "BORP976UD3nMq3bDhp5Xc0JAbecKXE1hZJUZu8erhoaB7xdigzTYuOBKKXlIKnxsYezhXltsHP73vUks64fU6xo";

const VAPID_PRIVATE_KEY =
  Deno.env.get("VAPID_PRIVATE_KEY") ||
  "zbkQyL0OKfyVVCxb3HWvK0QRQBX7ltyYOQO2MojQNjo";

const VAPID_SUBJECT =
  Deno.env.get("VAPID_SUBJECT") || "mailto:contato@jogosdehoje.com.br";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

function getBrasiliaDateAndMinutes(): { dateStr: string; currentMinutes: number } {
  const now = new Date();
  const brasiliaOffset = -3 * 60; // UTC-3 em minutos
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  let bMinutes = utcMinutes + brasiliaOffset;
  if (bMinutes < 0) bMinutes += 24 * 60;

  // Data formatada YYYY-MM-DD em Brasília
  const bDate = new Date(now.getTime() - 3 * 3600 * 1000);
  const dateStr = bDate.toISOString().slice(0, 10);

  return { dateStr, currentMinutes: bMinutes };
}

function timeToMinutes(timeStr: string): number | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

serve(async (req: Request) => {
  // CORS Headers
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
      Deno.env.get("SUPABASE_ANON_KEY") ||
      "";

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Carrega todas as inscrições ativas
    const { data: subscriptions, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (subsError || !subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Nenhuma inscrição push encontrada no momento.",
          sentCount: 0,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const { dateStr: todayBrasilia, currentMinutes } = getBrasiliaDateAndMinutes();

    // 2. Busca jogos de hoje
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .eq("date", todayBrasilia);

    if (matchesError || !matches) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Nenhum jogo encontrado para hoje.",
          sentCount: 0,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;
    const expiredEndpoints: string[] = [];

    // Helper para enviar push com segurança e capturar inscrições expiradas
    const sendPushToSubscriber = async (sub: any, payload: any) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(payload)
        );
        sentCount++;
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          expiredEndpoints.push(sub.endpoint);
        } else {
          console.warn("[Push Error]", err?.message || err);
        }
      }
    };

    // -------------------------------------------------------------
    // ALERTA 1: Jogo começa em breve (entre 5 e 15 minutos)
    // -------------------------------------------------------------
    for (const match of matches) {
      const matchMin = timeToMinutes(match.time_br);
      if (matchMin === null) continue;

      const diff = matchMin - currentMinutes;
      // Se falta entre 0 e 15 minutos para começar
      if (diff >= 0 && diff <= 15) {
        const eventType = "pregame_15min";

        // Verifica se já enviamos este alerta
        const { data: alreadySent } = await supabase
          .from("sent_notifications_log")
          .select("id")
          .eq("match_id", match.id)
          .eq("event_type", eventType)
          .maybeSingle();

        if (!alreadySent) {
          const channels = Array.isArray(match.channels)
            ? match.channels.map((c: any) => c.name).join(", ")
            : "TV e Streaming";

          const home = match.team_home;
          const away = match.team_away;

          // Seleciona os usuários interessados neste jogo (por time ou por campeonato favorito)
          const matchChamp = (match.championship || "").toLowerCase();

          const interestedSubs = subscriptions.filter((sub: any) => {
            if (!sub.notify_pregame) return false;

            // 1. Alerta por Campeonato Favorito
            const champMatch =
              Array.isArray(sub.favorite_championships) &&
              sub.favorite_championships.some((c: string) => {
                const cNorm = c.toLowerCase();
                return matchChamp.includes(cNorm) || cNorm.includes(matchChamp);
              });
            if (champMatch) return true;

            // 2. Alerta por Time Favorito
            const teamMatch =
              Array.isArray(sub.favorite_teams) &&
              sub.favorite_teams.some((t: string) => {
                const tNorm = t.toLowerCase();
                return (
                  home.toLowerCase().includes(tNorm) ||
                  away.toLowerCase().includes(tNorm)
                );
              });
            if (teamMatch) return true;

            // 3. Inscrito geral sem filtros específicos
            const hasNoFilters =
              (!sub.favorite_teams || sub.favorite_teams.length === 0) &&
              (!sub.favorite_championships || sub.favorite_championships.length === 0);

            return hasNoFilters;
          });

          const title = `🔔 JOGO EM BREVE: ${home} x ${away}`;
          const body = `Bola rola às ${match.time_br}! Onde assistir: ${channels}. Toque para detalhes.`;

          for (const sub of interestedSubs) {
            await sendPushToSubscriber(sub, {
              title,
              body,
              icon: "/icon-192.png",
              badge: "/icon-192.png",
              matchId: match.id,
              url: `/?match=${match.id}`,
            });
          }

          // Grava no log para não repetir o envio
          await supabase.from("sent_notifications_log").insert({
            match_id: match.id,
            event_type: eventType,
            title,
            body,
            recipient_count: interestedSubs.length,
          });
        }
      }
    }

    // -------------------------------------------------------------
    // Limpeza de inscrições inválidas/expiradas
    // -------------------------------------------------------------
    if (expiredEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints);
    }

    return new Response(
      JSON.stringify({
        success: true,
        todayBrasilia,
        totalSubscribers: subscriptions.length,
        notificationsSent: sentCount,
        expiredCleaned: expiredEndpoints.length,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
