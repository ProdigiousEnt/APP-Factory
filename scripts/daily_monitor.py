#!/usr/bin/env python3
"""Daily App Monitor - Checks app status and reviews, creates issues for negative reviews."""

import jwt
import time
import requests
import os
from datetime import datetime, timedelta

GITHUB_REPO = "ProdigiousEnt/APP-Factory"
APPS = [{"bundle_id": "com.splitsmart.ai", "name": "SplitSmart"}]

def get_env(name):
    val = os.environ.get(name)
    if not val:
        raise ValueError(f"Missing: {name}")
    return val

def generate_token():
    headers = {"alg": "ES256", "kid": get_env('ASC_KEY_ID'), "typ": "JWT"}
    payload = {
        "iss": get_env('ASC_ISSUER_ID'),
        "iat": int(time.time()),
        "exp": int(time.time()) + 1200,
        "aud": "appstoreconnect-v1"
    }
    return jwt.encode(payload, get_env('ASC_PRIVATE_KEY'), algorithm="ES256", headers=headers)

def asc_get(token, endpoint, params=None):
    url = f"https://api.appstoreconnect.apple.com/v1{endpoint}"
    r = requests.get(url, headers={"Authorization": f"Bearer {token}"}, params=params or {})
    r.raise_for_status()
    return r.json()

def gh_api(method, endpoint, data=None):
    url = f"https://api.github.com{endpoint}"
    headers = {"Authorization": f"token {get_env('GH_TOKEN')}", "Accept": "application/vnd.github.v3+json"}
    if method == "GET":
        return requests.get(url, headers=headers, params=data or {}).json()
    return requests.post(url, headers=headers, json=data).json()

def get_existing_review_ids():
    issues = gh_api("GET", f"/repos/{GITHUB_REPO}/issues", {"labels": "app-review", "state": "all", "per_page": 100})
    ids = set()
    for issue in issues if isinstance(issues, list) else []:
        body = issue.get("body", "")
        if "Review ID:" in body:
            for line in body.split("\n"):
                if "Review ID:" in line:
                    ids.add(line.split("Review ID:")[-1].strip())
    return ids

def create_review_issue(app_name, review):
    labels = ["app-review", f"{review.get('rating', 0)}-star"]
    body = f"""## App Store Review

**App:** {app_name}
**Rating:** {review.get('rating', 0)}/5
**Reviewer:** {review.get('reviewerNickname', 'Anonymous')}
**Territory:** {review.get('territory', '')}

### {review.get('title', 'No title')}

{review.get('body', '')}

---
**Review ID:** {review['id']}
"""
    return gh_api("POST", f"/repos/{GITHUB_REPO}/issues", {
        "title": f"[{app_name}] {review.get('rating', 0)} star: {review.get('title', '')[:40]}",
        "body": body,
        "labels": labels
    })

def main():
    print("Starting Daily App Monitor...")
    token = generate_token()
    existing = get_existing_review_ids()
    
    for app in APPS:
        print(f"\nChecking {app['name']}...")
        
        data = asc_get(token, "/apps", {"filter[bundleId]": app["bundle_id"]})
        if not data.get("data"):
            print(f"  Not found: {app['bundle_id']}")
            continue
        app_id = data["data"][0]["id"]
        
        versions = asc_get(token, f"/apps/{app_id}/appStoreVersions", 
                          {"fields[appStoreVersions]": "versionString,appStoreState"})
        if versions.get("data"):
            v = versions["data"][0]["attributes"]
            print(f"  Status: {v.get('appStoreState')} (v{v.get('versionString')})")
        
        try:
            reviews_data = asc_get(token, f"/apps/{app_id}/customerReviews", {
                "fields[customerReviews]": "rating,title,body,reviewerNickname,createdDate,territory",
                "sort": "-createdDate", "limit": 50
            })
        except:
            print("  No reviews yet")
            continue
        
        cutoff = datetime.utcnow() - timedelta(hours=24)
        for r in reviews_data.get("data", []):
            attrs = r.get("attributes", {})
            created = attrs.get("createdDate", "")
            if created:
                try:
                    dt = datetime.fromisoformat(created.replace("Z", "+00:00")).replace(tzinfo=None)
                    if dt >= cutoff and attrs.get("rating", 5) <= 2 and r["id"] not in existing:
                        issue = create_review_issue(app["name"], {"id": r["id"], **attrs})
                        print(f"  Created: {issue.get('html_url', 'error')}")
                except Exception as e:
                    print(f"  Error: {e}")
    
    print("\nDone!")

if __name__ == "__main__":
    main()
