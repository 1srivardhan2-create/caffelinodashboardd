/**
 * Optimizes a Cloudinary image URL by injecting transformation parameters.
 * e.g., /upload/v1234 -> /upload/q_auto,f_auto,w_800/v1234
 */
export const optimizeCloudinaryUrl = (
  url: string,
  width: number = 800,
  quality: string = "auto",
  format: string = "auto"
) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  
  // If it already contains upload transformations, avoid stacking them unnecessarily
  if (url.includes("/upload/q_") || url.includes("/upload/f_") || url.includes("/upload/w_")) {
    return url;
  }

  const transformations = `q_${quality},f_${format},w_${width}`;
  return url.replace("/upload/", `/upload/${transformations}/`);
};
