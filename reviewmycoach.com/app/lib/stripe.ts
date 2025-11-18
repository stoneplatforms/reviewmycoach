import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export const getStripeInstance = () => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  
  return stripeInstance;
};

// Stripe Connect specific functions
export const createConnectAccount = async (email: string, country: string = 'US') => {
  try {
    const stripe = getStripeInstance();
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      country,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    return account;
  } catch (error) {
    console.error('Error creating Connect account:', error);
    throw error;
  }
};

export const createAccountLink = async (accountId: string, returnUrl: string, refreshUrl: string) => {
  try {
    const stripe = getStripeInstance();
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
    return accountLink;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw error;
  }
};

export const getConnectAccount = async (accountId: string) => {
  try {
    const stripe = getStripeInstance();
    const account = await stripe.accounts.retrieve(accountId);
    return account;
  } catch (error) {
    console.error('Error retrieving Connect account:', error);
    throw error;
  }
};

export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  connectedAccountId: string,
  applicationFeeAmount: number,
  metadata: Record<string, string> = {}
) => {
  try {
    const stripe = getStripeInstance();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: connectedAccountId,
      },
      metadata,
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const createProduct = async (
  name: string,
  description: string,
  connectedAccountId: string,
  metadata: Record<string, string> = {}
) => {
  try {
    const stripe = getStripeInstance();
    const product = await stripe.products.create({
      name,
      description,
      metadata,
    }, {
      stripeAccount: connectedAccountId,
    });
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const createPrice = async (
  productId: string,
  unitAmount: number,
  currency: string = 'usd',
  connectedAccountId: string,
  recurring?: {
    interval: 'month' | 'year' | 'week' | 'day';
    interval_count?: number;
  }
) => {
  try {
    const stripe = getStripeInstance();
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: unitAmount,
      currency,
      recurring,
    }, {
      stripeAccount: connectedAccountId,
    });
    return price;
  } catch (error) {
    console.error('Error creating price:', error);
    throw error;
  }
}; 