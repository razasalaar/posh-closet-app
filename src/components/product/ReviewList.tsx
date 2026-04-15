import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
  averageRating: number;
  totalReviews: number;
}

const timeAgo = (date: string) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

const ReviewList = ({ reviews, loading, averageRating, totalReviews }: ReviewListProps) => {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-3xl font-heading font-bold">{averageRating.toFixed(1)}</p>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={14} className={s <= Math.round(averageRating) ? 'fill-gold text-gold' : 'text-border'} />
            ))}
          </div>
          <p className="text-xs font-body text-muted-foreground mt-1">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Reviews */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm font-body text-muted-foreground">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-4 last:border-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-body font-semibold">{review.user_name}</p>
                <span className="text-xs font-body text-muted-foreground">{timeAgo(review.created_at)}</span>
              </div>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={12} className={s <= review.rating ? 'fill-gold text-gold' : 'text-border'} />
                ))}
              </div>
              <p className="text-sm font-body text-muted-foreground mt-2 leading-relaxed">{review.review_text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
