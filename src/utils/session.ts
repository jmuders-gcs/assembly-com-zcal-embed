import { assemblyApi } from '@assembly-js/node-sdk';
import { need } from '@/utils/need';

const CASE_EXECUTIVE_BOOKING_LINK_FIELD_NAME = 'Case Executive Booking Link';

function normalizeFieldKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getStringCustomFieldValue(
  customFields: unknown,
  preferredKey?: string,
): string | undefined {
  if (!customFields || typeof customFields !== 'object') {
    return undefined;
  }

  const fields = customFields as Record<string, unknown>;
  const candidateKeys = [
    preferredKey,
    CASE_EXECUTIVE_BOOKING_LINK_FIELD_NAME,
    'caseExecutiveBookingLink',
    'case_executive_booking_link',
    'case-executive-booking-link',
    normalizeFieldKey(CASE_EXECUTIVE_BOOKING_LINK_FIELD_NAME),
  ].filter(Boolean) as string[];

  for (const key of candidateKeys) {
    const value = fields[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

/**
 * A helper function that instantiates the Assembly SDK and fetches data
 * from the Assembly API based on the contents of the token that gets
 * passed to your app in the searchParams.
 */
export async function getSession(searchParams: SearchParams) {
  // apiKey needs to be defined inside the function so we get the
  // error boundary page instead of a vercel error.
  const apiKey = need<string>(
    process.env.ASSEMBLY_API_KEY,
    'ASSEMBLY_API_KEY is required, guide available at: https://docs.assembly.com/docs/custom-apps-setting-up-your-first-app#step-2-register-your-app-and-get-an-api-key',
  );

  const assembly = assemblyApi({
    apiKey: apiKey,
    token:
      'token' in searchParams && typeof searchParams.token === 'string'
        ? searchParams.token
        : undefined,
  });

  const data: {
    workspace: Awaited<ReturnType<typeof assembly.retrieveWorkspace>>;
    client?: Awaited<ReturnType<typeof assembly.retrieveClient>>;
    company?: Awaited<ReturnType<typeof assembly.retrieveCompany>>;
    internalUser?: Awaited<ReturnType<typeof assembly.retrieveInternalUser>>;
    caseExecutiveBookingLink?: string;
  } = {
    workspace: await assembly.retrieveWorkspace(),
  };
  const tokenPayload = await assembly.getTokenPayload?.();

  if (tokenPayload?.clientId) {
    data.client = await assembly.retrieveClient({ id: tokenPayload.clientId });

    const customFields = await assembly.listCustomFields({ entityType: 'client' });
    const bookingLinkFieldKey = customFields.data
      ?.find((field) => field.name === CASE_EXECUTIVE_BOOKING_LINK_FIELD_NAME)
      ?.key;

    data.caseExecutiveBookingLink = getStringCustomFieldValue(
      data.client.customFields,
      bookingLinkFieldKey,
    );
  }
  if (tokenPayload?.companyId) {
    data.company = await assembly.retrieveCompany({
      id: tokenPayload.companyId,
    });
  }
  if (tokenPayload?.internalUserId) {
    data.internalUser = await assembly.retrieveInternalUser({
      id: tokenPayload.internalUserId,
    });
  }

  return data;
}

export type SessionData = Awaited<ReturnType<typeof getSession>>;
