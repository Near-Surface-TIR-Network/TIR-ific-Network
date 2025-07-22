import { Octokit } from "@octokit/rest";

export async function handler(event) {
  // 🔁 Handle preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // or your GitHub Pages domain
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "OK",
    };
  }

  try {
    const token = process.env.GITHUB_TOKEN;
    const octokit = new Octokit({ auth: token });

    const body = JSON.parse(event.body);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = body.filename || `submission-${timestamp}.json`;

    const files = [
      {
        path: `submissions/${filename}`,
        content: Buffer.from(decodeURIComponent(escape(atob(body.json)))).toString("base64"),
        message: `New submission: ${filename}`
      }
    ];

    if (body.image_base64 && body.image_filename) {
      files.push({
        path: `site-images/${body.image_filename}`,
        content: body.image_base64,
        message: `Add image: ${body.image_filename}`
      });
    }

    if (body.tir_image_base64 && body.tir_image_filename) {
      files.push({
        path: `site-images/${body.tir_image_filename}`,
        content: body.tir_image_base64,
        message: `Add TIR image: ${body.tir_image_filename}`
      });
    }

    for (const file of files) {
      await octokit.repos.createOrUpdateFileContents({
        owner: "Near-Surface-TIR-Network",
        repo: "TIR-ific-Network",
        path: file.path,
        message: file.message,
        content: file.content,
        branch: "main"
      });
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // or restrict to GitHub Pages
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Submitted successfully." }),
    };
  } catch (err) {
    console.error("Error submitting:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: "Submission failed.", details: err.message }),
    };
  }
}
