const SITE_NAME = "ZimTrade";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

module.exports = async (req, res) => {
  const base = `https://${req.headers["x-forwarded-host"] || req.headers.host}`;
  const { id } = req.query;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  // Load the real React page (static file, so no rewrite loop)
  const pageRes = await fetch(`${base}/index.html`);
  let html = await pageRes.text();

  if (!id || !UUID.test(id)) return res.status(200).send(html);

  try {
    const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const url =
      `${process.env.REACT_APP_SUPABASE_URL}/rest/v1/adverts` +
      `?id=eq.${id}&status=eq.active` +
      `&select=title,description,price,currency,city,advert_images(url,position)`;

    const r = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    const rows = await r.json();
    const advert = Array.isArray(rows) ? rows[0] : null;

    // Unknown or hidden advert: serve the normal generic page
    if (!advert) return res.status(200).send(html);

    const price =
      advert.price === null
        ? "Negotiable"
        : `${advert.currency === "USD" ? "$" : "ZWG "}${Number(advert.price).toLocaleString("en-US")}`;

    const image = [...(advert.advert_images || [])].sort((a, b) => a.position - b.position)[0]?.url;
    const title = `${advert.title} - ${price} | ${SITE_NAME}`;
    const summary = (advert.description || "").replace(/\s+/g, " ").trim().slice(0, 150);
    const description = `${price} in ${advert.city}. ${summary}`;
    const pageUrl = `${base}/adverts/${id}`;

    const tags = `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(pageUrl)}" />
    ${image ? `<meta property="og:image" content="${esc(image)}" />` : ""}
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="canonical" href="${esc(pageUrl)}" />`;

    // Remove the generic tags, then add this advert's tags
    html = html
      .replace(/<title>[\s\S]*?<\/title>/i, "")
      .replace(/<meta\s+name="description"[^>]*>/gi, "")
      .replace(/<meta\s+property="og:[^>]*>/gi, "")
      .replace(/<meta\s+name="twitter:[^>]*>/gi, "")
      .replace("</head>", `${tags}\n  </head>`);

    return res.status(200).send(html);
  } catch (err) {
    return res.status(200).send(html);
  }
};