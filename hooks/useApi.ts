import { endpoints } from "@/config/api";
import { supabase } from "@/config/supabase";
import { router } from "expo-router";
import { useCallback, useState } from "react";

type Method = "GET" | "POST" | "PUT" | "DELETE";

export function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(
    async (method: Method = "GET", body?: any, path: string = "") => {
      // Prevent multiple calls while saving
      if (method !== "GET" && isSaving) {
        return;
      }

      if (method !== "GET") {
        setIsSaving(true);
      }
      setLoading(true);
      setError(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log("Current session:", session ? "Present" : "Missing");
        const token = session?.access_token;
        console.log("Token:", token ? "Present" : "Missing");

        if (!token) {
          router.replace("/auth/signin");
          throw new Error(
            "Vous devez être connecté pour accéder à cette fonctionnalité"
          );
        }

        const headers: HeadersInit = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        console.log("Request headers:", headers);

        const response = await fetch(`${endpoints.baseUrl}${endpoint}${path}`, {
          method,
          headers: {
            ...headers,
            Accept: "application/json",
          },
          body: body ? JSON.stringify(body) : undefined,
          credentials: "include",
        });

        if (response.status === 401) {
          router.replace("/auth/signin");
          throw new Error("Session expirée, veuillez vous reconnecter");
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("API Error:", {
            status: response.status,
            statusText: response.statusText,
            data: errorData,
            url: `${endpoints.baseUrl}${endpoint}${path}`,
            method,
            body: body ? JSON.stringify(body) : undefined,
            headers: response.headers,
          });
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();
        setData(result);
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Une erreur est survenue");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
        if (method !== "GET") {
          setIsSaving(false);
        }
      }
    },
    [endpoint, isSaving]
  );

  return {
    data,
    loading,
    error,
    fetchData,
  };
}
