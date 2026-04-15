import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="border border-border rounded-lg p-6 text-center">
        <p className="text-sm font-body text-muted-foreground">
          Please <a href="/login" className="text-gold underline">sign in</a> to write a review.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }
    if (!name.trim()) {
      toast.error('Please enter your name');
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
      user_name: name.trim(),
      rating,
      review_text: reviewText.trim(),
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already reviewed this product');
      } else {
        toast.error('Failed to submit review');
      }
    } else {
      toast.success('Review submitted!');
      setName('');
      setRating(0);
      setReviewText('');
      onReviewSubmitted();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-lg p-6 space-y-4">
      <h3 className="text-xs tracking-widest uppercase font-body font-semibold">Write a Review</h3>

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
              className="p-0.5"
            >
              <Star
                size={22}
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

      <Input
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        required
      />

      <Textarea
        placeholder="Share your experience with this product..."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        maxLength={1000}
        rows={4}
        required
      />

      <Button type="submit" variant="luxury" disabled={submitting} className="w-full">
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};

export default ReviewForm;
