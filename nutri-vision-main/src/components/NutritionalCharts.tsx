import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface NutritionalData {
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

interface NutritionalChartsProps {
  nutritionalContent: NutritionalData;
  vitaminsAndMinerals?: Array<{ name: string; amount: string; dailyValue: string }>;
  overallHealthScore?: number;
}

const COLORS = {
  protein: "hsl(var(--primary))",
  carbs: "hsl(var(--secondary))",
  fats: "hsl(var(--accent))",
  fiber: "hsl(145 65% 65%)",
};

export const NutritionalCharts = ({ 
  nutritionalContent, 
  vitaminsAndMinerals = [],
  overallHealthScore = 0 
}: NutritionalChartsProps) => {
  const macroData = [
    { name: "Protein", value: nutritionalContent.protein, color: COLORS.protein },
    { name: "Carbs", value: nutritionalContent.carbohydrates, color: COLORS.carbs },
    { name: "Fats", value: nutritionalContent.fats, color: COLORS.fats },
  ];

  const detailedData = [
    { name: "Protein", value: nutritionalContent.protein, unit: "g" },
    { name: "Carbs", value: nutritionalContent.carbohydrates, unit: "g" },
    { name: "Fats", value: nutritionalContent.fats, unit: "g" },
    { name: "Fiber", value: nutritionalContent.fiber, unit: "g" },
    { name: "Sugar", value: nutritionalContent.sugar, unit: "g" },
  ];

  const healthMetrics = [
    { metric: "Protein", value: Math.min((nutritionalContent.protein / 50) * 10, 10) },
    { metric: "Fiber", value: Math.min((nutritionalContent.fiber / 10) * 10, 10) },
    { metric: "Balance", value: overallHealthScore },
    { metric: "Low Sugar", value: Math.max(10 - (nutritionalContent.sugar / 10), 0) },
    { metric: "Low Sodium", value: Math.max(10 - (nutritionalContent.sodium / 500), 0) },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Macronutrient Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Nutritional Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={detailedData}>
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Health Metrics Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={healthMetrics}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" stroke="hsl(var(--foreground))" />
              <PolarRadiusAxis angle={90} domain={[0, 10]} stroke="hsl(var(--muted-foreground))" />
              <Radar 
                name="Health Score" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.6}
                animationDuration={1000}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Key Nutrients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Calories</span>
              <span className="text-2xl font-bold text-primary">{nutritionalContent.calories}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sodium</span>
              <span className="text-lg font-semibold">{nutritionalContent.sodium}mg</span>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Vitamins & Minerals</h4>
              {vitaminsAndMinerals.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="text-muted-foreground">{item.dailyValue}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
