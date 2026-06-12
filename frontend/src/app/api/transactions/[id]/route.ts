import { NextResponse } from "next/server";

// Proxy for getting transaction status (GET)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  try {
    const res = await fetch(`${API_URL}/api/transactions/${id}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Transaction not found" }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error proxying transaction check for ${id}:`, error);
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}

// Proxy for simulating payment callback (POST)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  try {
    const res = await fetch(`${API_URL}/api/transactions/${id}/pay`, {
      method: "POST",
    });
    
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error proxying payment simulation for ${id}:`, error);
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}
