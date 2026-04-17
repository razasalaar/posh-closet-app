import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

interface LoginPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveCheckoutState?: () => void;
}

const LoginPromptDialog = ({ open, onOpenChange, onSaveCheckoutState }: LoginPromptDialogProps) => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    // Save checkout state before Google OAuth redirect
    if (onSaveCheckoutState) {
      onSaveCheckoutState();
    }
    setError('');
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) {
      setError(error.message);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading tracking-wider text-xl">Sign In to Complete Your Order</AlertDialogTitle>
          <AlertDialogDescription className="font-body text-sm space-y-2">
            <span className="block">Sign in to your account to:</span>
            <span className="block">✓ Track your order status in real-time</span>
            <span className="block">✓ Get notifications on order updates</span>
            <span className="block">✓ View your order history anytime</span>
            
            <div className="flex items-start gap-3 mt-3 p-3.5 bg-gold/10 text-gold-foreground rounded-lg border border-gold/30">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-gold" />
              <span className="block text-sm font-medium leading-snug text-foreground">
                <strong className="text-gold">Important:</strong> You must be logged in to place an order. This ensures secure tracking and safe delivery of your products.
              </span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && <p className="text-xs text-destructive font-body text-center">{error}</p>}

        <div className="flex flex-col gap-3 pt-1">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-lg border border-border bg-background hover:bg-surface transition-all duration-200 font-body text-sm font-medium shadow-sm hover:shadow-md hover:border-gold/40 disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin text-muted-foreground" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
            )}
            <span className="group-hover:text-foreground transition-colors">
              {loading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>
        </div>

        <AlertDialogFooter className="sm:justify-center pt-1">
          <AlertDialogCancel className="font-body text-sm">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LoginPromptDialog;
