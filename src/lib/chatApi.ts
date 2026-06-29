import { getAccessToken } from "@/lib/auth";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function call<T>(path: string, method: string, body?: unknown): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `Erreur ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as T;
}

async function fetchBlobUrl(path: string): Promise<string> {
  const token = getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return URL.createObjectURL(await res.blob());
}

async function uploadFile<T>(path: string, file: File): Promise<T> {
  const token = getAccessToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `Erreur ${res.status}`);
  }
  return res.json() as T;
}

export interface ChatConversation {
  id: string;
  reservationId: string;
  creeLe: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  auteurId: string;
  auteurNom: string;
  contenu: string | null;
  pieceJointeUrl: string | null;
  lu: boolean;
  envoyeLe: string;
}

export const chatApi = {
  getOrCreate: (reservationId: string): Promise<ChatConversation> =>
    call(`/api/reservations/${reservationId}/conversation`, "GET"),

  getMessages: (conversationId: string, since?: string): Promise<ChatMessage[]> =>
    call(
      `/api/conversations/${conversationId}/messages${since ? `?since=${encodeURIComponent(since)}` : ""}`,
      "GET",
    ),

  sendMessage: (conversationId: string, contenu: string): Promise<ChatMessage> =>
    call(`/api/conversations/${conversationId}/messages`, "POST", { contenu }),

  sendImage: (conversationId: string, file: File): Promise<ChatMessage> =>
    uploadFile(`/api/conversations/${conversationId}/messages/image`, file),

  messageImageUrl: (conversationId: string, messageId: string): Promise<string> =>
    fetchBlobUrl(`/api/conversations/${conversationId}/messages/${messageId}/image`),
};
