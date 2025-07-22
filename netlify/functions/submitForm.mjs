import { Octokit } from "@octokit/rest";

console.log("Received body from client:", event.body);
const body = JSON.parse(event.body);
console.log("Decoded body:", body);

export async function handler(event) {
  try {
    const token = process.env.GITHUB_TOKEN;
    const octokit = new Octokit({ auth: token });

    const body = JSON.parse(event.body);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `submission-${timestamp}.json`;

    const content = Buffer.from(JSON.stringify(body, null, 2)).toString("base64");

    await octokit.repos.createOrUpdateFileContents({
      owner: "Near-Surface-TIR-Network",
      repo: "TIR-ific-Network",
      path: `submissions/${filename}`,
      message: `New submission: ${filename}`,
      content: content,
      branch: "main"
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Submitted successfully." }),
    };
  } catch (err) {
    console.error("Error submitting:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Submission failed." }),
    };
  }
}

