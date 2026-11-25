"use client";

import { useEffect, useState } from "react";
import { BellOff, BellRing, Send, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deletePushSubscription,
  savePushSubscription,
  sendTestPush,
} from "@/app/(app)/notifications/push-actions";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

type Status = "loading" | "unsupported" | "ios-install" | "denied" | "off" | "on";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
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

/** Card that turns phone / browser push notifications on or off for this device. */
export function PushToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      if (!supported || !PUBLIC_KEY) {
        // iPhone only supports web push once AgriTrack is added to the Home Screen
        setStatus(isIos() && !isStandalone() ? "ios-install" : "unsupported");
        return;
      }
      if (Notification.permission === "denied") return setStatus("denied");
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.getSubscription();
      if (sub) await savePushSubscription(sub.toJSON()); // keep the server copy fresh
      setStatus(sub ? "on" : "off");
    })().catch(() => setStatus("unsupported"));
  }, []);

  async function enable() {
    setBusy(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
        }));
      const res = await savePushSubscription(sub.toJSON());
      setStatus(res.ok ? "on" : "off");
      setMessage(res.ok ? "Notifications are on for this device." : "Could not save this device.");
    } catch {
      setMessage("Could not turn on notifications on this device.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMessage(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await deletePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus("off");
      setMessage("Notifications are off for this device.");
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true);
    setMessage(null);
    try {
      const r = await sendTestPush();
      setMessage(r.sent > 0 ? "Test notification sent - check your notifications." : "No device received it. Try turning notifications off and on.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="animate-fade-up rounded-2xl border border-gray-200/70 bg-white/95 p-5 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-200 to-gold-400 text-green-950">
            <Smartphone className="h-6 w-6" />
          </span>
          <div>
            <p className="font-bold text-gray-900">Phone notifications</p>
            <p className="mt-0.5 max-w-xl text-sm text-gray-500">
              {status === "on" && "This device receives alerts for low stock, upcoming and overdue harvests - even when the phone is locked."}
              {status === "off" && "Get low-stock and harvest alerts on this phone or computer, even when AgriTrack is closed."}
              {status === "denied" &&
                "Notifications are blocked for AgriTrack in this browser. Allow them in the browser / phone settings, then reload this page."}
              {status === "ios-install" &&
                "On iPhone, first tap Share → Add to Home Screen, open AgriTrack from the Home Screen, then turn notifications on here."}
              {status === "unsupported" && "This browser does not support push notifications. Use Chrome on Android or a desktop browser."}
              {status === "loading" && "Checking this device..."}
            </p>
            {message && <p className="mt-1.5 text-sm font-semibold text-green-700">{message}</p>}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {status === "off" && (
            <Button onClick={enable} disabled={busy}>
              <BellRing /> Turn on
            </Button>
          )}
          {status === "on" && (
            <>
              <Button variant="gold" onClick={test} disabled={busy}>
                <Send /> Send test
              </Button>
              <Button variant="outline" onClick={disable} disabled={busy}>
                <BellOff /> Turn off
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
