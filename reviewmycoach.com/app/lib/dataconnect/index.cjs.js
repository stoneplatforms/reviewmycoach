const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'reviewmycoach',
  service: 'review-my-coach-service',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
};

const updateUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUser', inputVars);
}
updateUserRef.operationName = 'UpdateUser';
exports.updateUserRef = updateUserRef;

exports.updateUser = function updateUser(dcOrVars, vars) {
  return executeMutation(updateUserRef(dcOrVars, vars));
};

const completeOnboardingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CompleteOnboarding', inputVars);
}
completeOnboardingRef.operationName = 'CompleteOnboarding';
exports.completeOnboardingRef = completeOnboardingRef;

exports.completeOnboarding = function completeOnboarding(dcOrVars, vars) {
  return executeMutation(completeOnboardingRef(dcOrVars, vars));
};

const createCoachRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCoach', inputVars);
}
createCoachRef.operationName = 'CreateCoach';
exports.createCoachRef = createCoachRef;

exports.createCoach = function createCoach(dcOrVars, vars) {
  return executeMutation(createCoachRef(dcOrVars, vars));
};

const updateCoachRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCoach', inputVars);
}
updateCoachRef.operationName = 'UpdateCoach';
exports.updateCoachRef = updateCoachRef;

exports.updateCoach = function updateCoach(dcOrVars, vars) {
  return executeMutation(updateCoachRef(dcOrVars, vars));
};

const claimCoachRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ClaimCoach', inputVars);
}
claimCoachRef.operationName = 'ClaimCoach';
exports.claimCoachRef = claimCoachRef;

exports.claimCoach = function claimCoach(dcOrVars, vars) {
  return executeMutation(claimCoachRef(dcOrVars, vars));
};

const createReviewRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateReview', inputVars);
}
createReviewRef.operationName = 'CreateReview';
exports.createReviewRef = createReviewRef;

exports.createReview = function createReview(dcOrVars, vars) {
  return executeMutation(createReviewRef(dcOrVars, vars));
};

const updateCoachRatingStatsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCoachRatingStats', inputVars);
}
updateCoachRatingStatsRef.operationName = 'UpdateCoachRatingStats';
exports.updateCoachRatingStatsRef = updateCoachRatingStatsRef;

exports.updateCoachRatingStats = function updateCoachRatingStats(dcOrVars, vars) {
  return executeMutation(updateCoachRatingStatsRef(dcOrVars, vars));
};

const createMarketplaceCardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMarketplaceCard', inputVars);
}
createMarketplaceCardRef.operationName = 'CreateMarketplaceCard';
exports.createMarketplaceCardRef = createMarketplaceCardRef;

exports.createMarketplaceCard = function createMarketplaceCard(dcOrVars, vars) {
  return executeMutation(createMarketplaceCardRef(dcOrVars, vars));
};

const updateMarketplaceCardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMarketplaceCard', inputVars);
}
updateMarketplaceCardRef.operationName = 'UpdateMarketplaceCard';
exports.updateMarketplaceCardRef = updateMarketplaceCardRef;

exports.updateMarketplaceCard = function updateMarketplaceCard(dcOrVars, vars) {
  return executeMutation(updateMarketplaceCardRef(dcOrVars, vars));
};

const purchaseCardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'PurchaseCard', inputVars);
}
purchaseCardRef.operationName = 'PurchaseCard';
exports.purchaseCardRef = purchaseCardRef;

exports.purchaseCard = function purchaseCard(dcOrVars, vars) {
  return executeMutation(purchaseCardRef(dcOrVars, vars));
};

const unlockTierCardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UnlockTierCard', inputVars);
}
unlockTierCardRef.operationName = 'UnlockTierCard';
exports.unlockTierCardRef = unlockTierCardRef;

exports.unlockTierCard = function unlockTierCard(dcOrVars, vars) {
  return executeMutation(unlockTierCardRef(dcOrVars, vars));
};

const updateCoachActiveCardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCoachActiveCard', inputVars);
}
updateCoachActiveCardRef.operationName = 'UpdateCoachActiveCard';
exports.updateCoachActiveCardRef = updateCoachActiveCardRef;

