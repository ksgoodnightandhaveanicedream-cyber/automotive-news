"""RSSフィードから自動車関連の記事一覧を収集し、docs/data/articles.json を更新するスクリプト。

GitHub Actions（定期実行・手動実行）およびローカルから実行する想定。
"""

import calendar
import json
import os
import urllib.parse
from datetime import datetime, timedelta, timezone

import feedparser
import requests
from bs4 import BeautifulSoup

from sources import SOURCES

JST = timezone(timedelta(hours=9))
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "..", "docs", "data", "articles.json")
RETENTION_DAYS = 30
REQUEST_HEADERS = {"User-Agent": "Mozilla/5.0"}

TOYOKEIZAI_BASE = "https://toyokeizai.net"
TOYOKEIZAI_MAX_PAGES = 6  # 1タグあたりの最大取得ページ数（安全のための上限）


def to_iso(struct_time):
    if struct_time is None:
        return None
    dt_utc = datetime.fromtimestamp(calendar.timegm(struct_time), tz=timezone.utc)
    return dt_utc.astimezone(JST).isoformat()


def fetch_toyokeizai_tag_page(tag, page, source_name):
    """東洋経済のタグ別記事一覧ページ（1ページ分）を取得する。"""
    url = f"{TOYOKEIZAI_BASE}/list/tag/{urllib.parse.quote(tag)}"
    if page > 1:
        url += f"?page={page}"

    res = requests.get(url, headers=REQUEST_HEADERS, timeout=10)
    res.raise_for_status()
    soup = BeautifulSoup(res.text, "html.parser")

    articles = []
    for a in soup.select("a.m-article__ttl"):
        href = a.get("href", "")
        if not href:
            continue
        link = href if href.startswith("http") else TOYOKEIZAI_BASE + href
        link = link.split("?")[0]

        article_el = a.find_parent("article")
        time_el = article_el.find("time", class_="m-article__date") if article_el else None
        published_at = None
        if time_el and time_el.get("datetime"):
            dt = datetime.fromisoformat(time_el["datetime"])
            published_at = dt.astimezone(JST).isoformat()

        articles.append(
            {
                "title": a.get_text(strip=True),
                "url": link,
                "source": source_name,
                "published_at": published_at,
            }
        )
    return articles


def fetch_toyokeizai_tags(tags, source_name):
    cutoff = datetime.now(tz=JST) - timedelta(days=RETENTION_DAYS)
    by_url = {}
    for tag in tags:
        for page in range(1, TOYOKEIZAI_MAX_PAGES + 1):
            items = fetch_toyokeizai_tag_page(tag, page, source_name)
            if not items:
                break
            for item in items:
                by_url[item["url"]] = item

            dated = [
                datetime.fromisoformat(i["published_at"])
                for i in items
                if i["published_at"]
            ]
            if dated and min(dated) < cutoff:
                break
    return list(by_url.values())


def fetch_source(source):
    if source.get("type") == "toyokeizai_tag":
        return fetch_toyokeizai_tags(source["tags"], source["name"])

    articles = []
    feed = feedparser.parse(source["url"])
    for entry in feed.entries:
        published_at = to_iso(entry.get("published_parsed") or entry.get("updated_parsed"))
        articles.append(
            {
                "title": entry.get("title", "").strip(),
                "url": entry.get("link", "").strip(),
                "source": source["name"],
                "published_at": published_at,
            }
        )
    return articles


def load_existing(path):
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("articles", [])


def merge_articles(existing, fetched, active_source_names):
    # ソース一覧から外れたサイトの古い記事は保持しない
    existing = [a for a in existing if a.get("source") in active_source_names]
    by_url = {a["url"]: a for a in existing if a.get("url")}
    for a in fetched:
        if a.get("url"):
            by_url[a["url"]] = a
    return list(by_url.values())


def filter_recent(articles, days):
    cutoff = datetime.now(tz=JST) - timedelta(days=days)
    kept = []
    for a in articles:
        published_at = a.get("published_at")
        if not published_at:
            kept.append(a)
            continue
        try:
            dt = datetime.fromisoformat(published_at)
        except ValueError:
            kept.append(a)
            continue
        if dt >= cutoff:
            kept.append(a)
    return kept


def main():
    fetched = []
    for source in SOURCES:
        try:
            fetched.extend(fetch_source(source))
        except Exception as e:
            print(f"[WARN] {source['name']} の取得に失敗しました: {e}")

    active_source_names = {s["name"] for s in SOURCES}
    existing = load_existing(OUTPUT_PATH)
    merged = merge_articles(existing, fetched, active_source_names)
    merged = filter_recent(merged, RETENTION_DAYS)
    merged.sort(key=lambda a: a.get("published_at") or "", reverse=True)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(
            {
                "updated_at": datetime.now(tz=JST).isoformat(),
                "articles": merged,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )

    print(f"{len(merged)}件の記事を書き出しました: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
