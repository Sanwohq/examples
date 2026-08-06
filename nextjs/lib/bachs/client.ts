const BACHS_SCRIPT_URL = "https://checkout.bachs.io/bachs.js";

let scriptLoadPromise: Promise<void> | null = null;

declare global {
  interface Window {
    Bachs?: {
      Initialize(options?: {
        onEvent?: (event: { type: string; data: Record<string, unknown> }) => void;
        baseUrl?: string;
      }): unknown;
      Checkout: {
        open(args: {
          checkoutUrl?: string;
          token?: string;
          onEvent?: (event: {
            type: string;
            data: Record<string, unknown>;
          }) => void;
          options?: {
            showCloseButton?: boolean;
            autoCloseOnComplete?: boolean;
          };
        }): Promise<unknown>;
        close(): void;
        isOpen(): boolean;
      };
    };
  }
}

function loadBachsScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    if (typeof window.Bachs !== "undefined") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = BACHS_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      if (typeof window.Bachs === "undefined") {
        reject(new Error("Bachs SDK loaded but `Bachs` global not found"));
      } else {
        resolve();
      }
    };
    script.onerror = () => reject(new Error("Failed to load Bachs SDK script"));

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export type BachsOverlayResult =
  | { status: "success"; reference: string }
  | { status: "cancelled" }
  | { status: "error"; message: string };

/** Extracts the checkout origin (e.g. sandbox vs live) from a checkout URL. */
function getCheckoutOrigin(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    return url.origin;
  } catch {
    return "https://checkout.bachs.io";
  }
}

/** Opens the Bachs overlay checkout for a server-created checkout session. */
export async function openBachsCheckout(options: {
  checkoutUrl: string;
  onEvent?: (event: { type: string; data: Record<string, unknown> }) => void;
}): Promise<BachsOverlayResult> {
  await loadBachsScript();

  const bachs = window.Bachs;
  if (!bachs) {
    return { status: "error", message: "Bachs SDK unavailable" };
  }

  return new Promise<BachsOverlayResult>((resolve) => {
    let settled = false;

    bachs.Initialize({
      // Validate the checkoutUrl against the origin it actually came from,
      // so sandbox (sandbox-checkout.bachs.io) and live (checkout.bachs.io)
      // sessions both pass the SDK's origin check.
      baseUrl: getCheckoutOrigin(options.checkoutUrl),
      onEvent: (event) => {
        options.onEvent?.(event);
        if (settled) return;

        switch (event.type) {
          case "checkout.completed":
            settled = true;
            resolve({
              status: "success",
              reference: (event.data?.reference as string) ?? "",
            });
            break;
          case "checkout.failed":
          case "checkout.error":
            settled = true;
            resolve({
              status: "error",
              message: (event.data?.message as string) ?? "Bachs checkout failed",
            });
            break;
          case "checkout.closed": {
            const reason = event.data?.reason as string | undefined;
            if (reason === "completed" && settled) return;
            settled = true;
            resolve({ status: "cancelled" });
            break;
          }
        }
      },
    });

    bachs.Checkout.open({
      checkoutUrl: options.checkoutUrl,
      onEvent: (event) => options.onEvent?.(event),
    }).catch(() => {
      if (!settled) {
        settled = true;
        resolve({ status: "error", message: "Failed to open Bachs checkout" });
      }
    });
  });
}
