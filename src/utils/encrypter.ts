import crypto from "crypto"
export const encrypt = (text: string) => {
  return Buffer.from(text).toString("base64");
};