export interface Catalogue {
  id: number;
  title: string;
  category: string;
  description: string;
  slug: string;
  web_url: string;
  content: string;
  image: string;
  average_rating: number;
  download_count: number;
  price: number;
  has_in_app_purchases: boolean;
  version: string;
  platform: string;
  release_date: string | null; // Date represented as string (ISO 8601) or null
  developer: string;
  supported_languages?: string[];
  tags?: string[];
  app_store_url: string;
  play_store_url: string;
  published: boolean;
  published_on?: Date;
  created_on?: Date;
  modified_on?: Date;
  modified_by: string;
  deleted: boolean;
  youtube_url: string | null;
}
