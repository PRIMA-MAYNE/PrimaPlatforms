import * as React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-cream-white text-gray-800 overflow-x-hidden">
      {/* Mobile Backdrop — Soft Blur & Subtle Gradient */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle at center, rgba(157, 136, 230, 0.15), transparent 70%)',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Floating, Translucent Sidebar — Soft Purple Glow */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="lg:static lg:translate-x-0 lg:opacity-100 lg:shadow-none backdrop-blur-xl border-r border-purple-100/30"
        style={{
          background: 'rgba(253, 250, 245, 0.95) !important',
          boxShadow: '0 8px 32px rgba(157, 136, 230, 0.08), 0 0 40px rgba(126, 164, 232, 0.05)',
          borderRight: '1px solid rgba(157, 136, 230, 0.1)',
        }}
      />

      {/* Main Content Area — Soft Ambient Light */}
      <div className="lg:pl-72 transition-all duration-500 ease-out">
        {/* Header — Gentle Glow & Floating Effect */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          className="sticky top-0 z-30 backdrop-blur-lg border-b border-purple-100/20 shadow-sm"
          style={{
            background: 'rgba(253, 250, 245, 0.92)',
            boxShadow: '0 4px 20px rgba(126, 164, 232, 0.04), 0 1px 10px rgba(157, 136, 230, 0.06)',
          }}
        />

        {/* Page Content — Dreamy Padding, Soft Curves */}
        <main className="relative py-12 px-4 sm:px-6 lg:px-12 min-h-[calc(100vh-64px)]">
          <div className="mx-auto max-w-7xl">
            {/* Subtle Floating Container with Cream Glow */}
            <div className="relative overflow-hidden rounded-3xl bg-white p-8 md:p-12 shadow-xl border border-cream-100/40">
              {/* Floating Abstract Shapes (optional visual flair) */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

              {/* Your Children Content — Centered, Calm, Sacred Space */}
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Decorative Corner Glow — Always Present */}
      <div className="fixed bottom-8 right-8 w-20 h-20 bg-purple-300 rounded-full opacity-10 blur-2xl animate-pulse"></div>
    </div>
  );
};
