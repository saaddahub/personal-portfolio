import { requireSupabase, isAdmin } from '../lib/supabase';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_DATA_URL_LENGTH = 350_000;

export function validateImageFile(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPG, PNG, or WebP image.');
  }
  if (file.size > MAX_FILE_BYTES) throw new Error('This image is too large. Choose a file under 10 MB.');
  if (!file.size) throw new Error('This file is empty. Choose another image.');
}

export function validateImageLink(value) {
  const link = value.trim();
  if (!link) throw new Error('Paste a direct image link first.');
  if (/^(https?:\/\/|\/(?!\/))/i.test(link) || /^images\//i.test(link)) return link;
  throw new Error('Use an https:// image link or a site path such as /images/project.png.');
}

export function loadProjectImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = setTimeout(() => finish(new Error('The image took too long to load. Try another file or link.')), 15000);
    const finish = (error) => {
      clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      if (error) reject(error);
      else resolve(image);
    };
    image.onload = () => finish();
    image.onerror = () => finish(new Error('Could not open this image. Choose another file or use a direct, publicly accessible image link.'));
    image.src = src;
  });
}

// Store a portable, resized image in the existing portfolio configuration.
// Blob URLs are only used while decoding and never saved to localStorage.
export async function prepareProjectImage(file) {
  validateImageFile(file);
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadProjectImage(objectUrl);
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 40_000_000) {
      throw new Error('Choose an image smaller than 40 megapixels.');
    }
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image processing is unavailable. Try another browser or use an image link.');
    for (const maxEdge of [1600, 1200, 900, 640]) {
      const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.86, 0.72, 0.56]) {
        let result = canvas.toDataURL('image/webp', quality);
        if (!result.startsWith('data:image/webp')) {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          result = canvas.toDataURL('image/jpeg', quality);
        }
        if (result.length <= MAX_DATA_URL_LENGTH) return result;
      }
    }
    throw new Error('This image could not be made small enough to save. Try a smaller image.');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadProjectImage(file) {
  const client = requireSupabase();
  const { data: { session } } = await client.auth.getSession();
  if (!isAdmin(session)) throw new Error('Sign in as the portfolio admin to upload pictures.');
  const prepared = await prepareProjectImage(file);
  const blob = await (await fetch(prepared)).blob();
  const path = session.user.id + '/' + crypto.randomUUID() + (blob.type === 'image/webp' ? '.webp' : '.jpg');
  const { error } = await client.storage.from('project-images').upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) throw new Error('Upload failed: ' + error.message);
  return client.storage.from('project-images').getPublicUrl(path).data.publicUrl;
}
