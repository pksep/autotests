import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class MessagingAPI extends APIPageObject {
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
    return this.apiProbe(request, 'MessagingAPI.sendMessage', payload, accessToken);
  }

  async getMessages(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getMessages', args };
    return this.apiProbe(request, 'MessagingAPI.getMessages', payload, accessToken);
  }

  async createConversation(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createConversation', args };
    return this.apiProbe(request, 'MessagingAPI.createConversation', payload, accessToken);
  }

  async getConversationById(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getConversationById', args };
    return this.apiProbe(request, 'MessagingAPI.getConversationById', payload, accessToken);
  }

  async deleteConversation(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteConversation', args };
    return this.apiProbe(request, 'MessagingAPI.deleteConversation', payload, accessToken);
  }

  async getAllConversations(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAllConversations', args };
    return this.apiProbe(request, 'MessagingAPI.getAllConversations', payload, accessToken);
  }

  async markMessageAsRead(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'markMessageAsRead', args };
    return this.apiProbe(request, 'MessagingAPI.markMessageAsRead', payload, accessToken);
  }

  async markConversationAsRead(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'markConversationAsRead', args };
    return this.apiProbe(request, 'MessagingAPI.markConversationAsRead', payload, accessToken);
  }

  async getUnreadMessageCount(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getUnreadMessageCount', args };
    return this.apiProbe(request, 'MessagingAPI.getUnreadMessageCount', payload, accessToken);
  }

  async addParticipantToConversation(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'addParticipantToConversation', args };
    return this.apiProbe(request, 'MessagingAPI.addParticipantToConversation', payload, accessToken);
  }

  async removeParticipantFromConversation(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'removeParticipantFromConversation', args };
    return this.apiProbe(request, 'MessagingAPI.removeParticipantFromConversation', payload, accessToken);
  }

  async getConversationParticipants(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getConversationParticipants', args };
    return this.apiProbe(request, 'MessagingAPI.getConversationParticipants', payload, accessToken);
  }

  async searchMessages(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'searchMessages', args };
    return this.apiProbe(request, 'MessagingAPI.searchMessages', payload, accessToken);
  }

  async getMessageHistory(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getMessageHistory', args };
    return this.apiProbe(request, 'MessagingAPI.getMessageHistory', payload, accessToken);
  }
}
