import { Collaborator } from "@/hooks/useCollaboration";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Users, Wifi, WifiOff } from "lucide-react";

interface PresenceIndicatorProps {
  collaborators: Collaborator[];
  isConnected: boolean;
}

export function PresenceIndicator({ collaborators, isConnected }: PresenceIndicatorProps) {
  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm" data-testid="presence-offline">
        <WifiOff className="size-4" />
        <span className="hidden sm:inline">Offline</span>
      </div>
    );
  }

  if (collaborators.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm" data-testid="presence-alone">
        <Wifi className="size-4 text-emerald-500" />
        <span className="hidden sm:inline">Connected</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2" data-testid="presence-collaborators">
        <div className="flex -space-x-2">
          {collaborators.slice(0, 3).map((collab, i) => (
            <Tooltip key={collab.odId}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="size-7 border-2 border-background ring-2 ring-primary/20">
                    {collab.odProfileImage ? (
                      <AvatarImage src={collab.odProfileImage} alt={collab.odName} />
                    ) : null}
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {collab.odName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {collab.isEditing && (
                    <span className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-amber-500 rounded-full border border-background animate-pulse" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{collab.odName}</p>
                <p className="text-xs text-muted-foreground">
                  {collab.isEditing ? "Currently editing..." : "Viewing"}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
          {collaborators.length > 3 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="size-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium">
                  +{collaborators.length - 3}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{collaborators.length - 3} more collaborators</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <Badge variant="secondary" className="gap-1 text-xs hidden sm:flex">
          <Users className="size-3" />
          {collaborators.length + 1} online
        </Badge>
      </div>
    </TooltipProvider>
  );
}
