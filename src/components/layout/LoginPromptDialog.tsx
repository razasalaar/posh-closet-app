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
import { LogIn, ShoppingBag } from 'lucide-react';

interface LoginPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueAsGuest: () => void;
}

const LoginPromptDialog = ({ open, onOpenChange, onContinueAsGuest }: LoginPromptDialogProps) => {
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
            <span className="block mt-2 text-muted-foreground">You can also continue as guest — if you create an account later from the same browser, your orders will be linked automatically.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onContinueAsGuest} className="font-body text-sm">
            <ShoppingBag size={14} className="mr-1" /> Continue as Guest
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
