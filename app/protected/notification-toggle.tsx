"use client";

import { useEffect, useState, useTransition } from "react";

import {
  deletePushSubscription,
  savePushSubscription,
  sendTestNotification,
} from "./notifications/actions";

// ============================================================
// BOTÓN DE RECORDATORIO DIARIO
// ============================================================

type Status =
  | "loading"
  | "unsupported" // navegador sin notificaciones
  | "install" // iPhone: hay que instalar la app primero
  | "denied" // el usuario las bloqueó
  | "off"
  | "on";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const output = new Uint8Array(raw.length);

  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i);
  }

  return output;
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function NotificationToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function check() {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      if (!supported) {
        setStatus(isIos() && !isStandalone() ? "install" : "unsupported");
        return;
      }

      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const subscription = await registration.pushManager.getSubscription();

        setStatus(
          subscription && Notification.permission === "granted" ? "on" : "off"
        );
      } catch {
        setStatus("unsupported");
      }
    }

    check();
  }, []);

  function enable() {
    setMessage("");

    startTransition(async () => {
      try {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!publicKey) {
          setMessage("Falta configurar las claves de notificaciones.");
          return;
        }

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          setStatus(permission === "denied" ? "denied" : "off");
          return;
        }

        const registration = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;

        const subscription =
          (await registration.pushManager.getSubscription()) ??
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          }));

        const result = await savePushSubscription(subscription.toJSON());

        if (!result.success) {
          setMessage(result.message);
          return;
        }

        setStatus("on");
        setMessage("¡Listo! Te avisaré cada tarde si aún no has practicado.");
      } catch (error) {
        console.error(error);
        setMessage("No se pudo activar el recordatorio en este dispositivo.");
      }
    });
  }

  function disable() {
    setMessage("");

    startTransition(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();

      if (subscription) {
        await deletePushSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }

      setStatus("off");
    });
  }

  function test() {
    setMessage("");

    startTransition(async () => {
      const result = await sendTestNotification();
      setMessage(result.message);
    });
  }

  if (status === "loading") {
    return <div className="mt-5 h-12" />;
  }

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      {status === "install" && (
        <p className="text-sm text-slate-500">
          🔔 Para recibir un recordatorio diario, instala la app: en Safari
          pulsa <span className="font-semibold">Compartir → Añadir a pantalla de inicio</span> y
          ábrela desde el icono.
        </p>
      )}

      {status === "unsupported" && (
        <p className="text-sm text-slate-500">
          🔕 Este navegador no admite notificaciones.
        </p>
      )}

      {status === "denied" && (
        <p className="text-sm text-slate-500">
          🔕 Has bloqueado las notificaciones. Actívalas en los ajustes del
          móvil para Play on Words.
        </p>
      )}

      {status === "off" && (
        <button
          type="button"
          onClick={enable}
          disabled={isPending}
          className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {isPending ? "Activando…" : "🔔 Activar recordatorio diario"}
        </button>
      )}

      {status === "on" && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-600">
            🔔 Recordatorio diario activado
          </p>

          <div className="flex shrink-0 gap-3 text-sm font-semibold">
            <button
              type="button"
              onClick={test}
              disabled={isPending}
              className="text-orange-600 disabled:opacity-50"
            >
              Probar
            </button>
            <button
              type="button"
              onClick={disable}
              disabled={isPending}
              className="text-slate-400 disabled:opacity-50"
            >
              Desactivar
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="mt-3 text-sm text-slate-500">{message}</p>
      )}
    </div>
  );
}
