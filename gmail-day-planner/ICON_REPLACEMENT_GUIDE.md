# Icon Replacement Guide

Replace all emojis with SVG icons from `Icons.tsx`:

## Dashboard.tsx
- 📧 → `<Icons.Mail />`
- 🔄 → `<Icons.RefreshCw />`
- ⚠️ → `<Icons.AlertCircle />`
- 🔥 → `<Icons.TrendingUp />`
- 💰 → `<Icons.DollarSign />`
- 💼 → `<Icons.Briefcase />`
- 📅 → `<Icons.Calendar />`
- 📎 → `<Icons.Paperclip />`
- 🔐 → `<Icons.Lock />`
- 📊 → `<Icons.BarChart />`
- 🔍 → `<Icons.Search />`
- 📭 → `<Icons.Mail />`
- 🔒 → `<Icons.Lock />`
- ✉️ → `<Icons.Mail />`
- ❗ → `<Icons.AlertCircle />`

## SummaryView.tsx
- ⭐ → `<Icons.Star />`
- 💰 → `<Icons.DollarSign />`
- 💼 → `<Icons.Briefcase />`
- 📅 → `<Icons.Calendar />`
- 📎 → `<Icons.Paperclip />`
- 🗓 → `<Icons.Calendar />`
- 🕒 → `<Icons.Clock />`
- 🧠 → `<Icons.BarChart />`
- 📊 → `<Icons.BarChart />`
- 📭 → `<Icons.Mail />`

## All other components
Replace emojis with appropriate icons from Icons.tsx

## Import statement to add:
```typescript
import { Icons } from './Icons';
```

## Usage example:
```typescript
// Before
<span>📧</span>

// After
<Icons.Mail />
```
