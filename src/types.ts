import { LucideIcon } from 'lucide-react';

export interface Hero {
  id: string;
  name: string;
  nameEn: string;
  nameRu: string;
  icon: string;
  rarity?: number;
  element?: string;
  type: 'legendary' | 'epic';
  gameId: string;
  nameEn: string;
  nameRu: string;
}

export interface Account {
  id: string;
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  price: number;
  image: string;
  heroes: Hero[];
  server?: string;
  adventureRank?: number;
  guaranteed?: boolean;
  gameId: string;
  resources: { name: string; value: number }[];
  metaTitleEn?: string;
  metaTitleRu?: string;
  metaDescriptionEn?: string;
  metaDescriptionRu?: string;
  metaKeywordsEn?: string;
  metaKeywordsRu?: string;
  status: 'active' | 'sold' | 'hidden';
}

export interface Game {
  id: string;
  nameEn: string;
  nameRu: string;
  icon: LucideIcon;
  image: string;
  slug: string;
  description: {
    en: string;
    ru: string;
  };
  hasGachaHeroes: boolean;
}

export interface PurchaseNotification {
  id: string;
  gameId: string;
  accountTitle: string;
  heroes: Hero[];
  timeAgo: string;
  price: number;
}