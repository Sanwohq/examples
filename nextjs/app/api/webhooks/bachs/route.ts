import { NextRequest, NextResponse } from "next/server";
import { bachsServer } from "@/lib/bachs/server";

export const runtime = "nodejs";

/** Simple in-memory dedupe for demo purposes. Swap for a persistent store. */
const processedEventIds = new Set<string>();

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const webhookSecret = process.env.BACHS_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "BACHS_WEBHOOK_SECRET is not configured on the server" },
      { status: 500 }
    );
  }

  const capability = bachsServer.webhook!;
  const verified = capability.verifySignature(
    { secretKey: webhookSecret },
    req.headers,
    rawBody
  );

  if (!verified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event;
  try {
    event = capability.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  if (processedEventIds.has(event.id)) {
    // At-least-once delivery: acknowledge duplicates idempotently.
    return NextResponse.json({ received: true, duplicate: true });
  }
  processedEventIds.add(event.id);

  if (capability.isSuccess?.(event)) {
    const reference = capability.getReference?.(event);
    // Fulfil the order here (update DB, grant access, ship, etc.).
    console.log("Bachs payment confirmed:", {
      reference,
      data: event.data,
    });
  }

  return NextResponse.json({ received: true });
}