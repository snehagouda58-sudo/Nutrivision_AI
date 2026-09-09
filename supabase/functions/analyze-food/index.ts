import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, userProfile } = await req.json();
    
    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing food image with AI...");

    // Create personalized system prompt based on user profile
    let systemPrompt = `You are an expert nutritionist and dietitian analyzing food images. 
Provide detailed nutritional analysis and personalized health recommendations.`;

    if (userProfile) {
      systemPrompt += `\n\nUser Profile:
- Gender: ${userProfile.gender || 'Not specified'}
- Age: ${userProfile.age || 'Not specified'}
- Height: ${userProfile.height_cm ? `${userProfile.height_cm} cm` : 'Not specified'}
- Weight: ${userProfile.weight_kg ? `${userProfile.weight_kg} kg` : 'Not specified'}
- Activity Level: ${userProfile.activity_level || 'Not specified'}
- Health Goals: ${userProfile.health_goals?.join(', ') || 'Not specified'}
- Dietary Restrictions: ${userProfile.dietary_restrictions?.join(', ') || 'None'}
- Allergies: ${userProfile.allergies?.join(', ') || 'None'}
- Medical Conditions: ${userProfile.medical_conditions?.join(', ') || 'None'}

Based on this profile, provide personalized nutritional advice and recommendations.`;
    }

    const userPrompt = `Analyze this food image with HIGH ACCURACY (aim for 80-90% precision) and provide detailed analysis.

CRITICAL: You must respond with a JSON object wrapped in markdown code block. Format:

\`\`\`json
{
  "foodName": "Name of the food item",
  "description": "Brief description of the food",
  "portionSize": "Estimated portion size (e.g., 1 cup, 200g)",
  "nutritionalContent": {
    "calories": number,
    "protein": number (in grams),
    "carbohydrates": number (in grams),
    "fats": number (in grams),
    "fiber": number (in grams),
    "sugar": number (in grams),
    "sodium": number (in mg)
  },
  "vitaminsAndMinerals": [
    {"name": "Vitamin/Mineral name", "amount": "amount with unit", "dailyValue": "% of daily value"}
  ],
  "healthBenefits": ["benefit 1", "benefit 2", "benefit 3"],
  "concerns": ["concern 1", "concern 2"],
  "personalizedRecommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "healthierAlternatives": ["alternative 1", "alternative 2"],
  "overallHealthScore": number (1-10 scale)
}
\`\`\`

Be specific with measurements and use scientific accuracy. Consider the user's health profile when making recommendations.`;

    // Call Lovable AI with Gemini model for multimodal analysis
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log("Food analysis completed successfully");

    // Store the analysis in the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        await supabase.from("food_analyses").insert({
          user_id: user.id,
          image_url: imageUrl,
          analysis_result: { analysis },
          recommendations: analysis,
        });
      }
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-food function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});