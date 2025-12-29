import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MOCK_COMPS, SECTORS, STAGES } from "@/lib/constants";
import { Search, Filter, Download } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';

export default function MarketComps() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Market Comparables</h1>
          <p className="text-muted-foreground mt-1">Benchmark your startup against similar companies.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
                <Download className="size-4 mr-2" /> Export CSV
            </Button>
        </div>
      </div>

      {/* Scatter Plot */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
        <CardHeader>
            <CardTitle>Valuation vs Revenue</CardTitle>
            <CardDescription>Compare your valuation against market multiples</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                            type="number" 
                            dataKey="revenue" 
                            name="Revenue" 
                            unit="$" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickFormatter={(value) => `${value/1000}k`}
                        />
                        <YAxis 
                            type="number" 
                            dataKey="valuation" 
                            name="Valuation" 
                            unit="$" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickFormatter={(value) => `${value/1000000}M`}
                        />
                        <ZAxis type="number" dataKey="growth" range={[50, 400]} name="Growth" />
                        <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }} 
                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                            formatter={(value: any, name: any) => [
                                name === 'Valuation' ? `$${value/1000000}M` : name === 'Revenue' ? `$${value/1000}k` : `${value}%`, 
                                name
                            ]}
                        />
                        <Scatter name="Market Comps" data={MOCK_COMPS} fill="hsl(var(--primary))" />
                        {/* User Company Indicator - Mocked */}
                        <Scatter 
                            name="Your Company" 
                            data={[{ revenue: 600000, valuation: 12500000, growth: 120 }]} 
                            fill="hsl(var(--chart-2))" 
                            shape="star" 
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
        <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search companies..." className="pl-9" />
                </div>
                <Select defaultValue="all-sectors">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sector" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-sectors">All Sectors</SelectItem>
                        {SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select defaultValue="all-stages">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Stage" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-stages">All Stages</SelectItem>
                        {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button variant="secondary" className="px-3">
                    <Filter className="size-4" />
                </Button>
            </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/10 overflow-hidden">
        <Table>
            <TableHeader className="bg-secondary/50">
                <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead className="text-right">Valuation (Post)</TableHead>
                    <TableHead className="text-right">Revenue (ARR)</TableHead>
                    <TableHead className="text-right">Growth</TableHead>
                    <TableHead>Region</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {MOCK_COMPS.map((comp, i) => (
                    <TableRow key={i} className="hover:bg-secondary/30 transition-colors">
                        <TableCell className="font-medium text-foreground">{comp.company}</TableCell>
                        <TableCell>
                            <Badge variant="secondary" className="font-normal text-xs">{comp.sector}</Badge>
                        </TableCell>
                        <TableCell>{comp.round}</TableCell>
                        <TableCell className="text-right font-mono font-medium">
                            ${(comp.valuation / 1000000).toFixed(1)}M
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                            ${(comp.revenue / 1000).toFixed(0)}k
                        </TableCell>
                        <TableCell className="text-right">
                            <span className="text-emerald-500 font-medium">{comp.growth}%</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{comp.region}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </Card>
      
      <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-secondary/50 to-background border-primary/10">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Median Valuation (Seed)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold font-heading">$10.2M</div>
                    <p className="text-xs text-muted-foreground mt-1">For B2B SaaS in 2024</p>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-secondary/50 to-background border-primary/10">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Median Revenue Multiple</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold font-heading">15.4x</div>
                    <p className="text-xs text-muted-foreground mt-1">ARR Multiple</p>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-secondary/50 to-background border-primary/10">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Deal Volume</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold font-heading">124</div>
                    <p className="text-xs text-muted-foreground mt-1">Deals in last 90 days</p>
                </CardContent>
            </Card>
      </div>
    </div>
  );
}
