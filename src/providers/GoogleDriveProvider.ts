import { google } from "googleapis";
import { JWT } from "google-auth-library";
import streamifier from "streamifier";
import { env } from "~/config/environment";

const SCOPES = ['https://www.googleapis.com/auth/drive'];

let clientEmail = env.GOOGLE_CLIENT_EMAIL;
let privateKey = env.GOOGLE_PRIVATE_KEY;


// Fix formatting for private keys passed via environment variables
if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
}

// Function to authorize and get access to Google Drive API
async function authorize(): Promise<JWT> {
    if (!clientEmail || !privateKey) {
        throw new Error("Missing Google Drive API credentials. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY.");
    }

    const auth = new (google.auth as any).JWT(
        clientEmail,
        undefined,
        privateKey,
        SCOPES
    );

    try {
        await auth.authorize();
        return auth;
    } catch (error: any) {
        throw new Error(`Error authorizing Google Drive API: ${error.message}`);
    }
}

async function uploadFile(auth: JWT, fileBuffer: Buffer, fileName: string, folderId: string): Promise<any> {
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
        name: fileName,
        parents: [folderId]
    };

    const media = {
        mimeType: 'application/octet-stream',
        body: streamifier.createReadStream(fileBuffer)
    };

    try {
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id'
        });

        console.log('File uploaded successfully. File ID:', response.data.id);
        return response.data;
    } catch (error: any) {
        throw new Error(`Error uploading file to Google Drive: ${error.message}`);
    }
}

async function deleteFile(auth: JWT, fileId: string): Promise<void> {
    const drive = google.drive({ version: 'v3', auth });

    try {
        await drive.files.delete({
            fileId: fileId
        });

        console.log('File deleted successfully.');
    } catch (error: any) {
        throw new Error(`Error deleting file from Google Drive: ${error.message}`);
    }
}

export const googleDriveProvider = {
    authorize,
    uploadFile,
    deleteFile
};
