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
│   └── all_problems.json
├── problems/
│   ├── leetcode_problems.json
│   └── codeforces_problems.json
├── utils/
│   ├── merge.js
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

1. Scrape problems from LeetCode and Codeforces using Puppeteer.
2. Merge both datasets into a unified corpus.
3. Preprocess titles and descriptions by:
   - Converting text to lowercase
   - Removing punctuation
   - Removing stop words
4. Build a TF-IDF index.
5. Convert user queries into TF-IDF vectors.
6. Compute cosine similarity between the query and indexed problems.
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

Start the server

```bash
npm start
```

Open

```
http://localhost:3000
```

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
