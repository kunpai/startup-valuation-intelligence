import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useValuation } from "@/context/ValuationContext";
import { 
  Users, 
  Mail, 
  UserPlus, 
  Copy, 
  Trash2, 
  Crown, 
  Clock,
  CheckCircle2,
  ArrowLeft,
  Send
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface TeamMember {
  id: string;
  companyId: string;
  userId: string;
  role: string;
  joinedAt: string;
}

interface Invite {
  id: string;
  companyId: string;
  invitedBy: string;
  inviteEmail: string;
  inviteToken: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

interface TeamData {
  members: TeamMember[];
  invites: Invite[];
  owner: { userId: string };
}

export default function TeamManagement() {
  const { currentCompanyId: companyId } = useValuation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");

  const { data: teamData, isLoading } = useQuery<TeamData>({
    queryKey: ["/api/companies", companyId, "team"],
    queryFn: async () => {
      if (!companyId) return { members: [], invites: [], owner: { userId: "" } };
      const res = await fetch(`/api/companies/${companyId}/team`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch team");
      return res.json();
    },
    enabled: !!companyId
  });

  const sendInviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch(`/api/companies/${companyId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error("Failed to send invite");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "team"] });
      setInviteEmail("");
      toast({ title: "Invite sent!", description: "An invitation has been created." });
    },
    onError: () => {
      toast({ title: "Failed to send invite", variant: "destructive" });
    }
  });

  const cancelInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const res = await fetch(`/api/companies/${companyId}/invites/${inviteId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to cancel invite");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "team"] });
      toast({ title: "Invite cancelled" });
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/companies/${companyId}/team/${memberId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to remove member");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "team"] });
      toast({ title: "Team member removed" });
    }
  });

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copied!", description: "Share this link with your team member." });
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      sendInviteMutation.mutate(inviteEmail.trim());
    }
  };

  if (!companyId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Users className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Company Selected</h2>
        <p className="text-muted-foreground mb-6">
          Complete onboarding to manage your team.
        </p>
        <Link href="/onboarding">
          <Button>Start Onboarding</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 pb-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ArrowLeft className="size-4 mr-1" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold font-heading">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Invite team members to collaborate on your valuation
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="size-5 text-primary" />
              Invite Team Members
            </CardTitle>
            <CardDescription>
              Send an invite by email. They'll be able to view and edit your valuation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    data-testid="input-invite-email"
                  />
                  <Button 
                    type="submit" 
                    disabled={!inviteEmail.trim() || sendInviteMutation.isPending}
                    data-testid="button-send-invite"
                  >
                    <Send className="size-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </form>

            {teamData?.invites && teamData.invites.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Clock className="size-4" />
                  Pending Invites
                </h4>
                <div className="space-y-2">
                  {teamData.invites.map((invite) => (
                    <div 
                      key={invite.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border"
                      data-testid={`invite-${invite.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{invite.inviteEmail}</p>
                          <p className="text-xs text-muted-foreground">
                            Expires {new Date(invite.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyInviteLink(invite.inviteToken)}
                          data-testid={`button-copy-link-${invite.id}`}
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelInviteMutation.mutate(invite.id)}
                          data-testid={`button-cancel-invite-${invite.id}`}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              Team Members
            </CardTitle>
            <CardDescription>
              People who have access to this valuation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading team...</div>
            ) : (
              <div className="space-y-3">
                <div 
                  className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20"
                  data-testid="team-owner"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Crown className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">You (Owner)</p>
                      <p className="text-xs text-muted-foreground">Full access</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">Owner</Badge>
                </div>

                {teamData?.members && teamData.members.length > 0 ? (
                  teamData.members.map((member) => (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border"
                      data-testid={`member-${member.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarFallback>
                            <Users className="size-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">Team Member</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{member.role}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMemberMutation.mutate(member.userId)}
                          data-testid={`button-remove-member-${member.id}`}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="size-8 mx-auto mb-2 opacity-50" />
                    <p>No team members yet</p>
                    <p className="text-sm">Send an invite to get started</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card className="bg-secondary/20">
        <CardHeader>
          <CardTitle className="text-lg">How Team Collaboration Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">1</div>
              <div>
                <p className="font-medium">Send Invite</p>
                <p className="text-sm text-muted-foreground">Enter their email and send an invitation</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">2</div>
              <div>
                <p className="font-medium">They Accept</p>
                <p className="text-sm text-muted-foreground">Team member clicks the link or uses token</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold shrink-0">3</div>
              <div>
                <p className="font-medium">Collaborate Live</p>
                <p className="text-sm text-muted-foreground">See each other's changes in real-time</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
