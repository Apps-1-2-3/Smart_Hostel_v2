import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  useEffect(() => {
    if (isAuthenticated && user) {
      const roleRoutes = {
        student: '/student',
        admin: '/admin',
        mess_staff: '/mess',
      };
      navigate(from || roleRoutes[user.role], { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    if (!value.toLowerCase().endsWith('@rvce.edu.in')) {
      setEmailError('Only @rvce.edu.in email addresses are allowed');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setGeneralError('');
    if (value) {
      validateEmail(value);
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateEmail(email)) return;
    if (!password) {
      setGeneralError('Password is required');
      return;
    }

    setIsSubmitting(true);

    const result = await login(email, password);

    if (!result.success) {
      setGeneralError(result.error || 'Login failed');
      setIsSubmitting(false);
      return;
    }

    toast({
      title: 'Welcome back!',
      description: 'You have successfully logged in.',
    });
  };

  const isEmailValid = email && !emailError && email.toLowerCase().endsWith('@rvce.edu.in');
  const canSubmit = isEmailValid && password && !isSubmitting;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)]" />
      
      <div className="relative flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 animate-slide-up">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow mx-auto">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">SmartHostel</h1>
            <p className="text-muted-foreground">Intelligent Attendance & Mess Management</p>
          </div>

          {/* Login Card */}
          <Card className="border-border/50 shadow-card">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="font-display text-xl">Sign in to your account</CardTitle>
              <CardDescription>
                Use your RVCE email to access the portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    College Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="yourname@rvce.edu.in"
                      value={email}
                      onChange={handleEmailChange}
                      className={`pl-10 ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''} ${isEmailValid ? 'border-success focus-visible:ring-success' : ''}`}
                    />
                    {isEmailValid && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                    )}
                  </div>
                  {emailError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setGeneralError('');
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {generalError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {generalError}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={!canSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Demo Accounts */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center mb-3">Demo Accounts (password: password123)</p>
                <div className="grid gap-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                    <span className="text-muted-foreground">Student:</span>
                    <code className="text-foreground">student@rvce.edu.in</code>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                    <span className="text-muted-foreground">Admin:</span>
                    <code className="text-foreground">admin@rvce.edu.in</code>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                    <span className="text-muted-foreground">Mess Staff:</span>
                    <code className="text-foreground">mess@rvce.edu.in</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            © 2024 RV College of Engineering. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
