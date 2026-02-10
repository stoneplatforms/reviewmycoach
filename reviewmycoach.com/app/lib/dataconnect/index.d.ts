import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface ApproveCoachRequestData {
  coachRequest_update?: CoachRequest_Key | null;
}

export interface ApproveCoachRequestVariables {
  id: string;
  reviewedByUserId: string;
  createdCoachId: string;
}

export interface Booking_Key {
  id: string;
  __typename?: 'Booking_Key';
}

export interface Bookmark_Key {
  id: string;
  __typename?: 'Bookmark_Key';
}

export interface CheckCoachUsernameAvailabilityData {
  coaches: ({
    id: string;
    username?: string | null;
  } & Coach_Key)[];
}

export interface CheckCoachUsernameAvailabilityVariables {
  username: string;
}

export interface CheckUsernameAvailabilityData {
  users: ({
    id: string;
    username?: string | null;
  } & User_Key)[];
}

export interface CheckUsernameAvailabilityVariables {
  username: string;
}

export interface ClaimCoachData {
  coach_update?: Coach_Key | null;
}

export interface ClaimCoachVariables {
  id: string;
  userId: string;
}

export interface Class_Key {
  id: string;
  __typename?: 'Class_Key';
}

export interface CoachRequest_Key {
  id: string;
  __typename?: 'CoachRequest_Key';
}

export interface Coach_Key {
  id: string;
  __typename?: 'Coach_Key';
}

export interface CompleteOnboardingData {
  user_update?: User_Key | null;
}

export interface CompleteOnboardingVariables {
  id: string;
}

export interface Conversation_Key {
  id: string;
  __typename?: 'Conversation_Key';
}

export interface CountAllCoachesData {
  coaches: ({
    id: string;
  } & Coach_Key)[];
}

export interface CreateCoachData {
  coach_insert: Coach_Key;
}

export interface CreateCoachRequestData {
  coachRequest_insert: CoachRequest_Key;
}

export interface CreateCoachRequestVariables {
  id: string;
  submittedByUserId?: string | null;
  submittedByName?: string | null;
  coachName: string;
  school: string;
  sport: string;
}

export interface CreateCoachVariables {
  id: string;
  username: string;
  userId: string;
  displayName: string;
  email: string;
}

export interface CreateMarketplaceCardData {
  marketplaceCard_insert: MarketplaceCard_Key;
}

export interface CreateMarketplaceCardVariables {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category?: string | null;
  tier?: string | null;
  rarity?: string | null;
  price: number;
  stripePriceId?: string | null;
  stripeProductId?: string | null;
  isFeatured?: boolean | null;
  sortOrder?: number | null;
}

export interface CreateReviewData {
  review_insert: Review_Key;
}

export interface CreateReviewVariables {
  id: string;
  coachId: string;
  coachUsername: string;
  userId?: string | null;
  email?: string | null;
  studentName: string;
  rating: number;
  reviewText: string;
  sport: string;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  id: string;
  email: string;
  displayName?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
}

export interface DeleteCoachData {
  coach_delete?: Coach_Key | null;
}

export interface DeleteCoachVariables {
  id: string;
}

