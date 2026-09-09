import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Camera, Upload, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { NutritionalCharts } from "./NutritionalCharts";

interface FoodAnalyzerProps {
  userProfile: any;
  userId: string;
}

const FoodAnalyzer = ({ userProfile, userId }: FoodAnalyzerProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('food-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('food-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const analyzeImage = async (imageUrl: string) => {
    try {
      setAnalyzing(true);
      setAnalysis(null);

      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { imageUrl, userProfile }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      // Parse JSON from markdown code block
      const jsonMatch = data.analysis.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[1]);
        setAnalysis(parsedData);
      } else {
        // Fallback to plain text
        setAnalysis({ rawAnalysis: data.analysis });
      }
      
      toast.success("Analysis complete!");
    } catch (error: any) {
      console.error("Analysis error:", error);
      
      if (error.message?.includes("Rate limit")) {
        toast.error("Too many requests. Please wait a moment and try again.");
      } else if (error.message?.includes("credits")) {
        toast.error("AI credits depleted. Please add credits to continue.");
      } else {
        toast.error("Failed to analyze image. Please try again.");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload and analyze
      const imageUrl = await uploadImage(file);
      await analyzeImage(imageUrl);
    } catch (error) {
      toast.error("Failed to process image");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Food Analysis
          </CardTitle>
          <CardDescription>
            Upload or capture a photo of your food to get instant nutritional analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!imagePreview ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => cameraInputRef.current?.click()}
                variant="outline"
                className="h-32 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-smooth"
                disabled={analyzing}
              >
                <div className="flex flex-col items-center gap-2">
                  <Camera className="h-8 w-8 text-primary" />
                  <span>Take Photo</span>
                </div>
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="h-32 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-smooth"
                disabled={analyzing}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-primary" />
                  <span>Upload Image</span>
                </div>
              </Button>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden shadow-soft">
                <img
                  src={imagePreview}
                  alt="Food preview"
                  className="w-full h-auto max-h-96 object-contain bg-muted"
                />
              </div>

              {analyzing && (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Analyzing your food...</p>
                  </div>
                </div>
              )}

              {analysis && analysis.nutritionalContent && (
                <div className="space-y-6">
                  <Card className="shadow-soft border-2 border-primary/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl">{analysis.foodName}</CardTitle>
                          <CardDescription className="mt-2">{analysis.description}</CardDescription>
                        </div>
                        {analysis.overallHealthScore && (
                          <Badge variant="secondary" className="text-lg px-4 py-2">
                            Score: {analysis.overallHealthScore}/10
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">Portion Size:</span>
                        <span>{analysis.portionSize}</span>
                      </div>

                      <NutritionalCharts 
                        nutritionalContent={analysis.nutritionalContent}
                        vitaminsAndMinerals={analysis.vitaminsAndMinerals}
                        overallHealthScore={analysis.overallHealthScore}
                      />

                      <div className="grid gap-4 md:grid-cols-2 mt-6">
                        {analysis.healthBenefits && analysis.healthBenefits.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                Health Benefits
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {analysis.healthBenefits.map((benefit: string, idx: number) => (
                                  <li key={idx} className="text-sm flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}

                        {analysis.concerns && analysis.concerns.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-accent" />
                                Concerns
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {analysis.concerns.map((concern: string, idx: number) => (
                                  <li key={idx} className="text-sm flex items-start gap-2">
                                    <span className="text-accent mt-1">•</span>
                                    <span>{concern}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}

                        {analysis.personalizedRecommendations && analysis.personalizedRecommendations.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Personalized Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {analysis.personalizedRecommendations.map((rec: string, idx: number) => (
                                  <li key={idx} className="text-sm flex items-start gap-2">
                                    <span className="text-secondary mt-1">•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}

                        {analysis.healthierAlternatives && analysis.healthierAlternatives.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Healthier Alternatives</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {analysis.healthierAlternatives.map((alt: string, idx: number) => (
                                  <li key={idx} className="text-sm flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{alt}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {analysis && analysis.rawAnalysis && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {analysis.rawAnalysis}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={() => {
                  setImagePreview(null);
                  setAnalysis(null);
                }}
                variant="outline"
                className="w-full"
              >
                Analyze Another Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!userProfile && (
        <Card className="border-accent/50 bg-accent/10">
          <CardContent className="pt-6">
            <p className="text-sm text-center">
              <strong>Tip:</strong> Complete your health profile to get personalized nutritional recommendations!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FoodAnalyzer;