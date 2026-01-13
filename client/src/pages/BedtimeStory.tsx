import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Sparkles, Loader2, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StoryRequest {
  theme: string;
  characters?: string;
  ageGroup: string;
  length: string;
}

interface StoryResponse {
  story: string;
  theme: string;
  characters?: string;
  ageGroup: string;
  length: string;
  generatedAt: string;
}

export default function BedtimeStory() {
  const { toast } = useToast();
  const [theme, setTheme] = useState("");
  const [characters, setCharacters] = useState("");
  const [ageGroup, setAgeGroup] = useState("5-8");
  const [length, setLength] = useState("short");
  const [generatedStory, setGeneratedStory] = useState<StoryResponse | null>(null);

  const generateStory = useMutation({
    mutationFn: async (request: StoryRequest) => {
      const response = await fetch("/api/bedtime-story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error("Failed to generate story");
      return response.json();
    },
    onSuccess: (data: StoryResponse) => {
      setGeneratedStory(data);
      toast({
        title: "Story Generated!",
        description: "Your bedtime story is ready to read.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate story. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!theme.trim()) {
      toast({
        title: "Theme Required",
        description: "Please enter a theme for your story.",
        variant: "destructive",
      });
      return;
    }

    generateStory.mutate({
      theme,
      characters: characters.trim() || undefined,
      ageGroup,
      length,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Moon className="h-8 w-8 text-primary" />
          Bedtime Story Generator
        </h1>
        <p className="text-muted-foreground mt-2">
          Create magical bedtime stories with AI
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Story Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Story Settings
            </CardTitle>
            <CardDescription>Customize your bedtime story</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme *</Label>
              <Input
                id="theme"
                placeholder="e.g., A brave bunny exploring the forest"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="characters">Characters (Optional)</Label>
              <Input
                id="characters"
                placeholder="e.g., A friendly fox, a wise owl"
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age-group">Age Group</Label>
              <Select value={ageGroup} onValueChange={setAgeGroup}>
                <SelectTrigger id="age-group">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5-8">5-8 years</SelectItem>
                  <SelectItem value="8-12">8-12 years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Story Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger id="length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (2-3 min)</SelectItem>
                  <SelectItem value="medium">Medium (5-7 min)</SelectItem>
                  <SelectItem value="long">Long (10+ min)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateStory.isPending}
              className="w-full"
              size="lg"
            >
              {generateStory.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Story...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Story
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Story Display */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Your Story
            </CardTitle>
            <CardDescription>
              {generatedStory
                ? `Generated on ${new Date(generatedStory.generatedAt).toLocaleDateString()}`
                : "Your generated story will appear here"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedStory ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {generatedStory.theme}
                  </span>
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                    Ages {generatedStory.ageGroup}
                  </span>
                  <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm capitalize">
                    {generatedStory.length}
                  </span>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-base leading-relaxed">
                    {generatedStory.story}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <BookOpen className="h-16 w-16 mb-4 opacity-20" />
                <p>Fill in the settings and click "Generate Story" to create your bedtime story</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Story Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                "A magical adventure in a candy forest",
                "The sleepy dragon who guards dreams",
                "A journey to the moon on a paper boat",
                "The little star who learned to shine",
                "A cozy tale of forest friends",
              ].map((example) => (
                <Button
                  key={example}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => setTheme(example)}
                >
                  {example}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
