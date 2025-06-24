import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  TrendingUp,
  BarChart3,
  GraduationCap,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Attendance Tracker",
    href: "/attendance",
    icon: Users,
  },
  {
    name: "AI Lesson Planning",
    href: "/lesson-planning",
    icon: FileText,
  },
  {
    name: "Assessment Generator",
    href: "/assessment",
    icon: ClipboardList,
  },
  {
    name: "Performance Tracker",
    href: "/performance",
    icon: TrendingUp,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-border px-6 py-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg catalyst-gradient">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Catalyst
              </span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={cn(
                            "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors",
                            isActive
                              ? "catalyst-gradient text-white"
                              : "text-gray-700 hover:text-pink-600 hover:bg-pink-50",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-6 w-6 shrink-0",
                              isActive
                                ? "text-white"
                                : "text-gray-400 group-hover:text-pink-600",
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn("relative z-50 lg:hidden", isOpen ? "block" : "hidden")}
      >
        <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white shadow-xl">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 py-4">
            <div className="flex h-16 shrink-0 items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg catalyst-gradient">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  Catalyst
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-6 w-6" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            onClick={onClose}
                            className={cn(
                              "group flex gap-x-3 rounded-md p-4 text-base leading-6 font-semibold transition-colors touch-manipulation",
                              isActive
                                ? "catalyst-gradient text-white"
                                : "text-gray-700 hover:text-pink-600 hover:bg-pink-50",
                            )}
                          >
                            <item.icon
                              className={cn(
                                "h-6 w-6 shrink-0",
                                isActive
                                  ? "text-white"
                                  : "text-gray-400 group-hover:text-pink-600",
                              )}
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};
