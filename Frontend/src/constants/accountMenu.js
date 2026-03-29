import {
  BadgePercent,
  Bell,
  CreditCard,
  Crown,
  Gift,
  Heart,
  LogOut,
  MapPinned,
  Package,
  Sparkles,
  UserCircle2,
} from 'lucide-react';

export const accountMenuItems = [
  { label: 'My Profile', to: '/account/profile', icon: UserCircle2 },
  { label: 'Flipkart Plus Zone', to: '/account/plus', icon: Crown },
  { label: 'Orders', to: '/account/orders', icon: Package },
  { label: 'Wishlist', to: '/account/wishlist', icon: Heart },
  { label: 'Rewards', to: '/account/rewards', icon: Sparkles },
  { label: 'Gift Cards', to: '/account/gift-cards', icon: Gift },
  { label: 'Coupons', to: '/account/coupons', icon: BadgePercent },
  { label: 'Saved Cards', to: '/account/cards', icon: CreditCard },
  { label: 'Saved Addresses', to: '/account/addresses', icon: MapPinned },
  { label: 'Notifications', to: '/account/notifications', icon: Bell },
  { label: 'Logout', to: '#logout', icon: LogOut, isLogout: true },
];

export const accountPageCopy = {
  '/account/profile': {
    title: 'My Profile',
    description: 'Your personal details, saved preferences, and communication settings will live here soon.',
  },
  '/account/plus': {
    title: 'Flipkart Plus Zone',
    description: 'Membership perks, milestone tracking, and loyalty rewards are queued up for the next phase.',
  },
  '/account/orders': {
    title: 'Orders',
    description: 'Order history, shipment status, and invoice actions will be connected in a follow-up pass.',
  },
  '/account/wishlist': {
    title: 'Wishlist',
    description: 'Saved products and price-drop tracking will appear here once the wishlist flow is implemented.',
  },
  '/account/rewards': {
    title: 'Rewards',
    description: 'Coupons, reward points, and offer unlocks will be surfaced here after the promotion engine lands.',
  },
  '/account/gift-cards': {
    title: 'Gift Cards',
    description: 'Gift card balances, redemption, and purchase history are reserved for a dedicated follow-up task.',
  },
  '/account/coupons': {
    title: 'Coupons',
    description: 'Eligible offers and saved coupon codes will appear here once we connect the discounts workflow.',
  },
  '/account/cards': {
    title: 'Saved Cards',
    description: 'Secure payment method storage is intentionally deferred until the payments layer is implemented.',
  },
  '/account/addresses': {
    title: 'Saved Addresses',
    description: 'Address management UI is in place conceptually and will be fully wired into account settings next.',
  },
  '/account/notifications': {
    title: 'Notifications',
    description: 'Order alerts, account notices, and promotional preferences will be managed from this screen soon.',
  },
};
