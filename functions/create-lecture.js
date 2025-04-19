const { Octokit } = require("@octokit/rest");
const path = require("path");

exports.handler = async function(event, context) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    // Parse the incoming JSON
    const { fileName, content, title, number } = JSON.parse(event.body);

    // Validate inputs
    if (!fileName || !content || !title || !number) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" })
      };
    }

    // Check if the user is authenticated and has admin role
    if (!context.clientContext?.user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Unauthorized - Must be logged in" })
      };
    }

    // Get user metadata to check for admin role
    const { app_metadata } = context.clientContext?.user;
    const roles = app_metadata?.roles || [];
    
    if (!roles.includes('admin')) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Forbidden - Must have admin role" })
      };
    }

    // Get environment variables (set these in your Netlify dashboard)
    const {
      GITHUB_TOKEN,
      GITHUB_OWNER,
      GITHUB_REPO,
      GITHUB_BRANCH = "main"
    } = process.env;

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Server configuration error" })
      };
    }

    // Initialize Octokit (GitHub API client)
    const octokit = new Octokit({
      auth: GITHUB_TOKEN
    });

    // The path where lecture files are stored
    const filePath = path.join("lectures", fileName);

    // Check if file already exists
    try {
      const { data } = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: filePath,
        ref: GITHUB_BRANCH
      });

      // If we get here, the file exists
      return {
        statusCode: 409,
        body: JSON.stringify({ error: `File ${fileName} already exists` })
      };
    } catch (error) {
      // 404 error means the file doesn't exist, which is what we want
      if (error.status !== 404) {
        throw error;
      }
    }

    // Create the file in the repository
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      message: `Add lecture ${number}: ${title}`,
      content: Buffer.from(content).toString("base64"),
      branch: GITHUB_BRANCH
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: `Lecture ${number} created successfully`,
        sha: response.data.commit.sha,
        url: `lectures/${fileName}`
      })
    };
  } catch (error) {
    console.error("Error creating lecture:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create lecture: " + error.message })
    };
  }
}; 