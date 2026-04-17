import { cloudinaryProvider } from '~/providers/CloudinaryProvider';

export const imageService = {
  uploadImage: async (file: Express.Multer.File) => {
    const result = await cloudinaryProvider.streamUpload(file.buffer, 'room_pro');
    return result.secure_url;
  }
};
