# In Three Words

**Original art. Three words. A good cause.**

A recurring art project where strangers commission original acrylic paintings by providing just three words as inspiration. A portion of every sale goes to a rotating charity.

## How It Works

1. **Enter for free** — submit your name, phone number, three words, and preferred size
2. **One person is selected each Sunday** — you'll get a text if it's you
3. **Confirm and pay within 3 hours** — $20 (small) or $25 (medium) via Venmo/PayPal
4. **I paint your piece** — original acrylic on canvas, interpreting your words with full creative freedom
5. **You get the original** — photographed, packed, and shipped to your door (US only)
6. **A charity benefits** — a flat donation from every painting goes to a rotating charity of the week

## Pricing

| Size | Price | Charity Donation |
|------|-------|-----------------|
| Under 11x14 | $20 | $5 |
| 12x16 – 24x36 | $25 | $7 |

## Project Structure

```
in-three-words/
├── public/                  # Static assets served directly
│   └── index.html           # Landing page
├── src/
│   ├── components/          # Future: reusable UI components
│   └── utils/               # Future: helper functions
├── assets/                  # Images, logos, brand assets
├── docs/
│   ├── LAUNCH-PLAN.md       # Full launch plan and timeline
│   ├── PRICING.md           # Pricing breakdown and financials
│   └── PROCESS.md           # Step-by-step process documentation
├── .github/
│   └── workflows/           # Future: CI/CD workflows
├── .gitignore
├── LICENSE
└── README.md
```

## Tech Stack (Current)

- **Landing page**: Static HTML/CSS (no build step needed)
- **Submissions**: Google Form (linked from landing page)
- **Selection notifications**: SMS (text the winner each Sunday)
- **Payments**: Venmo / PayPal (only charged after selection)
- **Shipping**: Pirate Ship (discounted USPS rates)
- **Social**: Instagram (primary)

## Deployment

The landing page is a single static HTML file. Deploy it anywhere:

**GitHub Pages:**
1. Go to Settings → Pages
2. Set source to `main` branch, `/public` folder
3. Your site will be live at `https://StructureMA.github.io/in-three-words/`

**Vercel / Netlify:**
1. Connect this repo
2. Set the publish directory to `public/`
3. Deploy

## Roadmap

- [ ] Launch landing page
- [ ] Set up Instagram @inthreewords
- [ ] Create Google Form for submissions
- [ ] First painting + charity donation
- [ ] Add timelapse/process videos
- [ ] Community charity voting
- [ ] Print reproductions
- [ ] International shipping

## License

MIT — see [LICENSE](LICENSE) for details.

---

Built with paint, three words, and good intentions.
