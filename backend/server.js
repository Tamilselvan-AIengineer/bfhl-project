const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const isValidEdge = (str) => {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  if (!/^[A-Z]->[A-Z]$/.test(trimmed)) return false;
  const [p, c] = trimmed.split("->");
  if (p === c) return false;
  return true;
};

app.post("/bfhl", (req, res) => {
  const input = req.body.data || [];

  let invalid_entries = [];
  let duplicate_edges = [];
  let seen = new Set();
  let edges = [];

  // Step 1: Validation + duplicates
  input.forEach((item) => {
    const trimmed = item.trim();

    if (!isValidEdge(trimmed)) {
      invalid_entries.push(item);
      return;
    }

    if (seen.has(trimmed)) {
      if (!duplicate_edges.includes(trimmed)) {
        duplicate_edges.push(trimmed);
      }
      return;
    }

    seen.add(trimmed);
    edges.push(trimmed);
  });

  // Step 2: Build graph
  let adj = {};
  let childSet = new Set();
  let nodes = new Set();
  let parentOf = {};

  edges.forEach((e) => {
    const [p, c] = e.split("->");

    // multi-parent rule
    if (parentOf[c]) return;
    parentOf[c] = p;

    if (!adj[p]) adj[p] = [];
    adj[p].push(c);

    nodes.add(p);
    nodes.add(c);
    childSet.add(c);
  });

  // Step 3: find roots
  let roots = [...nodes].filter((n) => !childSet.has(n));

  // Step 4: group components
  let visited = new Set();
  let hierarchies = [];

  const dfsCycle = (node, visiting) => {
    if (visiting.has(node)) return true;
    if (!adj[node]) return false;

    visiting.add(node);

    for (let nei of adj[node]) {
      if (dfsCycle(nei, visiting)) return true;
    }

    visiting.delete(node);
    return false;
  };

  const buildTree = (node) => {
    let obj = {};
    if (adj[node]) {
      adj[node].forEach((child) => {
        obj[child] = buildTree(child);
      });
    }
    return obj;
  };

  const depthCalc = (node) => {
    if (!adj[node] || adj[node].length === 0) return 1;
    let max = 0;
    for (let c of adj[node]) {
      max = Math.max(max, depthCalc(c));
    }
    return max + 1;
  };

  const allNodes = [...nodes];

  allNodes.forEach((start) => {
    if (visited.has(start)) return;

    let stack = [start];
    let component = [];

    while (stack.length) {
      let cur = stack.pop();
      if (visited.has(cur)) continue;
      visited.add(cur);
      component.push(cur);

      if (adj[cur]) stack.push(...adj[cur]);
      for (let k in adj) {
        if (adj[k].includes(cur)) stack.push(k);
      }
    }

    // find root
    let compRoots = component.filter((n) => !childSet.has(n));
    let root =
      compRoots.length > 0
        ? compRoots.sort()[0]
        : component.sort()[0];

    // cycle detection
    let hasCycle = dfsCycle(root, new Set());

    if (hasCycle) {
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true,
      });
    } else {
      let tree = {};
      tree[root] = buildTree(root);

      hierarchies.push({
        root,
        tree,
        depth: depthCalc(root),
      });
    }
  });

  // Summary
  let total_trees = hierarchies.filter((h) => !h.has_cycle).length;
  let total_cycles = hierarchies.filter((h) => h.has_cycle).length;

  let largest_tree_root = "";
  let maxDepth = 0;

  hierarchies.forEach((h) => {
    if (!h.has_cycle) {
      if (
        h.depth > maxDepth ||
        (h.depth === maxDepth && h.root < largest_tree_root)
      ) {
        maxDepth = h.depth;
        largest_tree_root = h.root;
      }
    }
  });

  res.json({
    user_id: "tamilselvanm_12112005",
    email_id: "tm7708@srmist.edu.in",
    college_roll_number: "RA2311047010038",
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees,
      total_cycles,
      largest_tree_root,
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
