import { getURLOrg } from '@ps-flow/frontend-modules-api'; // Mock this
import TicketDeliveryAPI from '@ps-flow/frontend-modules-api/TicketsDeliveryAPI';

import { BlockerType } from '../Blocker';
import upsertBlocker, { BLOCKER_ERR_MSG } from './upsertBlocker';

// Mock dependencies
jest.mock('@ps-flow/frontend-modules-api', () => ({
  getURLOrg: jest.fn(),
}));
jest.mock('@ps-flow/frontend-modules-api/TicketsDeliveryAPI', () => ({
  withMiddleware: jest.fn(),
}));

const dummyBlockerParams = {
  blockerType: BlockerType.TicketBlocker, // blockerType
  blockerText: 'Blocker reason', // blockerText
  blockerSubject: 123, // blockerSubject -> passed to create a new blocker (POST request)
  blockerId: 1, // blockerId -> passed to update existing blocker (PATCH request)
};

describe('upsertBlocker function', () => {
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create a blocker (POST request)', async () => {
    // Mock the return value of getURLOrg
    (getURLOrg as jest.Mock).mockReturnValue('mock-org-slug');

    // Mock the TicketDeliveryAPI.orgTicketDeliveryBlockerUpdate()
    (TicketDeliveryAPI.withMiddleware as jest.Mock).mockReturnValueOnce({
      orgTicketDeliveryBlockerCreate: mockCreate,
    });

    mockCreate.mockResolvedValue({ id: 1, text: 'Blocker created' });

    const result = await upsertBlocker(
      dummyBlockerParams.blockerType,
      dummyBlockerParams.blockerText,
      dummyBlockerParams.blockerSubject,
      null
    );

    // Validate the success case
    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(null);
    expect(mockCreate).toHaveBeenCalledWith({
      orgSlug: 'mock-org-slug',
      data: {
        ticket: dummyBlockerParams.blockerSubject,
        pr: null,
        text: dummyBlockerParams.blockerText,
      },
    });
  });

  it('should successfully update a blocker (PATCH request)', async () => {
    // Mock the return value of getURLOrg
    (getURLOrg as jest.Mock).mockReturnValue('mock-org-slug');

    // Mock the TicketDeliveryAPI.orgTicketDeliveryBlockerUpdate()
    (TicketDeliveryAPI.withMiddleware as jest.Mock).mockReturnValueOnce({
      orgTicketDeliveryBlockerUpdate: mockUpdate,
    });

    const result = await upsertBlocker(
      dummyBlockerParams.blockerType,
      dummyBlockerParams.blockerText,
      dummyBlockerParams.blockerSubject,
      dummyBlockerParams.blockerId
    );

    // Validate the success case for update
    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(null);
    expect(mockUpdate).toHaveBeenCalledWith({
      orgSlug: 'mock-org-slug',
      id: dummyBlockerParams.blockerId,
      data: {
        text: dummyBlockerParams.blockerText,
        pr: null,
        ticket: dummyBlockerParams.blockerSubject,
      },
    });
  });

  it('should return error when API call fails', async () => {
    // Mock the return value of getURLOrg
    (getURLOrg as jest.Mock).mockReturnValue('mock-org-slug');

    // Mock the behavior of TicketDeliveryAPI.withMiddleware
    const mockWithMiddleware = jest.fn().mockReturnValue({
      orgTicketDeliveryBlockerCreate: mockCreate,
    });
    (TicketDeliveryAPI.withMiddleware as jest.Mock) = mockWithMiddleware;

    // Mock error
    mockCreate.mockRejectedValueOnce(new Error(BLOCKER_ERR_MSG));

    // Mock console.error
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

    const result = await upsertBlocker(
      dummyBlockerParams.blockerType,
      dummyBlockerParams.blockerText,
      dummyBlockerParams.blockerSubject,
      null
    );

    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(BLOCKER_ERR_MSG);
    expect(result.data).toBeUndefined();

    // Assert that console.error was called with correct message
    expect(consoleErrorMock).toHaveBeenCalledWith(
      BLOCKER_ERR_MSG,
      expect.any(Error)
    );

    // Clean up the mock error
    consoleErrorMock.mockRestore();
  });
});
