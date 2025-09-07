import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GraduationCap, Loader2, Eye, EyeOff, Mail, Zap } from "lucide-react";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { toast } from "@/hooks/use-toast";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignIn: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      const { error } = await signIn(data.email, data.password);

      if (!error) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    setIsLoading(true);

    // Create demo user data
    const demoUser = {
      id: "demo-user-001",
      email: "demo@catalyst-education.com",
      user_metadata: {
        full_name: "Demo Teacher",
        role: "teacher",
        school_name: "Catalyst Demo School"
      }
    };

    // Store demo user in localStorage for demo purposes
    localStorage.setItem("catalyst-demo-user", JSON.stringify(demoUser));
    localStorage.setItem("catalyst-auth-token", "demo-token-" + Date.now());

    // Add demo data for inspection
    const demoData = {
      classes: [
        {
          id: "class-001",
          name: "Grade 10A Mathematics",
          grade: "10",
          students: [
            { id: "student-001", name: "John Mwansa", class: "class-001", gender: "Male" },
            { id: "student-002", name: "Mary Banda", class: "class-001", gender: "Female" },
            { id: "student-003", name: "Peter Phiri", class: "class-001", gender: "Male" },
            { id: "student-004", name: "Grace Tembo", class: "class-001", gender: "Female" },
            { id: "student-005", name: "Joseph Mulenga", class: "class-001", gender: "Male" }
          ]
        },
        {
          id: "class-002",
          name: "Grade 9B English",
          grade: "9",
          students: [
            { id: "student-006", name: "Sarah Musonda", class: "class-002", gender: "Female" },
            { id: "student-007", name: "David Chanda", class: "class-002", gender: "Male" },
            { id: "student-008", name: "Ruth Nyirenda", class: "class-002", gender: "Female" }
          ]
        }
      ],
      grades: [
        { id: "grade-001", studentId: "student-001", studentName: "John Mwansa", subject: "Mathematics", assessmentName: "Mid-term Test", score: 85, maxScore: 100, date: "2024-01-10", class: "class-001" },
        { id: "grade-002", studentId: "student-002", studentName: "Mary Banda", subject: "Mathematics", assessmentName: "Mid-term Test", score: 92, maxScore: 100, date: "2024-01-10", class: "class-001" },
        { id: "grade-003", studentId: "student-003", studentName: "Peter Phiri", subject: "Mathematics", assessmentName: "Mid-term Test", score: 78, maxScore: 100, date: "2024-01-10", class: "class-001" },
        { id: "grade-004", studentId: "student-001", studentName: "John Mwansa", subject: "Mathematics", assessmentName: "Final Exam", score: 88, maxScore: 100, date: "2024-01-15", class: "class-001" }
      ],
      attendance: [
        { id: "att-001", studentId: "student-001", date: "2024-01-15", status: "present", class: "class-001" },
        { id: "att-002", studentId: "student-002", date: "2024-01-15", status: "present", class: "class-001" },
        { id: "att-003", studentId: "student-003", date: "2024-01-15", status: "absent", class: "class-001" },
        { id: "att-004", studentId: "student-004", date: "2024-01-15", status: "present", class: "class-001" }
      ]
    };

    // Store demo data
    localStorage.setItem("catalyst-classes", JSON.stringify(demoData.classes));
    localStorage.setItem("catalyst-grades", JSON.stringify(demoData.grades));
    localStorage.setItem("catalyst-attendance", JSON.stringify(demoData.attendance));

    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard", { replace: true });

      // Show welcome toast
      setTimeout(() => {
        toast({
          title: "🎓 Demo Access Granted!",
          description: "Welcome to Catalyst Education Demo. All features are fully functional with sample data.",
          duration: 5000,
        });
      }, 1000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-catalyst-50 to-catalyst-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src="https://cdn.builder.io/api/v1/image/assets%2Fb0ce78c613014eb194e6c86c886e717d%2F8a8e0cb23614495a9f5637c129cc7c00?format=webp&width=192" alt="Catalyst" className="w-12 h-12 rounded-xl" />
            <span className="text-2xl font-bold text-foreground">Catalyst</span>
          </Link>
        </div>

        {/* Sign In Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Sign in to your account to continue transforming education
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <ForgotPasswordDialog />
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pr-10"
                    {...register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full catalyst-gradient text-base h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Install App */}
            <div className="flex justify-center">
              <span className="text-xs text-muted-foreground mr-2">Install:</span>
              <div>
                {/* inline import to avoid SSR issues */}
                {React.createElement(require('@/components/pwa/InstallPrompt').InstallPrompt)}
              </div>
            </div>

            {/* Demo Access */}
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Demo Access
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-catalyst-200 text-catalyst-700 hover:bg-catalyst-50"
              onClick={handleDemoSignIn}
              disabled={isLoading}
            >
              <Zap className="w-4 h-4 mr-2" />
              Demo Sign In (Inspector Access)
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Don't have an account?
                </span>
              </div>
            </div>

            <Link to="/signup">
              <Button variant="outline" className="w-full">
                Create New Account
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer Text */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Protected by enterprise-grade security.
          <br />
          Your data is safe with us.
        </p>
      </div>
    </div>
  );
};

// Forgot Password Dialog Component
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ForgotPasswordDialog: React.FC = () => {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      await resetPassword(email);
      setIsOpen(false);
      setEmail("");
    } catch (error) {
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-sm text-catalyst-600">
          Forgot password?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your
            password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email Address</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SignIn;
