import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

interface Props {
  onLoginSuccess: () => void;
  savedEmail?: string;
}

type AuthMode = 'options' | 'signin' | 'signup';

export const CheckoutAuthSection = ({ onLoginSuccess, savedEmail = '' }: Props) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>('options');
  const [email, setEmail] = useState(savedEmail);
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) { toast.error('Invalid email or password'); setLoading(false); return; }
      toast.success('Welcome back!');
      onLoginSuccess();
    } else {
      if (!fullName) { toast.error('Please enter your name'); setLoading(false); return; }
      const { error } = await signUp(email, password, fullName);
      if (error) { toast.error(error.message || 'Sign up failed'); setLoading(false); return; }
      toast.success('Account created! Check your email to verify, or proceed if auto-confirmed.');
      onLoginSuccess();
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    // Save current URL so OAuth redirects back to checkout
    localStorage.setItem('checkout_return', '/checkout');
    await signInWithGoogle();
    setGoogleLoading(false);
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 bg-primary text-primary-foreground px-5 py-4">
        <span className="w-7 h-7 rounded-full border-2 border-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
        <span className="font-heading text-lg tracking-wider">Contact Information</span>
      </div>

      <div className="p-5 space-y-4 bg-background">
        {/* Google */}
        <button
          id="checkout-google-signin"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 border border-border rounded-lg py-3 px-4 hover:bg-surface transition-colors font-body text-sm font-medium"
        >
          {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-body uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email/password form */}
        {mode === 'signup' && (
          <div>
            <Label className="font-body text-xs tracking-widest uppercase">Full Name</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" className="mt-1 font-body" />
          </div>
        )}
        <div>
          <Label className="font-body text-xs tracking-widest uppercase">Email <span className="text-destructive">*</span></Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="mt-1 font-body" />
        </div>

        {mode !== 'options' && (
          <div>
            <Label className="font-body text-xs tracking-widest uppercase">Password <span className="text-destructive">*</span></Label>
            <div className="relative mt-1">
              <Input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="font-body pr-10"
                onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        )}

        {mode === 'options' ? (
          <div className="space-y-2">
            <Button
              id="checkout-proceed-email"
              variant="luxury"
              size="lg"
              className="w-full"
              onClick={() => setMode('signin')}
            >
              PROCEED TO SHIPPING
            </Button>
            <p className="text-center text-sm font-body text-muted-foreground">
              Already have an account?{' '}
              <button onClick={() => setMode('signin')} className="underline text-foreground font-medium">Sign in</button>
            </p>
            <p className="text-center text-sm font-body text-muted-foreground">
              New here?{' '}
              <button onClick={() => setMode('signup')} className="underline text-foreground font-medium">Create account</button>
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              id="checkout-auth-submit"
              variant="luxury"
              size="lg"
              className="w-full"
              onClick={handleEmailAuth}
              disabled={loading}
            >
              {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {mode === 'signin' ? 'SIGN IN & CONTINUE' : 'CREATE ACCOUNT & CONTINUE'}
            </Button>
            <p className="text-center text-sm font-body text-muted-foreground">
              {mode === 'signin' ? (
                <>New here? <button onClick={() => setMode('signup')} className="underline text-foreground font-medium">Create account</button></>
              ) : (
                <>Already have an account? <button onClick={() => setMode('signin')} className="underline text-foreground font-medium">Sign in</button></>
              )}
            </p>
            <button onClick={() => setMode('options')} className="w-full text-xs text-muted-foreground font-body underline text-center">← Back</button>
          </div>
        )}
      </div>

      {/* Locked shipping/payment placeholders */}
      <div className="border-t border-border px-5 py-4 bg-muted/30 flex items-center gap-3 opacity-50">
        <span className="w-7 h-7 rounded-full border-2 border-muted-foreground flex items-center justify-center text-sm font-bold text-muted-foreground">2</span>
        <span className="font-heading text-base tracking-wider text-muted-foreground">Shipping</span>
      </div>
      <div className="border-t border-border px-5 py-4 bg-muted/30 flex items-center gap-3 opacity-50">
        <span className="w-7 h-7 rounded-full border-2 border-muted-foreground flex items-center justify-center text-sm font-bold text-muted-foreground">3</span>
        <span className="font-heading text-base tracking-wider text-muted-foreground">Payment</span>
      </div>
    </div>
  );
};

export const LoggedInBadge = ({ email, onSignOut }: { email: string; onSignOut: () => void }) => (
  <div className="flex items-center justify-between border border-border rounded-xl px-5 py-4 bg-surface">
    <div className="flex items-center gap-3">
      <CheckCircle2 size={20} className="text-gold flex-shrink-0" />
      <div>
        <p className="text-xs font-body text-muted-foreground uppercase tracking-widest">Signed in as</p>
        <p className="text-sm font-body font-semibold">{email}</p>
      </div>
    </div>
    <button onClick={onSignOut} className="text-xs font-body text-muted-foreground underline hover:text-foreground transition-colors">Sign out</button>
  </div>
);
