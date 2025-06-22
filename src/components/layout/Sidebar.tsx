import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  TrendingUp,
  BarChart3,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Attendance Tracker",
    href: "/attendance",
    icon: Users,
  },
  {
    name: "Lesson Planning",
    href: "/lesson-planning",
    icon: FileText,
  },
  {
    name: "Assessment Generator",
    href: "/assessment-generator",
    icon: ClipboardList,
  },
  {
    name: "Performance Tracker",
    href: "/performance-tracker",
    icon: TrendingUp,
  },
  {
    name: "Analytics & Insights",
    href: "/analytics",
    icon: BarChart3,
  },
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0",
          isCollapsed ? "-translate-x-full" : "translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg catalyst-gradient">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Catalyst
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start text-sm font-medium",
                      isActive
                        ? "bg-catalyst-500 hover:bg-catalyst-600 text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              Catalyst v1.0
            </div>
          </div>
        </div>
      </div>

      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(false)}
        className={cn(
          "fixed top-4 left-4 z-40 lg:hidden",
          !isCollapsed && "hidden",
        )}
      >
        <Menu className="w-4 h-4" />
      </Button>
    </>
  );
};
