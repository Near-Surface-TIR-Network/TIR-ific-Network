const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  try {
    const token = process.env.GITHUB_TOKEN;
    const octokit = new Octokit({ auth: token });

    const body = JSON.parse(event.body);

    const { filename, json, image_base64, image_filename, tir_image_base64, tir_image_filename } = body;

    // Create and upload JSON file
    const jsonRes = await octokit.repos.createOrUpdateFileContents({
      owner: "Near-Surface-TIR-Network",
      repo: "TIR-ific-Network",
      path: `submissions/${filename}`,
      message: `New form submission: ${filename}`,
      content: json,
      branch: "main",
    });

    // Upload RGB image if present
    if (image_base64 && image_filename) {
      await octokit.repos.createOrUpdateFileContents({
        owner: "Near-Surface-TIR-Network",
        repo: "TIR-ific-Network",
        path: `site-images/${image_filename}`,
        message: `Add RGB image: ${image_filename}`,
        content: image_base64,
        branch: "main",
      });
    }

    // Upload TIR image if present
    if (tir_image_base64 && tir_image_filename) {
      await octokit.repos.createOrUpdateFileContents({
        owner: "Near-Surface-TIR-Network",
        repo: "TIR-ific-Network",
        path: `site-images/${tir_image_filename}`,
        message: `Add TIR image: ${tir_image_filename}`,
        content: tir_image_base64,
        branch: "main",
      });
    }

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
};
