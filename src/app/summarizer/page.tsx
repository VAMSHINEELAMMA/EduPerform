
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, BookText, Link as LinkIcon } from "lucide-react";
import { summarizeContent, SummarizeContentOutput } from "@/ai/flows/summarize-content-flow";
import { analyzeUrl } from "@/ai/flows/analyze-url-flow";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function SummarizerPage() {
  const [pastedContent, setPastedContent] = useState("");
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState<SummarizeContentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarizeText = async () => {
    if (!pastedContent.trim()) {
      toast({
        variant: "destructive",
        title: "Content is empty",
        description: "Please enter some text to summarize.",
      });
      return;
    }
    await generateSummary(summarizeContent({ content: pastedContent }));
  };
  
  const handleSummarizeUrl = async () => {
    if (!url.trim()) {
      toast({
        variant: "destructive",
        title: "URL is empty",
        description: "Please enter a URL to analyze.",
      });
      return;
    }
     try {
      new URL(url);
    } catch (_) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter a valid URL.",
      });
      return;
    }
    await generateSummary(analyzeUrl({ url: url }));
  };

  const generateSummary = async (promise: Promise<SummarizeContentOutput>) => {
     setIsLoading(true);
     setSummary(null);

     try {
       const result = await promise;
       setSummary(result);
     } catch (error) {
       console.error("Summarization failed:", error);
       toast({
         variant: "destructive",
         title: "Summarization Failed",
         description: "An error occurred while analyzing the content. The URL may be inaccessible or the content too large.",
       });
     } finally {
       setIsLoading(false);
     }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <BookText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">AI Content Summarizer</CardTitle>
              <CardDescription>
                Paste your content below or provide a URL, and the AI will extract the key points for you.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="text">Paste Text</TabsTrigger>
                    <TabsTrigger value="url">From URL</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="pt-4">
                    <div className="space-y-4">
                        <Textarea
                            placeholder="Paste your text, article, or notes here..."
                            rows={10}
                            value={pastedContent}
                            onChange={(e) => setPastedContent(e.target.value)}
                            disabled={isLoading}
                            className="text-base"
                        />
                        <Button onClick={handleSummarizeText} disabled={isLoading || !pastedContent.trim()} className="w-full md:w-auto">
                            {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                            ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Key Points
                            </>
                            )}
                        </Button>
                    </div>
                </TabsContent>
                 <TabsContent value="url" className="pt-4">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <LinkIcon className="h-5 w-5 text-muted-foreground"/>
                            <Input
                                type="url"
                                placeholder="https://example.com/article"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={isLoading}
                                className="text-base"
                            />
                        </div>
                        <Button onClick={handleSummarizeUrl} disabled={isLoading || !url.trim()} className="w-full md:w-auto">
                            {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing URL...
                            </>
                            ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Analyze URL
                            </>
                            )}
                        </Button>
                    </div>
                 </TabsContent>
            </Tabs>
        </CardContent>
      </Card>

      {summary && (
        <Card className="animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" /> Key Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {summary.keyPoints}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
