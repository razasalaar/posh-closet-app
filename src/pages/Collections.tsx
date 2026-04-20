import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Product } from '@/lib/store';
import { usePageSeo } from '@/hooks/usePageSeo';
import { ProductGridSkeleton } from '@/components/product/ProductCardSkeleton';

interface CategoryItem {
  id: string;
  name: string;
  type: 'men' | 'women';
}

const Collections = () => {
  const { type } = useParams<{ type?: string }>();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedCategory(categoryParam || 'all');
  }, [categoryParam]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch categories
      let catQuery = supabase.from('categories').select('*').order('name');
      if (type === 'men' || type === 'women') {
        catQuery = catQuery.eq('type', type);
      }
      const { data: catData } = await catQuery;
      const resolvedCategories = (catData ?? []) as CategoryItem[];
      setCategories(resolvedCategories);

      // Fetch products with category join
      let prodQuery = supabase.from('products').select('*, categories(name, type)');
      if (type === 'men' || type === 'women') {
        // Filter by category type via inner join
        const catIds = resolvedCategories.map((c) => c.id);
        if (catIds.length > 0) {
          prodQuery = prodQuery.in('category_id', catIds);
        } else {
          setProducts([]);
          setLoading(false);
          return;
        }
      }
      if (selectedCategory !== 'all') {
        prodQuery = prodQuery.eq('category_id', selectedCategory);
      }
      const { data: prodData } = await prodQuery;
      setProducts((prodData ?? []) as Product[]);
      setLoading(false);
    };
    fetchData();
  }, [type, selectedCategory]);

  const sortedProducts = useMemo(() => {
    const result = [...products];
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return result;
  }, [products, sortBy]);

  const title = type === 'men' ? "Men's Collection" : type === 'women' ? "Women's Collection" : 'All Collections';
  const selectedCategoryName = categories.find((cat) => cat.id === selectedCategory)?.name;

  const seoMeta = useMemo(() => {
    if (type === "men") {
      return {
        title: "Men Collection | Premium Shirts, Trousers & Suits Pakistan",
        description:
          "Explore premium men clothing in Pakistan including shirts, trousers, pants and suits from Mansa Mussa with modern minimalist design.",
        path: "/collections/men",
      };
    }

    if (type === "women") {
      return {
        title: "Women Collection | Lawn, Linen & Dresses Online Pakistan",
        description:
          "Shop women's premium lawn, linen, dresses and suits online in Pakistan at Mansa Mussa. Elegant minimalist styles for every season.",
        path: "/collections/women",
      };
    }

    return {
      title: "Premium Clothing Collections Online Pakistan | Mansa Mussa",
      description:
        "Browse premium men and women clothing collections in Pakistan. Shop shirts, trousers, lawn and suits online at Mansa Mussa.",
      path: "/collections",
    };
  }, [type]);

  usePageSeo(seoMeta);

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <h1 className="font-heading text-3xl md:text-4xl tracking-wider text-center mb-8">{title}</h1>
        <h2 className="sr-only">
          {selectedCategoryName
            ? `Buy ${selectedCategoryName} Online in Pakistan`
            : "Shop premium fashion categories in Pakistan"}
        </h2>

        {/* Desktop filters */}
        <div className="hidden md:flex items-center justify-between mb-8 pb-4 border-b border-border">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs tracking-widest uppercase font-body text-muted-foreground">Filter:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs tracking-wider uppercase font-body px-3 py-1.5 rounded-full transition-colors ${selectedCategory === 'all' ? 'bg-gradient-to-r from-[hsl(43,72%,48%)] to-[hsl(36,70%,52%)] text-white shadow-sm border-0' : 'bg-surface hover:bg-muted'}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs tracking-wider uppercase font-body px-3 py-1.5 rounded-full transition-colors ${selectedCategory === cat.id ? 'bg-gradient-to-r from-[hsl(43,72%,48%)] to-[hsl(36,70%,52%)] text-white shadow-sm border-0' : 'bg-surface hover:bg-muted'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <select
            aria-label="Sort products"
            title="Sort products"
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

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {sortedProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground font-body">No products found in this category.</p>
              </div>
            )}
          </>
        )}

        <section className="mt-12 md:mt-16 border-t border-border pt-8">
          <h2 className="font-heading text-xl tracking-wider uppercase mb-3">Shop by Category</h2>
          <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4">
            Discover premium essentials including men shirts, trousers, suits, and women lawn, linen,
            dresses and suits made for modern Pakistani wardrobes.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="text-xs uppercase tracking-wider bg-surface px-3 py-1 rounded-full">Shirts</span>
            <span className="text-xs uppercase tracking-wider bg-surface px-3 py-1 rounded-full">Trousers</span>
            <span className="text-xs uppercase tracking-wider bg-surface px-3 py-1 rounded-full">Lawn</span>
            <span className="text-xs uppercase tracking-wider bg-surface px-3 py-1 rounded-full">Suits</span>
          </div>
        </section>
      </div>

      {/* Mobile filter button */}
      <button
        onClick={() => setShowFilters(true)}
        className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-[hsl(43,72%,48%)] to-[hsl(36,70%,52%)] text-white rounded-full px-6 py-3 flex items-center gap-2 shadow-[0_8px_30px_rgba(184,142,62,0.3)] border-0"
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
              <button aria-label="Close filters" title="Close filters" onClick={() => setShowFilters(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4 mb-6">
              <p className="text-xs tracking-widest uppercase font-body text-muted-foreground">Category</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`text-xs tracking-wider uppercase font-body px-3 py-1.5 rounded-full transition-colors ${selectedCategory === 'all' ? 'bg-gradient-to-r from-[hsl(43,72%,48%)] to-[hsl(36,70%,52%)] text-white shadow-sm border-0' : 'bg-surface'}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-xs tracking-wider uppercase font-body px-3 py-1.5 rounded-full transition-colors ${selectedCategory === cat.id ? 'bg-gradient-to-r from-[hsl(43,72%,48%)] to-[hsl(36,70%,52%)] text-white shadow-sm border-0' : 'bg-surface'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <p className="text-xs tracking-widest uppercase font-body text-muted-foreground">Sort By</p>
              <select
                aria-label="Sort products on mobile"
                title="Sort products on mobile"
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
              className="w-full bg-gradient-to-r from-[hsl(43,72%,48%)] to-[hsl(36,70%,52%)] text-white py-3 rounded-lg text-xs tracking-widest uppercase font-body font-semibold shadow-md border-0"
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
