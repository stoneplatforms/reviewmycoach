import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'reviewmycoach',
  service: 'review-my-coach-service',
  location: 'us-east4'
};

export const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';

export function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
}

export const updateUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUser', inputVars);
}
updateUserRef.operationName = 'UpdateUser';

export function updateUser(dcOrVars, vars) {
  return executeMutation(updateUserRef(dcOrVars, vars));
}

export const completeOnboardingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CompleteOnboarding', inputVars);
}
completeOnboardingRef.operationName = 'CompleteOnboarding';

export function completeOnboarding(dcOrVars, vars) {
  return executeMutation(completeOnboardingRef(dcOrVars, vars));
}

export const createCoachRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCoach', inputVars);
}
createCoachRef.operationName = 'CreateCoach';

export function createCoach(dcOrVars, vars) {
  return executeMutation(createCoachRef(dcOrVars, vars));
}

export const updateCoachRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCoach', inputVars);
}
updateCoachRef.operationName = 'UpdateCoach';

export function updateCoach(dcOrVars, vars) {
  return executeMutation(updateCoachRef(dcOrVars, vars));
}

export const claimCoachRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ClaimCoach', inputVars);
}
claimCoachRef.operationName = 'ClaimCoach';

export function claimCoach(dcOrVars, vars) {
  return executeMutation(claimCoachRef(dcOrVars, vars));
}

export const createReviewRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateReview', inputVars);
}
createReviewRef.operationName = 'CreateReview';

export function createReview(dcOrVars, vars) {
  return executeMutation(createReviewRef(dcOrVars, vars));
}

export const updateCoachRatingStatsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCoachRatingStats', inputVars);
}
updateCoachRatingStatsRef.operationName = 'UpdateCoachRatingStats';

export function updateCoachRatingStats(dcOrVars, vars) {
  return executeMutation(updateCoachRatingStatsRef(dcOrVars, vars));
}

export const createMarketplaceCardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMarketplaceCard', inputVars);
}
createMarketplaceCardRef.operationName = 'CreateMarketplaceCard';

export function createMarketplaceCard(dcOrVars, vars) {
  return executeMutation(createMarketplaceCardRef(dcOrVars, vars));
}

export const updateMarketplaceCardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMarketplaceCard', inputVars);
}
updateMarketplaceCardRef.operationName = 'UpdateMarketplaceCard';

export function updateMarketplaceCard(dcOrVars, vars) {
  return executeMutation(updateMarketplaceCardRef(dcOrVars, vars));
}

export const purchaseCardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'PurchaseCard', inputVars);
}
purchaseCardRef.operationName = 'PurchaseCard';

export function purchaseCard(dcOrVars, vars) {
  return executeMutation(purchaseCardRef(dcOrVars, vars));
}

export const unlockTierCardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UnlockTierCard', inputVars);
}
unlockTierCardRef.operationName = 'UnlockTierCard';

export function unlockTierCard(dcOrVars, vars) {
  return executeMutation(unlockTierCardRef(dcOrVars, vars));
}

export const updateCoachActiveCardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCoachActiveCard', inputVars);
}
updateCoachActiveCardRef.operationName = 'UpdateCoachActiveCard';

export function updateCoachActiveCard(dcOrVars, vars) {
  return executeMutation(updateCoachActiveCardRef(dcOrVars, vars));
}

export const getUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUser', inputVars);
}
getUserRef.operationName = 'GetUser';

export function getUser(dcOrVars, vars) {
  return executeQuery(getUserRef(dcOrVars, vars));
}

export const getUserByEmailRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserByEmail', inputVars);
}
getUserByEmailRef.operationName = 'GetUserByEmail';

export function getUserByEmail(dcOrVars, vars) {
  return executeQuery(getUserByEmailRef(dcOrVars, vars));
}

export const getUserByUsernameRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserByUsername', inputVars);
}
getUserByUsernameRef.operationName = 'GetUserByUsername';

export function getUserByUsername(dcOrVars, vars) {
  return executeQuery(getUserByUsernameRef(dcOrVars, vars));
}

export const checkUsernameAvailabilityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CheckUsernameAvailability', inputVars);
}
checkUsernameAvailabilityRef.operationName = 'CheckUsernameAvailability';

export function checkUsernameAvailability(dcOrVars, vars) {
  return executeQuery(checkUsernameAvailabilityRef(dcOrVars, vars));
}

export const getCoachRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoach', inputVars);
}
getCoachRef.operationName = 'GetCoach';

export function getCoach(dcOrVars, vars) {
  return executeQuery(getCoachRef(dcOrVars, vars));
}

export const getCoachByUsernameRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoachByUsername', inputVars);
}
getCoachByUsernameRef.operationName = 'GetCoachByUsername';

