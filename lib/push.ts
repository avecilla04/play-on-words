import webpush from "web-push";

// ============================================================
// ENVÍO DE NOTIFICACIONES PUSH (solo en el servidor)
// ============================================================
//
// Variables de entorno necesarias:
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY
//   VAPID_PRIVATE_KEY
//   VAPID_SUBJECT   (por ejemplo: mailto:tu@email.com)
// ============================================================

export type StoredSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

let configured = false;

export function pushIsConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT
  );
}

function configure() {
  if (configured) return;

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  configured = true;
}

// "sent"  → enviada
// "gone"  → el dispositivo ya no existe (hay que borrar la suscripción)
// "error" → otro fallo (se reintentará mañana)
export async function sendPush(
  subscription: StoredSubscription,
  payload: PushPayload
): Promise<"sent" | "gone" | "error"> {
  configure();

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 6, urgency: "normal" }
    );

    return "sent";
  } catch (error) {
    const statusCode =
      typeof error === "object" && error && "statusCode" in error
        ? Number((error as { statusCode: unknown }).statusCode)
        : 0;

    if (statusCode === 404 || statusCode === 410) {
      return "gone";
    }

    console.error("Error enviando notificación:", error);
    return "error";
  }
}
