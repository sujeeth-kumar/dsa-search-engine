# DSA Search Engine

A web-based search engine that enables users to discover relevant Data Structures and Algorithms problems from **LeetCode** and **Codeforces** using natural language queries.

🔗 **Live Demo:** https://dsa-search-engine-wdab.onrender.com

---

## Overview

Finding the right coding problem often requires searching through multiple platforms. This project simplifies that process by indexing over **9,000 programming problems** and retrieving the most relevant matches using **TF-IDF** and **Cosine Similarity**.

The dataset was **scraped from scratch using Puppeteer**, merged into a unified corpus, preprocessed, and indexed to provide fast and accurate search results.

---

## Features

- 🔍 Search over **9,000+ DSA problems**
- 🕸️ Custom Puppeteer-based web scrapers
- 📚 Supports LeetCode and Codeforces
- ⚡ TF-IDF based document indexing
- 📈 Cosine similarity ranking
- 🎯 Title boosting for improved search relevance
- 🧹 Text preprocessing with stop-word removal
- 🌐 Responsive web interface
- ☁️ Deployed on Render

---

## Dataset

The search engine indexes **9,000+ programming problems** collected from:

- LeetCode
- Codeforces

Each indexed problem contains:

- Problem title
- Problem description
- Problem URL

---

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Search & NLP
- Natural.js
- TF-IDF
- Cosine Similarity

### Web Scraping
- Puppeteer

### Deployment
- Render

---

## Project Structure

```text
.
├── assets/
├── corpus/
│   ├── all_problems.json     # raw merged corpus (input to indexing)
│   ├── problems.json         # slim problem list served to the frontend
│   └── search-index.json     # precomputed TF-IDF index (served, not built at boot)
├── problems/
│   ├── leetcode_problems.json
│   └── codeforces_problems.json
├── utils/
│   ├── merge.js
│   ├── build-index.js        # offline: builds search-index.json + problems.json
│   └── preprocess.js
├── scrape.js
├── index.js
├── index.html
├── styles.css
├── script.js
├── package.json
└── README.md
```

---

## How It Works

1. Scrape problems from LeetCode and Codeforces using Puppeteer (offline, manual).
2. Merge both datasets into a unified corpus (`npm run merge`).
3. Preprocess titles and descriptions by:
   - Converting text to lowercase
   - Removing punctuation
   - Removing stop words
4. **Build the TF-IDF index once, offline** (`npm run build-index`), producing
   `corpus/search-index.json` and `corpus/problems.json`.
5. At runtime, the server simply loads those precomputed files — it no longer
   rebuilds the index on every boot.
6. Convert user queries into TF-IDF vectors and compute cosine similarity
   against the precomputed document vectors.
7. Apply title boosting to improve ranking.
8. Return the Top 10 most relevant problems.

---

## Installation

Clone the repository

```bash
git clone https://github.com/sujeeth-kumar/dsa-search-engine.git
```

Move into the project directory

```bash
cd dsa-search-engine
```

Install dependencies

```bash
npm install
```

Build the search index (only needed once, or whenever
`corpus/all_problems.json` changes — the result is already committed to the
repo)

```bash
npm run build-index
```

Start the server

```bash
npm start
```

Open

```
http://localhost:3000
```

---

## Why It Was Slow on Render

Two things made the live deploy slow to open:

1. **Puppeteer was a production dependency.** It's only used by `scrape.js`
   to collect data offline, but because it lived in `dependencies`, every
   `npm install` on Render downloaded a full Chromium browser (~300MB)
   before the app could even start. Puppeteer is now a `devDependency`, and
   `.puppeteerrc.cjs` skips the browser download entirely during install —
   it's only fetched manually (`npx puppeteer browsers install chrome`) if
   you actually need to re-scrape.
2. **The TF-IDF search index was rebuilt from scratch on every boot.**
   Indexing 8,700+ problem descriptions with `natural` took 30–45 seconds on
   each cold start. That work now happens once, offline (`npm run
   build-index`), and is committed as `corpus/search-index.json`. The server
   just loads that file, which takes well under a second.

One thing this *can't* fix: Render's free tier spins your service down after
15 minutes of inactivity, and the first request after that always needs to
spin a new instance back up (typically 30–60 seconds, mostly Render's
container cold start, not this app). That's a platform limitation of the
free tier, not something fixable in app code — upgrading to a paid Render
plan (or using a host with always-on instances) is the only way to remove
that delay entirely.

---

## Example Queries

- binary search
- climbing stairs
- graph bfs
- dynamic programming
- segment tree
- knapsack
- dijkstra
- prefix sum
- two pointers

---

## Future Improvements

- Platform filters
- Difficulty filters
- Topic-based filtering
- Autocomplete suggestions
- Fuzzy search
- BM25 ranking
- Semantic search using embeddings

---

## Screenshot

_Add a screenshot of the homepage and search results here._

---

## Author

**Sujeeth Kumar Chunarkar**

GitHub: https://github.com/sujeeth-kumar

---

## License

This project is licensed under the ISC License.
