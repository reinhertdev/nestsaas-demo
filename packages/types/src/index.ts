export type User = {
  id: string;
  supabaseId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
