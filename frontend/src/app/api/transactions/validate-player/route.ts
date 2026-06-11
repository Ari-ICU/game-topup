import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const url = new URL(request.url);
  const search = url.search;

  try {
    const res = await fetch(`${API_URL}/api/transactions/validate-player${search}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error proxying player validation:", error);
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}