exports.updateCoachActiveCard = function updateCoachActiveCard(dcOrVars, vars) {
  return executeMutation(updateCoachActiveCardRef(dcOrVars, vars));
};

const getUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUser', inputVars);
}
getUserRef.operationName = 'GetUser';
exports.getUserRef = getUserRef;

exports.getUser = function getUser(dcOrVars, vars) {
  return executeQuery(getUserRef(dcOrVars, vars));
};

const getUserByEmailRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserByEmail', inputVars);
}
getUserByEmailRef.operationName = 'GetUserByEmail';
exports.getUserByEmailRef = getUserByEmailRef;

exports.getUserByEmail = function getUserByEmail(dcOrVars, vars) {
  return executeQuery(getUserByEmailRef(dcOrVars, vars));
};

const getUserByUsernameRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserByUsername', inputVars);
}
getUserByUsernameRef.operationName = 'GetUserByUsername';
exports.getUserByUsernameRef = getUserByUsernameRef;

exports.getUserByUsername = function getUserByUsername(dcOrVars, vars) {
  return executeQuery(getUserByUsernameRef(dcOrVars, vars));
};

const checkUsernameAvailabilityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CheckUsernameAvailability', inputVars);
}
checkUsernameAvailabilityRef.operationName = 'CheckUsernameAvailability';
exports.checkUsernameAvailabilityRef = checkUsernameAvailabilityRef;

exports.checkUsernameAvailability = function checkUsernameAvailability(dcOrVars, vars) {
  return executeQuery(checkUsernameAvailabilityRef(dcOrVars, vars));
};

const getCoachRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoach', inputVars);
}
getCoachRef.operationName = 'GetCoach';
exports.getCoachRef = getCoachRef;

exports.getCoach = function getCoach(dcOrVars, vars) {
  return executeQuery(getCoachRef(dcOrVars, vars));
};

const getCoachByUsernameRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoachByUsername', inputVars);
}
getCoachByUsernameRef.operationName = 'GetCoachByUsername';
exports.getCoachByUsernameRef = getCoachByUsernameRef;

exports.getCoachByUsername = function getCoachByUsername(dcOrVars, vars) {
  return executeQuery(getCoachByUsernameRef(dcOrVars, vars));
};

const getClaimableCoachesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClaimableCoaches', inputVars);
}
getClaimableCoachesRef.operationName = 'GetClaimableCoaches';
exports.getClaimableCoachesRef = getClaimableCoachesRef;

exports.getClaimableCoaches = function getClaimableCoaches(dcOrVars, vars) {
  return executeQuery(getClaimableCoachesRef(dcOrVars, vars));
};

const checkCoachUsernameAvailabilityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CheckCoachUsernameAvailability', inputVars);
}
checkCoachUsernameAvailabilityRef.operationName = 'CheckCoachUsernameAvailability';
exports.checkCoachUsernameAvailabilityRef = checkCoachUsernameAvailabilityRef;

exports.checkCoachUsernameAvailability = function checkCoachUsernameAvailability(dcOrVars, vars) {
  return executeQuery(checkCoachUsernameAvailabilityRef(dcOrVars, vars));
};

const searchCoachesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchCoaches', inputVars);
}
searchCoachesRef.operationName = 'SearchCoaches';
exports.searchCoachesRef = searchCoachesRef;

exports.searchCoaches = function searchCoaches(dcOrVars, vars) {
  return executeQuery(searchCoachesRef(dcOrVars, vars));
};

const searchCoachesAdvancedRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchCoachesAdvanced', inputVars);
}
searchCoachesAdvancedRef.operationName = 'SearchCoachesAdvanced';
exports.searchCoachesAdvancedRef = searchCoachesAdvancedRef;

exports.searchCoachesAdvanced = function searchCoachesAdvanced(dcOrVars, vars) {
  return executeQuery(searchCoachesAdvancedRef(dcOrVars, vars));
};

const getPublicCoachesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPublicCoaches', inputVars);
}
getPublicCoachesRef.operationName = 'GetPublicCoaches';
exports.getPublicCoachesRef = getPublicCoachesRef;

