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


// 🔒 Saving encrypted token with encrypted key
const setToken = (token: string): void => {
  const encryptedValue = encryptData(token);
  if (encryptedValue) {
    localStorage.setItem(RAW_TOKEN_KEY, encryptedValue);
  }
};

// 🔓 Retrieve decrypted token
const getToken = (): string | null => {
  const storedValue = localStorage.getItem(RAW_TOKEN_KEY);
  if (!storedValue) return null;
  const decrypted = decryptData(storedValue);
  return typeof decrypted === "string" ? decrypted : null;
};

export { getToken, setToken, encryptData, decryptData };