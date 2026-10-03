// Authentication & Password Management for Saad's Portfolio Admin Portal

const AUTH_KEY = 'saad_portfolio_admin_auth_v1';
const PASS_HASH_KEY = 'saad_portfolio_admin_pwd_hash_v1';
export const DEFAULT_PASSWORDS = ['saad2026', 'admin'];

// Fallback hash in case crypto.subtle is unavailable in non-HTTPS environments
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'sh_' + Math.abs(hash).toString(36);
}

export async function hashPassword(str) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(str);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return simpleHash(str);
    }
  }
  return simpleHash(str);
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return (
    sessionStorage.getItem(AUTH_KEY) === 'authenticated' ||
    localStorage.getItem(AUTH_KEY) === 'authenticated'
  );
}

export async function verifyPassword(inputPassword) {
  if (!inputPassword) return false;
  const customHash = localStorage.getItem(PASS_HASH_KEY);
  const inputHash = await hashPassword(inputPassword);

  if (customHash) {
    return inputHash === customHash;
  }

  // Check default passwords
  for (const defPass of DEFAULT_PASSWORDS) {
    const defHash = await hashPassword(defPass);
    if (inputHash === defHash || inputPassword === defPass) {
      return true;
    }
  }
  return false;
}

export async function login(password, rememberMe = false) {
  const isValid = await verifyPassword(password);
  if (!isValid) return false;

  if (rememberMe) {
    localStorage.setItem(AUTH_KEY, 'authenticated');
  } else {
    sessionStorage.setItem(AUTH_KEY, 'authenticated');
  }
  return true;
}

export function logout() {
  sessionStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_KEY);
}

export async function changePassword(currentPassword, newPassword) {
  const isValid = await verifyPassword(currentPassword);
  if (!isValid) {
    throw new Error('Current password is incorrect.');
  }
  if (!newPassword || newPassword.length < 4) {
    throw new Error('New password must be at least 4 characters long.');
  }

  const newHash = await hashPassword(newPassword);
  localStorage.setItem(PASS_HASH_KEY, newHash);
  return true;
}

export function hasCustomPassword() {
  return !!localStorage.getItem(PASS_HASH_KEY);
}

export function resetPasswordToDefault() {
  localStorage.removeItem(PASS_HASH_KEY);
}
