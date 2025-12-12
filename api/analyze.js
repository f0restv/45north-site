// /api/analyze.js
// Vercel Serverless Function - Claude Image Analysis
// NOT LIVE - Add ANTHROPIC_API_KEY to Vercel env vars to activate

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API not configured',
      message: 'Add ANTHROPIC_API_KEY to Vercel environment variables'
    });
  }

  try {
    const { images, askingPrice, notes } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    // Build the image content for Claude
    const imageContent = images.map(img => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: img.type || 'image/jpeg',
        data: img.data.replace(/^data:image\/\w+;base64,/, ''),
      },
    }));

    const prompt = `You are an expert appraiser and listing specialist for 45° North Collective, a marketing agency that sells inventory for antique stores, pawn shops, and collectibles dealers.

Analyze these images and provide:

1. **Item Identification**: What is this item? Be specific (brand, era, model if visible)

2. **Condition Assessment**: Rate condition (Poor/Fair/Good/Excellent/Mint) and note any visible issues

3. **Market Value Estimate**: Provide a realistic range based on current market
   - Low estimate: $___
   - High estimate: $___
   ${askingPrice ? `- Client asking price: $${askingPrice}` : ''}
   ${askingPrice ? `- Price assessment: Is the asking price reasonable? Too high? A bargain?` : ''}

4. **Listing Title**: Write a compelling 60-80 character title for auction sites

5. **Listing Description**: Write a 2-3 paragraph description that:
   - Opens with a hook
   - Describes key features and condition honestly
   - Mentions provenance/history if apparent
   - Closes with collector appeal
   - Includes relevant keywords for search

6. **Platform Recommendation**: Which platform(s) would sell this best?
   - HiBid (local auctions, general collectibles)
   - eBay (national reach, specific collectors)
   - Whatnot (live auctions, engaged community)

7. **Tags**: List 5-10 relevant tags for categorization

${notes ? `\nClient notes: "${notes}"` : ''}

Respond in JSON format:
{
  "itemType": "string",
  "condition": "string",
  "conditionNotes": "string",
  "valueLow": number,
  "valueHigh": number,
  "askingPriceAssessment": "string or null",
  "listingTitle": "string",
  "listingDescription": "string",
  "platforms": ["array", "of", "platforms"],
  "tags": ["array", "of", "tags"],
  "additionalNotes": "string or null"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: [
              ...imageContent,
              { type: 'text', text: prompt },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      return res.status(500).json({ error: 'Analysis failed', details: error });
    }

    const data = await response.json();
    const analysisText = data.content[0].text;

    // Try to parse as JSON, fall back to raw text
    let analysis;
    try {
      // Extract JSON from response (Claude sometimes wraps it in markdown)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: analysisText };
    } catch {
      analysis = { raw: analysisText };
    }

    return res.status(200).json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}
