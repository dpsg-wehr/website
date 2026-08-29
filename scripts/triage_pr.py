#!/usr/bin/env python3
import os
import sys
import json
import urllib.request
import urllib.parse
import urllib.error

# Environment variables
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://192.168.178.53:11434/api/generate")
MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")

SEARXNG_URL = os.getenv("SEARXNG_URL", "https://search.linus-fischer.de")
FORGEJO_API = os.getenv("FORGEJO_API", "https://git.linus-fischer.de/api/v1")
FORGEJO_TOKEN = os.getenv("FORGEJO_TOKEN", "")
REPO = os.getenv("GITHUB_REPOSITORY", "")
PR_NUMBER = os.getenv("PR_NUMBER", "")

PR_TITLE = os.getenv("PR_TITLE", "")
PR_BODY = os.getenv("PR_BODY", "")


def load_pr_info():
    """
    Loads PR title and body safely from $GITHUB_EVENT_PATH or the Forgejo API
    to avoid passing large strings directly into environment variables.
    """
    global PR_TITLE, PR_BODY

    # 1. Try reading from GITHUB_EVENT_PATH event json file
    event_path = os.getenv("GITHUB_EVENT_PATH")
    if event_path and os.path.isfile(event_path):
        try:
            with open(event_path, "r", encoding="utf-8") as f:
                event_data = json.load(f)
                pr = event_data.get("pull_request", {})
                if pr:
                    if not PR_TITLE:
                        PR_TITLE = pr.get("title", "")
                    if not PR_BODY:
                        PR_BODY = pr.get("body", "") or ""
                    print(f"Loaded PR info from {event_path}: '{PR_TITLE}' ({len(PR_BODY)} chars)")
                    return
        except Exception as e:
            print(f"Warning: Could not read GITHUB_EVENT_PATH ({e})", file=sys.stderr)

    # 2. Fallback: Fetch directly from Forgejo API
    if FORGEJO_API and REPO and PR_NUMBER:
        try:
            headers = {"User-Agent": "Website-AI-Triage/1.0"}
            if FORGEJO_TOKEN:
                headers["Authorization"] = f"token {FORGEJO_TOKEN}"
            url = f"{FORGEJO_API}/repos/{REPO}/pulls/{PR_NUMBER}"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if not PR_TITLE:
                    PR_TITLE = data.get("title", "")
                if not PR_BODY:
                    PR_BODY = data.get("body", "") or ""
                print(f"Loaded PR info from Forgejo API: '{PR_TITLE}' ({len(PR_BODY)} chars)")
        except Exception as e:
            print(f"Warning: Could not fetch PR info from API ({e})", file=sys.stderr)


def perform_web_search(query, max_results=4):
    """
    Performs web search prioritizing self-hosted SearXNG instance,
    with fallback to DuckDuckGo if needed.
    """
    print(f"Searching web for: {query}")
    results = []

    # 1. Primary: Self-hosted SearXNG JSON API
    if SEARXNG_URL:
        try:
            print(f"Querying self-hosted SearXNG ({SEARXNG_URL})...")
            params = urllib.parse.urlencode(
                {
                    "q": query,
                    "format": "json",
                    "categories": "general",
                    "language": "auto",
                }
            )
            url = f"{SEARXNG_URL.rstrip('/')}/search?{params}"
            req = urllib.request.Request(
                url, headers={"User-Agent": "Website-AI-Triage/1.0"}
            )

            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                raw_results = data.get("results", [])
                for res in raw_results[:max_results]:
                    results.append(
                        {
                            "title": res.get("title", ""),
                            "snippet": res.get("content", ""),
                            "url": res.get("url", ""),
                        }
                    )
                if results:
                    print(
                        f"Successfully retrieved {len(results)} results from SearXNG."
                    )
                    return results
        except Exception as e:
            print(
                f"SearXNG query failed ({e}), falling back to secondary search...",
                file=sys.stderr,
            )

    # 2. Fallback: DuckDuckGo Search
    try:
        from duckduckgo_search import DDGS

        with DDGS() as ddgs:
            search_results = list(ddgs.text(query, max_results=max_results))
            for res in search_results:
                results.append(
                    {
                        "title": res.get("title", ""),
                        "snippet": res.get("body", ""),
                        "url": res.get("href", ""),
                    }
                )
            return results
    except Exception as e:
        print(f"DuckDuckGo fallback failed: {e}", file=sys.stderr)

    return results


def extract_search_context():
    """Formulates a search query based on PR title and body"""
    query = f"{PR_TITLE} breaking changes migration guide changelog"
    search_data = perform_web_search(query)

    if not search_data:
        return "No external web search results found."

    context = "### Live Web Research & Documentation:\n"
    for idx, item in enumerate(search_data, 1):
        context += f"[{idx}] {item['title']}\nURL: {item['url']}\nSnippet: {item['snippet']}\n\n"
    return context


