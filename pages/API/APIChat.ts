import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class ChatAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async sendMessage(request: APIRequestContext, messageData: any, userId: string) {
        logger.info(`Sending chat message:`, messageData);

        const response = await request.post(ENV.API_BASE_URL + 'api/chat/messages', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: messageData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Chat message sent successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to send chat message, status: ${response.status()}`);
            throw new Error(`Failed to send chat message with status: ${response.status()}`);
        }
    }

    async getMessages(request: APIRequestContext, chatId: string, paginationData: any) {
        logger.info(`Getting chat messages for chat ID: ${chatId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/chat/messages/${chatId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved chat messages`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get chat messages, status: ${response.status()}`);
            throw new Error(`Failed to get chat messages with status: ${response.status()}`);
        }
    }

    async createChatRoom(request: APIRequestContext, roomData: any, userId: string) {
        logger.info(`Creating chat room:`, roomData);

        const response = await request.post(ENV.API_BASE_URL + 'api/chat/rooms', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: roomData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Chat room created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create chat room, status: ${response.status()}`);
            throw new Error(`Failed to create chat room with status: ${response.status()}`);
        }
    }

    async updateChatRoom(request: APIRequestContext, roomData: any, userId: string) {
        logger.info(`Updating chat room:`, roomData);

        const response = await request.put(ENV.API_BASE_URL + 'api/chat/rooms', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: roomData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Chat room updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update chat room, status: ${response.status()}`);
            throw new Error(`Failed to update chat room with status: ${response.status()}`);
        }
    }

    async getChatRoomById(request: APIRequestContext, roomId: string) {
        logger.info(`Getting chat room by ID: ${roomId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/chat/rooms/${roomId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved chat room by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get chat room by ID, status: ${response.status()}`);
            throw new Error(`Failed to get chat room by ID with status: ${response.status()}`);
        }
    }

    async deleteChatRoom(request: APIRequestContext, roomId: string, userId: string) {
        logger.info(`Deleting chat room with ID: ${roomId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/chat/rooms/${roomId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Chat room deleted successfully' };
            logger.info(`Chat room deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete chat room, status: ${response.status()}`);
            throw new Error(`Failed to delete chat room with status: ${response.status()}`);
        }
    }

    async getAllChatRooms(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all chat rooms with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/chat/rooms/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all chat rooms`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all chat rooms, status: ${response.status()}`);
            throw new Error(`Failed to get all chat rooms with status: ${response.status()}`);
        }
    }

    async getChatRoomsByUser(request: APIRequestContext, userId: string) {
        logger.info(`Getting chat rooms by user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/chat/rooms/user/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved chat rooms by user`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get chat rooms by user, status: ${response.status()}`);
            throw new Error(`Failed to get chat rooms by user with status: ${response.status()}`);
        }
    }

    async addUserToChatRoom(request: APIRequestContext, roomId: string, userId: string, targetUserId: string) {
        logger.info(`Adding user ${targetUserId} to chat room ${roomId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/chat/rooms/${roomId}/users`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: { userId: targetUserId }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`User added to chat room successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to add user to chat room, status: ${response.status()}`);
            throw new Error(`Failed to add user to chat room with status: ${response.status()}`);
        }
    }

    async removeUserFromChatRoom(request: APIRequestContext, roomId: string, userId: string, targetUserId: string) {
        logger.info(`Removing user ${targetUserId} from chat room ${roomId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/chat/rooms/${roomId}/users/${targetUserId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'User removed from chat room successfully' };
            logger.info(`User removed from chat room successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to remove user from chat room, status: ${response.status()}`);
            throw new Error(`Failed to remove user from chat room with status: ${response.status()}`);
        }
    }

    async getChatRoomUsers(request: APIRequestContext, roomId: string) {
        logger.info(`Getting users for chat room ${roomId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/chat/rooms/${roomId}/users`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved chat room users`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get chat room users, status: ${response.status()}`);
            throw new Error(`Failed to get chat room users with status: ${response.status()}`);
        }
    }

    async markMessageAsRead(request: APIRequestContext, messageId: string, userId: string) {
        logger.info(`Marking message ${messageId} as read`);

        const response = await request.put(ENV.API_BASE_URL + `api/chat/messages/${messageId}/read`, {
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

    async getUnreadMessageCount(request: APIRequestContext, userId: string) {
        logger.info(`Getting unread message count for user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/chat/messages/unread-count/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved unread message count`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get unread message count, status: ${response.status()}`);
            throw new Error(`Failed to get unread message count with status: ${response.status()}`);
        }
    }

    async searchMessages(request: APIRequestContext, searchData: any) {
        logger.info(`Searching chat messages:`, searchData);

        const response = await request.post(ENV.API_BASE_URL + 'api/chat/messages/search', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully searched chat messages`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to search chat messages, status: ${response.status()}`);
            throw new Error(`Failed to search chat messages with status: ${response.status()}`);
        }
    }
}
