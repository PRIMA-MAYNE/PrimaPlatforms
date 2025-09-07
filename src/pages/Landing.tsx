import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoSignIn } from "@/components/demo/DemoSignIn";
import {
  GraduationCap,
  Users,
  FileText,
  ClipboardList,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Star,
  Globe,
  Shield,
  Zap,
  Menu,
  X,
} from "lucide-react";

const Landing: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fb0ce78c613014eb194e6c86c886e717d%2F8a8e0cb23614495a9f5637c129cc7c00?format=webp&width=192"
                alt="Catalyst"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg"
              />
              <span className="text-lg sm:text-xl font-bold text-foreground">
                Catalyst
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/signin">
                <Button variant="ghost" className="text-sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="catalyst-gradient text-sm">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-background">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/signin"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-catalyst-600 hover:bg-catalyst-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 text-base font-medium text-white catalyst-gradient rounded-md hover:opacity-90"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 catalyst-gradient opacity-5"></div>
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6 sm:mb-8">
              <Badge
                variant="secondary"
                className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                AI Features Enabled
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4 sm:mb-6">
              Revolutionize Education with{" "}
              <span className="bg-gradient-to-r from-catalyst-500 to-catalyst-700 bg-clip-text text-transparent">
                AI-Powered
              </span>{" "}
              Management
            </h1>
            <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
              Streamline your educational workflow with Catalyst - the
              comprehensive platform that combines attendance tracking, AI
              lesson planning, assessment generation, and analytics in one
              powerful solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="catalyst-gradient w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link to="/signin">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                >
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Demo Auto Sign-In */}
            <div className="mt-8 sm:mt-12 max-w-md mx-auto">
              <DemoSignIn />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3 sm:mb-4">
              Everything You Need to Manage Education
            </h2>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
              Comprehensive tools designed for modern educational environments
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <Card className="relative group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 catalyst-gradient rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2">
                  Smart Attendance Tracking
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Real-time attendance monitoring with automated reporting and
                  40-day tracking system
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 catalyst-gradient rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2">
                  AI Lesson Planning
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Generate ECZ-aligned lesson plans instantly with intelligent
                  AI assistance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 catalyst-gradient rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2">
                  Assessment Generation
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Create comprehensive assessments with intelligent question
                  generation and marking schemes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 catalyst-gradient rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2">
                  Performance Analytics
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Track student progress with detailed analytics and
                  personalized insights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 catalyst-gradient rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2">
                  Advanced Analytics
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Comprehensive dashboard with real-time insights and data
                  visualization
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 catalyst-gradient rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2">
                  Secure & Reliable
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Enterprise-grade security with cloud backup and data
                  protection
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 sm:mb-6">
                Why Choose Catalyst?
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">
                      ECZ Curriculum Aligned
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Specifically designed for Zambian educational standards
                      with ECZ-compliant content generation
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">
                      AI-Powered Efficiency
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Save hours with intelligent content generation and
                      automated administrative tasks
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">
                      Mobile-First Design
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Access all features seamlessly on any device, from
                      smartphones to desktop computers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:order-first">
              <div className="aspect-square bg-gradient-to-br from-catalyst-50 to-catalyst-100 rounded-2xl p-8 sm:p-12 flex items-center justify-center">
                <div className="text-center">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Fb0ce78c613014eb194e6c86c886e717d%2Fe7cb74a8d70c41d684ed641a5e36b2ea?format=webp&width=512"
                    alt="Catalyst"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mx-auto mb-4 sm:mb-6"
                  />
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                    Catalyst Education
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    The future of educational management
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-24 catalyst-gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to Transform Your Education Management?
            </h2>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-catalyst-100 mb-6 sm:mb-8">
              Join thousands of educators already using Catalyst to streamline
              their workflow and improve student outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto bg-white text-pink-600 hover:bg-gray-50 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fb0ce78c613014eb194e6c86c886e717d%2F8a8e0cb23614495a9f5637c129cc7c00?format=webp&width=192"
                alt="Catalyst"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-lg sm:text-xl font-bold">Catalyst</span>
            </div>
            <p className="text-sm sm:text-base text-gray-400 mb-4">
              Empowering education through intelligent technology
            </p>
            <div className="flex justify-center space-x-4 sm:space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Support
              </a>
            </div>
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800">
              <p className="text-xs sm:text-sm text-gray-500">
                © 2024 Catalyst Education. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