export interface GetActiveCoachServicesByIdData {
  services: ({
    id: string;
    coachId?: string | null;
    coachUsername?: string | null;
    title?: string | null;
    description?: string | null;
    price?: number | null;
    duration?: number | null;
    isActive?: boolean | null;
    totalBookings?: number | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Service_Key)[];
}

export interface GetActiveCoachServicesByIdVariables {
  coachId: string;
  limit?: number | null;
  offset?: number | null;
}

export interface GetClaimableCoachesData {
  coaches: ({
    id: string;
    username?: string | null;
    displayName?: string | null;
    email?: string | null;
    organization?: string | null;
    school?: string | null;
    sports?: unknown | null;
  } & Coach_Key)[];
}

export interface GetClaimableCoachesVariables {
  email: string;
}

export interface GetCoachActiveCardData {
  userCards: ({
    id: string;
    cardId?: string | null;
    cardName?: string | null;
    cardImageUrl?: string | null;
    isActive?: boolean | null;
  } & UserCard_Key)[];
}

export interface GetCoachActiveCardVariables {
  coachUsername: string;
}

export interface GetCoachByUsernameData {
  coaches: ({
    id: string;
    username?: string | null;
    userId?: string | null;
    displayName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    bio?: string | null;
    sports?: unknown | null;
    specialties?: unknown | null;
    certifications?: unknown | null;
    location?: string | null;
    organization?: string | null;
    school?: string | null;
    role?: string | null;
    gender?: string | null;
    ageGroup?: unknown | null;
    availability?: unknown | null;
    languages?: unknown | null;
    website?: string | null;
    socialMedia?: unknown | null;
    hourlyRate?: number | null;
    experience?: number | null;
    averageRating?: number | null;
    totalReviews?: number | null;
    profileImage?: string | null;
    isVerified?: boolean | null;
    sourceUrl?: string | null;
    subscriptionTier?: number | null;
    longevityPlatformYears?: number | null;
    careerYears?: number | null;
    coursesCreated?: number | null;
    jobsCompleted?: number | null;
    consistencyMultiplier?: number | null;
    totalXp?: number | null;
    activeCardId?: string | null;
    activeCardImageUrl?: string | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Coach_Key)[];
}

export interface GetCoachByUsernameVariables {
  username: string;
}

export interface GetCoachCardsData {
  userCards: ({
    id: string;
    cardId?: string | null;
    cardName?: string | null;
    cardImageUrl?: string | null;
    isActive?: boolean | null;
    purchasedAt?: TimestampString | null;
  } & UserCard_Key)[];
}

export interface GetCoachCardsVariables {
  coachUsername: string;
}

export interface GetCoachData {
  coach?: {
    id: string;
    username?: string | null;
    userId?: string | null;
    displayName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    bio?: string | null;
    sports?: unknown | null;
    specialties?: unknown | null;
    certifications?: unknown | null;
    location?: string | null;
    organization?: string | null;
    school?: string | null;
    role?: string | null;
    gender?: string | null;
    ageGroup?: unknown | null;
    availability?: unknown | null;
    languages?: unknown | null;
    website?: string | null;
    socialMedia?: unknown | null;
    hourlyRate?: number | null;
    experience?: number | null;
    averageRating?: number | null;
    totalReviews?: number | null;
    profileImage?: string | null;
    isVerified?: boolean | null;
    isClaimed?: boolean | null;
    sourceUrl?: string | null;
    subscriptionStatus?: string | null;
    subscriptionTier?: number | null;
    longevityPlatformYears?: number | null;
    careerYears?: number | null;
    coursesCreated?: number | null;
    jobsCompleted?: number | null;
    consistencyMultiplier?: number | null;
    totalXp?: number | null;
    activeCardId?: string | null;
    activeCardImageUrl?: string | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Coach_Key;
}

export interface GetCoachRequestData {
  coachRequest?: {
    id: string;
    submittedByUserId?: string | null;
    submittedByName?: string | null;
    coachName?: string | null;
    school?: string | null;
    sport?: string | null;
    status?: string | null;
    reviewedByUserId?: string | null;
    reviewedAt?: TimestampString | null;
    rejectionReason?: string | null;
    createdCoachId?: string | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & CoachRequest_Key;
}

export interface GetCoachRequestVariables {
  id: string;
}

export interface GetCoachRequestsData {
  coachRequests: ({
    id: string;
    submittedByUserId?: string | null;
    submittedByName?: string | null;
    coachName?: string | null;
    school?: string | null;
    sport?: string | null;
    status?: string | null;
    reviewedByUserId?: string | null;
    reviewedAt?: TimestampString | null;
    rejectionReason?: string | null;
    createdCoachId?: string | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & CoachRequest_Key)[];
}

export interface GetCoachRequestsVariables {
  status?: string | null;
}

export interface GetCoachReviewsData {
  reviews: ({
    id: string;
    coachId?: string | null;
    coachUsername?: string | null;
    userId?: string | null;
    studentName?: string | null;
    rating?: number | null;
    reviewText?: string | null;
    sport?: string | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Review_Key)[];
}

export interface GetCoachReviewsPaginatedData {
  reviews: ({
    id: string;
    coachId?: string | null;
    coachUsername?: string | null;
    userId?: string | null;
    studentName?: string | null;
    rating?: number | null;
    reviewText?: string | null;
    sport?: string | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Review_Key)[];
}

export interface GetCoachReviewsPaginatedVariables {
  coachId: string;
  offset?: number | null;
  limit?: number | null;
}

export interface GetCoachReviewsVariables {
  coachId: string;
  limit?: number | null;
}

export interface GetCoachServicesByIdData {
  services: ({
    id: string;
    coachId?: string | null;
    coachUsername?: string | null;
    title?: string | null;
    description?: string | null;
    price?: number | null;
    duration?: number | null;
    isActive?: boolean | null;
    totalBookings?: number | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Service_Key)[];
}

export interface GetCoachServicesByIdVariables {
  coachId: string;
  limit?: number | null;
  offset?: number | null;
}

export interface GetCoachServicesByUsernameData {
  services: ({
    id: string;
    coachId?: string | null;
    coachUsername?: string | null;
    title?: string | null;
    description?: string | null;
    price?: number | null;
    duration?: number | null;
    isActive?: boolean | null;
    totalBookings?: number | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Service_Key)[];
}

export interface GetCoachServicesByUsernameVariables {
  coachUsername: string;
  limit?: number | null;
  offset?: number | null;
}

export interface GetCoachVariables {
  id: string;
}

export interface GetEligibleTierCardsData {
  tierCards: ({
    id: string;
    tierNumber?: number | null;
    tierName?: string | null;
    requiredXp?: number | null;
    imageUrl?: string | null;
    description?: string | null;
    isActive?: boolean | null;
  } & TierCard_Key)[];
}

export interface GetEligibleTierCardsVariables {
  requiredXp: number;
}

export interface GetMarketplaceCardData {
  marketplaceCard?: {
    id: string;
    name?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    category?: string | null;
    tier?: string | null;
    rarity?: string | null;
    price?: number | null;
    stripePriceId?: string | null;
    stripeProductId?: string | null;
    isActive?: boolean | null;
    isFeatured?: boolean | null;
    totalPurchases?: number | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & MarketplaceCard_Key;
}

export interface GetMarketplaceCardVariables {
  id: string;
}

export interface GetMarketplaceCardsData {
  marketplaceCards: ({
    id: string;
    name?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    category?: string | null;
    tier?: string | null;
    rarity?: string | null;
    price?: number | null;
    isFeatured?: boolean | null;
    totalPurchases?: number | null;
    createdAt?: TimestampString | null;
  } & MarketplaceCard_Key)[];
}

export interface GetMarketplaceCardsVariables {
  category?: string | null;
  tier?: string | null;
  limit?: number | null;
  offset?: number | null;
}

export interface GetPendingCoachRequestsData {
  coachRequests: ({
    id: string;
    submittedByUserId?: string | null;
    submittedByName?: string | null;
    coachName?: string | null;
    school?: string | null;
    sport?: string | null;
    status?: string | null;
    createdAt?: TimestampString | null;
  } & CoachRequest_Key)[];
}

export interface GetPublicCoachesData {
  coaches: ({
    id: string;
    username?: string | null;
    userId?: string | null;
    displayName?: string | null;
    bio?: string | null;
    sports?: unknown | null;
    specialties?: unknown | null;
    location?: string | null;
    organization?: string | null;
    school?: string | null;
    role?: string | null;
    hourlyRate?: number | null;
    averageRating?: number | null;
    totalReviews?: number | null;
    profileImage?: string | null;
    isVerified?: boolean | null;
    hasActiveServices?: boolean | null;
    subscriptionTier?: number | null;
    longevityPlatformYears?: number | null;
    careerYears?: number | null;
    coursesCreated?: number | null;
    jobsCompleted?: number | null;
    consistencyMultiplier?: number | null;
    totalXp?: number | null;
    isClaimed?: boolean | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Coach_Key)[];
}

export interface GetPublicCoachesVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface GetRecentReviewsData {
  reviews: ({
    id: string;
    coachId?: string | null;
    coachUsername?: string | null;
    userId?: string | null;
    studentName?: string | null;
    rating?: number | null;
    reviewText?: string | null;
    sport?: string | null;
    createdAt?: TimestampString | null;
  } & Review_Key)[];
}

export interface GetRecentReviewsVariables {
  limit?: number | null;
}

export interface GetTierCardsData {
  tierCards: ({
    id: string;
    tierNumber?: number | null;
    tierName?: string | null;
    requiredXp?: number | null;
    imageUrl?: string | null;
    description?: string | null;
  } & TierCard_Key)[];
}

export interface GetTopCoachesByXpData {
  coaches: ({
    id: string;
    username?: string | null;
    userId?: string | null;
    displayName?: string | null;
    bio?: string | null;
    sports?: unknown | null;
    specialties?: unknown | null;
    location?: string | null;
    organization?: string | null;
    school?: string | null;
    role?: string | null;
    hourlyRate?: number | null;
    averageRating?: number | null;
    totalReviews?: number | null;
    profileImage?: string | null;
    isVerified?: boolean | null;
    hasActiveServices?: boolean | null;
    isClaimed?: boolean | null;
    totalXp?: number | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Coach_Key)[];
}

export interface GetTopCoachesByXpVariables {
  limit?: number | null;
}

export interface GetUserByEmailData {
  users: ({
    id: string;
    userId?: string | null;
    email?: string | null;
    displayName?: string | null;
    username?: string | null;
    role?: string | null;
    onboardingCompleted?: boolean | null;
    isVerified?: boolean | null;
  } & User_Key)[];
}

export interface GetUserByEmailVariables {
  email: string;
}

export interface GetUserByUsernameData {
  users: ({
    id: string;
    username?: string | null;
    displayName?: string | null;
  } & User_Key)[];
}

export interface GetUserByUsernameVariables {
  username: string;
}

export interface GetUserCardsData {
  userCards: ({
    id: string;
    userId?: string | null;
    coachUsername?: string | null;
    cardId?: string | null;
    cardType?: string | null;
    cardName?: string | null;
    cardImageUrl?: string | null;
    isActive?: boolean | null;
    unlockedAt?: TimestampString | null;
    purchasedAt?: TimestampString | null;
    createdAt?: TimestampString | null;
  } & UserCard_Key)[];
}

export interface GetUserCardsVariables {
  userId: string;
}

export interface GetUserData {
  user?: {
    id: string;
    userId?: string | null;
    email?: string | null;
    displayName?: string | null;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role?: string | null;
    onboardingCompleted?: boolean | null;
    isVerified?: boolean | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & User_Key;
}

export interface GetUserVariables {
  id: string;
}

export interface IdentityVerification_Key {
  id: string;
  __typename?: 'IdentityVerification_Key';
}

export interface JobApplication_Key {
  id: string;
  __typename?: 'JobApplication_Key';
}

export interface Job_Key {
  id: string;
  __typename?: 'Job_Key';
}

export interface MarketplaceCard_Key {
  id: string;
  __typename?: 'MarketplaceCard_Key';
}

export interface Message_Key {
  id: string;
  __typename?: 'Message_Key';
}

export interface PurchaseCardData {
  userCard_insert: UserCard_Key;
}

export interface PurchaseCardVariables {
  id: string;
  userId: string;
  coachUsername: string;
  cardId: string;
  cardName: string;
  cardImageUrl: string;
  stripePaymentId?: string | null;
}

export interface RejectCoachRequestData {
  coachRequest_update?: CoachRequest_Key | null;
}

export interface RejectCoachRequestVariables {
  id: string;
  reviewedByUserId: string;
  rejectionReason?: string | null;
}

export interface Report_Key {
  id: string;
  __typename?: 'Report_Key';
}

export interface Review_Key {
  id: string;
  __typename?: 'Review_Key';
}

export interface SearchCoachesAdvancedData {
  coaches: ({
    id: string;
    username?: string | null;
    userId?: string | null;
    displayName?: string | null;
    email?: string | null;
    bio?: string | null;
    sports?: unknown | null;
    specialties?: unknown | null;
    certifications?: unknown | null;
    location?: string | null;
    organization?: string | null;
    school?: string | null;
    role?: string | null;
    gender?: string | null;
    ageGroup?: unknown | null;
    sourceUrl?: string | null;
    hourlyRate?: number | null;
    averageRating?: number | null;
    totalReviews?: number | null;
    profileImage?: string | null;
    isVerified?: boolean | null;
    hasActiveServices?: boolean | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Coach_Key)[];
}

export interface SearchCoachesAdvancedVariables {
  searchTerm?: string | null;
  sport?: string | null;
  location?: string | null;
  gender?: string | null;
  organization?: string | null;
  minRating?: number | null;
  maxRate?: number | null;
  isVerified?: boolean | null;
  offset?: number | null;
  limit?: number | null;
}

export interface SearchCoachesData {
  coaches: ({
    id: string;
    username?: string | null;
    displayName?: string | null;
    bio?: string | null;
    sports?: unknown | null;
    location?: string | null;
    hourlyRate?: number | null;
    averageRating?: number | null;
    totalReviews?: number | null;
    profileImage?: string | null;
  } & Coach_Key)[];
}

export interface SearchCoachesVariables {
  sport?: string | null;
  location?: string | null;
  limit?: number | null;
}

export interface Service_Key {
  id: string;
  __typename?: 'Service_Key';
}

export interface Sport_Key {
  id: string;
  __typename?: 'Sport_Key';
}

export interface Tag_Key {
  id: string;
  __typename?: 'Tag_Key';
}

export interface TierCard_Key {
  id: string;
  __typename?: 'TierCard_Key';
}

export interface UnlockTierCardData {
  userCard_insert: UserCard_Key;
}

export interface UnlockTierCardVariables {
  id: string;
  userId: string;
  coachUsername: string;
  cardId: string;
  cardName: string;
  cardImageUrl: string;
}

export interface UpdateCoachActiveCardData {
  coach_update?: Coach_Key | null;
}

export interface UpdateCoachActiveCardVariables {
  coachId: string;
  activeCardId?: string | null;
  activeCardImageUrl?: string | null;
}

export interface UpdateCoachData {
  coach_update?: Coach_Key | null;
}

export interface UpdateCoachRatingStatsData {
  coach_update?: Coach_Key | null;
}

export interface UpdateCoachRatingStatsVariables {
  coachId: string;
  averageRating: number;
  totalReviews: number;
}

export interface UpdateCoachTotalXpData {
  coach_update?: Coach_Key | null;
}

export interface UpdateCoachTotalXpVariables {
  id: string;
  totalXp: number;
}

export interface UpdateCoachVariables {
  id: string;
  bio?: string | null;
  sports?: unknown | null;
  location?: string | null;
  hourlyRate?: number | null;
  profileImage?: string | null;
  isPublic?: boolean | null;
  activeCardId?: string | null;
  activeCardImageUrl?: string | null;
  school?: string | null;
}

export interface UpdateMarketplaceCardData {
  marketplaceCard_update?: MarketplaceCard_Key | null;
}

export interface UpdateMarketplaceCardVariables {
  id: string;
  name?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  isActive?: boolean | null;
  isFeatured?: boolean | null;
  sortOrder?: number | null;
}

export interface UpdateUserData {
  user_update?: User_Key | null;
}

export interface UpdateUserVariables {
  id: string;
  displayName?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  onboardingCompleted?: boolean | null;
}

export interface UserCard_Key {
  id: string;
  __typename?: 'UserCard_Key';
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface UpdateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
  operationName: string;
}
export const updateUserRef: UpdateUserRef;

export function updateUser(vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;
export function updateUser(dc: DataConnect, vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;

interface CompleteOnboardingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CompleteOnboardingVariables): MutationRef<CompleteOnboardingData, CompleteOnboardingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CompleteOnboardingVariables): MutationRef<CompleteOnboardingData, CompleteOnboardingVariables>;
  operationName: string;
}
export const completeOnboardingRef: CompleteOnboardingRef;

export function completeOnboarding(vars: CompleteOnboardingVariables): MutationPromise<CompleteOnboardingData, CompleteOnboardingVariables>;
export function completeOnboarding(dc: DataConnect, vars: CompleteOnboardingVariables): MutationPromise<CompleteOnboardingData, CompleteOnboardingVariables>;

interface CreateCoachRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCoachVariables): MutationRef<CreateCoachData, CreateCoachVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCoachVariables): MutationRef<CreateCoachData, CreateCoachVariables>;
  operationName: string;
}
export const createCoachRef: CreateCoachRef;

export function createCoach(vars: CreateCoachVariables): MutationPromise<CreateCoachData, CreateCoachVariables>;
export function createCoach(dc: DataConnect, vars: CreateCoachVariables): MutationPromise<CreateCoachData, CreateCoachVariables>;

interface UpdateCoachRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCoachVariables): MutationRef<UpdateCoachData, UpdateCoachVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCoachVariables): MutationRef<UpdateCoachData, UpdateCoachVariables>;
  operationName: string;
}
export const updateCoachRef: UpdateCoachRef;

export function updateCoach(vars: UpdateCoachVariables): MutationPromise<UpdateCoachData, UpdateCoachVariables>;
export function updateCoach(dc: DataConnect, vars: UpdateCoachVariables): MutationPromise<UpdateCoachData, UpdateCoachVariables>;

interface ClaimCoachRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ClaimCoachVariables): MutationRef<ClaimCoachData, ClaimCoachVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ClaimCoachVariables): MutationRef<ClaimCoachData, ClaimCoachVariables>;
  operationName: string;
}
export const claimCoachRef: ClaimCoachRef;

export function claimCoach(vars: ClaimCoachVariables): MutationPromise<ClaimCoachData, ClaimCoachVariables>;
export function claimCoach(dc: DataConnect, vars: ClaimCoachVariables): MutationPromise<ClaimCoachData, ClaimCoachVariables>;

interface UpdateCoachTotalXpRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCoachTotalXpVariables): MutationRef<UpdateCoachTotalXpData, UpdateCoachTotalXpVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCoachTotalXpVariables): MutationRef<UpdateCoachTotalXpData, UpdateCoachTotalXpVariables>;
  operationName: string;
}
export const updateCoachTotalXpRef: UpdateCoachTotalXpRef;

export function updateCoachTotalXp(vars: UpdateCoachTotalXpVariables): MutationPromise<UpdateCoachTotalXpData, UpdateCoachTotalXpVariables>;
export function updateCoachTotalXp(dc: DataConnect, vars: UpdateCoachTotalXpVariables): MutationPromise<UpdateCoachTotalXpData, UpdateCoachTotalXpVariables>;

interface DeleteCoachRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCoachVariables): MutationRef<DeleteCoachData, DeleteCoachVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteCoachVariables): MutationRef<DeleteCoachData, DeleteCoachVariables>;
  operationName: string;
}
export const deleteCoachRef: DeleteCoachRef;

