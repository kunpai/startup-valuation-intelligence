import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Calculator,
  LineChart,
  FileText,
  Settings,
  PieChart,
  Briefcase,
  History,
} from "lucide-react";
import { useLocation, Link } from "wouter";

export function AppSidebar() {
  const [location] = useLocation();

  const items = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Valuation Engine",
      url: "/calculator",
      icon: Calculator,
    },
    {
      title: "Market Comparables",
      url: "/comparables",
      icon: Briefcase,
    },
    {
      title: "History & Scenarios",
      url: "/scenarios",
      icon: History,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: FileText,
    },
  ];

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border/50">
        <div className="flex items-center gap-2 px-2 w-full">
          <div className="size-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">
            SVI
          </div>
          <span className="font-bold text-lg tracking-tight truncate group-data-[collapsible=icon]:hidden">
            Valuation Intel
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    tooltip={item.title}
                    size="lg"
                    className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-all duration-200"
                  >
                    <Link href={item.url}>
                      <item.icon className="!size-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <Settings className="!size-5" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
          <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Founder Ace</span>
            <span className="text-xs text-muted-foreground">Series A Plan</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
