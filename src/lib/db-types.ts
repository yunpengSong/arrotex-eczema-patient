/** Row shape of the users table */
export interface DbUserRow {
  id: number;
  title: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

/** Row shape of the auto_login_tokens table */
export interface DbAutoLoginTokenRow {
  id: number;
  user_id: number;
  token: string;
  used: boolean;
  expires_at: Date;
  created_at: Date;
}

export interface CreateUserData {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AutoLoginTokenCreateData {
  userId: number;
  token: string;
  expiresAt: Date;
}

export interface Db {
  users: {
    create: (data: CreateUserData) => Promise<{ id: number; email: string }>;
    findUnique: ({
      where,
    }: {
      where: { email?: string; id?: number };
    }) => Promise<DbUserRow | null>;
  };
  autoLoginTokens: {
    create: (data: AutoLoginTokenCreateData) => Promise<{ id: number; token: string }>;
    findUnique: ({ where }: { where: { token?: string } }) => Promise<DbAutoLoginTokenRow | null>;
    markAsUsed: (id: number) => Promise<void>;
  };
}
