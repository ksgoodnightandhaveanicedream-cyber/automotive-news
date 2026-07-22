"""収集対象のニュースソース一覧。

このアプリは自動車業界専門の情報収集を目的とするため、収集する記事は自動車関連のみ。
RSS生死・利用規約は定期的に見直すこと。

type が "toyokeizai_tag" のソースは、東洋経済オンラインにRSSでは配信されていない
自動車関連の網羅的な記事一覧を得るため、`tags` に指定したタグの記事一覧ページ
（例: https://toyokeizai.net/list/tag/自動車トレンド）を直接取得する。
"""

SOURCES = [
    {
        "name": "Car Watch",
        "url": "http://car.watch.impress.co.jp/docs/car.rdf",
    },
    {
        "name": "carview!",
        "url": "https://news.yahoo.co.jp/rss/media/carv/all.xml",
    },
    {
        "name": "webCG",
        "url": "https://news.yahoo.co.jp/rss/media/webcg/all.xml",
    },
    {
        "name": "ベストカーWeb",
        "url": "https://news.yahoo.co.jp/rss/media/bestcar/all.xml",
    },
    {
        "name": "日刊自動車新聞",
        "url": "https://news.yahoo.co.jp/rss/media/netdenjd/all.xml",
    },
    {
        "name": "東洋経済オンライン",
        "type": "toyokeizai_tag",
        "tags": ["自動車トレンド"],
    },
]
