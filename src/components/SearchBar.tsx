import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/useTools';

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categorySlug: string;
  onCategoryChange: (value: string) => void;
}

const SearchBar = ({ search, onSearchChange, categorySlug, onCategoryChange }: SearchBarProps) => {
  const { data: categories } = useCategories();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tools..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 rounded-lg bg-card border-border"
        />
      </div>
      <Select value={categorySlug} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-48 h-12 rounded-lg bg-card">
          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories?.map((cat) => (
            <SelectItem key={cat.id} value={cat.slug}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
};

export default SearchBar;
