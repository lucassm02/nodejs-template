type Payload = {
  telecall: { productId: string };
  additionalData: { labels: string[] };
};

export type DetailModel = { image: string; title: string; description: string };

type PlanModel = {
  planId: number;
  typeId: number;
  value: string;
  costValue: string;
  mvnoId: string;
  programmable: boolean;
  durationTime: number;
  name: string;
  description: string;
  label: string;
  audio: string;
  payload: Payload;
  externalId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
};

export type PlanWithDetailsModel = Omit<
  PlanModel,
  'TypeId' | 'costValue' | 'mvnoId' | 'deletedAt' | 'updateAt' | 'audio'
> & {
  planId: string;
  type: string;
  details: DetailModel[];
};

export enum PlanType {
  RECHARGE = 1,
  BUNDLE = 2,
  BONUS = 3,
}
