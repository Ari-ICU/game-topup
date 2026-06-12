import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const API_URL =
    process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  try {
    const body = await request.json();

    const res = await fetch(
      `${API_URL}/api/transactions/promos/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const contentType = res.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const data = await res.json();

      return NextResponse.json(data, {
        status: res.status,
      });
    }

    const text = await res.text();

    return NextResponse.json(
      {
        error: text,
      },
      {
        status: res.status,
      }
    );
  } catch (error) {
    console.error("Promo validation proxy error:", error);

    return NextResponse.json(
      {
        error: "Failed to connect to backend",
      },
      {
        status: 500,
      }
    );
  }
}