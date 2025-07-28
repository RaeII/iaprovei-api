export interface IUserLookupService {
  findActiveUserById(userId: number): Promise<{ is_active: boolean } | null>;
  findUserByEmail(email: string): Promise<{ id: number; password_hash: string; is_active: boolean } | null>;
}
