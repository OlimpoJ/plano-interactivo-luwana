export const getMediaUrl = (path: string | undefined): string => {
  if (!path) return '';
  
  const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL || '';
  if (!mediaUrl) return path;
  
  // Ensure we don't duplicate slashes
  const baseUrl = mediaUrl.endsWith('/') ? mediaUrl.slice(0, -1) : mediaUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
