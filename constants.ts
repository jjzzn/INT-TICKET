import { Role, User } from './types';

export const USERS: Record<string, User> = {
  'user-client': {
    id: 'user-client',
    firstName: 'Alex',
    lastName: 'Doe',
    email: 'alex.d@example.com',
    role: Role.CLIENT,
    password: 'password123',
  },
  'user-organizer': {
    id: 'user-organizer',
    firstName: 'Ben',
    lastName: 'Carter',
    email: 'ben.c@webevents.com',
    role: Role.ORGANIZER,
    password: 'password123',
  },
  'user-admin': {
    id: 'user-admin',
    firstName: 'Chris',
    lastName: 'Vision',
    email: 'chris.v@int-ticket.com',
    // fix: Use correct enum member for Super Admin role. This is fixed by the change in types.ts
    role: Role.SUPER_ADMIN,
    password: 'password123',
  },
};

export const MOCK_API_DELAY = 500;