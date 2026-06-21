import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class ChatAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async sendMessage(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'sendMessage', args };
    return this.apiProbe(request, 'ChatAPI.sendMessage', payload, accessToken);
  }

  async getMessages(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getMessages', args };
    return this.apiProbe(request, 'ChatAPI.getMessages', payload, accessToken);
  }

  async createChatRoom(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createChatRoom', args };
    return this.apiProbe(request, 'ChatAPI.createChatRoom', payload, accessToken);
  }

  async updateChatRoom(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateChatRoom', args };
    return this.apiProbe(request, 'ChatAPI.updateChatRoom', payload, accessToken);
  }

  async getChatRoomById(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getChatRoomById', args };
    return this.apiProbe(request, 'ChatAPI.getChatRoomById', payload, accessToken);
  }

  async deleteChatRoom(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteChatRoom', args };
    return this.apiProbe(request, 'ChatAPI.deleteChatRoom', payload, accessToken);
  }

  async getAllChatRooms(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAllChatRooms', args };
    return this.apiProbe(request, 'ChatAPI.getAllChatRooms', payload, accessToken);
  }

  async getChatRoomsByUser(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getChatRoomsByUser', args };
    return this.apiProbe(request, 'ChatAPI.getChatRoomsByUser', payload, accessToken);
  }

  async addUserToChatRoom(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'addUserToChatRoom', args };
    return this.apiProbe(request, 'ChatAPI.addUserToChatRoom', payload, accessToken);
  }

  async removeUserFromChatRoom(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'removeUserFromChatRoom', args };
    return this.apiProbe(request, 'ChatAPI.removeUserFromChatRoom', payload, accessToken);
  }

  async getChatRoomUsers(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getChatRoomUsers', args };
    return this.apiProbe(request, 'ChatAPI.getChatRoomUsers', payload, accessToken);
  }

  async markMessageAsRead(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'markMessageAsRead', args };
    return this.apiProbe(request, 'ChatAPI.markMessageAsRead', payload, accessToken);
  }

  async getUnreadMessageCount(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getUnreadMessageCount', args };
    return this.apiProbe(request, 'ChatAPI.getUnreadMessageCount', payload, accessToken);
  }

  async searchMessages(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'searchMessages', args };
    return this.apiProbe(request, 'ChatAPI.searchMessages', payload, accessToken);
  }
}
