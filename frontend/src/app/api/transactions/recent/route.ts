import { NextResponse } from "next/server";

export async function GET() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  try {
    const res = await fetch(`${API_URL}/api/transactions/recent`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch recent transactions" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying recent transactions:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}
