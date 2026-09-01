#!/usr/bin/env python3
import os
import sys
import json
import re
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


def parse_packages_from_pr():
    """
    Parses package names and version changes from the PR body markdown table and PR title.
    """
    packages = []
    # 1. Match Renovate markdown table rows:
    # | Package | Change | ... |
    # | [@eslint/eslintrc](url) | 3.3.6 → 3.3.7 | ... |
    # or | tsx | 4.23.12 -> 4.23.13 | ...
    table_pattern = re.compile(
        r"\|\s*(?:\[(?P<p1>[^\]]+)\]\([^)]+\)|(?P<p2>[^|]+?))\s*\|\s*[`']?(?P<change>[0-9a-zA-Z.\-_^~]+\s*(?:->|→)\s*[0-9a-zA-Z.\-_^~]+)[`']?\s*\|"
    )
    for line in PR_BODY.splitlines():
        m = table_pattern.search(line)
        if m:
            pkg = (m.group("p1") or m.group("p2") or "").strip().strip("`*")
            change = m.group("change").strip().replace("->", "→")
            if pkg and change and not pkg.lower().startswith("package") and not pkg.startswith("---"):
                packages.append({"name": pkg, "change": change})

    # 2. Fallback: Check single package bump in title
    if not packages and PR_TITLE:
        single_pattern = re.compile(
            r"(?:update dependency|update|bump)\s+([@\w\-/]+)\s+to\s+v?([0-9a-zA-Z.\-_]+)",
            re.IGNORECASE,
        )
        m = single_pattern.search(PR_TITLE)
        if m:
            packages.append({"name": m.group(1), "change": f"to {m.group(2)}"})

    return packages


def perform_web_search(query, max_results=3):
    """
    Performs web search prioritizing self-hosted SearXNG instance,
    with fallback to DuckDuckGo if needed.
    """
    print(f"Searching web for: {query}")
    results = []

    # 1. Primary: Self-hosted SearXNG JSON API
    if SEARXNG_URL:
        try:
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


def extract_search_context(packages):
    """Formulates targeted search queries for updated packages."""
    search_data = []

    if packages:
        # Search for up to 3 representative packages from the group
        for pkg in packages[:3]:
            pkg_name = pkg["name"]
            change = pkg.get("change", "")
            to_ver = change.split("→")[-1].strip() if "→" in change else ""
            query = f"{pkg_name} {to_ver} changelog breaking changes release notes".strip()
            results = perform_web_search(query, max_results=2)
            search_data.extend(results)
    else:
        query = f"{PR_TITLE} breaking changes migration guide changelog"
        search_data = perform_web_search(query, max_results=4)

    if not search_data:
        return "No external web search results found."

    context = "### Live Web Research & Documentation:\n"
    seen_urls = set()
    count = 1
    for item in search_data:
        url = item.get("url", "")
        if url and url not in seen_urls:
            seen_urls.add(url)
            context += f"[{count}] {item['title']}\nURL: {url}\nSnippet: {item['snippet']}\n\n"
            count += 1
    return context


def build_prompt(web_research_context, packages):
    packages_summary = ""
    if packages:
        packages_summary = "Identified packages in this PR:\n" + "\n".join(
            [f"- {p['name']}: {p['change']}" for p in packages]
        ) + "\n\n"

    return f"""You are an expert Frontend & DevOps engineer evaluating a Renovate dependency update Pull Request for a Next.js (App Router, Static Export 'output: export') website with Tailwind CSS, React 19, MDX, Vitest, and Playwright.

PR Title: {PR_TITLE}

{packages_summary}PR Description & Changelog:
{PR_BODY[:4000]}

{web_research_context}

### Assessment Instructions:
1. Review all updated packages. Identify whether each update is a PATCH, MINOR, or MAJOR bump.
2. Cross-reference the PR changelog and Live Web Research for:
   - Breaking changes, deprecated APIs, or config shifts (Next.js App Router, Tailwind CSS v4, React 19 hooks/types).
   - Peer dependency compatibility issues.
   - Static export compatibility.
3. Determine Risk Level:
   - LOW: Safe patch/minor updates, type definition updates (@types/*), minor devDependencies with no breaking changes -> decision: "APPROVED".
   - MEDIUM: Minor updates with new features, test runner changes, or packages requiring small code adjustments -> decision: "NEEDS_REVIEW".
   - HIGH: Major version upgrades (e.g., Next.js, React, Tailwind, Playwright, TypeScript, ESLint major jumps), packages with breaking changes, peer dependency mismatches -> decision: "REJECTED" or "NEEDS_REVIEW".
4. Provide Actionable Guidance & Links.

Respond ONLY with a valid JSON object matching this exact schema:
{{
  "decision": "APPROVED" | "NEEDS_REVIEW" | "REJECTED",
  "risk_level": "LOW" | "MEDIUM" | "HIGH",
  "summary": "Concise 1-line summary of what is being updated",
  "packages": [
    {{
      "name": "package-name",
      "change": "1.0.0 → 1.0.1",
      "type": "PATCH" | "MINOR" | "MAJOR",
      "risk": "LOW" | "MEDIUM" | "HIGH",
      "notes": "Brief note on change or bug fix"
    }}
  ],
  "breaking_changes": true | false,
  "breaking_changes_details": "Description of any breaking changes or deprecations, or 'None'",
  "reasoning": "Concise explanation of the overall risk assessment",
  "manual_actions": [
    "Step 1 (e.g. run e2e tests locally with pnpm test:e2e)"
  ],
  "relevant_links": [
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


def find_existing_triage_comment():
    """Finds existing comment ID containing the triage marker."""
    if not FORGEJO_TOKEN or not REPO or not PR_NUMBER:
        return None
    try:
        url = f"{FORGEJO_API}/repos/{REPO}/issues/{PR_NUMBER}/comments"
        headers = {
            "Authorization": f"token {FORGEJO_TOKEN}",
            "User-Agent": "Website-AI-Triage/1.0",
        }
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            comments = json.loads(resp.read().decode("utf-8"))
            for c in comments:
                if "<!-- ai-pr-triage -->" in c.get("body", ""):
                    return c.get("id")
    except Exception as e:
        print(f"Warning: Could not check existing comments ({e})", file=sys.stderr)
    return None


def post_comment(assessment):
    decision = assessment.get("decision", "NEEDS_REVIEW")
    risk = assessment.get("risk_level", "MEDIUM")
    summary = assessment.get("summary", "")
    reasoning = assessment.get("reasoning", "")
    rec = assessment.get("recommendation", "")
    breaking_details = assessment.get("breaking_changes_details", "None")
    manual_actions = assessment.get("manual_actions", [])
    links = assessment.get("relevant_links", [])
    packages = assessment.get("packages", [])

    # Format packages table
    packages_table = ""
    if packages and isinstance(packages, list) and len(packages) > 0:
        packages_table = "### 📦 Evaluated Packages\n\n"
        packages_table += "| Package | Change | Type | Risk | Notes |\n"
        packages_table += "| :--- | :--- | :---: | :---: | :--- |\n"
        for p in packages:
            name = p.get("name", "")
            change = p.get("change", "")
            ptype = p.get("type", "")
            prisk = p.get("risk", "LOW")
            notes = p.get("notes", "-")
            packages_table += f"| `{name}` | `{change}` | `{ptype}` | `{prisk}` | {notes} |\n"
        packages_table += "\n"

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
            if isinstance(link, str) and link.startswith("http"):
                links_md += f"- [{link}]({link})\n"
        links_md += "\n"

    automerge_note = ""
    if decision == "APPROVED":
        automerge_note = "> [!NOTE]\n> **Auto-Merge**: This PR has been evaluated as safe (`APPROVED`). It will be automatically merged once all CI test suites pass.\n\n"

    comment_body = f"""<!-- ai-pr-triage -->
