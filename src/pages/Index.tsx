import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import ToolCard from '@/components/ToolCard';
import { useTools } from '@/hooks/useTools';

const Index = () => {
  const [search, setSearch] = useState('');
  const [categorySlug, setCategorySlug] = useState('all');
  const { data: tools, isLoading } = useTools(
    categorySlug === 'all' ? undefined : categorySlug,
    search || undefined
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Layers className="h-4 w-4" />
              Free Tools & Resources
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
              Discover the Best
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Free Tools
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              A curated collection of the best free online tools and resources to boost your productivity.
            </p>
          </motion.div>

          <SearchBar
            search={search}
            onSearchChange={setSearch}
            categorySlug={categorySlug}
            onCategoryChange={setCategorySlug}
          />
        </div>
      </section>

      {/* Tools Grid */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg h-72 animate-pulse shadow-card" />
              ))}
            </div>
          ) : tools && tools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tools.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No tools found. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
