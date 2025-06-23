import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="pl-64">
        {/* Fixed Header */}
        <div className="fixed top-0 right-0 left-64 z-40 bg-background border-b">
          <Header />
        </div>

        {/* Scrollable Content */}
        <main className="pt-16 min-h-screen">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