export function getCoachByUsername(dcOrVars, vars) {
  return executeQuery(getCoachByUsernameRef(dcOrVars, vars));
}

export const getClaimableCoachesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClaimableCoaches', inputVars);
}
getClaimableCoachesRef.operationName = 'GetClaimableCoaches';

export function getClaimableCoaches(dcOrVars, vars) {
  return executeQuery(getClaimableCoachesRef(dcOrVars, vars));
}

export const checkCoachUsernameAvailabilityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CheckCoachUsernameAvailability', inputVars);
}
checkCoachUsernameAvailabilityRef.operationName = 'CheckCoachUsernameAvailability';

export function checkCoachUsernameAvailability(dcOrVars, vars) {
  return executeQuery(checkCoachUsernameAvailabilityRef(dcOrVars, vars));
}

export const searchCoachesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchCoaches', inputVars);
}
searchCoachesRef.operationName = 'SearchCoaches';

export function searchCoaches(dcOrVars, vars) {
  return executeQuery(searchCoachesRef(dcOrVars, vars));
}

export const searchCoachesAdvancedRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchCoachesAdvanced', inputVars);
}
searchCoachesAdvancedRef.operationName = 'SearchCoachesAdvanced';

export function searchCoachesAdvanced(dcOrVars, vars) {
  return executeQuery(searchCoachesAdvancedRef(dcOrVars, vars));
}

export const getPublicCoachesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPublicCoaches', inputVars);
}
getPublicCoachesRef.operationName = 'GetPublicCoaches';

export function getPublicCoaches(dcOrVars, vars) {
  return executeQuery(getPublicCoachesRef(dcOrVars, vars));
}

export const getCoachReviewsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoachReviews', inputVars);
}
getCoachReviewsRef.operationName = 'GetCoachReviews';

export function getCoachReviews(dcOrVars, vars) {
  return executeQuery(getCoachReviewsRef(dcOrVars, vars));
}

export const getRecentReviewsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRecentReviews', inputVars);
}
getRecentReviewsRef.operationName = 'GetRecentReviews';

export function getRecentReviews(dcOrVars, vars) {
  return executeQuery(getRecentReviewsRef(dcOrVars, vars));
}

export const getCoachReviewsPaginatedRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoachReviewsPaginated', inputVars);
}
getCoachReviewsPaginatedRef.operationName = 'GetCoachReviewsPaginated';

export function getCoachReviewsPaginated(dcOrVars, vars) {
  return executeQuery(getCoachReviewsPaginatedRef(dcOrVars, vars));
}

export const countAllCoachesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CountAllCoaches');
}
countAllCoachesRef.operationName = 'CountAllCoaches';

export function countAllCoaches(dc) {
  return executeQuery(countAllCoachesRef(dc));
}

export const getTierCardsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTierCards');
}
getTierCardsRef.operationName = 'GetTierCards';

export function getTierCards(dc) {
  return executeQuery(getTierCardsRef(dc));
}

export const getEligibleTierCardsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEligibleTierCards', inputVars);
}
getEligibleTierCardsRef.operationName = 'GetEligibleTierCards';

export function getEligibleTierCards(dcOrVars, vars) {
  return executeQuery(getEligibleTierCardsRef(dcOrVars, vars));
}

export const getMarketplaceCardsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMarketplaceCards', inputVars);
}
getMarketplaceCardsRef.operationName = 'GetMarketplaceCards';

export function getMarketplaceCards(dcOrVars, vars) {
  return executeQuery(getMarketplaceCardsRef(dcOrVars, vars));
}

export const getMarketplaceCardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMarketplaceCard', inputVars);
}
getMarketplaceCardRef.operationName = 'GetMarketplaceCard';

export function getMarketplaceCard(dcOrVars, vars) {
  return executeQuery(getMarketplaceCardRef(dcOrVars, vars));
}

export const getUserCardsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserCards', inputVars);
}
getUserCardsRef.operationName = 'GetUserCards';

export function getUserCards(dcOrVars, vars) {
  return executeQuery(getUserCardsRef(dcOrVars, vars));
}

export const getCoachCardsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoachCards', inputVars);
}
getCoachCardsRef.operationName = 'GetCoachCards';

export function getCoachCards(dcOrVars, vars) {
  return executeQuery(getCoachCardsRef(dcOrVars, vars));
}

export const getCoachActiveCardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoachActiveCard', inputVars);
}
getCoachActiveCardRef.operationName = 'GetCoachActiveCard';

export function getCoachActiveCard(dcOrVars, vars) {
  return executeQuery(getCoachActiveCardRef(dcOrVars, vars));
}

