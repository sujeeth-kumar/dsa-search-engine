// Precomputes the TF-IDF search index for all problems and saves it to disk.
//
// Why this exists: the server used to build this index from scratch (parsing
// 8,700+ problem descriptions with the `natural` library) every time it
// booted. On Render's free tier that added many extra seconds to every cold
// start. Now we do this work once, offline, and the server just loads the
// finished index as JSON, which is near-instant.
//
// Run with: npm run build-index
// Re-run this any time corpus/all_problems.json changes.

import fs from "fs/promises";
import pkg from "natural";

import preprocess from "./preprocess.js";

const { TfIdf } = pkg;

async function buildIndex() {
  console.time("build-index");

  const data = await fs.readFile(
    new URL("../corpus/all_problems.json", import.meta.url),
    "utf-8"
  );
  const problems = JSON.parse(data);

  const tfidf = new TfIdf();

  problems.forEach((problem) => {
    const text = preprocess(
      `${problem.title} ${problem.title} ${problem.description || ""}`
    );
    tfidf.addDocument(text);
  });

  // Sparse per-document term -> weight vectors, plus precomputed vector
  // magnitudes so cosine similarity at query time is just a dot product.
  const docVectors = [];
  const docMagnitudes = [];

  problems.forEach((_, idx) => {
    const vector = {};
    let sumSquares = 0;

    tfidf.listTerms(idx).forEach(({ term, tfidf: weight }) => {
      vector[term] = Math.round(weight * 1e6) / 1e6; // trim float noise
      sumSquares += weight * weight;
    });

    docVectors[idx] = vector;
    docMagnitudes[idx] = Math.sqrt(sumSquares);
  });

  // Collect every term's IDF once so the server can score queries without
  // needing the `natural` library (or the raw corpus text) at runtime.
  const idfMap = {};
  const seenTerms = new Set();
  docVectors.forEach((vector) => {
    Object.keys(vector).forEach((term) => seenTerms.add(term));
  });
  seenTerms.forEach((term) => {
    idfMap[term] = tfidf.idf(term);
  });

  // Slim copy of the problems used by the frontend/search response.
  const lightProblems = problems.map((p) => ({
    title: p.title,
    url: p.url,
    platform: p.platform,
  }));

  const index = {
    builtAt: new Date().toISOString(),
    count: problems.length,
    idf: idfMap,
    docVectors,
    docMagnitudes,
  };

  await fs.writeFile(
    new URL("../corpus/search-index.json", import.meta.url),
    JSON.stringify(index)
  );
  await fs.writeFile(
    new URL("../corpus/problems.json", import.meta.url),
    JSON.stringify(lightProblems)
  );

  console.timeEnd("build-index");
  console.log(`Indexed ${problems.length} problems.`);
}

buildIndex();
