// Netlify serverless function: receives lead form -> sends to Telegram
// Token & chat id are read from environment variables (hidden, safe)
exports.handler = async (event) => {
  const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: CORS, body: "Method not allowed" };

  try {
    const data = JSON.parse(event.body || "{}");
    const name = (data.name || "").toString().slice(0, 200).trim();
    const contact = (data.contact || "").toString().slice(0, 200).trim();
    const type = (data.type || "").toString().slice(0, 200).trim();
    const brief = (data.brief || "").toString().slice(0, 2000).trim();
    const consent = data.consent === true;
    const privacyVersion = (data.privacy_version || "").toString().slice(0, 40).trim();

    // simple honeypot check (bots fill hidden field)
    if (data.website) return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };

    if (!name || !contact || !consent) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "name, contact & consent required" }) };

    const TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    if (!TOKEN || !CHAT_ID) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "server not configured" }) };

    const esc = (s) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
    const text =
      "🎬 <b>Новая заявка с сайта</b>\n\n" +
      "👤 <b>Имя:</b> " + esc(name) + "\n" +
      "📞 <b>Контакт:</b> " + esc(contact) + "\n" +
      (type ? "🎯 <b>Формат:</b> " + esc(type) + "\n" : "") +
      (brief ? "📝 <b>О проекте:</b>\n" + esc(brief) + "\n\n" : "\n") +
      "✅ <b>Согласие на обработку ПД:</b> да\n" +
      "📄 <b>Версия политики:</b> " + esc(privacyVersion || "не указана") + "\n" +
      "🕒 <b>Получено:</b> " + esc(new Date().toISOString());

    const resp = await fetch("https://api.telegram.org/bot" + TOKEN + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: "telegram failed", detail: t }) };
    }
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: String(e) }) };
  }
};
