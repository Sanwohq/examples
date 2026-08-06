const SQUAD_SCRIPT_URL = "https://checkout.squadco.com/widget/squad.min.js";

let scriptLoadPromise: Promise<void> | null = null;

declare global {
  interface Window {
    squad: new (config: {
      key: string;
      email: string;
      amount: number;
      currency_code: string;
      onLoad?: () => void;
      onSuccess?: (response: {
        transaction_ref?: string;
        reference?: string;
      }) => void;
      onClose?: () => void;
    }) => {
      setup: () => void;
      open: () => void;
    };
  }
}

function loadSquadScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    if (typeof window.squad !== "undefined") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = SQUAD_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      if (typeof window.squad === "undefined") {
        reject(new Error("Squad SDK loaded but `squad` global not found"));
      } else {
        resolve();
      }
    };

    script.onerror = () => reject(new Error("Failed to load Squad SDK script"));

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export interface SquadPayOptions {
  publicKey: string;
  email: string;
  amount: number;
  currency: string;
}

export type SquadPayResult =
  | { status: "success"; reference: string }
  | { status: "cancelled" }
  | { status: "error"; message: string };

export async function payWithSquad(options: SquadPayOptions): Promise<SquadPayResult> {
  await loadSquadScript();

  return new Promise<SquadPayResult>((resolve) => {
    let settled = false;

    const instance = new window.squad({
      key: options.publicKey,
      email: options.email,
      amount: options.amount,
      currency_code: options.currency,
      onLoad: () => {},
      onSuccess: (response) => {
        settled = true;
        resolve({
          status: "success",
          reference:
            (response && (response.transaction_ref || response.reference)) || "",
        });
      },
      onClose: () => {
        if (!settled) {
          resolve({ status: "cancelled" });
        }
      },
    });

    instance.setup();
    instance.open();
  });
}
