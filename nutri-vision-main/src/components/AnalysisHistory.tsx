import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { History, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface AnalysisHistoryProps {
  userId: string;
}

const AnalysisHistory = ({ userId }: AnalysisHistoryProps) => {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyses();
  }, [userId]);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("food_analyses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setAnalyses(data || []);
    } catch (error: any) {
      console.error("Error fetching analyses:", error);
      toast.error("Failed to load analysis history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <History className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analysis History</h3>
          <p className="text-muted-foreground text-center">
            Your food analysis history will appear here once you start analyzing images.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Analysis History
          </CardTitle>
          <CardDescription>View your past food analyses</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {analyses.map((analysis) => (
          <Card key={analysis.id} className="shadow-soft hover:shadow-glow transition-smooth">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-48 h-48 flex-shrink-0">
                  <img
                    src={analysis.image_url}
                    alt="Food"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(analysis.created_at), "PPpp")}
                  </div>

                  {analysis.recommendations && (
                    <div className="prose prose-sm max-w-none">
                      <div className="line-clamp-6 whitespace-pre-wrap">
                        {analysis.recommendations}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AnalysisHistory;