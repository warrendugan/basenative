import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server';

export interface RegisterStartRequest {
  email: string;
  displayName: string;
}

export interface RegisterStartResponse {
  options: PublicKeyCredentialCreationOptionsJSON;
  userId: string;
}

export interface RegisterFinishRequest {
  userId: string;
  email: string;
  displayName: string;
  response: RegistrationResponseJSON;
}

export interface RegisterFinishResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticateStartRequest {
  email: string;
}

export interface AuthenticateStartResponse {
  options: PublicKeyCredentialRequestOptionsJSON;
}

export interface AuthenticateFinishRequest {
  email: string;
  response: AuthenticationResponseJSON;
}

export interface AuthenticateFinishResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RevokeCredentialRequest {
  credentialId: string;
}

export interface CredentialListItem {
  credentialId: string;
  deviceType: string;
  backedUp: boolean;
  createdAt: string;
  transports: string[];
}
