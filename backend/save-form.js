const express = require("express");
const router = express.Router();
const { Octokit } = require("@octokit/rest");
require("dotenv").config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = "near-surface-tir-network";
const REPO = "TIR-ific-Network";
const BRANCH = "main";
const PENDING_PATH = "pending/";

router.post("/save-form", async (req, res) => {
  const formData = req.body;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `submission-${timestamp}.json`;
  const content = Buffer.from(JSON.stringify(formData, null, 2)).toString("base64");

  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: `${PENDING_PATH}${filename}`,
      message: `Add new site submission: ${filename}`,
      content: content,
      branch: BRANCH,
    });

    res.status(200).send({ message: "Saved to GitHub!" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to save form." });
  }
});

module.exports = router;
