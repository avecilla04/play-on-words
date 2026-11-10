// Tipos mínimos de la librería "web-push" (lo que usa la app).
// Así no hace falta instalar @types/web-push.

declare module "web-push" {
  type PushSubscription = {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };

  type RequestOptions = {
    TTL?: number;
    urgency?: "very-low" | "low" | "normal" | "high";
  };

  const webpush: {
    setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
    sendNotification(
      subscription: PushSubscription,
      payload?: string,
      options?: RequestOptions
    ): Promise<unknown>;
    generateVAPIDKeys(): { publicKey: string; privateKey: string };
  };

  export default webpush;
}
