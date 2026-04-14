import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoIcon from '@/assets/logo-icon.png';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <Layout>
        <div className="container max-w-md py-16 md:py-24 text-center">
          <h1 className="font-heading text-3xl tracking-wider mb-4">Check Your Email</h1>
          <p className="text-muted-foreground font-body mb-6">
            We've sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>.
            Please verify your email to continue.
          </p>
          <Button variant="luxury" asChild>
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-md py-16 md:py-24">
        <div className="text-center mb-8">
          <img src={logoIcon} alt="Mansa Mussa" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="font-heading text-3xl tracking-wider mb-2">Create Account</h1>
          <p className="text-sm text-muted-foreground font-body">Join Mansa Mussa for an exclusive shopping experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="font-body text-xs tracking-wide uppercase">Full Name</Label>
            <div className="relative mt-1">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 font-body"
                required
              />
            </div>
          </div>

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
                placeholder="Minimum 6 characters"
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground font-body mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gold hover:underline font-medium">Sign In</Link>
        </p>
      </div>
    </Layout>
  );
};

export default Signup;
