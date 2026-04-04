import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { products, categories } from '@/lib/data';
import { SlidersHorizontal, X } from 'lucide-react';

const Collections = () => {
  const { type } = useParams<{ type?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (type === 'men' || type === 'women') {
      result = result.filter((p) => p.categoryType === type);
    }
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (sortBy === 'price-low') result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [type, selectedCategory, sortBy]);

  const availableCategories = type === 'men' ? categories.men : type === 'women' ? categories.women : [...categories.men, ...categories.women];

  const title = type === 'men' ? "Men's Collection" : type === 'women' ? "Women's Collection" : 'All Collections';

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <h1 className="font-heading text-3xl md:text-4xl tracking-wider text-center mb-8">{title}</h1>

        {/* Desktop filters */}
        <div className="hidden md:flex items-center justify-between mb-8 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-widest uppercase font-body text-muted-foreground">Filter:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs tracking-wider uppercase font-body px-3 py-1.5 rounded-full transition-colors ${selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-surface hover:bg-muted'}`}
            >
              All
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs tracking-wider uppercase font-body px-3 py-1.5 rounded-full transition-colors ${selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-surface hover:bg-muted'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs tracking-wider uppercase font-body bg-surface border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="default">Sort By</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body">No products found in this category.</p>
          </div>
        )}
      </div>

      {/* Mobile filter button */}
      <button
        onClick={() => setShowFilters(true)}
        className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-primary text-primary-foreground rounded-full px-6 py-3 flex items-center gap-2 shadow-lg"
      >
        <SlidersHorizontal size={16} />
        <span className="text-xs tracking-widest uppercase font-body font-semibold">Filter & Sort</span>
      </button>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="md:hidden fixed inset-0 z-50 bg-primary/50 backdrop-blur-sm" onClick={() => setShowFilters(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg">Filter & Sort</h3>
              <button onClick={() => setShowFilters(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4 mb-6">
              <p className="text-xs tracking-widest uppercase font-body text-muted-foreground">Category</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`text-xs tracking-wider uppercase font-body px-3 py-1.5 rounded-full transition-colors ${selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-surface'}`}
                >
                  All
                </button>
                {availableCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-xs tracking-wider uppercase font-body px-3 py-1.5 rounded-full transition-colors ${selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-surface'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <p className="text-xs tracking-widest uppercase font-body text-muted-foreground">Sort By</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full text-sm font-body bg-surface border border-border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
            <button
              onClick={() => setShowFilters(false)}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg text-xs tracking-widest uppercase font-body font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Collections;
