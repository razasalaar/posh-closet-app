import { Product } from './store';

export const categories = {
  men: [
    { id: 'suits', name: 'Suits' },
    { id: 'trousers', name: 'Trousers' },
    { id: 'shirts', name: 'Shirts' },
    { id: 'pants', name: 'Pants' },
    { id: 'shalwar-kameez', name: 'Shalwar Kameez' },
  ],
  women: [
    { id: 'lawn', name: 'Lawn' },
    { id: 'linen', name: 'Linen' },
    { id: 'pret', name: 'Pret' },
    { id: 'unstitched', name: 'Unstitched' },
  ],
};

const placeholderImg = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop';
const placeholderImg2 = 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=800&fit=crop';
const placeholderImg3 = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop';
const placeholderImg4 = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop';
const placeholderImg5 = 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop';
const placeholderImg6 = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop';
const menImg1 = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop';
const menImg2 = 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=800&fit=crop';
const menImg3 = 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=800&fit=crop';
const womenImg1 = 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop';
const womenImg2 = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop';

export const products: Product[] = [
  {
    id: '1',
    name: 'Classic Black Suit',
    brand: 'ÉLAN',
    price: 24999,
    category: 'suits',
    categoryType: 'men',
    image: menImg2,
    images: [menImg2, menImg3, menImg1],
    description: 'A timeless classic black suit tailored with premium fabric for the modern gentleman. Perfect for formal occasions and business meetings.',
    rating: 4.8,
    reviews: 124,
  },
  {
    id: '2',
    name: 'Premium Cotton Shirt',
    brand: 'KHAADI',
    price: 4999,
    category: 'shirts',
    categoryType: 'men',
    image: placeholderImg5,
    images: [placeholderImg5, menImg1],
    description: 'Premium Egyptian cotton shirt with a modern slim fit. Breathable fabric for all-day comfort.',
    rating: 4.5,
    reviews: 89,
  },
  {
    id: '3',
    name: 'Slim Fit Trousers',
    brand: 'BONANZA',
    price: 5499,
    category: 'trousers',
    categoryType: 'men',
    image: menImg3,
    images: [menImg3, menImg1],
    description: 'Modern slim-fit trousers crafted from premium stretch fabric for ultimate comfort and style.',
    rating: 4.3,
    reviews: 56,
  },
  {
    id: '4',
    name: 'Embroidered Shalwar Kameez',
    brand: 'GUL AHMED',
    price: 8999,
    category: 'shalwar-kameez',
    categoryType: 'men',
    image: menImg1,
    images: [menImg1, menImg2],
    description: 'Intricately embroidered shalwar kameez set in premium lawn fabric. Perfect for festive occasions.',
    rating: 4.7,
    reviews: 203,
  },
  {
    id: '5',
    name: 'Designer Lawn Collection',
    brand: 'SANA SAFINAZ',
    price: 6999,
    category: 'lawn',
    categoryType: 'women',
    image: placeholderImg6,
    images: [placeholderImg6, womenImg1, womenImg2],
    description: 'Exquisite lawn collection featuring delicate prints and premium fabric. A must-have for the summer season.',
    rating: 4.9,
    reviews: 312,
  },
  {
    id: '6',
    name: 'Luxury Linen Suit',
    brand: 'MARIA B',
    price: 12999,
    category: 'linen',
    categoryType: 'women',
    image: womenImg1,
    images: [womenImg1, placeholderImg6, womenImg2],
    description: 'Luxurious linen suit with intricate embroidery work. Premium quality fabric for elegant occasions.',
    rating: 4.6,
    reviews: 178,
  },
  {
    id: '7',
    name: 'Ready-to-Wear Pret',
    brand: 'SAPPHIRE',
    price: 3999,
    category: 'pret',
    categoryType: 'women',
    image: womenImg2,
    images: [womenImg2, womenImg1],
    description: 'Stylish ready-to-wear pret collection. Modern cuts with traditional aesthetics.',
    rating: 4.4,
    reviews: 145,
  },
  {
    id: '8',
    name: 'Unstitched Festive Collection',
    brand: 'ALKARAM',
    price: 15999,
    category: 'unstitched',
    categoryType: 'women',
    image: placeholderImg,
    images: [placeholderImg, placeholderImg2],
    description: 'Premium unstitched fabric with exclusive festive prints and embroidered patches.',
    rating: 4.8,
    reviews: 267,
  },
  {
    id: '9',
    name: 'Formal Dress Pants',
    brand: 'CAMBRIDGE',
    price: 3999,
    category: 'pants',
    categoryType: 'men',
    image: placeholderImg3,
    images: [placeholderImg3, menImg3],
    description: 'Classic formal dress pants with a comfortable fit. Perfect for office and formal events.',
    rating: 4.2,
    reviews: 67,
  },
  {
    id: '10',
    name: 'Silk Embroidered Suit',
    brand: 'HSY',
    price: 34999,
    category: 'suits',
    categoryType: 'men',
    image: placeholderImg4,
    images: [placeholderImg4, menImg2, menImg1],
    description: 'Handcrafted silk suit with premium embroidery. A statement piece for special occasions.',
    rating: 4.9,
    reviews: 89,
  },
];

export const formatPrice = (price: number): string => {
  return `Rs. ${price.toLocaleString('en-PK')}`;
};
