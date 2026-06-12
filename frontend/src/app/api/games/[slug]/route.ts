import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  try {
    const res = await fetch(`${API_URL}/api/games/${slug}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Game not found" }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error proxying game details for ${slug}:`, error);
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}
