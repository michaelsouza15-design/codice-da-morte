import { useState, useEffect } from 'react';

const SECURITY_KEY = 'codice_uploads_unlocked';
const EVENT_NAME = 'codice_upload_permission_changed';
const ADMIN_PASSCODE = '170671';

export function isUploadsUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SECURITY_KEY) === 'true';
  } catch {
    return false;
  }
}

export function unlockUploads(passcode: string): { success: boolean; message: string } {
  const clean = passcode.trim();
  if (clean === ADMIN_PASSCODE) {
    try {
      localStorage.setItem(SECURITY_KEY, 'true');
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { unlocked: true } }));
      return { success: true, message: 'Uploads liberados com sucesso!' };
    } catch {
      return { success: false, message: 'Erro ao salvar permissão local.' };
    }
  }
  return { success: false, message: 'Senha incorreta. Acesso negado.' };
}

export function lockUploads(): void {
  try {
    localStorage.setItem(SECURITY_KEY, 'false');
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { unlocked: false } }));
  } catch {
    // fallback
  }
}

export function useUploadSecurity() {
  const [unlocked, setUnlocked] = useState<boolean>(() => isUploadsUnlocked());

  useEffect(() => {
    const handleUpdate = () => {
      setUnlocked(isUploadsUnlocked());
    };
    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const attemptUnlock = (pass: string) => {
    return unlockUploads(pass);
  };

  const relock = () => {
    lockUploads();
  };

  return { isUnlocked: unlocked, unlock: attemptUnlock, lock: relock };
}
