export type GoogleProfile = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

type TokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
};

type GoogleAccounts = {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: {
        access_token?: string;
        error?: string;
        error_description?: string;
      }) => void;
      error_callback?: (error: { type?: string; message?: string }) => void;
    }) => TokenClient;
  };
};

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

const GIS_SRC = "https://accounts.google.com/gsi/client";

let scriptPromise: Promise<void> | null = null;

export function getGoogleClientId(override?: string) {
  const fromEnv = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";
  return (override?.trim() || fromEnv).trim();
}

export function loadGoogleIdentityScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in is browser-only."));
  }
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google sign-in."))
      );
      if (window.google?.accounts?.oauth2) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load Google sign-in."));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function requestGoogleProfile(clientIdOverride?: string): Promise<GoogleProfile> {
  const clientId = getGoogleClientId(clientIdOverride);
  if (!clientId) {
    throw new Error(
      "Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local, then restart the server."
    );
  }

  await loadGoogleIdentityScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google sign-in failed to initialize.");
  }

  const accessToken = await new Promise<string>((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(
            new Error(
              response.error_description ||
                response.error ||
                "Google sign-in was cancelled."
            )
          );
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (error) => {
        reject(
          new Error(error.message || "Google sign-in popup was blocked or closed.")
        );
      },
    });

    // Forces the Google account chooser so users pick their real account
    client.requestAccessToken({ prompt: "select_account" });
  });

  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("Could not load your Google profile. Try again.");
  }

  const data = (await res.json()) as {
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
  };

  if (!data.email || !data.sub) {
    throw new Error("Google did not return an email for this account.");
  }

  return {
    id: data.sub,
    email: data.email,
    name: data.name || data.email.split("@")[0],
    picture: data.picture,
  };
}
