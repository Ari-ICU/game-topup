import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const API_URL = process.env.BACKEND_API_URL || "http://localhost:5001";
  const { path } = await params;
  const pathStr = path.join("/");
  const url = new URL(request.url);
  const search = url.search;

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";

  try {
    const res = await fetch(`${API_URL}/api/admin/${pathStr}${search}`, {
      method: "GET",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`Error proxying GET to admin/${pathStr}:`, error);
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const API_URL = process.env.BACKEND_API_URL || "http://localhost:5001";
  const { path } = await params;
  const pathStr = path.join("/");

  if (pathStr === "logout") {
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0)
    });
    return response;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";

  let body = {};
  try {
    body = await request.json();
  } catch { }

  try {
    const res = await fetch(`${API_URL}/api/admin/${pathStr}`, {
      method: "POST",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (res.ok && pathStr === "login" && data.token) {
      const response = NextResponse.json({ success: true }, { status: res.status });
      const maxAgeSeconds = parseInt(process.env.JWT_EXPIRES_IN_SECONDS || "86400", 10) || 86400;
      response.cookies.set("admin_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: maxAgeSeconds
      });
      return response;
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`Error proxying POST to admin/${pathStr}:`, error);
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const API_URL = process.env.BACKEND_API_URL || "http://localhost:5001";
  const { path } = await params;
  const pathStr = path.join("/");

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";

  let body = {};
  try {
    body = await request.json();
  } catch { }

  try {
    const res = await fetch(`${API_URL}/api/admin/${pathStr}`, {
      method: "PUT",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`Error proxying PUT to admin/${pathStr}:`, error);
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const API_URL = process.env.BACKEND_API_URL || "http://localhost:5001";

  const { path } = await params;
  const pathStr = path.join("/");

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";

  let body = {};
  try {
    body = await request.json();
  } catch { }

  try {
    const res = await fetch(`${API_URL}/api/admin/${pathStr}`, {
      method: "PATCH",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    console.log("PATCH forwarding to:", `${API_URL}/api/admin/${pathStr}`);

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
    console.error(`Error proxying PATCH to admin/${pathStr}:`, error);

    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const API_URL = process.env.BACKEND_API_URL || "http://localhost:5001";
  const { path } = await params;
  const pathStr = path.join("/");

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";

  try {
    const res = await fetch(`${API_URL}/api/admin/${pathStr}`, {
      method: "DELETE",
      headers: {
        "Authorization": token ? `Bearer ${token}` : ""
      }
    });

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`Error proxying DELETE to admin/${pathStr}:`, error);
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}
