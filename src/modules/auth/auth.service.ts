import { Injectable } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';

@Injectable()
export class AuthService {
    private clerk = createClerkClient({ secretKey: process.env.CLERK_API_KEY });

    async createUser(email: string, password: string) {
        const user = await this.clerk.users.createUser({
            emailAddress: [email],
            password,
        });
        return user;
    }

    async authenticateUser(email: string, password: string) {
        const userResponse = await this.clerk.users.getUserList({ emailAddress: [email] });
        const user = userResponse[0];
        if (!user) throw new Error('User not found');

        const isValid = await this.clerk.users.verifyPassword({
            userId: user.id,
            password,
        });
        if (!isValid) throw new Error('Invalid credentials');

        const session = await this.clerk.sessions.createSession({ userId: user.id });
        return session;
    }

    async getUser(userId: string) {
        const user = await this.clerk.users.getUser(userId);
        return user;
    }
}