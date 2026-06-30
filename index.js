import express from "express";
import compression from "compression";
import fs from "fs/promises";

import preprocess from "./utils/preprocess.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(express.json());
// Cache static assets (logos, css, js) in the browser so repeat visits
// don't re-download them on every page load.
app.use(express.static(".", { maxAge: "1d" }));

let problems = [];
let idf = {};
let docVectors = [];
let docMagnitudes = [];

// Loading a couple of pre-built JSON files is essentially instant, unlike
// the old approach of re-running TF-IDF over the whole corpus on every boot.
async function loadIndex() {
  const [indexRaw, problemsRaw] = await Promise.all([
    fs.readFile("./corpus/search-index.json", "utf-8"),
    fs.readFile("./corpus/problems.json", "utf-8"),
  ]);

  const index = JSON.parse(indexRaw);
  problems = JSON.parse(problemsRaw);
  idf = index.idf;
  docVectors = index.docVectors;
  docMagnitudes = index.docMagnitudes;
}

function idfFor(term) {
  return idf[term] || 0;
}

app.get("/healthz", (req, res) => {
  res.json({ ok: true, problems: problems.length });
});

app.post("/search", (req, res) => {
  const rawQuery = req.body.query;

  if (!rawQuery || typeof rawQuery !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'query'" });
  }

  const query = preprocess(rawQuery);
  const tokens = query.split(" ").filter(Boolean);

  if (tokens.length === 0) {
    return res.json({ results: [] });
  }

  // Build the query TF×IDF vector
  const termFreq = {};
  tokens.forEach((t) => {
    termFreq[t] = (termFreq[t] || 0) + 1;
  });

  const queryVector = {};
  let sumSqQ = 0;
  const N = tokens.length;
  Object.entries(termFreq).forEach(([term, count]) => {
    const tf = count / N;
    const w = tf * idfFor(term);
    queryVector[term] = w;
    sumSqQ += w * w;
  });
  const queryMag = Math.sqrt(sumSqQ) || 1;
  const queryTerms = Object.entries(queryVector);
  const lowerQuery = rawQuery.toLowerCase();

  // Compute cosine similarity against each document
  const scores = [];
  for (let idx = 0; idx < problems.length; idx++) {
    const docVec = docVectors[idx];
    const docMag = docMagnitudes[idx] || 1;
    let dot = 0;

    for (const [term, wq] of queryTerms) {
      const dw = docVec[term];
      if (dw) dot += wq * dw;
    }

    let score = dot / (queryMag * docMag);

    if (score > 0 && problems[idx].title.toLowerCase().includes(lowerQuery)) {
      score += 3;
    }

    if (score > 0) scores.push({ idx, score });
  }

  const top = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ idx }) => problems[idx]);

  res.json({ results: top });
});

loadIndex()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (${problems.length} problems indexed)`);
    });
  })
  .catch((err) => {
    console.error("Failed to load search index.", err);
    console.error("Run `npm run build-index` to generate corpus/search-index.json first.");
    process.exit(1);
  });
