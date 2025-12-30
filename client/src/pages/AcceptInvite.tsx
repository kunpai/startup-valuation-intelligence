import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function AcceptInvite() {
  const [, params] = useRoute("/invite/:token");
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);

  const acceptMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch(`/api/invites/${token}/accept`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept invite");
      return data;
    },
    onSuccess: (data) => {
      setStatus("success");
      setMessage(data.message || "You've joined the team!");
      setCompanyId(data.companyId);
    },
    onError: (error: Error) => {
      setStatus("error");
      setMessage(error.message);
    }
  });

  useEffect(() => {
    if (params?.token) {
      acceptMutation.mutate(params.token);
    }
  }, [params?.token]);

  const goToDashboard = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {status === "loading" && (
                <Loader2 className="size-16 text-primary animate-spin" />
              )}
              {status === "success" && (
                <CheckCircle2 className="size-16 text-emerald-500" />
              )}
              {status === "error" && (
                <XCircle className="size-16 text-destructive" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {status === "loading" && "Accepting Invite..."}
              {status === "success" && "Welcome to the Team!"}
              {status === "error" && "Invite Error"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {status === "success" && (
              <Button onClick={goToDashboard} className="gap-2" data-testid="button-go-dashboard">
                <Users className="size-4" />
                Go to Dashboard
              </Button>
            )}
            {status === "error" && (
              <Button variant="outline" onClick={goToDashboard} data-testid="button-go-home">
                Go to Home
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
