// Add these types to your existing types/index.ts file

export type SubscriptionPlan = 'free' | 'pro' | 'team';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionFeature {
  id: string;
  plan: SubscriptionPlan;
  feature: string;
  limit: number | null;
  createdAt: Date;
}

export interface SubscriptionUsage {
  id: string;
  subscriptionId: string;
  feature: string;
  used: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}