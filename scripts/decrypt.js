import crypto from "crypto";
import fs from "fs";
import path from "path";

export function decryptWithAES(encryptedData, key) {
    const [ivString, encryptedDataString] = encryptedData.split(":");
    const iv = Buffer.from(ivString, "base64");
    const cipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key, "base64"), iv);

    let decryptedData = cipher.update(encryptedDataString, "base64", "utf8");
    decryptedData += cipher.final("utf8");

    return decryptedData;
}

export function decryptFile(privateKey, encryptedFilePath, encryptedAESKeyPath) {
    try {
        const encryptedAESKey = fs.readFileSync(encryptedAESKeyPath);

        // Decrypt the AES key using the RSA private key
        const aesKey = crypto
            .privateDecrypt(
                {
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_PADDING
                },
                encryptedAESKey
            )
            .toString("base64");
        const encryptedData = fs.readFileSync(encryptedFilePath, "utf8");

        const decryptedData = decryptWithAES(encryptedData, aesKey);

        const decryptedFilePath = encryptedFilePath.replace(".encrypted", "");
        fs.writeFileSync(decryptedFilePath, decryptedData);
    } catch (error) {
        console.error("Decryption failed:", error);
    }
}

export function generateFilePath(fileName) {
    return path.join(__dirname, "..", "config", fileName);
}

const privateKey = process.env.DECRYPTION_PRIVATE_KEY
    ? process.env.DECRYPTION_PRIVATE_KEY
    : path.join(__dirname, "..", "private.pem");

const key = fs.existsSync(privateKey) ? fs.readFileSync(privateKey, "utf8") : privateKey;

const encryptedFilePath = generateFilePath(`local-${process.env.NODE_ENV}.json.encrypted`);
const encryptedAESKeyPath = generateFilePath(`local-${process.env.NODE_ENV}.json.encrypted.key`);

decryptFile(key, encryptedFilePath, encryptedAESKeyPath);
