/**
 * @file lib/actions/subscription.ts
 * Re-export wrapper para manter compatibilidade com importações legadas.
 */

export * from './subscriptions';
export {
  getSubscription as getUserSubscription,
  upgrade as changeUserPlan,
  cancel as cancelUserSubscription,
} from './subscriptions';
