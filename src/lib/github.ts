export const GITHUB_OWNER = "TheFive-Team";
export const GITHUB_REPO = "thefive-20988471";
export const GITHUB_BRANCH = "main";

/**
 * Fetches the SHA of a file in the repo to allow updating it.
 */
export async function getFileSha(path: string, token: string): Promise<string | null> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json"
    }
  });
  if (!res.ok) {
    if (res.status === 404) return null; // File doesn't exist yet
    throw new Error(`GitHub API error: ${res.statusText}`);
  }
  const data = await res.json();
  return data.sha;
}

/**
 * Commits a file (create or update) to the GitHub repository.
 */
export async function commitFile(
  path: string,
  content: string, // Plain text or base64
  message: string,
  token: string,
  isBase64 = false
) {
  const sha = await getFileSha(path, token);
  
  // Convert content to base64 if it's not already
  const base64Content = isBase64 ? content : btoa(unescape(encodeURIComponent(content)));

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      content: base64Content,
      branch: GITHUB_BRANCH,
      ...(sha ? { sha } : {})
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`Failed to commit file: ${errorData.message || res.statusText}`);
  }
  
  return await res.json();
}