export function deleteCoach(vars: DeleteCoachVariables): MutationPromise<DeleteCoachData, DeleteCoachVariables>;
export function deleteCoach(dc: DataConnect, vars: DeleteCoachVariables): MutationPromise<DeleteCoachData, DeleteCoachVariables>;

interface CreateReviewRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateReviewVariables): MutationRef<CreateReviewData, CreateReviewVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateReviewVariables): MutationRef<CreateReviewData, CreateReviewVariables>;
  operationName: string;
}
export const createReviewRef: CreateReviewRef;

export function createReview(vars: CreateReviewVariables): MutationPromise<CreateReviewData, CreateReviewVariables>;
export function createReview(dc: DataConnect, vars: CreateReviewVariables): MutationPromise<CreateReviewData, CreateReviewVariables>;

interface UpdateCoachRatingStatsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCoachRatingStatsVariables): MutationRef<UpdateCoachRatingStatsData, UpdateCoachRatingStatsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCoachRatingStatsVariables): MutationRef<UpdateCoachRatingStatsData, UpdateCoachRatingStatsVariables>;
  operationName: string;
}
export const updateCoachRatingStatsRef: UpdateCoachRatingStatsRef;

export function updateCoachRatingStats(vars: UpdateCoachRatingStatsVariables): MutationPromise<UpdateCoachRatingStatsData, UpdateCoachRatingStatsVariables>;
export function updateCoachRatingStats(dc: DataConnect, vars: UpdateCoachRatingStatsVariables): MutationPromise<UpdateCoachRatingStatsData, UpdateCoachRatingStatsVariables>;

