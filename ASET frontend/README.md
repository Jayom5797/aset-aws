# ASET - Academic Safety & Evidencing Truth

**AI-powered scientific claim verification platform** that helps researchers, students, and academics verify scientific claims using peer-reviewed literature from arXiv and NASA ADS.

## 🎯 What is ASET?

ASET is an intelligent research assistant that:
- **Searches** 972,327+ scientific papers from arXiv and NASA ADS
- **Analyzes** claims using AI ( llama-3.3-70b model)
- **Verifies** scientific statements with evidence-based scoring
- **Provides** detailed paper analysis with relevance rankings

## ✨ Key Features

### 🔍 Intelligent Paper Search
- Full-text search across 972K+ papers
- Hierarchical classification (Domain → Topic → Subtopic)
- Relevance scoring (1-10) based on title, abstract, and FTS rank
- Support for both arXiv and NASA ADS sources
- Advanced filtering by year, topic, subtopic, source, and relevance

### 🤖 AI-Powered Verification
- Analyzes top papers using llama-3.3-70b model
- Generates verification scores (0-100%)
- Provides verdict: Supported, Contradicted, or Neutral
- Confidence levels: High, Medium, Low
- Detailed paper-by-paper analysis with evidence extraction
- Processing time: 5-10 seconds for 5 papers

### 📊 Rich Results Display
- Two-column layout: Papers (left) + AI Analysis (right)
- Sticky verification sidebar for easy reference
- Collapsible abstracts to reduce clutter
- Paper ranking with visual badges
- Color-coded relevance scores
- Direct links to original papers

### 💬 Chat Interface
- Conversational UI for natural claim submission
- Chat history with localStorage persistence
- Auto-save conversations
- Load previous chats from history
- Suggestion cards for quick queries

### 📈 Performance Optimized
- Progressive loading (10 papers at a time)
- Compact card design for better information density
- Responsive layout (desktop + mobile)
- Fast query times (typically < 2000ms)

## 🛠️ Technical Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Custom CSS with modern design system
- **State Management**: React Hooks
- **Storage**: localStorage for chat persistence
- **Build Tool**: Vite 7.3.0

### Backend API
- **Database**: Turso (SQLite at the edge) - 972,327 papers
- **AI Model**: Groq API with llama-3.3-70b
- **Search**: Full-text search (FTS5) + hierarchical indexing
- **Sources**: arXiv API + NASA ADS API

### Data Sources
- **arXiv**: Physics, astronomy, computer science papers
- **NASA ADS**: Astrophysics and space science literature
- **Coverage**: Papers from 1990s to present

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running (see environment configuration)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "ASET frontend"

# Install dependencies
npm install
```

### Environment Configuration

Create `.env` file for development:
```env
VITE_API_URL=http://localhost:3000
```

Create `.env.production` file for production:
```env
VITE_API_URL=https://your-backend-api.com
```

### Development

```bash
# Start development server
npm run dev

# Access at http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment

**Vercel (Recommended)**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Manual Deployment**:
1. Run `npm run build`
2. Deploy the `dist` folder to any static hosting service
3. Ensure environment variables are configured

## 📖 How to Use ASET

### 1. Submit a Claim
Type a scientific claim in the chat interface:
- "Can black holes evaporate through Hawking radiation?"
- "Have we discovered Earth-like planets in habitable zones?"
- "Can neutron stars exceed 5 solar masses?"

### 2. Review Papers
Browse the ranked list of relevant papers:
- View relevance scores (1-10)
- Check paper metadata (authors, year, source)
- Read abstracts (click "Show Abstract")
- Access original papers via links

### 3. Verify with AI
Click "Verify Claim with AI" to:
- Analyze top 5 papers
- Get verification score (0-100%)
- See verdict (Supported/Contradicted/Neutral)
- Review confidence level
- Read AI-generated summary
- Explore key findings
- View detailed paper analyses

### 4. Manage Chats
- **New Chat**: Start fresh conversation
- **History**: View all past chats
- **Load Chat**: Restore previous conversation
- **Auto-save**: All chats saved automatically

## 🎨 UI Features

### Compact Design
- 40% more content visible without scrolling
- Tighter spacing (12px gaps between cards)
- Smaller fonts (13-16px range)
- Collapsible sections

### Visual Hierarchy
- Paper rank badges (#1, #2, #3...)
- Color-coded relevance scores
- Source badges (arXiv vs NASA ADS)
- Sticky verification sidebar

### Responsive Layout
- Desktop: Two-column layout (papers + verification)
- Tablet: Adjusted column widths
- Mobile: Single column, stacked layout

## 🔧 Configuration

### API Endpoints Used
- `POST /api/get-sources` - Search papers
- `POST /api/verify-claim` - AI verification
- `GET /api/filters` - Get filter options

### Search Parameters
- `claim`: Scientific claim to search
- `filters`: { yearMin, yearMax, topic, subtopic, source, minRelevance }
- `limit`: Number of papers (default: 50)
- `offset`: Pagination offset

### Verification Parameters
- `claim`: Scientific claim to verify
- `papers`: Array of paper objects
- `maxPapers`: Number to analyze (default: 5)

## 📊 Data Structure

### Paper Object
```javascript
{
  paperId: "2401.12345",
  title: "Paper Title",
  authors: "Author 1, Author 2",
  abstract: "Paper abstract...",
  year: 2024,
  journal: "Journal Name",
  source: "arxiv" | "nasa-ads",
  url: "https://arxiv.org/abs/2401.12345",
  relevance: 8.5
}
```

### Verification Result
```javascript
{
  verificationScore: 85,
  verdict: "Supported",
  confidence: "High",
  summary: "AI-generated summary...",
  keyFindings: ["Finding 1", "Finding 2"],
  limitations: "Analysis limitations...",
  papersAnalyzed: 5,
  processingTimeMs: 5432,
  analyses: [/* detailed paper analyses */]
}
```

## 🔐 Privacy & Storage

- **Chat History**: Stored locally in browser (localStorage)
- **No Server Storage**: Conversations not sent to backend
- **API Calls**: Only search queries and verification requests
- **Data Persistence**: Survives browser refresh, cleared on cache clear## 📊 Performance

- **Search**: 5-10 seconds for 5 papers
- **Verification**: 5-10 seconds for 5 papers
- **Pagination**: 5-10 seconds for 50 papers
- **Data Retrieval**: 5-10 seconds for 50 papers

## 📝 License

This project is part of academic research. All rights reserved.

## 🔗 Resources

- **arXiv**: https://arxiv.org
- **NASA ADS**: https://ui.adsabs.harvard.edu
- **Turso Database**: https://turso.tech

---

**Built for researchers, by researchers** 🚀
