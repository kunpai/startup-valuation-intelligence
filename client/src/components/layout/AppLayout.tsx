import * as React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Toaster } from "@/components/ui/toaster";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background font-sans text-foreground">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden relative flex flex-col">
           {/* Abstract Background */}
          <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-background to-background" />
          
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="-ml-2" />
            <div className="ml-auto flex items-center gap-4">
               {/* Header Actions could go here */}
            </div>
          </header>
          
          <div className="relative z-10 flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
