export const composeProxmoxToken = ({ user, tokenId, secret }: { user: string; tokenId: string; secret: string }) => {
  const cleanUser = user.trim();
  const cleanTokenId = tokenId.trim();
  const cleanSecret = secret.trim();
  if (!cleanUser) throw new Error('User Proxmox wajib diisi');
  if (!cleanTokenId) throw new Error('Token ID wajib diisi');
  if (!cleanSecret) throw new Error('Secret token wajib diisi');
  return `${cleanUser}!${cleanTokenId}=${cleanSecret}`;
};
