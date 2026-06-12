import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  try {
    const body = await request.json();
    const res = await fetch(`${API_URL}/api/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error proxying transaction creation:", error);
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}
