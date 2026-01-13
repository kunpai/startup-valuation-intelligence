import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Match {
  id: string;
  tournament: string;
  team1: { name: string; score: number; logo: string };
  team2: { name: string; score: number; logo: string };
  status: string;
  map: string;
}

interface Ranking {
  rank: number;
  team: string;
  points: number;
  wins: number;
  losses: number;
}

interface ValorantData {
  matches: Match[];
  rankings: Ranking[];
}

export default function ValorantScores() {
  const { data, isLoading } = useQuery<ValorantData>({
    queryKey: ["valorant-scores"],
    queryFn: async () => {
      const response = await fetch("/api/valorant/live-scores");
      if (!response.ok) throw new Error("Failed to fetch Valorant scores");
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          Valorant Live Scores
        </h1>
        <p className="text-muted-foreground mt-2">
          Track live matches and global team rankings
        </p>
      </div>

      {/* Live Matches */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Live Matches
        </h2>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data?.matches.map((match) => (
              <Card key={match.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription>{match.tournament}</CardDescription>
                    <Badge variant={match.status === "Live" ? "default" : "secondary"}>
                      {match.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{match.team1.logo}</span>
                      <span className="font-medium">{match.team1.name}</span>
                    </div>
                    <span className="text-2xl font-bold">{match.team1.score}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{match.team2.logo}</span>
                      <span className="font-medium">{match.team2.name}</span>
                    </div>
                    <span className="text-2xl font-bold">{match.team2.score}</span>
                  </div>
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Map: {match.map}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rankings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Global Rankings
        </h2>
        
        {isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Top Teams</CardTitle>
              <CardDescription>Current standings in competitive Valorant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.rankings.map((ranking) => (
                  <div
                    key={ranking.rank}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {ranking.rank}
                      </div>
                      <div>
                        <div className="font-semibold">{ranking.team}</div>
                        <div className="text-sm text-muted-foreground">
                          {ranking.wins}W - {ranking.losses}L
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{ranking.points}</div>
                      <div className="text-xs text-muted-foreground">Points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
