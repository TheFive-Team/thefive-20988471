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

/**
 * Deletes a file from the GitHub repository.
 */
export async function deleteFile(
  path: string,
  message: string,
  token: string
) {
  const sha = await getFileSha(path, token);
  if (!sha) return; // File already doesn't exist
  
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      sha,
      branch: GITHUB_BRANCH
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`Failed to delete file: ${errorData.message || res.statusText}`);
  }
}

/**
 * Lists files in a specific directory.
 */
export async function listFiles(
  path: string,
  token: string
): Promise<Array<{ name: string; path: string; url: string; sha: string }>> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json"
    }
  });
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`GitHub API error: ${res.statusText}`);
  }
  return await res.json();
}
