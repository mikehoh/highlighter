import { Color } from './color.type';

export interface ISelection {
  text: string;
  color: Color;
  start: number;
  end: number;
}
