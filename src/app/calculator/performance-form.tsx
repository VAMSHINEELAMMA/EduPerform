
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { PredictStudentPerformanceInput, PredictStudentPerformanceOutput } from "@/ai/flows/predict-student-performance";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Lightbulb, TrendingUp } from "lucide-react";

// Mock data fetching, in a real app this would come from an API or a global state
const getAverageScores = () => {
    // These would be fetched based on the logged-in user
    const mockAssessmentScores = [88, 92]; // From submitted assessments
    const mockProjectScores = [85, 95, 90]; // Assuming some project scores exist

    const average = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 80;
    
    return {
        assessmentScore: average(mockAssessmentScores),
        projectScore: average(mockProjectScores),
    };
};


const formSchema = z.object({
  assessmentScore: z.number().min(0).max(100),
  projectScore: z.number().min(0).max(100),
  feedbackScore: z.number().min(0).max(100),
  efficiency: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

interface PerformanceFormProps {
  predictStudentPerformance: (input: PredictStudentPerformanceInput) => Promise<PredictStudentPerformanceOutput>;
}

export function PerformanceForm({ predictStudentPerformance }: PerformanceFormProps) {
  const [prediction, setPrediction] = useState<PredictStudentPerformanceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { control, handleSubmit, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assessmentScore: 80,
      projectScore: 75,
      feedbackScore: 90,
      efficiency: 85,
    },
  });

  useEffect(() => {
    const avgScores = getAverageScores();
    reset({
        assessmentScore: Math.round(avgScores.assessmentScore),
        projectScore: Math.round(avgScores.projectScore),
        feedbackScore: 90, // Keep feedback and efficiency as adjustable params
        efficiency: 85,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const formValues = watch();

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setPrediction(null);
    try {
      const result = await predictStudentPerformance(data);
      setPrediction(result);
    } catch (error) {
      console.error("Prediction failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-8">
            {Object.keys(formValues).map((key) => {
              const fieldName = key as keyof FormValues;
              const label = fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return (
                <div key={fieldName} className="grid gap-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={fieldName}>{label}</Label>
                    <span className="text-lg font-bold text-primary">{formValues[fieldName]}</span>
                  </div>
                  <Controller
                    name={fieldName}
                    control={control}
                    render={({ field }) => (
                      <Slider
                        id={fieldName}
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        disabled={isLoading}
                      />
                    )}
                  />
                </div>
              );
            })}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
             <>
              <Sparkles className="mr-2 h-4 w-4" />
              Predict Performance
            </>
          )}
        </Button>
      </form>

      {prediction && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <Card className="bg-primary/5 border-primary/20">
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="text-primary"/> Predicted Performance</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-5xl font-bold text-primary">{prediction.predictedPerformance.toFixed(1)} / 100</p>
             </CardContent>
           </Card>

           <Card className="bg-accent/5 border-accent/20">
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lightbulb className="text-accent" /> Areas for Improvement</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{prediction.areasForImprovement}</p>
             </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
}
