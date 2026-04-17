import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoIcon from '@/assets/logo-icon.png';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      // Redirect to checkout if there's a pending checkout state
      const hasCheckoutState = localStorage.getItem('checkout_state');
      navigate(hasCheckoutState ? '/checkout' : '/');
    }
  };

  return (
    <Layout>
      <div className="container max-w-md py-16 md:py-24">
        <div className="text-center mb-8">
          <img src={logoIcon} alt="Mansa Mussa" className="h-16 w-auto mx-auto mb-4" />
          
          <h1 className="font-heading text-3xl tracking-wider mb-2">Welcome Back</h1>
          <p className="text-sm text-muted-foreground font-body">Sign in to your Mansa Mussa account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="font-body text-xs tracking-wide uppercase">Email</Label>
            <div className="relative mt-1">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 font-body"
                required
              />
            </div>
          </div>

          <div>
            <Label className="font-body text-xs tracking-wide uppercase">Password</Label>
            <div className="relative mt-1">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 font-body"
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-destructive font-body">{error}</p>}

          <Button variant="luxury" size="lg" className="w-full" disabled={loading}>
            {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Signing in...</> : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-body text-muted-foreground tracking-wider uppercase">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google Sign In */}
        {googleError && <p className="text-xs text-destructive font-body text-center mb-3">{googleError}</p>}
        <button
          onClick={async () => {
            setGoogleError('');
            setGoogleLoading(true);
            const { error } = await signInWithGoogle();
            setGoogleLoading(false);
            if (error) setGoogleError(error.message);
          }}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-surface transition-all duration-200 font-body text-sm font-medium shadow-sm hover:shadow-md hover:border-gold/40 disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          {googleLoading ? (
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
          <span className="group-hover:text-foreground transition-colors">Continue with Google</span>
        </button>

        <p className="text-center text-sm text-muted-foreground font-body mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-gold hover:underline font-medium">Create Account</Link>
        </p>
      </div>
    </Layout>
  );
};

export default Login;
