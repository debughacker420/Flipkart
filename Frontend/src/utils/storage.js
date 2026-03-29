const GUEST_ID_KEY = 'flipkart_guest_id';

export const getGuestId = () => {
  if (typeof window === 'undefined') return null;

  let guestId = localStorage.getItem(GUEST_ID_KEY);
  
  if (!guestId) {
    // Generate a new UUID-like string
    guestId = 'guest-' + crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  
  return guestId;
};