## 🤖 AI Dependency Assessment (`{MODEL}`)

| Field | Value |
| :--- | :--- |
| **Decision** | **`{decision}`** |
| **Risk Level** | `{risk}` |
| **Summary** | {summary or 'Evaluated dependency updates'} |
| **Breaking Changes** | `{assessment.get("breaking_changes", False)}` |

{automerge_note}{packages_table}### 📋 Analysis & Reasoning
{reasoning}

{breaking_md}{manual_actions_md}{links_md}### 💡 Recommendation
{rec}

---
*Researched via SearXNG & Analyzed locally with Ollama*
"""

    existing_id = find_existing_triage_comment()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"token {FORGEJO_TOKEN}",
        "User-Agent": "Website-AI-Triage/1.0",
    }

    if existing_id:
        comment_url = f"{FORGEJO_API}/repos/{REPO}/issues/comments/{existing_id}"
        req = urllib.request.Request(
            comment_url,
            data=json.dumps({"body": comment_body}).encode("utf-8"),
            headers=headers,
            method="PATCH",
        )
        urllib.request.urlopen(req)
        print(f"Successfully updated existing AI review comment (ID {existing_id}).")
    else:
        comment_url = f"{FORGEJO_API}/repos/{REPO}/issues/{PR_NUMBER}/comments"
        req = urllib.request.Request(
            comment_url,
            data=json.dumps({"body": comment_body}).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        urllib.request.urlopen(req)
        print("Successfully posted new AI review comment.")


def submit_approval_review(assessment):
    """
    Submits an approving review to the PR on Forgejo if decision is APPROVED.
    """
    if not FORGEJO_TOKEN or not REPO or not PR_NUMBER:
        return

    try:
        review_url = f"{FORGEJO_API}/repos/{REPO}/pulls/{PR_NUMBER}/reviews"
        review_body = {
            "event": "APPROVE",
            "body": f"🤖 AI Dependency Assessment: Automatically approved (Risk: {assessment.get('risk_level', 'LOW')}).",
        }
        req_review = urllib.request.Request(
            review_url,
            data=json.dumps(review_body).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"token {FORGEJO_TOKEN}",
                "User-Agent": "Website-AI-Triage/1.0",
            },
        )
        with urllib.request.urlopen(req_review) as resp:
            print(f"Successfully submitted approving review (status {resp.status}).")
    except Exception as e:
        print(f"Note: Could not submit formal review ({e})")


if __name__ == "__main__":
    try:
        print("Step 0: Loading PR details safely...")
        load_pr_info()

        print("Step 1: Parsing packages from PR...")
        packages = parse_packages_from_pr()
        print(f"Parsed {len(packages)} packages: {[p['name'] for p in packages]}")

        print(f"Step 2: Gathering targeted live web research via SearXNG...")
        web_context = extract_search_context(packages)

        print("Step 3: Running AI analysis via local Ollama...")
        prompt = build_prompt(web_context, packages)
        assessment = call_ollama(prompt)
        print("Assessment received:", json.dumps(assessment, indent=2))

        print("Step 4: Posting or updating PR comment...")
        post_comment(assessment)

        if assessment.get("decision") == "APPROVED":
            print("Step 5: Submitting formal approval review...")
            submit_approval_review(assessment)
    except Exception as e:
        print(f"Error during AI triage: {e}", file=sys.stderr)
        sys.exit(1)

