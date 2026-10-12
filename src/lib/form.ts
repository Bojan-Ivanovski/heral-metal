export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export function attachmentError(file: { name: string; size: number }): boolean {
  return file.size === 0 || file.size > MAX_ATTACHMENT_BYTES || !/\.(pdf|jpe?g|png|dwg)$/i.test(file.name);
}
