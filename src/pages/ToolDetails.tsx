import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowLeft, Copy, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import StarRating from '@/components/StarRating';
import { useToolBySlug } from '@/hooks/useTools';
import { toast } from 'sonner';

const ToolDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: tool, isLoading } = useToolBySlug(slug || '');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-3xl mx-auto animate-pulse space-y-6">
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-20 text-center">
          <p className="text-muted-foreground text-lg">Tool not found.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/">Go Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Tools
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Cover */}
          <div className="relative h-56 md:h-72 rounded-lg overflow-hidden bg-muted mb-8">
            {tool.cover_image ? (
              <img src={tool.cover_image} alt={tool.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full gradient-primary opacity-20" />
            )}
          </div>

          {/* Logo + Title */}
          <div className="flex items-start gap-4 mb-6 -mt-14 ml-4 relative z-10">
            <div className="w-20 h-20 rounded-xl bg-card shadow-elevated border-2 border-card overflow-hidden flex items-center justify-center shrink-0">
              {tool.logo_image ? (
                <img src={tool.logo_image} alt={`${tool.name} logo`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary">{tool.name[0]}</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-foreground">{tool.name}</h1>
              {tool.featured && (
                <Badge className="gradient-accent border-0 text-accent-foreground">⭐ Featured</Badge>
              )}
              {tool.categories && (
                <Badge variant="secondary">{tool.categories.name}</Badge>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {tool.full_description || tool.short_description}
            </p>

            <div className="flex gap-3">
              <Button asChild className="gradient-primary border-0 text-primary-foreground rounded-lg">
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                  Visit Website <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>

            {/* Rating */}
            <div className="bg-card rounded-lg p-6 shadow-card mt-8">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Rate this Tool</h2>
              <StarRating toolId={tool.id} avgRating={tool.avg_rating || 0} totalRatings={tool.total_ratings || 0} />
            </div>

            {/* Shared Credentials */}
            {tool.shared_enabled && tool.shared_email && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-card-foreground">Shared Access Credentials</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-card rounded-lg px-4 py-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium text-foreground">{tool.shared_email}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(tool.shared_email!, 'Email')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {tool.shared_password && (
                    <div className="flex items-center justify-between bg-card rounded-lg px-4 py-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Password</p>
                        <p className="text-sm font-medium text-foreground">{tool.shared_password}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(tool.shared_password!, 'Password')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ToolDetails;