interface CreateMarketplaceCardRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMarketplaceCardVariables): MutationRef<CreateMarketplaceCardData, CreateMarketplaceCardVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateMarketplaceCardVariables): MutationRef<CreateMarketplaceCardData, CreateMarketplaceCardVariables>;
  operationName: string;
}
export const createMarketplaceCardRef: CreateMarketplaceCardRef;

export function createMarketplaceCard(vars: CreateMarketplaceCardVariables): MutationPromise<CreateMarketplaceCardData, CreateMarketplaceCardVariables>;
export function createMarketplaceCard(dc: DataConnect, vars: CreateMarketplaceCardVariables): MutationPromise<CreateMarketplaceCardData, CreateMarketplaceCardVariables>;

interface UpdateMarketplaceCardRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMarketplaceCardVariables): MutationRef<UpdateMarketplaceCardData, UpdateMarketplaceCardVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateMarketplaceCardVariables): MutationRef<UpdateMarketplaceCardData, UpdateMarketplaceCardVariables>;
  operationName: string;
}
export const updateMarketplaceCardRef: UpdateMarketplaceCardRef;

export function updateMarketplaceCard(vars: UpdateMarketplaceCardVariables): MutationPromise<UpdateMarketplaceCardData, UpdateMarketplaceCardVariables>;
export function updateMarketplaceCard(dc: DataConnect, vars: UpdateMarketplaceCardVariables): MutationPromise<UpdateMarketplaceCardData, UpdateMarketplaceCardVariables>;

