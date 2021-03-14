export interface ServerCard {
  id: number;
  face: string | undefined;
  back: string | undefined;
}

export interface ServerCards {
  cards: ServerCard[];
}
