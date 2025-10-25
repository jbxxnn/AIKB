'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Home,
  Settings,
  Users,
  FileText,
  FileUp,
  HelpCircle,
  LogOut,
  ChevronRight,
  MessageSquare,
} from 'lucide-react'
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { signOut, useSession } from 'next-auth/react'
import { HugeiconsIcon } from '@hugeicons/react';
import { Comment01Icon, DashboardSquare03Icon, DocumentAttachmentIcon, CalendarIcon, ChatSpark01Icon } from '@hugeicons/core-free-icons';

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: <HugeiconsIcon icon={DashboardSquare03Icon} />,
  },
  {
    title: 'Chat',
    url: '/dashboard/chat',
    icon: <HugeiconsIcon icon={Comment01Icon} />,
  },
  {
    title: 'Schedule',
    url: '/dashboard/schedule',
    icon: <HugeiconsIcon icon={CalendarIcon} />,
    adminOnly: true,
  },
  {
    title: 'Documents',
    url: '/dashboard/documents',
    icon: <HugeiconsIcon icon={DocumentAttachmentIcon} />,
  },
  {
    title: 'Analytics',
    url: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Users',
    url: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'Reports',
    url: '/dashboard/reports',
    icon: FileText,
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
  },
]

const helpItems = [
  {
    title: 'Documentation',
    url: '/dashboard/help',
    icon: HelpCircle,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Filter items based on user role
  const filteredItems = items.filter(item => {
    if (item.adminOnly && session?.user?.role !== 'admin') {
      return false
    }
    return true
  })

  return (
    <Sidebar variant="inset" className="pt-16">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <HugeiconsIcon icon={ChatSpark01Icon} />
          <span className="font-semibold">AI.KB</span>
        </div>
      </SidebarHeader>
      <SidebarContent >
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      {React.isValidElement(item.icon) ? item.icon : React.createElement(item.icon as React.ComponentType)}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {helpItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      {React.isValidElement(item.icon) ? item.icon : React.createElement(item.icon as React.ComponentType)}
                      <span>{item.title}</span>
                    </Link>
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
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              tooltip="Sign out"
            >
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
