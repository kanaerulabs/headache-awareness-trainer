"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, ClipboardCheck, PlusCircle, BarChart3, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: "/checkin",
    label: "Check-in",
    icon: <ClipboardCheck className="h-5 w-5" />,
  },
  {
    href: "/log",
    label: "Log",
    icon: <PlusCircle className="h-6 w-6" />,
  },
  {
    href: "/insights",
    label: "Insights",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    href: "/learn",
    label: "Learn",
    icon: <BookOpen className="h-5 w-5" />,
  },
];

/**
 * BottomNav - Mobile-first bottom navigation bar
 * Fixed at the bottom of the screen for easy thumb access
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      data-testid="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.1)]"
    >
      <div className="flex items-center justify-around h-16 w-full px-2 sm:px-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const isLogButton = item.href === "/log";

          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-all duration-200",
                isLogButton && "relative -mt-3",
                isActive
                  ? "text-purple-600"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              {isLogButton ? (
                // Special styling for the center "Log" button with high-contrast colors
                <div
                  className={cn(
                    "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 border-2 border-purple-700",
                    isActive
                      ? "bg-purple-600 text-white"
                      : "bg-purple-500 text-white hover:shadow-xl hover:bg-purple-600",
                  )}
                >
                  {item.icon}
                </div>
              ) : (
                <>
                  <span
                    className={cn(
                      "transition-transform duration-200",
                      isActive && "scale-110",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={cn(
                      "text-xs mt-1 font-medium transition-opacity duration-200",
                      isActive ? "opacity-100" : "opacity-70",
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * BottomNavSpacer - Adds padding to prevent content from being hidden behind nav
 */
export function BottomNavSpacer() {
  return <div className="h-16 pb-safe" />;
}