interface PurchaseCardRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: PurchaseCardVariables): MutationRef<PurchaseCardData, PurchaseCardVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: PurchaseCardVariables): MutationRef<PurchaseCardData, PurchaseCardVariables>;
  operationName: string;
}
export const purchaseCardRef: PurchaseCardRef;

export function purchaseCard(vars: PurchaseCardVariables): MutationPromise<PurchaseCardData, PurchaseCardVariables>;
export function purchaseCard(dc: DataConnect, vars: PurchaseCardVariables): MutationPromise<PurchaseCardData, PurchaseCardVariables>;

interface UnlockTierCardRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UnlockTierCardVariables): MutationRef<UnlockTierCardData, UnlockTierCardVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UnlockTierCardVariables): MutationRef<UnlockTierCardData, UnlockTierCardVariables>;
  operationName: string;
}
export const unlockTierCardRef: UnlockTierCardRef;

export function unlockTierCard(vars: UnlockTierCardVariables): MutationPromise<UnlockTierCardData, UnlockTierCardVariables>;
export function unlockTierCard(dc: DataConnect, vars: UnlockTierCardVariables): MutationPromise<UnlockTierCardData, UnlockTierCardVariables>;

interface UpdateCoachActiveCardRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCoachActiveCardVariables): MutationRef<UpdateCoachActiveCardData, UpdateCoachActiveCardVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCoachActiveCardVariables): MutationRef<UpdateCoachActiveCardData, UpdateCoachActiveCardVariables>;
  operationName: string;
}
export const updateCoachActiveCardRef: UpdateCoachActiveCardRef;

export function updateCoachActiveCard(vars: UpdateCoachActiveCardVariables): MutationPromise<UpdateCoachActiveCardData, UpdateCoachActiveCardVariables>;
export function updateCoachActiveCard(dc: DataConnect, vars: UpdateCoachActiveCardVariables): MutationPromise<UpdateCoachActiveCardData, UpdateCoachActiveCardVariables>;

interface CreateCoachRequestRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCoachRequestVariables): MutationRef<CreateCoachRequestData, CreateCoachRequestVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCoachRequestVariables): MutationRef<CreateCoachRequestData, CreateCoachRequestVariables>;
  operationName: string;
}
export const createCoachRequestRef: CreateCoachRequestRef;

export function createCoachRequest(vars: CreateCoachRequestVariables): MutationPromise<CreateCoachRequestData, CreateCoachRequestVariables>;
export function createCoachRequest(dc: DataConnect, vars: CreateCoachRequestVariables): MutationPromise<CreateCoachRequestData, CreateCoachRequestVariables>;

interface ApproveCoachRequestRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ApproveCoachRequestVariables): MutationRef<ApproveCoachRequestData, ApproveCoachRequestVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ApproveCoachRequestVariables): MutationRef<ApproveCoachRequestData, ApproveCoachRequestVariables>;
  operationName: string;
}
export const approveCoachRequestRef: ApproveCoachRequestRef;

export function approveCoachRequest(vars: ApproveCoachRequestVariables): MutationPromise<ApproveCoachRequestData, ApproveCoachRequestVariables>;
export function approveCoachRequest(dc: DataConnect, vars: ApproveCoachRequestVariables): MutationPromise<ApproveCoachRequestData, ApproveCoachRequestVariables>;

interface RejectCoachRequestRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RejectCoachRequestVariables): MutationRef<RejectCoachRequestData, RejectCoachRequestVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RejectCoachRequestVariables): MutationRef<RejectCoachRequestData, RejectCoachRequestVariables>;
  operationName: string;
}
export const rejectCoachRequestRef: RejectCoachRequestRef;

export function rejectCoachRequest(vars: RejectCoachRequestVariables): MutationPromise<RejectCoachRequestData, RejectCoachRequestVariables>;
export function rejectCoachRequest(dc: DataConnect, vars: RejectCoachRequestVariables): MutationPromise<RejectCoachRequestData, RejectCoachRequestVariables>;

