import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class MessagingAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async sendMessage(request: APIRequestContext, messageData: any, userId: string) {
        logger.info(`Sending message:`, messageData);

        const response = await request.post(ENV.API_BASE_URL + 'api/messaging/send', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: messageData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Message sent successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to send message, status: ${response.status()}`);
            throw new Error(`Failed to send message with status: ${response.status()}`);
        }
    }

    async getMessages(request: APIRequestContext, conversationId: string, paginationData: any) {
        logger.info(`Getting messages for conversation: ${conversationId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/messaging/conversations/${conversationId}/messages`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved messages`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get messages, status: ${response.status()}`);
            throw new Error(`Failed to get messages with status: ${response.status()}`);
        }
    }

    async createConversation(request: APIRequestContext, conversationData: any, userId: string) {
        logger.info(`Creating conversation:`, conversationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/messaging/conversations', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: conversationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Conversation created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create conversation, status: ${response.status()}`);
            throw new Error(`Failed to create conversation with status: ${response.status()}`);
        }
    }

    async getConversationById(request: APIRequestContext, conversationId: string) {
        logger.info(`Getting conversation by ID: ${conversationId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/messaging/conversations/${conversationId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved conversation by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get conversation by ID, status: ${response.status()}`);
            throw new Error(`Failed to get conversation by ID with status: ${response.status()}`);
        }
    }

    async deleteConversation(request: APIRequestContext, conversationId: string, userId: string) {
        logger.info(`Deleting conversation with ID: ${conversationId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/messaging/conversations/${conversationId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Conversation deleted successfully' };
            logger.info(`Conversation deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete conversation, status: ${response.status()}`);
            throw new Error(`Failed to delete conversation with status: ${response.status()}`);
        }
    }

    async getAllConversations(request: APIRequestContext, userId: string, paginationData: any) {
        logger.info(`Getting all conversations for user: ${userId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/messaging/conversations/user/${userId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all conversations`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all conversations, status: ${response.status()}`);
            throw new Error(`Failed to get all conversations with status: ${response.status()}`);
        }
    }

    async markMessageAsRead(request: APIRequestContext, messageId: string, userId: string) {
        logger.info(`Marking message ${messageId} as read`);

        const response = await request.put(ENV.API_BASE_URL + `api/messaging/messages/${messageId}/read`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Message marked as read successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to mark message as read, status: ${response.status()}`);
            throw new Error(`Failed to mark message as read with status: ${response.status()}`);
        }
    }

    async markConversationAsRead(request: APIRequestContext, conversationId: string, userId: string) {
        logger.info(`Marking conversation ${conversationId} as read`);

        const response = await request.put(ENV.API_BASE_URL + `api/messaging/conversations/${conversationId}/read`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Conversation marked as read successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to mark conversation as read, status: ${response.status()}`);
            throw new Error(`Failed to mark conversation as read with status: ${response.status()}`);
        }
    }

    async getUnreadMessageCount(request: APIRequestContext, userId: string) {
        logger.info(`Getting unread message count for user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/messaging/unread-count/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved unread message count`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get unread message count, status: ${response.status()}`);
            throw new Error(`Failed to get unread message count with status: ${response.status()}`);
        }
    }

    async addParticipantToConversation(request: APIRequestContext, conversationId: string, participantId: string, userId: string) {
        logger.info(`Adding participant ${participantId} to conversation ${conversationId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/messaging/conversations/${conversationId}/participants`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: { participantId }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Participant added to conversation successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to add participant to conversation, status: ${response.status()}`);
            throw new Error(`Failed to add participant to conversation with status: ${response.status()}`);
        }
    }

    async removeParticipantFromConversation(request: APIRequestContext, conversationId: string, participantId: string, userId: string) {
        logger.info(`Removing participant ${participantId} from conversation ${conversationId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/messaging/conversations/${conversationId}/participants/${participantId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Participant removed from conversation successfully' };
            logger.info(`Participant removed from conversation successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to remove participant from conversation, status: ${response.status()}`);
            throw new Error(`Failed to remove participant from conversation with status: ${response.status()}`);
        }
    }

    async getConversationParticipants(request: APIRequestContext, conversationId: string) {
        logger.info(`Getting participants for conversation ${conversationId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/messaging/conversations/${conversationId}/participants`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved conversation participants`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get conversation participants, status: ${response.status()}`);
            throw new Error(`Failed to get conversation participants with status: ${response.status()}`);
        }
    }

    async searchMessages(request: APIRequestContext, searchData: any) {
        logger.info(`Searching messages:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/messaging/search', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully searched messages`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to search messages, status: ${response.status()}`);
            throw new Error(`Failed to search messages with status: ${response.status()}`);
        }
    }

    async getMessageHistory(request: APIRequestContext, userId: string, paginationData: any) {
        logger.info(`Getting message history for user: ${userId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/messaging/history/${userId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved message history`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get message history, status: ${response.status()}`);
            throw new Error(`Failed to get message history with status: ${response.status()}`);
        }
    }
}
