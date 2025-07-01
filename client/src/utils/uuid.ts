// client/src/utils/uuid.ts
export function getUserUuid(): string {
  let uuid = localStorage.getItem('igomon_user_uuid');
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem('igomon_user_uuid', uuid);
  }
  return uuid;
}