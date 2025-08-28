import CryptoJS from "crypto-js";

import { SECRET_KEY } from "../../constant";


// 🔒 Encrypt function
const encryptData = (data: unknown): string | null => {
    try {
        console.log(SECRET_KEY,'===SECRET_KEY')
        
        return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    } catch (error) {
        console.error("Encryption error:", error);
        return null;
    }
};

const RAW_TOKEN_KEY = "token";
// 👉 Encrypt only once (at startup)
const ENCRYPTED_TOKEN_KEY = encryptData(RAW_TOKEN_KEY) || RAW_TOKEN_KEY;
// 🔓 Decrypt function
const decryptData = (cipherText: string | null): unknown => {
    if (!cipherText) return null;

    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted);
    } catch (error) {
        console.error("Decryption error:", error);
        return null;
    }
};

 
// 🔒 Saving encrypted token with encrypted key
const setToken = (token: string): void => {
//   const encryptedKey = encryptData(RAW_TOKEN_KEY);
  const encryptedValue = encryptData(token);
 console.log(encryptedValue,'===setToken',encryptedValue)
  if (ENCRYPTED_TOKEN_KEY && encryptedValue) {
    localStorage.setItem(ENCRYPTED_TOKEN_KEY, encryptedValue);
  }
};

// 🔓 Retrieve decrypted token
const getToken = (): string | null => {
//   const encryptedKey = encryptData(RAW_TOKEN_KEY);
//   if (!encryptedKey) return null;
// console.log(encryptedKey,'===getToken')
  const storedValue = localStorage.getItem(ENCRYPTED_TOKEN_KEY);
  if (!storedValue) return null;

  const decrypted = decryptData(storedValue);
  console.log("=====decrypted token", decrypted);
  return typeof decrypted === "string" ? decrypted : null;
};

export { encryptData, decryptData, getToken, setToken };