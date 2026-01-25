"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSignOutMutation } from "@/hooks/mutations/auth.mutation";
import { getCookie } from "cookies-next";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const { data: user } = useCurrentUser();
  const signOut = useSignOutMutation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const handleSignOut = () => {
    const accessToken = getCookie("access_token");
    const refreshToken = getCookie("refresh_token");

    console.log("Access Token:", accessToken);
    if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/sign-in";
      return;
    }

    signOut.mutate(
      { accessToken, refreshToken },
      {
        onSuccess: () => {
          setTimeout(() => {
            window.location.href = "/sign-in";
          }, 0);
        },
        onError: () => {},
      },
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 ml-1">
          <Image
            src="/logo.png"
            alt="EssayGenius Logo"
            width={200}
            height={200}
          />
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/scored-essays" className="text-sm font-medium">
            Scored Essays
          </Link>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="mr-2"
            disabled={!mounted}
            onClick={() =>
              mounted && setTheme(theme === "dark" ? "light" : "dark")
            }
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {!mounted ? (
            <Skeleton className="w-10 h-10 rounded-full" />
          ) : (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <div className="flex items-center space-x-2">
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer">
                    {user ? (
                      <Avatar className="h-10 w-10">
                        {user.avatar ? (
                          <AvatarImage
                            src={user.avatar}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="object-cover"
                          />
                        ) : null}

                        <AvatarFallback
                          className="
        w-10 h-10
        rounded-full
        flex items-center justify-center
        text-lg
        bg-orange-300
        text-white
      "
                        >
                          {user.firstName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <User className="h-6 w-6" />
                    )}

                    <span className="sr-only">User menu</span>
                  </div>
                </DropdownMenuTrigger>
                <span className="font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <DropdownMenuContent align="end">
                {user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left"
                      >
                        Sign Out
                      </button>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/sign-in">Sign In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/sign-up">Sign Up</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
