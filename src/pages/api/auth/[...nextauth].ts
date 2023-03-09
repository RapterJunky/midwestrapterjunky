import NextAuth from 'next-auth';
import { authConfig } from '@lib/config/auth';

export default NextAuth(authConfig);