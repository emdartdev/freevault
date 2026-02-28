import { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRateTool, useUserRating } from '@/hooks/useTools';
import { toast } from 'sonner';

interface StarRatingProps {
  toolId: string;
  avgRating: number;
  totalRatings: number;
}

const StarRating = ({ toolId, avgRating, totalRatings }: StarRatingProps) => {
  const { user } = useAuth();
  const { data: userRating } = useUserRating(toolId, user?.id);
  const rateTool = useRateTool();
  const [hovered, setHovered] = useState(0);

  const handleRate = (value: number) => {
    if (!user) {
      toast.info('Please login to rate this tool');
      return;
    }
    rateTool.mutate(
      { toolId, userId: user.id, rating: value },
      { onSuccess: () => toast.success('Rating submitted!') }
    );
  };

  const currentRating = userRating?.rating || 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= (hovered || currentRating)
                  ? 'text-accent fill-accent'
                  : 'text-muted-foreground/30'
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {Number(avgRating) > 0 ? `${Number(avgRating).toFixed(1)} average` : 'No ratings yet'}
        {Number(totalRatings) > 0 && ` · ${totalRatings} rating${Number(totalRatings) !== 1 ? 's' : ''}`}
      </p>
      {!user && (
        <p className="text-xs text-muted-foreground italic">Login to rate this tool</p>
      )}
    </div>
  );
};

export default StarRating;
