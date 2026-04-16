import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck } from 'lucide-react';

interface LoginPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginPromptDialog = ({ open, onOpenChange }: LoginPromptDialogProps) => {
  const navigate = useNavigate();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading tracking-wider text-xl">Login for Better Experience</AlertDialogTitle>
          <AlertDialogDescription className="font-body text-sm space-y-2">
            <span className="block">Login to your account to:</span>
            <span className="block">✓ Track your order status in real-time</span>
            <span className="block">✓ Get notifications on order updates</span>
            <span className="block">✓ View your order history anytime</span>
            
            <div className="flex items-start gap-3 mt-5 p-3.5 bg-gold/10 text-gold-foreground rounded-lg border border-gold/30">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-gold" />
              <span className="block text-sm font-medium leading-snug text-foreground">
                <strong className="text-gold">Important:</strong> You must be logged in to place an order. This ensures secure tracking and safe delivery of your products.
              </span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="font-body text-sm">
            Cancel Setup
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => { onOpenChange(false); navigate('/login'); }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-body text-sm"
          >
            <LogIn size={14} className="mr-1" /> Login / Sign Up
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LoginPromptDialog;
