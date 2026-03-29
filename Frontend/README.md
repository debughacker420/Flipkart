# Flipkart Clone - E-commerce Web Application

A complete, high-fidelity clone of Flipkart's e-commerce platform built with React, TypeScript, and Tailwind CSS.

## 🎨 Design System

### Colors
- **Primary Blue**: #2874F0 (navbar, buttons, links)
- **Accent Yellow**: #F9A825 (Add to Cart button)
- **Accent Orange**: #FB641B (Buy Now button)
- **Success Green**: #388E3C (discounts, offers, in-stock)
- **Error Red**: #FF6161 (out of stock, errors)
- **Background**: #F1F3F6 (Flipkart grey)

### Typography
- Heading Large: 20px, SemiBold
- Body Regular: 14px, Regular
- Price Large: 28px, Bold
- Button Text: 14px, Bold

### Design Elements
- Border Radius: 2px (subtle, Flipkart-style)
- Spacing: 4px base grid
- Shadows: Subtle elevation with hover effects

## 📱 Features

### 6 Complete Pages

1. **Home Page**
   - Rotating hero banner carousel with promotional content
   - Category navigation with 8 product categories
   - Deal of the Day section with countdown timer
   - Featured promotional banners
   - Best Sellers product grid

2. **Product Listing Page**
   - Filter sidebar (Category, Price, Brand, Ratings)
   - Sort functionality
   - 4-column responsive product grid
   - Pagination with page numbers
   - Mobile filter drawer
   - Breadcrumb navigation

3. **Product Detail Page**
   - Image gallery with thumbnails
   - Product specifications table
   - Ratings and reviews overview
   - Available offers display
   - Quantity selector
   - Pincode-based delivery check
   - Add to Cart & Buy Now actions
   - Seller information

4. **Cart Page**
   - Cart items with quantity control
   - Price breakdown summary
   - Remove and Save for later options
   - Delivery address display
   - Empty cart state
   - Sticky price summary (desktop)

5. **Checkout Page**
   - Multi-step checkout flow
   - Saved address selection
   - Add new address form
   - Order summary with thumbnails
   - Price details
   - Address type selection (Home/Work)

6. **Order Confirmation Page**
   - Success animation
   - Order ID display
   - Estimated delivery date
   - Order items preview
   - Delivery address summary
   - Action buttons (Continue Shopping, View Order)

### Components

- **Navbar**: Sticky navigation with search, cart, categories
- **ProductCard**: Hover effects, add to cart button animation
- **FilterSidebar**: Multi-filter with checkboxes
- **Breadcrumb**: Navigation breadcrumbs
- **Stepper**: Quantity selector with +/- controls
- **PriceSummary**: Detailed price breakdown
- **RatingBadge**: Star ratings with counts
- **OfferTag**: Promotional offer display
- **Footer**: Links and information
- **ProductCardSkeleton**: Loading states

### State Management

- **Cart Context**: Global shopping cart state
  - Add to cart
  - Remove from cart
  - Update quantity
  - Clear cart
  - Calculate totals

### User Experience

- ✅ Toast notifications for cart actions
- ✅ Smooth page transitions
- ✅ Hover animations on product cards
- ✅ Loading skeletons
- ✅ Responsive mobile menu
- ✅ Sticky navigation
- ✅ Form validation ready
- ✅ 404 error page

## 🎯 Flipkart Design Accuracy

This clone closely follows Flipkart's actual design language:
- Exact color scheme matching Flipkart's brand
- 2px border radius (Flipkart's subtle rounded corners)
- Shadow system matching Flipkart's elevation
- Typography hierarchy
- Button styles (yellow Add to Cart, orange Buy Now)
- Navigation structure
- Product card layout
- Filter sidebar design
- Checkout flow

## 📱 Responsive Design

- **Desktop**: 1366px optimized layout
- **Tablet**: Adaptive grid layouts
- **Mobile**: 375px mobile-first design
  - Hamburger menu
  - Bottom sheet filters
  - Single column layouts
  - Touch-friendly buttons

## 🚀 Technology Stack

- **React 18** with TypeScript
- **React Router 7** for navigation
- **Tailwind CSS v4** for styling
- **Lucide React** for icons
- **Sonner** for toast notifications
- **Radix UI** for accessible components

## 🛍️ Mock Data

10 realistic product listings featuring:
- Samsung Galaxy S24 Ultra
- Apple iPhone 15 Pro Max
- OnePlus, Realme, Xiaomi, Google Pixel
- Vivo, Nothing Phone, Motorola, IQOO

Each product includes:
- High-quality images
- Detailed specifications
- Pricing with discounts
- Ratings and reviews
- Offers and promotions
- Stock status

## 🎨 Features Showcase

### Interactive Elements
- Product card hover effects with "Add to Cart" button slide-up
- Carousel auto-rotation with manual controls
- Countdown timer for deals
- Mobile drawer navigation
- Filter bottom sheet (mobile)
- Quantity steppers
- Toast notifications

### E-commerce Flows
- Browse products → View details → Add to cart → Checkout → Order confirmation
- Category filtering and search
- Multiple payment flow ready
- Address management

---

Built with ❤️ following Flipkart's design system
