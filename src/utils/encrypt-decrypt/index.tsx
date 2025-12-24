import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import { SECRET_KEY } from "../../constant";

const RAW_TOKEN_KEY = "rfjwhfyis"; // Raw key for storing token in localStorage

// 🔒 Encrypt function
const encryptData = (data: unknown): string | null => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

// 🔓 Decrypt function
const decryptData = (cipherText: string | null): unknown => {
  if (!cipherText) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      console.warn("Decryption produced empty string — possibly wrong key or corrupted data");
      return null;
    }
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};


// 🔒 Saving encrypted token with encrypted key (in cookies)
const setToken = (token: string): void => {
  const encryptedValue = encryptData(token);
  if (encryptedValue) {
    Cookies.set(RAW_TOKEN_KEY, encryptedValue, { expires: 7, sameSite: 'strict' });
  }
};

// 🔓 Retrieve decrypted token (from cookies)
const getToken = (): string | null => {
  const storedValue = Cookies.get(RAW_TOKEN_KEY);
  if (!storedValue) return null;
  const decrypted = decryptData(storedValue);
  return typeof decrypted === "string" ? decrypted : null;
};

// 🗑️ Remove token from cookies
const removeToken = (): void => {
  Cookies.remove(RAW_TOKEN_KEY);
};

export { getToken, setToken, removeToken, encryptData, decryptData };