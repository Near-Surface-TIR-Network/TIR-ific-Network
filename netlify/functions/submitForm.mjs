import { Octokit } from "@octokit/rest";

export async function handler(event) {
  try {
    console.log("📥 Raw payload from client:", event.body);  // ✅ logs full incoming payload

    const token = process.env.GITHUB_TOKEN;
    const octokit = new Octokit({ auth: token });

    const body = JSON.parse(event.body);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = body.filename || `submission-${timestamp}.json`;

    const jsonContent = Buffer.from(body.json, "base64").toString("utf-8");

    const responses = [];

    // Save JSON
    responses.push(
      await octokit.repos.createOrUpdateFileContents({
        owner: "Near-Surface-TIR-Network",
        repo: "TIR-ific-Network",
        path: `submissions/${filename}`,
        message: `Add submission ${filename}`,
        content: Buffer.from(jsonContent).toString("base64"),
        branch: "main"
      })
    );

    // Save RGB image if present
    if (body.image_base64 && body.image_filename) {
      responses.push(
        await octokit.repos.createOrUpdateFileContents({
          owner: "Near-Surface-TIR-Network",
          repo: "TIR-ific-Network",
          path: `site-images/${body.image_filename}`,
          message: `Add RGB image ${body.image_filename}`,
          content: body.image_base64,
          branch: "main"
        })
      );
    }

    // Save TIR image if present
    if (body.tir_image_base64 && body.tir_image_filename) {
      responses.push(
        await octokit.repos.createOrUpdateFileContents({
          owner: "Near-Surface-TIR-Network",
          repo: "TIR-ific-Network",
          path: `site-images/${body.tir_image_filename}`,
          message: `Add TIR image ${body.tir_image_filename}`,
          content: body.tir_image_base64,
          branch: "main"
        })
      );
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // or restrict to your GitHub Pages domain
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Submitted successfully." }),
    };
  } catch (err) {
    console.error("Error submitting:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // or restrict as needed
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: "Submission failed." }),
    };
  }
}

// Also handle the preflight OPTIONS request
export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }
