import {
  ValidateTokenModel,
  AuthenticationModel,
  PlanWithDetailsModel,
} from '@/domain/models';

export type SharedState = {
  validateToken: ValidateTokenModel;
  validateAuthenticationKey: AuthenticationModel;
  getPlanByIdentifier: PlanWithDetailsModel;
  getPlansBySourceAndMvno: PlanWithDetailsModel[];
};
