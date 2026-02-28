import { motion } from 'framer-motion';
import { Star, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Tool } from '@/hooks/useTools';

interface ToolCardProps {
  tool: Tool;
  index: number;
}

const ToolCard = ({ tool, index }: ToolCardProps) => {
  const rating = Number(tool.avg_rating) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative bg-card rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300"
    >
      {/* Cover Image */}
      <div className="relative h-40 bg-muted overflow-hidden">
        {tool.cover_image ? (
          <img
            src={tool.cover_image}
            alt={tool.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full gradient-primary opacity-20" />
        )}
        {tool.featured && (
          <Badge className="absolute top-3 right-3 gradient-accent border-0 text-accent-foreground text-xs font-semibold">
            ⭐ Featured
          </Badge>
        )}
      </div>

      {/* Logo */}
      <div className="absolute top-32 left-4">
        <div className="w-16 h-16 rounded-xl bg-card shadow-elevated border-2 border-card overflow-hidden flex items-center justify-center">
          {tool.logo_image ? (
            <img src={tool.logo_image} alt={`${tool.name} logo`} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-primary">{tool.name[0]}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pt-10 px-4 pb-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-card-foreground text-lg leading-tight">{tool.name}</h3>
          <div className="flex items-center gap-1 text-accent shrink-0 ml-2">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">{rating > 0 ? rating.toFixed(1) : '—'}</span>
          </div>
        </div>

        {tool.categories && (
          <Badge variant="secondary" className="text-xs mb-2">
            {tool.categories.name}
          </Badge>
        )}

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {tool.short_description}
        </p>

        <div className="flex gap-2">
          <Button asChild variant="default" size="sm" className="flex-1 rounded-lg gradient-primary border-0 text-primary-foreground">
            <Link to={`/tool/${tool.slug}`}>
              Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-lg">
            <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ToolCard;
