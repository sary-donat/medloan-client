// Item Id (from the server's SeedData.cs) → image in public/images.
// Adding an image: put the file in public/images and add one line here.
const images = {
  1: 'wheelchair.png',              // כיסא גלגלים מתקפל
  3: 'walker.png',                  // הליכון
  5: 'crutches.png',                // זוג קביים
  6: 'cane.png',                    // מקל הליכה
  11: 'blood-pressure-monitor.png', // מד לחץ דם
  12: 'pulse-oximeter.png',         // מד סטורציה
};

export const LOGO = '/images/logo.png';

// An item without an image shows the logo (on a light background, see .item-image.placeholder).
export function itemImage(itemId) {
  const file = images[itemId];
  return file ? { src: `/images/${file}`, placeholder: false } : { src: LOGO, placeholder: true };
}
