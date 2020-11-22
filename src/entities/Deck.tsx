import { Entity, Column, PrimaryGeneratedColumn } from "typeorm/browser";

@Entity("deck")
export class Deck {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  name!: string;

  @Column("simple-array")
  public cardIds!: number[];
}