interface GetUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
  operationName: string;
}
export const getUserRef: GetUserRef;

export function getUser(vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;
export function getUser(dc: DataConnect, vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserByEmailRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
  operationName: string;
}
export const getUserByEmailRef: GetUserByEmailRef;

export function getUserByEmail(vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;
export function getUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface GetUserByUsernameRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByUsernameVariables): QueryRef<GetUserByUsernameData, GetUserByUsernameVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByUsernameVariables): QueryRef<GetUserByUsernameData, GetUserByUsernameVariables>;
  operationName: string;
}
export const getUserByUsernameRef: GetUserByUsernameRef;

export function getUserByUsername(vars: GetUserByUsernameVariables): QueryPromise<GetUserByUsernameData, GetUserByUsernameVariables>;
export function getUserByUsername(dc: DataConnect, vars: GetUserByUsernameVariables): QueryPromise<GetUserByUsernameData, GetUserByUsernameVariables>;

interface CheckUsernameAvailabilityRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CheckUsernameAvailabilityVariables): QueryRef<CheckUsernameAvailabilityData, CheckUsernameAvailabilityVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CheckUsernameAvailabilityVariables): QueryRef<CheckUsernameAvailabilityData, CheckUsernameAvailabilityVariables>;
  operationName: string;
}
export const checkUsernameAvailabilityRef: CheckUsernameAvailabilityRef;

export function checkUsernameAvailability(vars: CheckUsernameAvailabilityVariables): QueryPromise<CheckUsernameAvailabilityData, CheckUsernameAvailabilityVariables>;
export function checkUsernameAvailability(dc: DataConnect, vars: CheckUsernameAvailabilityVariables): QueryPromise<CheckUsernameAvailabilityData, CheckUsernameAvailabilityVariables>;

interface GetCoachRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoachVariables): QueryRef<GetCoachData, GetCoachVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCoachVariables): QueryRef<GetCoachData, GetCoachVariables>;
  operationName: string;
}
export const getCoachRef: GetCoachRef;

export function getCoach(vars: GetCoachVariables): QueryPromise<GetCoachData, GetCoachVariables>;
export function getCoach(dc: DataConnect, vars: GetCoachVariables): QueryPromise<GetCoachData, GetCoachVariables>;

interface GetCoachByUsernameRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoachByUsernameVariables): QueryRef<GetCoachByUsernameData, GetCoachByUsernameVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCoachByUsernameVariables): QueryRef<GetCoachByUsernameData, GetCoachByUsernameVariables>;
  operationName: string;
}
export const getCoachByUsernameRef: GetCoachByUsernameRef;

export function getCoachByUsername(vars: GetCoachByUsernameVariables): QueryPromise<GetCoachByUsernameData, GetCoachByUsernameVariables>;
export function getCoachByUsername(dc: DataConnect, vars: GetCoachByUsernameVariables): QueryPromise<GetCoachByUsernameData, GetCoachByUsernameVariables>;

interface GetClaimableCoachesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClaimableCoachesVariables): QueryRef<GetClaimableCoachesData, GetClaimableCoachesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetClaimableCoachesVariables): QueryRef<GetClaimableCoachesData, GetClaimableCoachesVariables>;
  operationName: string;
}
export const getClaimableCoachesRef: GetClaimableCoachesRef;

export function getClaimableCoaches(vars: GetClaimableCoachesVariables): QueryPromise<GetClaimableCoachesData, GetClaimableCoachesVariables>;
export function getClaimableCoaches(dc: DataConnect, vars: GetClaimableCoachesVariables): QueryPromise<GetClaimableCoachesData, GetClaimableCoachesVariables>;

interface CheckCoachUsernameAvailabilityRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CheckCoachUsernameAvailabilityVariables): QueryRef<CheckCoachUsernameAvailabilityData, CheckCoachUsernameAvailabilityVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CheckCoachUsernameAvailabilityVariables): QueryRef<CheckCoachUsernameAvailabilityData, CheckCoachUsernameAvailabilityVariables>;
  operationName: string;
}
export const checkCoachUsernameAvailabilityRef: CheckCoachUsernameAvailabilityRef;

export function checkCoachUsernameAvailability(vars: CheckCoachUsernameAvailabilityVariables): QueryPromise<CheckCoachUsernameAvailabilityData, CheckCoachUsernameAvailabilityVariables>;
export function checkCoachUsernameAvailability(dc: DataConnect, vars: CheckCoachUsernameAvailabilityVariables): QueryPromise<CheckCoachUsernameAvailabilityData, CheckCoachUsernameAvailabilityVariables>;

interface SearchCoachesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: SearchCoachesVariables): QueryRef<SearchCoachesData, SearchCoachesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: SearchCoachesVariables): QueryRef<SearchCoachesData, SearchCoachesVariables>;
  operationName: string;
}
export const searchCoachesRef: SearchCoachesRef;

export function searchCoaches(vars?: SearchCoachesVariables): QueryPromise<SearchCoachesData, SearchCoachesVariables>;
export function searchCoaches(dc: DataConnect, vars?: SearchCoachesVariables): QueryPromise<SearchCoachesData, SearchCoachesVariables>;

interface SearchCoachesAdvancedRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: SearchCoachesAdvancedVariables): QueryRef<SearchCoachesAdvancedData, SearchCoachesAdvancedVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: SearchCoachesAdvancedVariables): QueryRef<SearchCoachesAdvancedData, SearchCoachesAdvancedVariables>;
  operationName: string;
}
export const searchCoachesAdvancedRef: SearchCoachesAdvancedRef;

export function searchCoachesAdvanced(vars?: SearchCoachesAdvancedVariables): QueryPromise<SearchCoachesAdvancedData, SearchCoachesAdvancedVariables>;
export function searchCoachesAdvanced(dc: DataConnect, vars?: SearchCoachesAdvancedVariables): QueryPromise<SearchCoachesAdvancedData, SearchCoachesAdvancedVariables>;

