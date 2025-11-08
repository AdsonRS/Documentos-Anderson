
export interface Paragraph {
  id: number;
  text: string;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}
