import NextAuth from 'next-auth';
import { authConfig } from '@api/auth';

export default NextAuth(authConfig);