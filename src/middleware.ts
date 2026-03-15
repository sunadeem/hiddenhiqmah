import { NextRequest, NextResponse } from "next/server";

const SITE_PASSWORD = process.env.SITE_PASSWORD || "hiqmah2026";
const IS_PASSWORD_ACTIVE = process.env.IS_PASSWORD_ACTIVE === "true";

export function middleware(request: NextRequest) {
  // If password protection is disabled, allow all requests through
  if (!IS_PASSWORD_ACTIVE) {
    return NextResponse.next();
  }

  const isAuthenticated = request.cookies.get("site-auth")?.value === "true";

  // Allow the password API route through
  if (request.nextUrl.pathname === "/api/auth") {
    return NextResponse.next();
  }

  if (isAuthenticated) {
    return NextResponse.next();
  }

  // Return a password page
  return new NextResponse(passwordPage(), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

export const config = {
  matcher: [
    // Match all paths except static files and Next internals
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};

function passwordPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hidden Hiqmah — Password Required</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #e5e5e5;
    }
    .container {
      text-align: center;
      max-width: 360px;
      padding: 2rem;
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #c9a84c;
    }
    p {
      font-size: 0.875rem;
      color: #888;
      margin-bottom: 1.5rem;
    }
    form { display: flex; flex-direction: column; gap: 0.75rem; }
    input {
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid #333;
      background: #141414;
      color: #e5e5e5;
      font-size: 0.875rem;
      outline: none;
      text-align: center;
    }
    input:focus { border-color: #c9a84c80; }
    button {
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid #c9a84c40;
      background: #c9a84c20;
      color: #c9a84c;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    button:hover { background: #c9a84c30; border-color: #c9a84c60; }
    .error { color: #ef4444; font-size: 0.75rem; display: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hidden Hiqmah</h1>
    <p>This site is under construction. Enter the password to continue.</p>
    <form onsubmit="handleSubmit(event)">
      <input type="password" id="pw" placeholder="Enter password" autofocus />
      <button type="submit">Enter</button>
      <p class="error" id="err">Incorrect password</p>
    </form>
  </div>
  <script>
    async function handleSubmit(e) {
      e.preventDefault();
      const pw = document.getElementById('pw').value;
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        document.getElementById('err').style.display = 'block';
      }
    }
  </script>
</body>
</html>`;
}
