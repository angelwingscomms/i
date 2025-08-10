import { toast } from "../toast";

export async function ensurePushSubscribed(userId: string) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' } as const;
  }

  try {
    // vite-plugin-pwa registers the service worker, wait until it's ready
    const registration = await navigator.serviceWorker.ready;

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      if (permission === 'denied') {
        toast.info('Notifications blocked. Please enable them in your browser settings.');
      } else {
        toast.info('Please enable notifications.', undefined, undefined, {
          label: 'Enable',
          callback: async () => {
            await Notification.requestPermission();
          },
        });
      }
      return { ok: false, reason: 'denied' } as const;
    }

    const vapidRes = await fetch('/push_notif');
    const { publicKey } = await vapidRes.json();

    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    // Try to reuse an existing subscription if present
    const existing = await registration.pushManager.getSubscription();
    const sub = existing || (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey }));

    await fetch(`/u/${userId}/push_notifications/save_subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub)
    });

    return { ok: true } as const;
  } catch (e) {
    console.error('ensurePushSubscribed error', e);
    return { ok: false, reason: 'error' } as const;
  }
}

export async function sendPushToUser(userId: string, title: string, body: string, tag?: string) {
  try {
    await fetch(`/u/${userId}/push_notif`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ t: title, m: body, k: tag })
    });
  } catch (e) {
    console.error('sendPushToUser error', e);
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
} 