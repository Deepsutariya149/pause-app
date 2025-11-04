const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

export const cloudinaryService = {
  async uploadImage(uri: string, type: 'image' | 'audio' = 'image'): Promise<string> {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: type === 'image' ? 'image/jpeg' : 'audio/m4a',
      name: `upload.${type === 'image' ? 'jpg' : 'm4a'}`,
    } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${type === 'image' ? 'image' : 'video'}/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const data = await response.json();
    return data.secure_url;
  },

  async uploadVoiceNote(uri: string): Promise<string> {
    return this.uploadImage(uri, 'audio');
  },
};


