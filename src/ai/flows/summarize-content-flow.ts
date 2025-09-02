
'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing text content into key pints.
 *
 * - summarizeContent - A function that takes a block of text and returns key pints.
 * - SummarizeContentInput - The input type for the summarizeContent function.
 * - SummarizeContentOutput - The return type for the summarizeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeContentInputSchema = z.object({
  content: z.string().describe('The text content to be summarized.'),
});
export type SummarizeContentInput = z.infer<
  typeof SummarizeContentInputSchema
>;

const SummarizeContentOutputSchema = z.object({
  keyPints: z
    .string()
    .describe(
      'The key pints of the content, formatted as a bulleted or numbered list.'
    ),
});
export type SummarizeContentOutput = z.infer<
  typeof SummarizeContentOutputSchema
>;

export async function summarizeContent(
  input: SummarizeContentInput
): Promise<SummarizeContentOutput> {
  return summarizeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeContentPrompt',
  input: {schema: SummarizeContentInputSchema},
  output: {schema: SummarizeContentOutputSchema},
  prompt: `You are an expert at summarizing complex topics into key pints.
  Analyze the following content and extract the most important key pints.
  Present the key pints as a concise, easy-to-read bulleted list.

  Content to summarize:
  ---
  {{content}}
  ---

  Output the key pints in the specified JSON format.`,
});

const summarizeContentFlow = ai.defineFlow(
  {
    name: 'summarizeContentFlow',
    inputSchema: SummarizeContentInputSchema,
    outputSchema: SummarizeContentOutputSchema,
  },
  async input => {
    if (!input.content.trim()) {
        return { keyPints: "Please provide some content to summarize." };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
