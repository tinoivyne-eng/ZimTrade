module.exports = async (req, res) => {
  const base = `https://${req.headers["x-forwarded-host"] || req.headers.host}`;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

  let adverts = [];
  try {
    const r = await fetch(
      `${process.env.REACT_APP_SUPABASE_URL}/rest/v1/adverts` +
        `?status=eq.active&select=id,created_at&order=created_at.desc&limit=1000`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    const rows = await r.json();
    if (Array.isArray(rows)) adverts = rows;
  } catch (err) {
    /* fall back to the static pages only */
  }

  const pages = ["/", "/browse", "/terms", "/privacy"];

  const urls = [
    ...pages.map((p) => `  <url><loc>${base}${p}</loc></url>`),
    ...adverts.map(
      (a) =>
        `  <url><loc>${base}/adverts/${a.id}</loc><lastmod>${a.created_at.slice(0, 10)}</lastmod></url>`
    ),
  ].join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(xml);
};