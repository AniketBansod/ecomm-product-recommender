// Generate or retrieve a persistent guest ID stored in localStorage
export function getGuestId() {
  const key = 'guest_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    localStorage.setItem(key, id);
  }
  return id;
}
