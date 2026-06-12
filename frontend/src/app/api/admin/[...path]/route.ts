import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function proxyRequest(
  method: string,
  pathStr: string,
  search: string,
  body?: any
) {
  const API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const cookieStore = await cookies();
  let token = cookieStore.get("admin_token")?.value || "";
  const refreshToken = cookieStore.get("admin_refresh_token")?.value || "";

  // 1. Handle Logout Interception
  if (method === "POST" && pathStr === "logout") {
    try {
      await fetch(`${API_URL}/api/admin/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error("Error calling backend logout:", error);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    });
    response.cookies.set("admin_refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    });
    return response;
  }

  // Helper to send proxy call
  const makeRequest = async (accessToken: string) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return await fetch(`${API_URL}/api/admin/${pathStr}${search}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  try {
    let res = await makeRequest(token);

    // 2. If access token is expired (401), attempt transparent token refresh
    if (res.status === 401 && refreshToken && pathStr !== "login" && pathStr !== "refresh") {
      console.log(`[Proxy] Access token expired for /api/admin/${pathStr}. Attempting token refresh...`);
      
      const refreshRes = await fetch(`${API_URL}/api/admin/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.token) {
          console.log(`[Proxy] Token refresh successful. Retrying original request.`);
          token = refreshData.token;

          // Retry the original request
          res = await makeRequest(token);

          // Return the retried response with the new admin_token cookie set
          const data = res.status === 204 ? null : await res.json();
          const response = res.status === 204
            ? new NextResponse(null, { status: 204 })
            : NextResponse.json(data, { status: res.status });

          response.cookies.set("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 900 // 15 minutes
          });
          return response;
        }
      } else {
        console.warn(`[Proxy] Refresh token validation failed. Clearing session.`);
        const response = NextResponse.json({ error: "Session expired. Please re-authenticate." }, { status: 401 });
        response.cookies.set("admin_token", "", { path: "/", expires: new Date(0) });
        response.cookies.set("admin_refresh_token", "", { path: "/", expires: new Date(0) });
        return response;
      }
    }

    // 3. Normal response path
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await res.json();

      // If login response, capture access token & refresh token and store in secure cookies
      if (res.ok && pathStr === "login" && data.token) {
        const response = NextResponse.json({ success: true }, { status: res.status });
        response.cookies.set("admin_token", data.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 900 // 15 mins
        });
        if (data.refreshToken) {
          response.cookies.set("admin_refresh_token", data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 604800 // 7 days
          });
        }
        return response;
      }

      return NextResponse.json(data, { status: res.status });
    }

    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  } catch (error) {
    console.error(`Error proxying ${method} to admin/${pathStr}:`, error);
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  const url = new URL(request.url);
  const search = url.search;
  return await proxyRequest("GET", pathStr, search);
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  let body = undefined;
  try {
    body = await request.json();
  } catch { }
  return await proxyRequest("POST", pathStr, "", body);
}

export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  let body = undefined;
  try {
    body = await request.json();
  } catch { }
  return await proxyRequest("PUT", pathStr, "", body);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  let body = undefined;
  try {
    body = await request.json();
  } catch { }
  return await proxyRequest("PATCH", pathStr, "", body);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  return await proxyRequest("DELETE", pathStr, "");
}
