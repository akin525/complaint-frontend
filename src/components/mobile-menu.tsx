import { useState } from "react";
import { Link } from "react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { to: "/register", label: "Sign Up" },
    { to: "/login", label: "Sign In" },
  ];

  return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <button className="p-2 rounded-md bg-white/10 text-white hover:bg-white/20 transition-all">
            <Menu size={22} />
            <span className="sr-only">Open menu</span>
          </button>
        </SheetTrigger>

        <SheetContent
            side="right"
            className="w-[280px] h-full bg-gradient-to-b from-[#101e4b] to-[#0a0f23] text-white border-l border-white/10 px-5 py-6 shadow-lg rounded-l-xl"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-lg font-bold tracking-wide">
              Welcome
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-3">
            {menuItems.map((item) => (
                <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200 text-white/90 hover:text-white text-base"
                >
                  {item.label}
                </Link>
            ))}
          </nav>

          <div className="mt-auto pt-8 text-xs text-white/40">
            &copy; {new Date().getFullYear()} YourBrand. All rights reserved.
          </div>
        </SheetContent>
      </Sheet>
  );
}
