function getIds(html) {
  const matches = html.matchAll(/data-ds-appid="(\d+)"/g);
  const ids = [];
  const seen = new Set();

  for (const match of matches) {
    const id = Number(match[1]);
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }

  return ids;
}

export async function getTopSellersSteamIds(limit = 1300) {
  const pageSize = 50;
  const pages = Math.ceil(limit / pageSize);

  const all = [];
  const seen = new Set();

  for (let page = 0; page < pages; page++) {
    const start = page * pageSize;
    const url =
      `https://store.steampowered.com/search/?` +
      `filter=globaltopsellers&category1=998&start=${start}&count=${pageSize}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch top sellers page ${page + 1}: ${res.statusText}`,
      );
    }

    const html = await res.text();
    const ids = getIds(html);

    for (const id of ids) {
      if (!seen.has(id)) {
        seen.add(id);
        all.push(id);
      }
      if (all.length === limit) {
        return all;
      }
    }
  }
  return all;
}
