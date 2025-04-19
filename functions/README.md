# Netlify Functions for Infi Notes

This directory contains serverless functions used by the Infi Notes website.

## Available Functions

### create-lecture.js

This function allows admin users to create new lecture HTML files in the GitHub repository, which will then be deployed to the website.

**HTTP Method**: POST

**Required Headers**:
- Content-Type: application/json
- Authorization: Bearer token (Netlify Identity JWT)

**Request Body**:
```json
{
  "fileName": "lecture8.html",
  "title": "Title of the lecture",
  "number": 8,
  "content": "<html>...</html>"
}
```

**Response Codes**:
- 201: Lecture created successfully
- 400: Missing required fields
- 401: User not authenticated
- 403: User doesn't have admin role
- 409: File already exists
- 500: Server error

## Development

To run these functions locally:

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run: `netlify dev`

## Environment Variables Required

The following environment variables must be set in Netlify dashboard:

- `GITHUB_TOKEN`: A GitHub personal access token with repo permissions
- `GITHUB_OWNER`: GitHub username or organization name
- `GITHUB_REPO`: Repository name
- `GITHUB_BRANCH`: Branch name (default: "main") 