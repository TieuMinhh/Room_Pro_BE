import { googleDriveProvider } from "~/providers/GoogleDriveProvider";

const uploadFile = async (file: any, fileName: string): Promise<{ fileId: string; downloadUrl: string }> => {
    const authClient = await googleDriveProvider.authorize();
    const uploadedFile = await googleDriveProvider.uploadFile(authClient, file, fileName, '1lBhVbDr7Tn1VScZXwHg1FVE-UEb4x_Hg');
    const fileId = uploadedFile.id;
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    return { fileId, downloadUrl };
};

export const fileMiddleware = { uploadFile };
