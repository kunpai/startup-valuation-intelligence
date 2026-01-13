import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Dices, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Bet {
  id: string;
  game: string;
  amount: number;
  multiplier: number;
  profit: number;
  timestamp: string;
}

interface Stats {
  totalBets: number;
  totalWagered: number;
  totalProfit: number;
  winRate: number;
  biggestWin: number;
}

interface LiveGame {
  name: string;
  players: number;
  status: string;
}

interface StakeData {
  recentBets: Bet[];
  stats: Stats;
  liveGames: LiveGame[];
}

export default function StakePlugin() {
  const { data, isLoading } = useQuery<StakeData>({
    queryKey: ["stake-stats"],
    queryFn: async () => {
      const response = await fetch("/api/stake/stats");
      if (!response.ok) throw new Error("Failed to fetch Stake data");
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Dices className="h-8 w-8 text-primary" />
          Stake.com Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Live betting statistics and game information
        </p>
      </div>

      {/* Stats Overview */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Bets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.stats.totalBets.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Wagered</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data?.stats.totalWagered || 0)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Profit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(data?.stats.totalProfit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(data?.stats.totalProfit || 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Win Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.stats.winRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Biggest Win</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(data?.stats.biggestWin || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Bets */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Bets
        </h2>
        
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {data?.recentBets.map((bet) => (
                  <div
                    key={bet.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <Dices className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{bet.game}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(bet.amount)} × {bet.multiplier}x
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${bet.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {bet.profit >= 0 ? '+' : ''}{formatCurrency(bet.profit)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(bet.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Live Games */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Live Games
        </h2>
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data?.liveGames.map((game) => (
              <Card key={game.name} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{game.name}</CardTitle>
                    <Badge variant="default">Live</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {game.players} players active
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
