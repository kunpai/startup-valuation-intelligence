import * as React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import { TourGuide } from "./TourGuide";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [runTour, setRunTour] = React.useState(false);

  // Check if it's the first visit
  React.useEffect(() => {
    const hasSeenTour = localStorage.getItem('svi-tour-seen');
    if (!hasSeenTour) {
        // Optional: Auto-start tour on first visit
        // setRunTour(true);
        // localStorage.setItem('svi-tour-seen', 'true');
    }
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <TourGuide run={runTour} setRun={setRunTour} />
      <div className="flex min-h-screen w-full bg-background font-sans text-foreground">
        <AppSidebar onStartTour={() => setRunTour(true)} />
        <main className="flex-1 overflow-x-hidden relative flex flex-col">
           {/* Abstract Background */}
          <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-background to-background" />
          
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="-ml-2" />
            <div className="ml-auto flex items-center gap-4">
               {/* Header Actions could go here */}
               <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex gap-2 text-muted-foreground hover:text-primary"
                onClick={() => setRunTour(true)}
               >
                <PlayCircle className="size-4" />
                Start Tour
               </Button>
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