def build_prompt(web_research_context):
    return f"""You are an expert Frontend & DevOps engineer evaluating a Renovate dependency update Pull Request for a Next.js (App Router, Static Export 'output: export') website with Tailwind CSS, React 19, MDX, Vitest, and Playwright.

PR Title: {PR_TITLE}

PR Description & Changelog:
{PR_BODY[:4000]}

{web_research_context}

### Assessment Instructions:
1. Identify the package being updated and whether it is a PATCH, MINOR, or MAJOR update.
2. Cross-reference the PR changelog and the Live Web Research results for:
   - Breaking changes, deprecated APIs, or config shifts (e.g. Next.js App Router changes, Tailwind CSS v4 class shifts, React 19 hooks/types).
   - Peer dependency compatibility issues (e.g., packages requiring React 18 when React 19 is used).
   - Static export compatibility (e.g., changes affecting next-image-export-optimizer, static generation, or MDX).
   - Official documentation links or migration guide URLs.
3. Determine Risk Level:
   - LOW: Safe patch/minor updates, type definition updates (@types/*), linter rules, or minor devDependencies with no breaking changes -> decision: "APPROVED".
   - MEDIUM: Minor updates with new features, test runner changes, or packages requiring small code adjustments -> decision: "NEEDS_REVIEW".
   - HIGH: Major version upgrades (e.g., Next.js, React, Tailwind, Playwright major jumps), packages with breaking changes, or peer dependency mismatches -> decision: "REJECTED" or "NEEDS_REVIEW".
4. Provide Actionable Guidance & Links:
   - If manual verification or migration steps are needed, list them clearly.
   - Include any verified documentation / migration guide URLs from the web search.

Respond ONLY with a valid JSON object matching this exact schema:
{{
  "decision": "APPROVED" | "NEEDS_REVIEW" | "REJECTED",
  "risk_level": "LOW" | "MEDIUM" | "HIGH",
  "package": "name of package",
  "from_version": "source version",
  "to_version": "target version",
  "breaking_changes": true | false,
  "breaking_changes_details": "Description of any breaking changes or deprecations, or 'None'",
  "reasoning": "Concise explanation of the risk assessment",
  "manual_actions": [
    "Step 1 (e.g. run e2e tests locally with pnpm test:e2e)",
    "Step 2 (e.g. check for deprecated styling syntax)"
  ],
  "relevant_links": [
    "https://example.com/migration-guide",
    "https://example.com/release-notes"
  ],
  "recommendation": "Summary recommendation for the maintainer"
}}
"""


def call_ollama(prompt):
    payload = {"model": MODEL, "prompt": prompt, "stream": False, "format": "json"}
    req = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        return json.loads(result["response"])


def post_comment(assessment):
    decision = assessment.get("decision", "NEEDS_REVIEW")
    risk = assessment.get("risk_level", "MEDIUM")
    reasoning = assessment.get("reasoning", "")
    rec = assessment.get("recommendation", "")
    breaking_details = assessment.get("breaking_changes_details", "None")
    manual_actions = assessment.get("manual_actions", [])
    links = assessment.get("relevant_links", [])

    manual_actions_md = ""
    if manual_actions and len(manual_actions) > 0:
        manual_actions_md = "### 🛠️ Required Manual Actions / Migration Steps\n"
        for idx, action in enumerate(manual_actions, 1):
            manual_actions_md += f"{idx}. {action}\n"
        manual_actions_md += "\n"

    breaking_md = ""
    if assessment.get("breaking_changes"):
        breaking_md = f"### ⚠️ Breaking Changes & Deprecations\n{breaking_details}\n\n"

    links_md = ""
    if links and len(links) > 0:
        links_md = "### 🔗 Relevant Documentation & Release Links\n"
        for link in links:
            if link.startswith("http"):
                links_md += f"- [{link}]({link})\n"
        links_md += "\n"

    automerge_note = ""
    if decision == "APPROVED":
        automerge_note = "> [!NOTE]\n> **Auto-Merge**: This PR has been evaluated as safe (`APPROVED`) and is being automatically merged.\n\n"

    comment_body = f"""<!-- ai-pr-triage -->
## 🤖 AI Dependency Assessment (`{MODEL}`)

| Field | Value |
| :--- | :--- |
| **Decision** | **`{decision}`** |
| **Risk Level** | `{risk}` |
| **Package** | `{assessment.get("package", "Unknown")}` |
| **Version Change** | `{assessment.get("from_version", "")} → {assessment.get("to_version", "")}` |
| **Breaking Changes** | `{assessment.get("breaking_changes", False)}` |

{automerge_note}### 📋 Analysis & Reasoning
{reasoning}

{breaking_md}{manual_actions_md}{links_md}### 💡 Recommendation
{rec}

---
*Researched via SearXNG & Analyzed locally with Ollama*
"""

    comment_url = f"{FORGEJO_API}/repos/{REPO}/issues/{PR_NUMBER}/comments"
    req = urllib.request.Request(
        comment_url,
        data=json.dumps({"body": comment_body}).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"token {FORGEJO_TOKEN}",
        },
    )
    urllib.request.urlopen(req)
    print("Successfully posted AI review comment to PR.")


