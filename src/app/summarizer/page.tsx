
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, BookText } from "lucide-react";
import { summarizeContent, SummarizeContentOutput } from "@/ai/flows/summarize-content-flow";
import { useToast } from "@/hooks/use-toast";

export default function SummarizerPage() {
  const [pastedContent, setPastedContent] = useState("");
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
         description: "An error occurred while analyzing the content.",
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
                Paste your content below and the AI will extract the key pints for you.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                        Generate Key Pints
                    </>
                    )}
                </Button>
            </div>
        </CardContent>
      </Card>

      {summary && (
        <Card className="animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" /> Key Pints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {summary.keyPints}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
