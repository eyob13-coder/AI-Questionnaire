// Polar Merchant of Record Client
let polarSdk: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  polarSdk = require('@polar-sh/sdk/2026-04');
} catch {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    polarSdk = require('@polar-sh/sdk');
  } catch {
    polarSdk = {};
  }
}

export interface PolarClientOptions {
  accessToken?: string;
  server?: 'production' | 'sandbox';
}

export class Polar {
  public checkouts: any;
  public subscriptions: any;
  public customers: any;
  public customerPortal: any;
  public customerSessions: any;
  public orders: any;
  public products: any;

  constructor(options?: PolarClientOptions) {
    const accessToken =
      options?.accessToken || process.env.POLAR_ACCESS_TOKEN || '';
    const server =
      options?.server ||
      (process.env.POLAR_ENV === 'production' ? 'production' : 'sandbox');

    if (typeof polarSdk.createPolar === 'function') {
      const client = polarSdk.createPolar({
        accessToken: accessToken || 'polar_test_fallback_token',
        environment: server,
      });
      this.checkouts = client.checkouts;
      this.subscriptions = client.subscriptions;
      this.customers = client.customers;
      this.customerPortal = client.customerPortal;
      this.customerSessions = client.customerSessions;
      this.orders = client.orders;
      this.products = client.products;
    } else {
      this.checkouts = {
        create: async () => ({
          id: `chk_demo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          url: 'https://sandbox.polar.sh/checkout/demo',
        }),
        get: async () => null,
      };
      this.customerSessions = {
        create: async () => ({
          customer_portal_url: 'https://sandbox.polar.sh/purchases',
        }),
      };
      this.customerPortal = {
        customerSessions: {
          create: async () => ({
            customer_portal_url: 'https://sandbox.polar.sh/purchases',
          }),
        },
      };
    }
  }

  validateWebhook(
    body: string | Buffer,
    headers: Record<string, string>,
    secret: string,
  ) {
    if (polarSdk.webhooks?.validateEvent) {
      return polarSdk.webhooks.validateEvent(body, headers, secret);
    }
    return typeof body === 'string' ? JSON.parse(body) : body;
  }
}
