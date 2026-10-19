import { itemImage } from '../itemImages';

export default function ItemImage({ itemId, name, className = '' }) {
  const { src, placeholder } = itemImage(itemId);
  return (
    <img
      className={`item-image ${placeholder ? 'placeholder' : ''} ${className}`}
      src={src}
      alt={placeholder ? '' : name}
      loading="lazy"
    />
  );
}
