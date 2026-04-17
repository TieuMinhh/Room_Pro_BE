import { google } from "googleapis";
import { JWT } from "google-auth-library";
import streamifier from "streamifier";
import apikeys from "../../google_apikey.json";

const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Function to authorize and get access to Google Drive API
async function authorize(): Promise<JWT> {
    const auth = new (google.auth as any).JWT(
        apikeys.client_email,
        undefined,
        apikeys.private_key,
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
