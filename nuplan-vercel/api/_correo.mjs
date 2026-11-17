// NuPlan · Mails a las consultantes (bloque 4): el acceso cuando Ro las da de alta y el
// aviso cuando Ro les contesta un mensaje. Salen por Resend desde rosana@nuplan.com.ar
// (la misma cuenta que Supabase usa para los códigos de entrada).
// Necesita RESEND_API_KEY en Vercel. Sin esa clave no se manda nada y se dice claro:
// lo que Ro cargó queda guardado igual.

import { registrar } from "./_lib.mjs";

const DE = () => process.env.NUPLAN_MAIL_DE || "Rosana Roldán <rosana@nuplan.com.ar>";
export const APP = () => (process.env.NUPLAN_APP_URL || "https://app.nuplan.com.ar").replace(/\/+$/, "");
export const MAIL_OK = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i;

export function esc(x) {
  return String(x == null ? "" : x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Un mail con la cara de NuPlan: título, párrafos (texto plano, se escapan) y un botón.
export function mailNuPlan({ kicker = "Programa NuPlan", titulo, parrafos = [], cita = "", boton = null, pie = "" }) {
  const H = [
    '<div style="font-family:\'DM Sans\',Helvetica,Arial,sans-serif;color:#1a1a1a;background:#fff6f3;padding:28px 16px;line-height:1.6">',
    '<div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #f6d9d1;border-radius:16px;padding:30px">',
    `<p style="margin:0 0 6px;font-size:15px;letter-spacing:2px;text-transform:uppercase;color:#c53a1e;font-weight:700">${esc(kicker)}</p>`,
    `<h1 style="margin:0 0 18px;font-size:26px;line-height:1.25">${esc(titulo)}</h1>`,
  ];
  parrafos.forEach((p) => H.push(`<p style="margin:0 0 14px;font-size:17px">${esc(p)}</p>`));
  if (cita) {
    H.push(
      '<div style="margin:6px 0 18px;padding:14px 16px;background:#fff6f3;border-left:4px solid #e8472a;border-radius:0 10px 10px 0">' +
        `<p style="margin:0;font-size:17px;white-space:pre-wrap">${esc(cita)}</p></div>`
    );
  }
  if (boton) {
    H.push(
      `<p style="margin:22px 0"><a href="${esc(boton.url)}" style="display:inline-block;background:#e8472a;color:#fff;text-decoration:none;` +
        `font-weight:700;font-size:18px;padding:15px 26px;border-radius:12px">${esc(boton.texto)}</a></p>`
    );
  }
  if (pie) H.push(`<p style="margin:22px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;font-size:15px;color:#6b7280">${esc(pie)}</p>`);
  H.push("</div></div>");
  return H.join("");
}

// { ok: true, id } · { sinConfig: true } · { ok: false, status, error }
export async function mandarMail({ para, asunto, html, texto }) {
  const clave = process.env.RESEND_API_KEY || "";
  if (!clave) {
    registrar("mail_sin_config", { asunto });
    return { sinConfig: true };
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: DE(), to: [para], subject: asunto, html, text: texto }),
      signal: AbortSignal.timeout(15000),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      registrar("mail_error", { asunto, status: r.status, error: String(j.message || j.name || "").slice(0, 200) });
      return { ok: false, status: r.status, error: j.message || "" };
    }
    return { ok: true, id: j.id || "" };
  } catch (e) {
    registrar("mail_error", { asunto, error: String((e && e.message) || e).slice(0, 200) });
    return { ok: false, status: 0, error: "sin conexión" };
  }
}
