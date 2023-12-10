import { Queue } from "bullmq";
import Redis from 'ioredis';
import { config } from "@/config";

export type EmailType = 'reset-password-email'|'welcome-email';

export type EmailConfig = {
    type: EmailType
    recipients: string|string[]
    subject: string
    fields?: any
}

const connection = new Redis(config.redis.uri, {
    maxRetriesPerRequest: null
});

const queue = new Queue("Emails", {
    connection
});

export class EmailQueue {
    static async sendEmail (config: EmailConfig) {
        await queue.add(config.type, {
            recipients: config.recipients,
            subject: config.subject,
            fields: config.fields
        })
    }
}
