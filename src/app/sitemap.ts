import { MetadataRoute } from "next";
import { getAllTravelGuidesAsync } from "@/lib/travelGuidesService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.taxiquangtri.com.vn";
  const travelGuides = await getAllTravelGuidesAsync();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cam-nang-du-lich`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const travelGuidePages: MetadataRoute.Sitemap = travelGuides.map((guide) => ({
    url: `${baseUrl}/cam-nang-du-lich/${guide.slug}`,
    lastModified: new Date(guide.publishedDate || new Date()),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [...staticPages, ...travelGuidePages];
}
