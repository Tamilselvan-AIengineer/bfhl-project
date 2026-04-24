import React, { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState(null);

  const handleSubmit = async () => {
    const arr = input.split(",").map((x) => x.trim());

    const res = await fetch("https://your-backend-url/bfhl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: arr }),
    });

    const data = await res.json();
    setOutput(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>BFHL Tree Analyzer</h2>

      <textarea
        rows={5}
        cols={50}
        placeholder="Enter A->B, B->C"
        onChange={(e) => setInput(e.target.value)}
      />

      <br />
      <button onClick={handleSubmit}>Submit</button>

      <pre>{JSON.stringify(output, null, 2)}</pre>
    </div>
  );
}

export default App;
