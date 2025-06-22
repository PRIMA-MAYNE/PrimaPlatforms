import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg catalyst-gradient">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Catalyst</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="catalyst-gradient">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-4 h-4 mr-1" />
            AI-Powered Education Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-catalyst-600 to-catalyst-800 bg-clip-text text-transparent">
            Transform Your Teaching with Catalyst
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive educational management system designed to streamline
            attendance tracking, lesson planning, and performance monitoring for
            modern educators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="catalyst-gradient text-lg px-8">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/signin">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No setup fees • Secure authentication • Ready in minutes
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Excel in Education
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Five powerful modules designed to streamline your teaching
              workflow and improve student outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Attendance Tracker */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-catalyst-300">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-catalyst-100">
                    <Users className="w-6 h-6 text-catalyst-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Smart Attendance</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      Core Module
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-base">
                  Streamlined roll call with real-time statistics, gender
                  breakdowns, and automated reporting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Live roll call interface</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Automated attendance summaries</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>PDF & Excel exports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* AI Lesson Planning */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-success/50">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-success/10">
                    <FileText className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      AI Lesson Planning
                    </CardTitle>
                    <Badge className="text-xs bg-success/10 text-success">
                      AI-Powered
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-base">
                  Generate comprehensive lesson plans with AI assistance in
                  seconds, not hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-success" />
                    <span>AI-generated lesson structure</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Editable & customizable</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Word & PDF downloads</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Assessment Generator */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-warning/50">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-warning/10">
                    <ClipboardList className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Assessment Generator
                    </CardTitle>
                    <Badge className="text-xs bg-warning/10 text-warning">
                      ECZ Format
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-base">
                  Create tests and assignments with automated marking schemes in
                  ECZ format.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-warning" />
                    <span>Multiple question types</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-warning" />
                    <span>Auto-generated marking keys</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-warning" />
                    <span>ECZ standards compliant</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Performance Tracker */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-info/50">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-info/10">
                    <TrendingUp className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Performance Tracker
                    </CardTitle>
                    <Badge className="text-xs bg-info/10 text-info">
                      Analytics
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-base">
                  Visual progress tracking with predictive analytics and
                  improvement insights.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-info" />
                    <span>Grade visualization charts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-info" />
                    <span>Trend analysis & alerts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-info" />
                    <span>Class vs individual comparison</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Analytics & Insights */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-300 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Smart Analytics</CardTitle>
                    <Badge className="text-xs bg-purple-100 text-purple-700">
                      Insights
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-base">
                  Comprehensive data analysis with actionable insights for
                  better teaching outcomes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span>Attendance correlation analysis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span>Teaching effectiveness metrics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span>Printable summary reports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Teachers Choose Catalyst
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built by educators, for educators. Experience the difference that
              thoughtful design makes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-catalyst-100 mx-auto mb-4">
                <Zap className="w-8 h-8 text-catalyst-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Time</h3>
              <p className="text-muted-foreground">
                Streamline administrative tasks and focus on what matters most -
                teaching and student engagement.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-success/10 mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Improve Outcomes</h3>
              <p className="text-muted-foreground">
                Data-driven insights help identify students who need support
                before it's too late.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-info/10 mx-auto mb-4">
                <Shield className="w-8 h-8 text-info" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-muted-foreground">
                Built with enterprise-grade security and reliable cloud
                infrastructure for peace of mind.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-warning/10 mx-auto mb-4">
                <Globe className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Accessible Anywhere
              </h3>
              <p className="text-muted-foreground">
                Cloud-based platform works on any device, anywhere you have
                internet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-muted-foreground">
              Built by educators and developers who understand the challenges of
              modern teaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 rounded-full bg-catalyst-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-catalyst-700">
                    LM
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1">
                  Likonge Mumbuwa Prince
                </h3>
                <p className="text-catalyst-600 font-medium mb-2">
                  CEO & Founder
                </p>
                <p className="text-sm text-muted-foreground">
                  Software Developer with expertise in educational technology
                  and platform development.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-success">KL</span>
                </div>
                <h3 className="font-semibold text-lg mb-1">Kapatiso Lyoba</h3>
                <p className="text-success font-medium mb-2">COO</p>
                <p className="text-sm text-muted-foreground">
                  Chemistry and Physics Teacher with deep understanding of
                  classroom operations and educational workflows.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 rounded-full bg-info/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-info">NM</span>
                </div>
                <h3 className="font-semibold text-lg mb-1">Nakweba Muhau</h3>
                <p className="text-info font-medium mb-2">CTO</p>
                <p className="text-sm text-muted-foreground">
                  ICT Teacher and technology specialist focused on educational
                  software architecture and AI integration.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-warning">JH</span>
                </div>
                <h3 className="font-semibold text-lg mb-1">Jeff Hambulo</h3>
                <p className="text-warning font-medium mb-2">
                  Head of Natural Sciences
                </p>
                <p className="text-sm text-muted-foreground">
                  Physics Teacher and HOD Natural Sciences, providing curriculum
                  expertise and educational leadership.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Teaching?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your journey with Catalyst and transform your teaching
              experience with our educational management platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="catalyst-gradient text-lg px-8">
                  Join Catalyst Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/signin">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Secure platform • No setup fees • Start immediately
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg catalyst-gradient">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Catalyst</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              &copy; 2024 Catalyst. All rights reserved. Built with ❤️ for
              educators worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
