# 45° North Collective - AI Portal Setup

## What's Built (Not Live Yet)

- `/api/analyze.js` - Vercel serverless function that calls Claude API
- `/portal-ai.html` - AI-powered portal (client uploads → instant analysis)

## To Activate

### 1. Get Anthropic API Key
- Go to: https://console.anthropic.com
- Create account if needed
- Go to API Keys → Create Key
- Copy the key (starts with `sk-ant-`)

### 2. Add to Vercel
- Go to: https://vercel.com/[your-project]/settings/environment-variables
- Add new variable:
  - Name: `ANTHROPIC_API_KEY`
  - Value: [paste your key]
  - Environment: Production

### 3. Swap the Portal
Rename files:
```
portfolio.html → portfolio-basic.html
portal-ai.html → portfolio.html
```

### 4. Push & Deploy
```bash
cd ~/Documents/45north-site
git add .
git commit -m "Activate AI portal"
git push
```

## Cost Estimate
- ~$0.01-0.05 per submission (depends on image count/size)
- 100 submissions ≈ $1-5

## How It Works
1. Client uploads photos + optional price/notes
2. JavaScript sends images to `/api/analyze`
3. Vercel function calls Claude API with images
4. Claude returns: item ID, condition, value range, listing title/description, platform recs, tags
5. Client sees instant results, can copy listing

## To Deactivate
Just rename `portfolio.html` back to `portal-ai.html` and restore the basic one.
