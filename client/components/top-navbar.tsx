"use client"

import { Bell, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { PlatformFilter } from "@/components/platform-filter"

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-[#121212] px-6 text-white shadow-md">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#1E40AF" />
            <path d="M10 16C10 12.6863 12.6863 10 16 10V22C12.6863 22 10 19.3137 10 16Z" fill="white" />
            <path
              d="M16 10C19.3137 10 22 12.6863 22 16C22 19.3137 19.3137 22 16 22V10Z"
              fill="white"
              fillOpacity="0.7"
            />
          </svg>
          <h1 className="text-xl font-bold tracking-tight">Contract AI</h1>
        </div>

        <div className="hidden md:flex md:w-72">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search contracts..."
              className="w-full bg-white/10 pl-8 text-sm text-white placeholder:text-gray-400 focus:bg-white/20 focus:ring-0"
            />
          </div>
        </div>

        <PlatformFilter />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
              <Avatar className="h-8 w-8 border border-white/20">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback className="bg-highlight-blue text-white">VA</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">Voice Actor</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
