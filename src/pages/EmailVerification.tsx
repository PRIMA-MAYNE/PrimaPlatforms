import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GraduationCap,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        if (!token || type !== "email") {
          setStatus("error");
          setMessage("Invalid verification link");
          return;
        }

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        });

        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }

        if (data.user) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");

          toast({
            title: "Email verified!",
            description: "Your account is now active. You can sign in.",
          });

          // Redirect to sign in after 3 seconds
          setTimeout(() => {
            navigate("/signin");
          }, 3000);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred");
      }
    };

    handleEmailVerification();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-catalyst-50 to-catalyst-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl catalyst-gradient">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">Catalyst</span>
          </Link>
        </div>

        {/* Verification Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            {status === "loading" && (
              <>
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-catalyst-100">
                    <Loader2 className="w-8 h-8 text-catalyst-600 animate-spin" />
                  </div>
                </div>
                <CardTitle className="text-xl">Verifying Your Email</CardTitle>
                <CardDescription>
                  Please wait while we verify your email address...
                </CardDescription>
              </>
            )}

            {status === "success" && (
              <>
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/10">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                </div>
                <CardTitle className="text-xl text-success">
                  Email Verified!
                </CardTitle>
                <CardDescription>{message}</CardDescription>
              </>
            )}

            {status === "error" && (
              <>
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                    <XCircle className="w-8 h-8 text-destructive" />
                  </div>
                </div>
                <CardTitle className="text-xl text-destructive">
                  Verification Failed
                </CardTitle>
                <CardDescription>{message}</CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {status === "success" && (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Redirecting you to sign in page in a few seconds...
                </p>
                <Link to="/signin">
                  <Button className="w-full catalyst-gradient">
                    Continue to Sign In
                  </Button>
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    The verification link may have expired or is invalid.
                  </p>
                </div>
                <div className="space-y-2">
                  <Link to="/signup">
                    <Button className="w-full catalyst-gradient">
                      Create New Account
                    </Button>
                  </Link>
                  <Link to="/signin">
                    <Button variant="outline" className="w-full">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {status === "loading" && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  This may take a few moments...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Need help? Contact our{" "}
            <Link to="/support" className="text-catalyst-600 hover:underline">
              support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
