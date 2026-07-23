"""収集対象のニュースソース一覧。

このアプリは自動車業界専門の情報収集を目的とするため、収集する記事は自動車関連のみ。
RSS生死・利用規約は定期的に見直すこと。

各ソースは "category" を持つ。
- "news": 自動車専門メディア・総合経済メディアの記事
- "press_release": 自動車メーカーが公式サイトで公表しているニュースリリース

type が "toyokeizai_tag" のソースは、東洋経済オンラインにRSSでは配信されていない
自動車関連の網羅的な記事一覧を得るため、`tags` に指定したタグの記事一覧ページ
（例: https://toyokeizai.net/list/tag/自動車トレンド）を直接取得する。

type が "mazda_release" / "suzuki_release" / "astemo_release" のソースは、
公式サイトにRSS配信がないため、ニュースリリース一覧ページ（マツダ）または
一覧が参照している公開XML/CSV（スズキ・Astemo）を直接取得する。
いずれもrobots.txtで許可された範囲。
"""

SOURCES = [
    {
        "name": "Car Watch",
        "url": "http://car.watch.impress.co.jp/docs/car.rdf",
        "category": "news",
    },
    {
        "name": "carview!",
        "url": "https://news.yahoo.co.jp/rss/media/carv/all.xml",
        "category": "news",
    },
    {
        "name": "webCG",
        "url": "https://news.yahoo.co.jp/rss/media/webcg/all.xml",
        "category": "news",
    },
    {
        "name": "ベストカーWeb",
        "url": "https://news.yahoo.co.jp/rss/media/bestcar/all.xml",
        "category": "news",
    },
    {
        "name": "日刊自動車新聞",
        "url": "https://news.yahoo.co.jp/rss/media/netdenjd/all.xml",
        "category": "news",
    },
    {
        "name": "東洋経済オンライン",
        "type": "toyokeizai_tag",
        "tags": ["自動車トレンド"],
        "category": "news",
    },
    {
        "name": "トヨタ自動車",
        "url": "https://global.toyota/export/jp/allnews_rss.xml",
        "category": "press_release",
    },
    {
        "name": "Honda",
        "url": "https://www.honda.co.jp/rss/hotnews.xml",
        "category": "press_release",
    },
    {
        "name": "日産自動車",
        "url": "https://global.nissannews.com/ja-JP/rss",
        "category": "press_release",
    },
    {
        "name": "SUBARU",
        "url": "https://www.subaru.co.jp/press/news/feed/",
        "category": "press_release",
    },
    {
        "name": "マツダ",
        "type": "mazda_release",
        "category": "press_release",
    },
    {
        "name": "スズキ",
        "type": "suzuki_release",
        "url": "https://www.suzuki.co.jp/release/release.xml",
        "category": "press_release",
    },
    {
        "name": "Astemo",
        "type": "astemo_release",
        "url": "https://www.astemo.com/jp/news/csv/news.csv",
        "category": "press_release",
    },
]
