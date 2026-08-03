import { supabase } from '../client';
import { convertToWebp } from './imageProcessing';

// Sube un archivo a una carpeta específica del bucket y devuelve la URL pública
export const uploadImage = async (file, folderPath, options = {}) => {
  const webpFile = await convertToWebp(file, options);
  const fileName = `${crypto.randomUUID()}.webp`;
  const filePath = `${folderPath}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, webpFile, { contentType: 'image/webp' });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);

  return { publicUrl: data.publicUrl, filePath };
};

// Foto de producto (requiere product_id real)
export const uploadProductPhoto = (file, storeId, productId) =>
  uploadImage(file, `${storeId}/products/${productId}/photos`, { maxWidth: 1200, quality: 0.8 });

// Foto de opción de customización (requiere product_id real)
export const uploadOptionPhoto = (file, storeId, productid) =>
  uploadImage(file, `${storeId}/products/${productid}/options`, { maxWidth: 600, quality: 0.8 });

// Insertar la fila en product_image después de subir la foto del producto
export const saveProductImageRow = async (productid, publicUrl) => {
  const { error } = await supabase
    .from('product_image')
    .insert({ product_id: productid, image_url: publicUrl });
  if (error) throw error;
};

// Guardar la URL de la foto en la opción de customización correspondiente
export const saveOptionImageUrl = async (optionId, publicUrl) => {
  const { error } = await supabase
    .from('customization_option')
    .update({ image_url: publicUrl })
    .eq('id', optionId);
  if (error) throw error;
};

// Borrar imagen de producto (archivo + fila)
export const deleteProductImage = async (imageId, filePath) => {
  await supabase.storage.from('product-images').remove([filePath]);
  await supabase.from('product_image').delete().eq('id', imageId);
};

// Add these to your existing imageUploads.js file

// Foto del logo de la tienda
export const uploadStoreLogo = (file, storeId) =>
  uploadImage(file, `${storeId}/logo`, { maxWidth: 600, quality: 0.8 });

// Actualizar la fila de la tienda con el URL del logo
export const saveStoreLogo = async (storeId, publicUrl) => {
  const { error } = await supabase
    .from('store') 
    .update({ logo: publicUrl }) 
    .eq('id', storeId);
  if (error) throw error;
};