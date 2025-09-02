'use server';
/**
 * @fileOverview A Genkit flow for summarizing content from a URL.
 *
 * - analyzeUrl - A function that takes a URL and returns key points.
 * - AnalyzeUrlInput - The input type for the analyzeUrl function.
 * - AnalyzeUrlOutput - The return type for the analyzeUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { fetchUrlContent } from '@/services/url-service';

const AnalyzeUrlInputSchema = z.object({
  url: z.string().url().describe('The URL of the content to be summarized.'),
});
export type AnalyzeUrlInput = z.infer<typeof AnalyzeUrlInputSchema>;

const AnalyzeUrlOutputSchema = z.object({
  keyPoints: z
    .string()
    .describe(
      'The key points of the content, formatted as a bulleted or numbered list.'
    ),
});
export type AnalyzeUrlOutput = z.infer<typeof AnalyzeUrlOutputSchema>;


const fetchUrlTool = ai.defineTool(
    {
      name: 'fetchUrlContent',
      description: 'Fetches the text content from a given URL.',
      inputSchema: z.object({ url: z.string().url() }),
      outputSchema: z.string(),
    },
    async ({ url }) => {
      try {
        return await fetchUrlContent(url);
      } catch (error: any) {
        return `Failed to fetch content from URL: ${error.message}`;
      }
    }
  );


export async function analyzeUrl(
  input: AnalyzeUrlInput
): Promise<AnalyzeUrlOutput> {
  return analyzeUrlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeUrlPrompt',
  input: {schema: z.object({ content: z.string() }) },
  output: {schema: AnalyzeUrlOutputSchema},
  prompt: `You are an expert at summarizing complex topics.
  Analyze the following content and extract the most important key points.
  Present the key points as a concise, easy-to-read bulleted list.

  If the content indicates an error or failure to fetch, state that you could not retrieve the content from the URL.

  Content to summarize:
  ---
  {{content}}
  ---

  Output the key points in the specified JSON format.`,
});

const analyzeUrlFlow = ai.defineFlow(
  {
    name: 'analyzeUrlFlow',
    inputSchema: AnalyzeUrlInputSchema,
    outputSchema: AnalyzeUrlOutputSchema,
  },
  async (input) => {
    const fetchResult = await fetchUrlTool(input);

    const {output} = await prompt({ content: fetchResult });
    return output!;
  }
);