interface GetPublicCoachesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetPublicCoachesVariables): QueryRef<GetPublicCoachesData, GetPublicCoachesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetPublicCoachesVariables): QueryRef<GetPublicCoachesData, GetPublicCoachesVariables>;
  operationName: string;
}
export const getPublicCoachesRef: GetPublicCoachesRef;

export function getPublicCoaches(vars?: GetPublicCoachesVariables): QueryPromise<GetPublicCoachesData, GetPublicCoachesVariables>;
export function getPublicCoaches(dc: DataConnect, vars?: GetPublicCoachesVariables): QueryPromise<GetPublicCoachesData, GetPublicCoachesVariables>;

interface GetTopCoachesByXpRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetTopCoachesByXpVariables): QueryRef<GetTopCoachesByXpData, GetTopCoachesByXpVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetTopCoachesByXpVariables): QueryRef<GetTopCoachesByXpData, GetTopCoachesByXpVariables>;
  operationName: string;
}
export const getTopCoachesByXpRef: GetTopCoachesByXpRef;

export function getTopCoachesByXp(vars?: GetTopCoachesByXpVariables): QueryPromise<GetTopCoachesByXpData, GetTopCoachesByXpVariables>;
export function getTopCoachesByXp(dc: DataConnect, vars?: GetTopCoachesByXpVariables): QueryPromise<GetTopCoachesByXpData, GetTopCoachesByXpVariables>;

interface GetCoachReviewsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoachReviewsVariables): QueryRef<GetCoachReviewsData, GetCoachReviewsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCoachReviewsVariables): QueryRef<GetCoachReviewsData, GetCoachReviewsVariables>;
  operationName: string;
}
export const getCoachReviewsRef: GetCoachReviewsRef;

export function getCoachReviews(vars: GetCoachReviewsVariables): QueryPromise<GetCoachReviewsData, GetCoachReviewsVariables>;
export function getCoachReviews(dc: DataConnect, vars: GetCoachReviewsVariables): QueryPromise<GetCoachReviewsData, GetCoachReviewsVariables>;

interface GetRecentReviewsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetRecentReviewsVariables): QueryRef<GetRecentReviewsData, GetRecentReviewsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetRecentReviewsVariables): QueryRef<GetRecentReviewsData, GetRecentReviewsVariables>;
  operationName: string;
}
export const getRecentReviewsRef: GetRecentReviewsRef;

export function getRecentReviews(vars?: GetRecentReviewsVariables): QueryPromise<GetRecentReviewsData, GetRecentReviewsVariables>;
export function getRecentReviews(dc: DataConnect, vars?: GetRecentReviewsVariables): QueryPromise<GetRecentReviewsData, GetRecentReviewsVariables>;

interface GetCoachReviewsPaginatedRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoachReviewsPaginatedVariables): QueryRef<GetCoachReviewsPaginatedData, GetCoachReviewsPaginatedVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCoachReviewsPaginatedVariables): QueryRef<GetCoachReviewsPaginatedData, GetCoachReviewsPaginatedVariables>;
  operationName: string;
}
export const getCoachReviewsPaginatedRef: GetCoachReviewsPaginatedRef;

export function getCoachReviewsPaginated(vars: GetCoachReviewsPaginatedVariables): QueryPromise<GetCoachReviewsPaginatedData, GetCoachReviewsPaginatedVariables>;
export function getCoachReviewsPaginated(dc: DataConnect, vars: GetCoachReviewsPaginatedVariables): QueryPromise<GetCoachReviewsPaginatedData, GetCoachReviewsPaginatedVariables>;

interface CountAllCoachesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<CountAllCoachesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<CountAllCoachesData, undefined>;
  operationName: string;
}
export const countAllCoachesRef: CountAllCoachesRef;

export function countAllCoaches(): QueryPromise<CountAllCoachesData, undefined>;
export function countAllCoaches(dc: DataConnect): QueryPromise<CountAllCoachesData, undefined>;

interface GetTierCardsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetTierCardsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetTierCardsData, undefined>;
  operationName: string;
}
export const getTierCardsRef: GetTierCardsRef;

export function getTierCards(): QueryPromise<GetTierCardsData, undefined>;
export function getTierCards(dc: DataConnect): QueryPromise<GetTierCardsData, undefined>;

interface GetEligibleTierCardsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEligibleTierCardsVariables): QueryRef<GetEligibleTierCardsData, GetEligibleTierCardsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetEligibleTierCardsVariables): QueryRef<GetEligibleTierCardsData, GetEligibleTierCardsVariables>;
  operationName: string;
}
export const getEligibleTierCardsRef: GetEligibleTierCardsRef;

export function getEligibleTierCards(vars: GetEligibleTierCardsVariables): QueryPromise<GetEligibleTierCardsData, GetEligibleTierCardsVariables>;
export function getEligibleTierCards(dc: DataConnect, vars: GetEligibleTierCardsVariables): QueryPromise<GetEligibleTierCardsData, GetEligibleTierCardsVariables>;

interface GetMarketplaceCardsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetMarketplaceCardsVariables): QueryRef<GetMarketplaceCardsData, GetMarketplaceCardsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetMarketplaceCardsVariables): QueryRef<GetMarketplaceCardsData, GetMarketplaceCardsVariables>;
  operationName: string;
}
export const getMarketplaceCardsRef: GetMarketplaceCardsRef;

export function getMarketplaceCards(vars?: GetMarketplaceCardsVariables): QueryPromise<GetMarketplaceCardsData, GetMarketplaceCardsVariables>;
export function getMarketplaceCards(dc: DataConnect, vars?: GetMarketplaceCardsVariables): QueryPromise<GetMarketplaceCardsData, GetMarketplaceCardsVariables>;

interface GetMarketplaceCardRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMarketplaceCardVariables): QueryRef<GetMarketplaceCardData, GetMarketplaceCardVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMarketplaceCardVariables): QueryRef<GetMarketplaceCardData, GetMarketplaceCardVariables>;
  operationName: string;
}
export const getMarketplaceCardRef: GetMarketplaceCardRef;

