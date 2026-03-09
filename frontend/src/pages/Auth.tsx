import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PawPrint } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'breeder' | 'trainer'>('breeder');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      await login(username, password);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      toast({
        title: "Success!",
        description: "You have been logged in successfully.",
      });

      // Redirect based on role
      if (userData.role === 'superadmin') {
        navigate('/superadmin-dashboard');
      } else if (userData.role === 'breeder') {
        navigate('/breeder-dashboard');
      } else if (userData.role === 'trainer') {
        navigate('/trainer-dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = "Invalid credentials. Please try again.";

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = "Cannot connect to server. Please ensure the Django backend is running on http://localhost:8000";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('signup-password') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const fullName = (formData.get('name') as string).trim().split(' ');
    const firstName = fullName[0];
    const lastName = fullName.slice(1).join(' ') || '';
    const email = formData.get('signup-email') as string;

    // Generate a unique username from the email local part + random suffix
    const emailLocal = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    const username = `${emailLocal}_${Math.random().toString(36).slice(2, 7)}`;

    try {
      await register({
        username,
        email,
        password: password,
        first_name: firstName,
        last_name: lastName,
        role: role,
      });

      toast({
        title: "Success!",
        description: "Your account has been created successfully.",
      });

      // Redirect based on role
      if (role === 'breeder') {
        navigate('/breeder-dashboard');
      } else {
        navigate('/trainer-dashboard');
      }
    } catch (error: any) {
      console.error('Registration error full:', JSON.stringify({
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code,
      }));

      let errorMessage = "Failed to create account. Please try again.";

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = "Cannot connect to server. Please ensure the Django backend is running on http://localhost:8000";
      } else if (error.response?.data) {
        const data = error.response.data;
        // Collect ALL field errors
        const fieldErrors: string[] = [];
        if (typeof data === 'object' && !Array.isArray(data)) {
          for (const [key, value] of Object.entries(data)) {
            if (key === 'error') {
              fieldErrors.push(String(value));
            } else if (key === 'detail') {
              fieldErrors.push(String(value));
            } else if (Array.isArray(value)) {
              fieldErrors.push(`${key}: ${value.join(', ')}`);
            } else if (typeof value === 'string') {
              fieldErrors.push(`${key}: ${value}`);
            }
          }
        }
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join('. ');
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }

      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light via-background to-secondary-light p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="p-3 bg-gradient-primary rounded-xl">
              <PawPrint className="h-8 w-8 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to manage your breeding and training operations
          </p>
        </div>

        <Card className="p-6 shadow-xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Email or Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary shadow-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <a href="#" className="text-primary hover:underline">
                    Forgot password?
                  </a>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John or John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="signup-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label>I am a...</Label>
                  <RadioGroup value={role} onValueChange={(value) => setRole(value as 'breeder' | 'trainer')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="breeder" id="breeder" />
                      <Label htmlFor="breeder" className="font-normal cursor-pointer">
                        Breeder - Manage breeding programs and litters
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="trainer" id="trainer" />
                      <Label htmlFor="trainer" className="font-normal cursor-pointer">
                        Trainer - Manage K9 training and deployments
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-secondary shadow-secondary"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
