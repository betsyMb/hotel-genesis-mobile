import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";

const BIOMETRIC_KEY = "biometric_enabled";
const BIO_EMAIL_KEY = "biometric_email";
const BIO_PASSWORD_KEY = "biometric_password";

export function useBiometric() {
  const [hasHardware, setHasHardware] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setHasHardware(compatible);
      setIsEnrolled(enrolled);

      if (compatible && enrolled) {
        try {
          const stored = await SecureStore.getItemAsync(BIOMETRIC_KEY);
          setIsEnabled(stored === "true");
        } catch {}
      }
      setLoading(false);
    })();
  }, []);

  const toggle = useCallback(async (email?: string, password?: string) => {
    const next = !isEnabled;
    try {
      await SecureStore.setItemAsync(BIOMETRIC_KEY, next.toString());
      if (next && email && password) {
        await SecureStore.setItemAsync(BIO_EMAIL_KEY, email);
        await SecureStore.setItemAsync(BIO_PASSWORD_KEY, password);
      } else if (!next) {
        await SecureStore.deleteItemAsync(BIO_EMAIL_KEY).catch(() => {});
        await SecureStore.deleteItemAsync(BIO_PASSWORD_KEY).catch(() => {});
      }
      setIsEnabled(next);
    } catch {}
  }, [isEnabled]);

  const getStoredCredentials = useCallback(async (): Promise<{ email: string; password: string } | null> => {
    try {
      const email = await SecureStore.getItemAsync(BIO_EMAIL_KEY);
      const password = await SecureStore.getItemAsync(BIO_PASSWORD_KEY);
      if (email && password) return { email, password };
    } catch {}
    return null;
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Autenticación requerida",
      fallbackLabel: "Usar código",
    });
    return result.success;
  }, []);

  return { hasHardware, isEnrolled, isEnabled, loading, toggle, authenticate, getStoredCredentials };
}
