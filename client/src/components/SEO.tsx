import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
}

export default function SEO({ title, description, keywords, ogImage, ogType = "website", canonical }: SEOProps) {
  const siteTitle = title.includes("LouvaMais") ? title : `${title} | LouvaMais`;

  useEffect(() => {
    document.title = siteTitle;
    const setMeta = (name: string, content: string, prop = false) => {
      const selector = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        if (prop) el.setAttribute("property", name); else el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    if (description) { setMeta("description", description); setMeta("og:description", description, true); }
    if (keywords) setMeta("keywords", keywords);
    setMeta("og:title", siteTitle, true);
    setMeta("og:type", ogType, true);
    if (ogImage) setMeta("og:image", ogImage, true);
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) { link = document.createElement("link"); link.setAttribute("rel", "canonical"); document.head.appendChild(link); }
      link.setAttribute("href", canonical);
    }
  }, [siteTitle, description, keywords, ogImage, ogType, canonical]);

  return null;
}