export function getMarketplaceCard(vars: GetMarketplaceCardVariables): QueryPromise<GetMarketplaceCardData, GetMarketplaceCardVariables>;
export function getMarketplaceCard(dc: DataConnect, vars: GetMarketplaceCardVariables): QueryPromise<GetMarketplaceCardData, GetMarketplaceCardVariables>;

interface GetUserCardsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserCardsVariables): QueryRef<GetUserCardsData, GetUserCardsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserCardsVariables): QueryRef<GetUserCardsData, GetUserCardsVariables>;
  operationName: string;
}
export const getUserCardsRef: GetUserCardsRef;

export function getUserCards(vars: GetUserCardsVariables): QueryPromise<GetUserCardsData, GetUserCardsVariables>;
export function getUserCards(dc: DataConnect, vars: GetUserCardsVariables): QueryPromise<GetUserCardsData, GetUserCardsVariables>;

interface GetCoachCardsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoachCardsVariables): QueryRef<GetCoachCardsData, GetCoachCardsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCoachCardsVariables): QueryRef<GetCoachCardsData, GetCoachCardsVariables>;
  operationName: string;
}
export const getCoachCardsRef: GetCoachCardsRef;

export function getCoachCards(vars: GetCoachCardsVariables): QueryPromise<GetCoachCardsData, GetCoachCardsVariables>;
export function getCoachCards(dc: DataConnect, vars: GetCoachCardsVariables): QueryPromise<GetCoachCardsData, GetCoachCardsVariables>;

interface GetCoachActiveCardRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoachActiveCardVariables): QueryRef<GetCoachActiveCardData, GetCoachActiveCardVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCoachActiveCardVariables): QueryRef<GetCoachActiveCardData, GetCoachActiveCardVariables>;
  operationName: string;
}
export const getCoachActiveCardRef: GetCoachActiveCardRef;

export function getCoachActiveCard(vars: GetCoachActiveCardVariables): QueryPromise<GetCoachActiveCardData, GetCoachActiveCardVariables>;
export function getCoachActiveCard(dc: DataConnect, vars: GetCoachActiveCardVariables): QueryPromise<GetCoachActiveCardData, GetCoachActiveCardVariables>;

interface GetCoachServicesByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoachServicesByIdVariables): QueryRef<GetCoachServicesByIdData, GetCoachServicesByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCoachServicesByIdVariables): QueryRef<GetCoachServicesByIdData, GetCoachServicesByIdVariables>;
  operationName: string;
}
export const getCoachServicesByIdRef: GetCoachServicesByIdRef;

export function getCoachServicesById(vars: GetCoachServicesByIdVariables): QueryPromise<GetCoachServicesByIdData, GetCoachServicesByIdVariables>;
export function getCoachServicesById(dc: DataConnect, vars: GetCoachServicesByIdVariables): QueryPromise<GetCoachServicesByIdData, GetCoachServicesByIdVariables>;

interface GetCoachServicesByUsernameRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoachServicesByUsernameVariables): QueryRef<GetCoachServicesByUsernameData, GetCoachServicesByUsernameVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCoachServicesByUsernameVariables): QueryRef<GetCoachServicesByUsernameData, GetCoachServicesByUsernameVariables>;
  operationName: string;
}
export const getCoachServicesByUsernameRef: GetCoachServicesByUsernameRef;

export function getCoachServicesByUsername(vars: GetCoachServicesByUsernameVariables): QueryPromise<GetCoachServicesByUsernameData, GetCoachServicesByUsernameVariables>;
export function getCoachServicesByUsername(dc: DataConnect, vars: GetCoachServicesByUsernameVariables): QueryPromise<GetCoachServicesByUsernameData, GetCoachServicesByUsernameVariables>;

interface GetActiveCoachServicesByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetActiveCoachServicesByIdVariables): QueryRef<GetActiveCoachServicesByIdData, GetActiveCoachServicesByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetActiveCoachServicesByIdVariables): QueryRef<GetActiveCoachServicesByIdData, GetActiveCoachServicesByIdVariables>;
  operationName: string;
}
export const getActiveCoachServicesByIdRef: GetActiveCoachServicesByIdRef;

export function getActiveCoachServicesById(vars: GetActiveCoachServicesByIdVariables): QueryPromise<GetActiveCoachServicesByIdData, GetActiveCoachServicesByIdVariables>;
export function getActiveCoachServicesById(dc: DataConnect, vars: GetActiveCoachServicesByIdVariables): QueryPromise<GetActiveCoachServicesByIdData, GetActiveCoachServicesByIdVariables>;

interface GetPendingCoachRequestsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetPendingCoachRequestsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetPendingCoachRequestsData, undefined>;
  operationName: string;
}
export const getPendingCoachRequestsRef: GetPendingCoachRequestsRef;

export function getPendingCoachRequests(): QueryPromise<GetPendingCoachRequestsData, undefined>;
export function getPendingCoachRequests(dc: DataConnect): QueryPromise<GetPendingCoachRequestsData, undefined>;

interface GetCoachRequestsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetCoachRequestsVariables): QueryRef<GetCoachRequestsData, GetCoachRequestsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetCoachRequestsVariables): QueryRef<GetCoachRequestsData, GetCoachRequestsVariables>;
  operationName: string;
}
export const getCoachRequestsRef: GetCoachRequestsRef;

export function getCoachRequests(vars?: GetCoachRequestsVariables): QueryPromise<GetCoachRequestsData, GetCoachRequestsVariables>;
export function getCoachRequests(dc: DataConnect, vars?: GetCoachRequestsVariables): QueryPromise<GetCoachRequestsData, GetCoachRequestsVariables>;

interface GetCoachRequestRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoachRequestVariables): QueryRef<GetCoachRequestData, GetCoachRequestVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCoachRequestVariables): QueryRef<GetCoachRequestData, GetCoachRequestVariables>;
  operationName: string;
}
export const getCoachRequestRef: GetCoachRequestRef;

export function getCoachRequest(vars: GetCoachRequestVariables): QueryPromise<GetCoachRequestData, GetCoachRequestVariables>;
export function getCoachRequest(dc: DataConnect, vars: GetCoachRequestVariables): QueryPromise<GetCoachRequestData, GetCoachRequestVariables>;

