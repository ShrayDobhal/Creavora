export const validImageSignature = (mimeType, bytes) => {
  const value = Array.from(bytes || []);
  if (mimeType === "image/jpeg") return value[0] === 0xff && value[1] === 0xd8 && value[2] === 0xff;
  if (mimeType === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => value[index] === byte);
  if (mimeType === "image/webp") return String.fromCharCode(...value.slice(0, 4)) === "RIFF" && String.fromCharCode(...value.slice(8, 12)) === "WEBP";
  return false;
};
