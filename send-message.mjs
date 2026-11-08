
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client();

function env(name) {
    return globalThis.Netlify?.env?.get(name) || process.env[name];
}

function reply(data, status = 200) {
    return Response.json(data, { status });
}

export default async function sendMessage(request) {
    if (request.method !== "POST") {
        return reply({ error: "Method not allowed" }, 405);
    }

    const origin = request.headers.get("origin");

    if (origin) {
        try {
            if (new URL(origin).origin !== new URL(request.url).origin) {
                return reply({ error: "Invalid request origin" }, 403);
            }
        } catch {
            return reply({ error: "Invalid request origin" }, 403);
        }
    }

    const clientId = env("GOOGLE_CLIENT_ID");
    const resendKey = env("RESEND_API_KEY");
    const mailTo = env("MAIL_TO");
    const mailFrom = env("MAIL_FROM");

    if (!clientId || !resendKey || !mailTo || !mailFrom) {
        return reply({ error: "Email service is not configured" }, 503);
    }

    let data;

    try {
        const raw = await request.text();

        if (raw.length > 10000) {
            return reply({ error: "Request is too large" }, 413);
        }

        data = JSON.parse(raw);
    } catch {
        return reply({ error: "Invalid JSON request" }, 400);
    }

    if (data.website) {
        return reply({ ok: true });
    }

    const credential = String(data.credential || "");
    const subject = String(data.subject || "").trim();
    const message = String(data.message || "").trim();

    if (!credential || !subject || !message) {
        return reply({ error: "Please complete all fields" }, 400);
    }

    if (subject.length > 100 || message.length < 10 || message.length > 2000) {
        return reply({ error: "Invalid subject or message length" }, 400);
    }

    let googleUser;

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: clientId
        });

        googleUser = ticket.getPayload();
    } catch {
        return reply({ error: "Google session expired. Please sign in again." }, 401);
    }

    if (!googleUser?.email || !googleUser.email_verified) {
        return reply({ error: "A verified Google account is required" }, 401);
    }

    const emailText = [
        "New message from the Kofia website concept",
        "",
        `Sender: ${googleUser.email}`,
        `Subject: ${subject}`,
        "",
        message
    ].join("\n");

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${resendKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: mailFrom,
                to: [mailTo],
                reply_to: [googleUser.email],
                subject: "Kofia Website Concept - New Message",
                text: emailText
            })
        });

        if (!response.ok) {
            return reply({ error: "Email could not be delivered" }, 502);
        }

        return reply({ ok: true });
    } catch {
        return reply({ error: "Email delivery is unavailable" }, 502);
    }
}
