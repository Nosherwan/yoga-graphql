export interface TagWithCategory {
  id: number;
  tag: string;
  category?: string | null;
  occurrence_count?: number | null;
  created_on?: Date | null;
  modified_on?: Date | null;
  modified_by?: string | null;
  deleted: boolean;
}
