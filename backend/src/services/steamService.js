export async function getGameInfo(steamId) {
  const url = `https://store.steampowered.com/api/appdetails?appids=${encodeURIComponent(steamId)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Failed to fetch game info for steamId ${steamId}: ${res.statusText}`,
    );
  }

  const data = await res.json();
  const entry = data[String(steamId)];

  if (!entry || !entry.success) {
    throw new Error(`Game with steamId ${steamId} not found`);
  }

  return entry.data;
}
