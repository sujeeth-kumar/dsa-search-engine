import fs from "fs/promises";

const leetcode = JSON.parse(
  await fs.readFile("./problems/leetcode_problems.json", "utf8")
);

const codeforces = JSON.parse(
  await fs.readFile("./problems/codeforces_problems.json", "utf8")
);

const merged = [
  ...leetcode.map(problem => ({
    ...problem,
    platform: "LeetCode",
  })),
  ...codeforces.map(problem => ({
    ...problem,
    platform: "Codeforces",
  })),
];

await fs.mkdir("./corpus", { recursive: true });

await fs.writeFile(
  "./corpus/all_problems.json",
  JSON.stringify(merged, null, 2)
);

console.log(`Merged ${merged.length} problems.`);