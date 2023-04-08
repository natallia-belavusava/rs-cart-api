import { AppRequest } from '../models';

/**
 * @param {AppRequest} request
 * @returns {string}
 */
export function getUserIdFromRequest(request: AppRequest): string {
  const userId = request.headers.authorization.split(' ')[1];
  //return userId
  return 'f2c03422-9235-4d89-84af-2bd7bf4b05a9'; //mock for testing
}