def merge_pr(assessment):
    """
    Automatically merges the PR if AI triage decision is APPROVED.
    First submits an approving review, then calls Forgejo merge API.
    """
    if not FORGEJO_TOKEN or not REPO or not PR_NUMBER:
        print("Missing FORGEJO_TOKEN, REPO, or PR_NUMBER, skipping automerge.")
        return

    print(f"Decision is APPROVED. Attempting automatic merge for PR #{PR_NUMBER} in {REPO}...")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"token {FORGEJO_TOKEN}",
        "User-Agent": "Website-AI-Triage/1.0",
    }

    # 1. Submit an approving review to the PR
    try:
        review_url = f"{FORGEJO_API}/repos/{REPO}/pulls/{PR_NUMBER}/reviews"
        review_body = {
            "event": "APPROVE",
            "body": f"🤖 AI Dependency Assessment: Automatically approved (Risk: {assessment.get('risk_level', 'LOW')}).",
        }
        req_review = urllib.request.Request(
            review_url,
            data=json.dumps(review_body).encode("utf-8"),
            headers=headers,
        )
        with urllib.request.urlopen(req_review) as resp:
            print(f"Successfully submitted approving review (status {resp.status}).")
    except Exception as e:
        print(f"Note: Could not submit formal review (self-review or reviews optional): {e}")

    # 2. Merge PR via Forgejo API
    merge_url = f"{FORGEJO_API}/repos/{REPO}/pulls/{PR_NUMBER}/merge"
    pkg = assessment.get("package", "dependency")
    from_v = assessment.get("from_version", "")
    to_v = assessment.get("to_version", "")
    version_str = f" to {to_v}" if to_v else ""

    commit_title = f"chore(deps): merge PR #{PR_NUMBER} ({pkg}{version_str})"
    commit_message = (
        f"Automated merge by AI PR Triage.\n\n"
        f"Decision: APPROVED\n"
        f"Risk Level: {assessment.get('risk_level', 'LOW')}\n"
        f"Package: {pkg}\n"
        f"Version Change: {from_v} -> {to_v}\n\n"
        f"Reasoning: {assessment.get('reasoning', 'Safe update')}"
    )

    merge_methods = ["merge", "rebase-merge", "rebase", "squash"]

    # First attempt: With merge_when_checks_succeed=True (enables auto-merge while CI checks complete)
    for method in merge_methods:
        payload = {
            "Do": method,
            "MergeTitleField": commit_title,
            "MergeMessageField": commit_message,
            "delete_branch_after_merge": True,
            "merge_when_checks_succeed": True,
        }
        try:
            req = urllib.request.Request(
                merge_url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
            )
            with urllib.request.urlopen(req) as resp:
                print(f"Successfully scheduled/executed merge (strategy '{method}', status {resp.status}) for PR #{PR_NUMBER}.")
                return
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8", errors="ignore")
            print(f"Merge attempt (strategy '{method}', when_checks_succeed=True) returned HTTP {e.code}: {err_msg}")
        except Exception as e:
            print(f"Merge attempt (strategy '{method}', when_checks_succeed=True) failed: {e}")

    # Fallback attempt: Direct merge without merge_when_checks_succeed
    for method in merge_methods:
        payload = {
            "Do": method,
            "MergeTitleField": commit_title,
            "MergeMessageField": commit_message,
            "delete_branch_after_merge": True,
        }
        try:
            req = urllib.request.Request(
                merge_url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
            )
            with urllib.request.urlopen(req) as resp:
                print(f"Successfully merged PR #{PR_NUMBER} directly with strategy '{method}' (status {resp.status}).")
                return
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8", errors="ignore")
            print(f"Direct merge attempt (strategy '{method}') returned HTTP {e.code}: {err_msg}")
        except Exception as e:
            print(f"Direct merge attempt (strategy '{method}') failed: {e}")

    print(f"Warning: Automatic merge could not be finalized for PR #{PR_NUMBER}.")


if __name__ == "__main__":
    try:
        print("Step 0: Loading PR details safely...")
        load_pr_info()

        print(f"Step 1: Gathering live web research on '{PR_TITLE}' via SearXNG...")
        web_context = extract_search_context()

        print("Step 2: Running AI analysis via local Ollama...")
        prompt = build_prompt(web_context)
        assessment = call_ollama(prompt)
        print("Assessment received:", json.dumps(assessment, indent=2))

        print("Step 3: Posting PR comment...")
        post_comment(assessment)

        # Step 4: Automatically merge approved PRs
        if assessment.get("decision") == "APPROVED":
            print("Step 4: PR was APPROVED by AI triage. Merging PR...")
            merge_pr(assessment)
        else:
            print(f"Step 4: PR decision is '{assessment.get('decision')}'. Skipping automatic merge.")
    except Exception as e:
        print(f"Error during AI triage: {e}", file=sys.stderr)
        sys.exit(1)
