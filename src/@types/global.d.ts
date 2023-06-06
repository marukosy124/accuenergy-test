export type TSortBy = "desc" | "asc";
export type TPlace = Omit<IRecord, "id", "lastViewed">;

export interface IRecord {
  id: number;
  name: string;
  lat: number;
  lng: number;
  lastViewed: Date;
}

export interface ILatestPlace extends IRecord {
  timeZone: string | null;
  localTime: Date | null;
}
