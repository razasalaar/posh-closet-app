import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Review {
  id: string;
  user_name: string;
  user_avatar?: string | null;
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

const ReviewAvatar = ({ name, avatar }: { name: string; avatar?: string | null }) => {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        referrerPolicy="no-referrer"
        className="w-9 h-9 rounded-full object-cover ring-2 ring-gold/25 flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center ring-2 ring-gold/20 flex-shrink-0">
      <span className="text-gold font-body font-semibold text-sm">
        {name?.charAt(0)?.toUpperCase() || '?'}
      </span>
    </div>
  );
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
          <p className="text-xs font-body text-muted-foreground mt-1">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Reviews */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm font-body text-muted-foreground">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-3 border-b border-border pb-5 last:border-0">
              <ReviewAvatar name={review.user_name} avatar={review.user_avatar} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-body font-semibold truncate">{review.user_name}</p>
                  <span className="text-xs font-body text-muted-foreground flex-shrink-0">
                    {timeAgo(review.created_at)}
                  </span>
                </div>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} className={s <= review.rating ? 'fill-gold text-gold' : 'text-border'} />
                  ))}
                </div>
                <p className="text-sm font-body text-muted-foreground mt-2 leading-relaxed">
                  {review.review_text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