exports.getPublicCoaches = function getPublicCoaches(dcOrVars, vars) {
  return executeQuery(getPublicCoachesRef(dcOrVars, vars));
};

const getCoachReviewsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoachReviews', inputVars);
}
getCoachReviewsRef.operationName = 'GetCoachReviews';
exports.getCoachReviewsRef = getCoachReviewsRef;

exports.getCoachReviews = function getCoachReviews(dcOrVars, vars) {
  return executeQuery(getCoachReviewsRef(dcOrVars, vars));
};

const getRecentReviewsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRecentReviews', inputVars);
}
getRecentReviewsRef.operationName = 'GetRecentReviews';
exports.getRecentReviewsRef = getRecentReviewsRef;

exports.getRecentReviews = function getRecentReviews(dcOrVars, vars) {
  return executeQuery(getRecentReviewsRef(dcOrVars, vars));
};

const getCoachReviewsPaginatedRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoachReviewsPaginated', inputVars);
}
getCoachReviewsPaginatedRef.operationName = 'GetCoachReviewsPaginated';
exports.getCoachReviewsPaginatedRef = getCoachReviewsPaginatedRef;

exports.getCoachReviewsPaginated = function getCoachReviewsPaginated(dcOrVars, vars) {
  return executeQuery(getCoachReviewsPaginatedRef(dcOrVars, vars));
};

const countAllCoachesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CountAllCoaches');
}
countAllCoachesRef.operationName = 'CountAllCoaches';
exports.countAllCoachesRef = countAllCoachesRef;

exports.countAllCoaches = function countAllCoaches(dc) {
  return executeQuery(countAllCoachesRef(dc));
};

const getTierCardsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTierCards');
}
getTierCardsRef.operationName = 'GetTierCards';
exports.getTierCardsRef = getTierCardsRef;

exports.getTierCards = function getTierCards(dc) {
  return executeQuery(getTierCardsRef(dc));
};

const getEligibleTierCardsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEligibleTierCards', inputVars);
}
getEligibleTierCardsRef.operationName = 'GetEligibleTierCards';
exports.getEligibleTierCardsRef = getEligibleTierCardsRef;

exports.getEligibleTierCards = function getEligibleTierCards(dcOrVars, vars) {
  return executeQuery(getEligibleTierCardsRef(dcOrVars, vars));
};

const getMarketplaceCardsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMarketplaceCards', inputVars);
}
getMarketplaceCardsRef.operationName = 'GetMarketplaceCards';
exports.getMarketplaceCardsRef = getMarketplaceCardsRef;

exports.getMarketplaceCards = function getMarketplaceCards(dcOrVars, vars) {
  return executeQuery(getMarketplaceCardsRef(dcOrVars, vars));
};

const getMarketplaceCardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMarketplaceCard', inputVars);
}
getMarketplaceCardRef.operationName = 'GetMarketplaceCard';
exports.getMarketplaceCardRef = getMarketplaceCardRef;

exports.getMarketplaceCard = function getMarketplaceCard(dcOrVars, vars) {
  return executeQuery(getMarketplaceCardRef(dcOrVars, vars));
};

const getUserCardsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserCards', inputVars);
}
getUserCardsRef.operationName = 'GetUserCards';
exports.getUserCardsRef = getUserCardsRef;

exports.getUserCards = function getUserCards(dcOrVars, vars) {
  return executeQuery(getUserCardsRef(dcOrVars, vars));
};

const getCoachCardsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoachCards', inputVars);
}
getCoachCardsRef.operationName = 'GetCoachCards';
exports.getCoachCardsRef = getCoachCardsRef;

exports.getCoachCards = function getCoachCards(dcOrVars, vars) {
  return executeQuery(getCoachCardsRef(dcOrVars, vars));
};

const getCoachActiveCardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoachActiveCard', inputVars);
}
getCoachActiveCardRef.operationName = 'GetCoachActiveCard';
exports.getCoachActiveCardRef = getCoachActiveCardRef;

exports.getCoachActiveCard = function getCoachActiveCard(dcOrVars, vars) {
  return executeQuery(getCoachActiveCardRef(dcOrVars, vars));
};
