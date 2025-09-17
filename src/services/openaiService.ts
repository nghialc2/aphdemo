import OpenAI from 'openai';

// Initialize OpenAI client (you'll need to set VITE_OPENAI_API_KEY in your environment)
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
});

export interface UniversityLocation {
  name: string;
  country: string;
  city: string;
  coordinates: [number, number]; // [longitude, latitude]
  description?: string;
  specializations?: string[];
  establishedYear?: number;
  ranking?: string;
}

export interface PartnershipInsight {
  university: string;
  country: string;
  keyStrengths: string[];
  collaborationAreas: string[];
  culturalNotes: string;
  businessOpportunities: string[];
  strategicValue: string;
}

export class OpenAIGeographicService {
  /**
   * Find precise coordinates for a university
   */
  async findUniversityCoordinates(universityName: string, country: string): Promise<UniversityLocation | null> {
    try {
      const prompt = `
        Find the exact geographic coordinates and detailed information for this university:
        University: "${universityName}"
        Country: "${country}"
        
        Please provide a JSON response with the following structure:
        {
          "name": "Full official university name",
          "country": "Country name",
          "city": "City where main campus is located",
          "coordinates": [longitude, latitude],
          "description": "Brief description of the university (2-3 sentences)",
          "specializations": ["area1", "area2", "area3"],
          "establishedYear": year,
          "ranking": "Global or regional ranking information if available"
        }
        
        Ensure coordinates are accurate to the main campus location.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: "You are a geographic and educational expert. Provide accurate, up-to-date information about universities worldwide. Always respond with valid JSON." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 800
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      // Parse the JSON response
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const universityData = JSON.parse(cleanedContent);
      
      return universityData;
    } catch (error) {
      console.error('Error finding university coordinates:', error);
      return null;
    }
  }

  /**
   * Get AI-powered partnership insights
   */
  async getPartnershipInsights(universityName: string, country: string): Promise<PartnershipInsight | null> {
    try {
      const prompt = `
        Analyze the strategic partnership potential between FSB (Foreign Trade University, Vietnam) and this university:
        University: "${universityName}"
        Country: "${country}"
        
        Provide insights about:
        1. The university's key academic strengths
        2. Potential collaboration areas with a Vietnamese business school
        3. Cultural considerations for partnership
        4. Business opportunities in the region
        5. Strategic value of this partnership
        
        Respond in JSON format:
        {
          "university": "University name",
          "country": "Country",
          "keyStrengths": ["strength1", "strength2", "strength3"],
          "collaborationAreas": ["area1", "area2", "area3"],
          "culturalNotes": "Important cultural considerations for Vietnamese partnerships",
          "businessOpportunities": ["opportunity1", "opportunity2", "opportunity3"],
          "strategicValue": "Why this partnership is valuable for FSB"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: "You are an international business education expert specializing in university partnerships and cross-cultural collaboration." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const insights = JSON.parse(cleanedContent);
      
      return insights;
    } catch (error) {
      console.error('Error getting partnership insights:', error);
      return null;
    }
  }

  /**
   * Batch process multiple universities to find coordinates
   */
  async batchFindCoordinates(universities: Array<{name: string, country: string}>): Promise<UniversityLocation[]> {
    const results: UniversityLocation[] = [];
    
    for (const uni of universities) {
      const location = await this.findUniversityCoordinates(uni.name, uni.country);
      if (location) {
        results.push(location);
      }
      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

  /**
   * Generate enhanced partnership descriptions
   */
  async generatePartnershipDescription(
    universityName: string, 
    country: string, 
    existingCollaborations: string[]
  ): Promise<string> {
    try {
      const prompt = `
        Create a compelling, professional description for FSB's partnership with ${universityName} in ${country}.
        
        Context:
        - FSB is Vietnam's leading business university
        - Current collaborations include: ${existingCollaborations.join(', ')}
        
        Write a 2-3 sentence description that highlights:
        - The strategic value of this partnership
        - Key collaboration areas
        - Benefits for students and faculty
        
        Keep it professional but engaging, suitable for a university website.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: "You are a professional marketing writer specializing in international education partnerships." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 200
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating partnership description:', error);
      return '';
    }
  }
}

// Export a singleton instance
export const openaiGeoService = new OpenAIGeographicService();