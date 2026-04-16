import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm = ({ productId, onReviewSubmitted }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="border border-border rounded-xl p-6 text-center bg-surface/50">
        <p className="text-sm font-body text-muted-foreground">
          Please <a href="/login" className="text-gold underline">sign in</a> to write a review.
        </p>
      </div>
    );
  }

  // Derive display name and avatar from user metadata
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Anonymous';

  const avatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }
    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      user_id: user.id,
      user_name: displayName,
      rating,
      review_text: reviewText.trim(),
      user_avatar: avatarUrl || null,
    });

    if (error) {
      console.error('Review submit error:', error);
      if (error.code === '23505') {
        toast.error('You have already reviewed this product');
      } else {
        toast.error(`Failed to submit review: ${error.message}`);
      }
    } else {
      toast.success('Review submitted!');
      setRating(0);
      setReviewText('');
      onReviewSubmitted();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-xl p-6 space-y-5 bg-surface/30">
      <h3 className="text-xs tracking-widest uppercase font-body font-semibold">Write a Review</h3>

      {/* Auto-filled user info */}
      <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-gold/30 flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center ring-2 ring-gold/30 flex-shrink-0">
            <span className="text-gold font-body font-semibold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p className="text-sm font-body font-semibold">{displayName}</p>
          <p className="text-xs font-body text-muted-foreground">Reviewing as yourself</p>
        </div>
      </div>

      {/* Star rating */}
      <div className="space-y-1">
        <p className="text-xs font-body text-muted-foreground">Your Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                size={24}
                className={
                  star <= (hoverRating || rating)
                    ? 'fill-gold text-gold'
                    : 'text-border'
                }
              />
            </button>
          ))}
        </div>
      </div>

      <Textarea
        placeholder="Share your experience with this product..."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        maxLength={1000}
        rows={4}
        required
        className="resize-none"
      />

      <Button type="submit" variant="luxury" disabled={submitting} className="w-full">
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};

export default ReviewForm;
