export type SignupRole = "CLIENT" | "PRESTATAIRE";

export type ClientType = "PARTICULIER" | "ENTREPRISE";

export interface SignupPayload {
  role: SignupRole;
  type: ClientType;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  raisonSociale?: string;
  matriculeFiscal?: string;
  nomCommercial?: string;
  categoriePrincipale?: string;
}

export interface SignupResponse {
  id: string;
  email: string;
  role: SignupRole;
  statutCompte: string;
}

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ?? "/api";
}

export async function registerAccount(payload: SignupPayload): Promise<SignupResponse> {
  const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String(data.message)
        : typeof data === "string" && data
          ? data
          : "Impossible de créer le compte pour le moment.";

    throw new Error(message);
  }

  return data as SignupResponse;
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  role: SignupRole;
  statutCompte: string;
  token?: string;
}

export async function loginAccount(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as any).message)
        : typeof data === "string" && data
        ? data
        : "Impossible de se connecter pour le moment.";

    throw new Error(message);
  }

  return data as LoginResponse;
}