import { NextRequest, NextResponse } from "next/server";
import { bachsServer } from "@/lib/bachs/server";

export const runtime = "nodejs";

interface CreateCheckoutBody {
  amount: number;
  currency: string;
  email: string;
  name?: string;
  phone?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  let body: CreateCheckoutBody;
  try {
    body = (await req.json()) as CreateCheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.amount || !body.currency || !body.email) {
    return NextResponse.json(
      { error: "amount, currency, and email are required" },
      { status: 400 }
    );
  }

  const secretKey = process.env.BACHS_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "BACHS_SECRET_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  try {
    const session = await bachsServer.initiate(
      { secretKey },
      {
        amount: body.amount,
        currency: body.currency,
        email: body.email,
        name: body.name,
        phone: body.phone,
        reference: body.reference,
        metadata: body.metadata,
      }
    );

    return NextResponse.json({ session });
  } catch (err) {
    console.error("Bachs initiate error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to create checkout",
      },
      { status: 502 }
    );
  }
}
