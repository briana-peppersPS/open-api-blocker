import { getURLOrg } from '@ps-flow/frontend-modules-api';
import TicketDeliveryAPI from '@ps-flow/frontend-modules-api/TicketsDeliveryAPI';

export const BLOCKER_ERR_MSG = 'An error occurred while upserting the blocker';

import { BlockerType } from '../Blocker';
import { getBlockerParams } from './blockerAPI';

const orgSlug = getURLOrg();
const blockerAPI = TicketDeliveryAPI.withMiddleware({
  async pre(context) {
    const headers = new Headers(context.init.headers);
    headers.set('Content-Type', 'application/json');
    // CSRF token fix
    headers.set('X-CSRFToken', 'delivery-csrftoken');
    // CORS fix
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'POST, PATCH, PUT, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    context.init.headers = headers;
    return context;
  },
});

export const createBlocker = async (
  blockerType: BlockerType,
  blockerText: string,
  blockerSubject: number
): Promise<{ isLoading: boolean; error: string | null; data?: unknown }> => {
  let isLoading = true;
  let error: string | null = null;

  const data = getBlockerParams(blockerType, blockerText, blockerSubject);

  try {
    const response = await blockerAPI.orgTicketDeliveryBlockerCreate({
      orgSlug,
      data,
    });
    isLoading = false;
    return { isLoading, error, data: response };
  } catch (err: unknown) {
    isLoading = false;

    if (err instanceof Error) {
      error = err instanceof Error ? err.message : BLOCKER_ERR_MSG;
      console.error('Unexpected error:', error);
    }
  }
  return { isLoading, error };
};

export const updateBlocker = async (
  blockerType: BlockerType,
  blockerText: string,
  blockerSubject: number,
  blockerId: number
): Promise<{ isLoading: boolean; error: string | null; data?: unknown }> => {
  let isLoading = true;
  let error: string | null = null;

  const data = getBlockerParams(
    blockerType,
    blockerText,
    blockerSubject,
    blockerId
  );

  try {
    const response = await blockerAPI.orgTicketDeliveryBlockerSetText({
      orgSlug,
      id: blockerId,
      data,
    });
    isLoading = false;
    return { isLoading, error, data: response };
  } catch (err: unknown) {
    isLoading = false;

    if (err instanceof Error) {
      error = err instanceof Error ? err.message : BLOCKER_ERR_MSG;
      console.error('Unexpected error:', error);
    }
  }

  return { isLoading, error };
};

export const flipBlocker = async (
  blockerId: number
): Promise<{ isLoading: boolean; error: string | null; data?: unknown }> => {
  let isLoading = true;
  let error: string | null = null;

  try {
    const response = await blockerAPI.orgTicketDeliveryBlockerSetBlocker({
      orgSlug,
      id: blockerId,
    });
    isLoading = false;
    return { isLoading, error, data: response };
  } catch (err: unknown) {
    isLoading = false;

    if (err instanceof Error) {
      error = err instanceof Error ? err.message : BLOCKER_ERR_MSG;
      console.error('Unexpected error:', error);
    }
  }

  return { isLoading, error };
};
