export const formatPrice = (number) => {
  if (number === undefined || number === null) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export const calculateDiscount = (price, mrp) => {
  if (!price || !mrp || mrp <= price) return '';
  const discount = ((mrp - price) / mrp) * 100;
  return `${Math.round(discount)}% off`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  return date.toLocaleDateString('en-IN', options);
};
