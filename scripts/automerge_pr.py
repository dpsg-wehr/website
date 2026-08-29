#!/usr/bin/env python3
import os
import sys
import json
import urllib.request
import urllib.error

FORGEJO_API = os.getenv("FORGEJO_API", "https://git.linus-fischer.de/api/v1")
FORGEJO_TOKEN = os.getenv("FORGEJO_TOKEN", "")
REPO = os.getenv("GITHUB_REPOSITORY", "")
PR_NUMBER = os.getenv("PR_NUMBER", "")
PR_TITLE = os.getenv("PR_TITLE", "")


def check_is_approved():
    """
    Checks whether the PR has received an approving review or AI triage approval.
    """
    if not FORGEJO_TOKEN or not REPO or not PR_NUMBER:
        print("Missing required environment variables (FORGEJO_TOKEN, GITHUB_REPOSITORY, PR_NUMBER).")
        return False

    headers = {
        "User-Agent": "Website-AutoMerge/1.0",
        "Authorization": f"token {FORGEJO_TOKEN}",
    }

    # 1. Check PR reviews for APPROVE state
    try:
        reviews_url = f"{FORGEJO_API}/repos/{REPO}/pulls/{PR_NUMBER}/reviews"
        req = urllib.request.Request(reviews_url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            reviews = json.loads(resp.read().decode("utf-8"))
            for r in reviews:
                if r.get("state") == "APPROVED" or r.get("state") == "APPROVE":
                    print(f"Found approving review from {r.get('user', {}).get('username')}.")
                    return True
    except Exception as e:
        print(f"Notice: Could not fetch reviews ({e})")

    # 2. Check PR comments for AI triage approval signature
    try:
        comments_url = f"{FORGEJO_API}/repos/{REPO}/issues/{PR_NUMBER}/comments"
        req = urllib.request.Request(comments_url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            comments = json.loads(resp.read().decode("utf-8"))
            for c in comments:
                body = c.get("body", "")
                if "<!-- ai-pr-triage -->" in body and "**`APPROVED`**" in body:
                    print("Found AI PR Triage APPROVED assessment comment.")
                    return True
    except Exception as e:
        print(f"Notice: Could not fetch comments ({e})")

    return False


def merge_pr():
    """
    Executes the merge for the pull request now that all CI checks have succeeded.
    """
    print(f"All CI tests passed and PR #{PR_NUMBER} is approved. Merging into base branch...")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"token {FORGEJO_TOKEN}",
        "User-Agent": "Website-AutoMerge/1.0",
    }

    merge_url = f"{FORGEJO_API}/repos/{REPO}/pulls/{PR_NUMBER}/merge"
    commit_title = f"chore(deps): merge verified PR #{PR_NUMBER}"
    if PR_TITLE:
        commit_title += f" - {PR_TITLE}"

    commit_message = (
        f"Automated merge by CI AutoMerge pipeline.\n\n"
        f"PR #{PR_NUMBER} has passed all CI test suites (typecheck, lint, build, Vitest, Playwright E2E) "
        f"and was verified by AI PR Triage."
    )

    merge_methods = ["merge", "rebase-merge", "rebase", "squash"]

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
                print(f"Successfully merged PR #{PR_NUMBER} (strategy '{method}', HTTP {resp.status}).")
                return True
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8", errors="ignore")
            print(f"Merge with strategy '{method}' returned HTTP {e.code}: {err_msg}")
        except Exception as e:
            print(f"Merge with strategy '{method}' failed: {e}")

    print(f"Warning: Could not automatically merge PR #{PR_NUMBER}.")
    return False


if __name__ == "__main__":
    try:
        print(f"Checking approval status for PR #{PR_NUMBER}...")
        if check_is_approved():
            success = merge_pr()
            if not success:
                sys.exit(1)
        else:
            print(f"PR #{PR_NUMBER} is not marked as APPROVED by AI triage. Skipping automatic merge.")
    except Exception as e:
        print(f"Error during automerge: {e}", file=sys.stderr)
        sys.exit(1)
