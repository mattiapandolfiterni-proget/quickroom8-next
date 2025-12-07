import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client.ts';
import { toast } from '@/hooks/use-toast';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File, bucket: string, folder?: string): Promise<string | null> => {
    if (!file) return null;

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: 'Upload Error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleImages = async (files: File[], bucket: string, folder?: string): Promise<string[]> => {
    if (!files.length) return [];

    try {
      setUploading(true);

      const uploadPromises = files.map(file => uploadImage(file, bucket, folder));
      const urls = await Promise.all(uploadPromises);

      return urls.filter((url): url is string => url !== null);
    } catch (error: any) {
      toast({
        title: 'Upload Error',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (url: string, bucket: string) => {
    try {
      const path = url.split('/').pop();
      if (!path) throw new Error('Invalid image URL');

      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Delete Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    uploading,
  };
};
