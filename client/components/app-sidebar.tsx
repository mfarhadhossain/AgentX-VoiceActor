"use client"

import { FileText, Home, MessageSquare, Settings, Star } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function AppSidebar() {
  const pathname = usePathname()

  const platforms = [
    { name: "Voices.com", count: 3 },
    { name: "Fiverr", count: 2 },
    { name: "Upwork", count: 5 },
    { name: "ACX", count: 1 },
    { name: "Voice123", count: 0 },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/"} tooltip="Home">
              <Link href="/">
                <Home />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/risk-summary"} tooltip="Risk Summary">
              <Link href="/risk-summary">
                <FileText />
                <span>Risk Summary</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/clause-details"} tooltip="Clause Details">
              <Link href="/clause-details">
                <Star />
                <span>Clause Details</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/negotiation-tips"} tooltip="Negotiation Tips">
              <Link href="/negotiation-tips">
                <MessageSquare />
                <span>Negotiation Tips</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <Separator className="my-4" />
        <SidebarGroup>
          <SidebarGroupLabel>Platforms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platforms.map((platform) => (
                <SidebarMenuItem key={platform.name}>
                  <SidebarMenuButton asChild>
                    <button>
                      <span>{platform.name}</span>
                      {platform.count > 0 && (
                        <Badge variant="secondary" className="ml-auto bg-[#1E40AF] text-white">
                          {platform.count}
                        </Badge>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button>
                <Settings />
                <span>Settings</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
