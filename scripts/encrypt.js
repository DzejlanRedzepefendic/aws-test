import crypto from "crypto";
import fs from "fs";
import path from "path";

export function generateAESKey() {
    return crypto.randomBytes(32).toString("base64");
}

export function encryptWithAES(data, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key, "base64"), iv);

    let encryptedData = cipher.update(data, "utf8", "base64");
    encryptedData += cipher.final("base64");

    // Concatenate IV and encrypted data for later decryption
    return iv.toString("base64") + ":" + encryptedData;
}

export function encryptFile(publicKey, filePath) {
    try {
        const aesKey = generateAESKey();

        const data = fs.readFileSync(filePath, "utf8");
        const encryptedData = encryptWithAES(data, aesKey);

        // Encrypt the AES key using the RSA public key
        const encryptedAESKey = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_PADDING
            },
            Buffer.from(aesKey, "base64")
        );

        // Save the encrypted data to the output file
        const outputPath = filePath + ".encrypted";
        console.log(outputPath);
        fs.writeFileSync(outputPath, encryptedData);

        // Save the encrypted AES key to a separate file
        const encryptedAESKeyPath = outputPath + ".key";
        fs.writeFileSync(encryptedAESKeyPath, encryptedAESKey);

        console.log("File encrypted successfully!");
    } catch (error) {
        console.error("Encryption failed:", error);
    }
}

function generateFilePath(fileName) {
    return path.join(__dirname, "..", "config", fileName);
}

const publicKey = process.env.ENCRYPTION_PUBLIC_KEY
    ? process.env.ENCRYPTION_PUBLIC_KEY
    : path.join(__dirname, "..", "public.pem");

const key = fs.existsSync(publicKey) ? fs.readFileSync(publicKey, "utf8") : publicKey;

let filePath = generateFilePath(`local-${process.env.NODE_ENV}.json`);

encryptFile(key, filePath);
