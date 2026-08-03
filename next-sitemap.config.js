/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://vinay.is-a.dev",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ["/admin/*", "/auth/*"],
  robotsTxtPolicies: [
    {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/*", "/auth", "/auth/*"],
    },
  ],
};
