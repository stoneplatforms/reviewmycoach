# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `reviewmycoach`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetUser*](#getuser)
  - [*GetUserByEmail*](#getuserbyemail)
  - [*GetUserByUsername*](#getuserbyusername)
  - [*CheckUsernameAvailability*](#checkusernameavailability)
  - [*GetCoach*](#getcoach)
  - [*GetCoachByUsername*](#getcoachbyusername)
  - [*GetClaimableCoaches*](#getclaimablecoaches)
  - [*CheckCoachUsernameAvailability*](#checkcoachusernameavailability)
  - [*SearchCoaches*](#searchcoaches)
  - [*SearchCoachesAdvanced*](#searchcoachesadvanced)
  - [*GetPublicCoaches*](#getpubliccoaches)
  - [*GetCoachReviews*](#getcoachreviews)
  - [*GetRecentReviews*](#getrecentreviews)
  - [*GetCoachReviewsPaginated*](#getcoachreviewspaginated)
  - [*CountAllCoaches*](#countallcoaches)
  - [*GetTierCards*](#gettiercards)
  - [*GetEligibleTierCards*](#geteligibletiercards)
  - [*GetMarketplaceCards*](#getmarketplacecards)
  - [*GetMarketplaceCard*](#getmarketplacecard)
  - [*GetUserCards*](#getusercards)
  - [*GetCoachCards*](#getcoachcards)
  - [*GetCoachActiveCard*](#getcoachactivecard)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*UpdateUser*](#updateuser)
  - [*CompleteOnboarding*](#completeonboarding)
  - [*CreateCoach*](#createcoach)
  - [*UpdateCoach*](#updatecoach)
  - [*ClaimCoach*](#claimcoach)
  - [*CreateReview*](#createreview)
  - [*UpdateCoachRatingStats*](#updatecoachratingstats)
  - [*CreateMarketplaceCard*](#createmarketplacecard)
  - [*UpdateMarketplaceCard*](#updatemarketplacecard)
  - [*PurchaseCard*](#purchasecard)
  - [*UnlockTierCard*](#unlocktiercard)
  - [*UpdateCoachActiveCard*](#updatecoachactivecard)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `reviewmycoach`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@reviewmycoach/dataconnect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@reviewmycoach/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@reviewmycoach/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `reviewmycoach` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetUser
You can execute the `GetUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getUser(vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
}
export const getUserRef: GetUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUser(dc: DataConnect, vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserRef {
  ...
  (dc: DataConnect, vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
}
export const getUserRef: GetUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserRef:
```typescript
const name = getUserRef.operationName;
console.log(name);
```

### Variables
The `GetUser` query requires an argument of type `GetUserVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserVariables {
  id: string;
}
```
### Return Type
Recall that executing the `GetUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUser, GetUserVariables } from '@reviewmycoach/dataconnect';

// The `GetUser` query requires an argument of type `GetUserVariables`:
const getUserVars: GetUserVariables = {
  id: ..., 
};

// Call the `getUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUser(getUserVars);
// Variables can be defined inline as well.
const { data } = await getUser({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUser(dataConnect, getUserVars);

console.log(data.user);

// Or, you can use the `Promise` API.
getUser(getUserVars).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserRef, GetUserVariables } from '@reviewmycoach/dataconnect';

// The `GetUser` query requires an argument of type `GetUserVariables`:
const getUserVars: GetUserVariables = {
  id: ..., 
};

// Call the `getUserRef()` function to get a reference to the query.
const ref = getUserRef(getUserVars);
// Variables can be defined inline as well.
const ref = getUserRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserRef(dataConnect, getUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## GetUserByEmail
You can execute the `GetUserByEmail` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getUserByEmail(vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface GetUserByEmailRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
}
export const getUserByEmailRef: GetUserByEmailRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface GetUserByEmailRef {
  ...
  (dc: DataConnect, vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
}
export const getUserByEmailRef: GetUserByEmailRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserByEmailRef:
```typescript
const name = getUserByEmailRef.operationName;
console.log(name);
```

### Variables
The `GetUserByEmail` query requires an argument of type `GetUserByEmailVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserByEmailVariables {
  email: string;
}
```
### Return Type
Recall that executing the `GetUserByEmail` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserByEmailData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetUserByEmail`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserByEmail, GetUserByEmailVariables } from '@reviewmycoach/dataconnect';

// The `GetUserByEmail` query requires an argument of type `GetUserByEmailVariables`:
const getUserByEmailVars: GetUserByEmailVariables = {
  email: ..., 
};

// Call the `getUserByEmail()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserByEmail(getUserByEmailVars);
// Variables can be defined inline as well.
const { data } = await getUserByEmail({ email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserByEmail(dataConnect, getUserByEmailVars);

console.log(data.users);

// Or, you can use the `Promise` API.
getUserByEmail(getUserByEmailVars).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetUserByEmail`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserByEmailRef, GetUserByEmailVariables } from '@reviewmycoach/dataconnect';

// The `GetUserByEmail` query requires an argument of type `GetUserByEmailVariables`:
const getUserByEmailVars: GetUserByEmailVariables = {
  email: ..., 
};

// Call the `getUserByEmailRef()` function to get a reference to the query.
const ref = getUserByEmailRef(getUserByEmailVars);
// Variables can be defined inline as well.
const ref = getUserByEmailRef({ email: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserByEmailRef(dataConnect, getUserByEmailVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetUserByUsername
You can execute the `GetUserByUsername` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getUserByUsername(vars: GetUserByUsernameVariables): QueryPromise<GetUserByUsernameData, GetUserByUsernameVariables>;

interface GetUserByUsernameRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByUsernameVariables): QueryRef<GetUserByUsernameData, GetUserByUsernameVariables>;
}
export const getUserByUsernameRef: GetUserByUsernameRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserByUsername(dc: DataConnect, vars: GetUserByUsernameVariables): QueryPromise<GetUserByUsernameData, GetUserByUsernameVariables>;

interface GetUserByUsernameRef {
  ...
  (dc: DataConnect, vars: GetUserByUsernameVariables): QueryRef<GetUserByUsernameData, GetUserByUsernameVariables>;
}
export const getUserByUsernameRef: GetUserByUsernameRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserByUsernameRef:
```typescript
const name = getUserByUsernameRef.operationName;
console.log(name);
```

### Variables
The `GetUserByUsername` query requires an argument of type `GetUserByUsernameVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserByUsernameVariables {
  username: string;
}
```
### Return Type
Recall that executing the `GetUserByUsername` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserByUsernameData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserByUsernameData {
  users: ({
    id: string;
    username?: string | null;
    displayName?: string | null;
  } & User_Key)[];
}
```
### Using `GetUserByUsername`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserByUsername, GetUserByUsernameVariables } from '@reviewmycoach/dataconnect';

// The `GetUserByUsername` query requires an argument of type `GetUserByUsernameVariables`:
const getUserByUsernameVars: GetUserByUsernameVariables = {
  username: ..., 
};

// Call the `getUserByUsername()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserByUsername(getUserByUsernameVars);
// Variables can be defined inline as well.
const { data } = await getUserByUsername({ username: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserByUsername(dataConnect, getUserByUsernameVars);

console.log(data.users);

// Or, you can use the `Promise` API.
getUserByUsername(getUserByUsernameVars).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetUserByUsername`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserByUsernameRef, GetUserByUsernameVariables } from '@reviewmycoach/dataconnect';

// The `GetUserByUsername` query requires an argument of type `GetUserByUsernameVariables`:
const getUserByUsernameVars: GetUserByUsernameVariables = {
  username: ..., 
};

// Call the `getUserByUsernameRef()` function to get a reference to the query.
const ref = getUserByUsernameRef(getUserByUsernameVars);
// Variables can be defined inline as well.
const ref = getUserByUsernameRef({ username: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserByUsernameRef(dataConnect, getUserByUsernameVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## CheckUsernameAvailability
You can execute the `CheckUsernameAvailability` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
checkUsernameAvailability(vars: CheckUsernameAvailabilityVariables): QueryPromise<CheckUsernameAvailabilityData, CheckUsernameAvailabilityVariables>;

interface CheckUsernameAvailabilityRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CheckUsernameAvailabilityVariables): QueryRef<CheckUsernameAvailabilityData, CheckUsernameAvailabilityVariables>;
}
export const checkUsernameAvailabilityRef: CheckUsernameAvailabilityRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
checkUsernameAvailability(dc: DataConnect, vars: CheckUsernameAvailabilityVariables): QueryPromise<CheckUsernameAvailabilityData, CheckUsernameAvailabilityVariables>;

interface CheckUsernameAvailabilityRef {
  ...
  (dc: DataConnect, vars: CheckUsernameAvailabilityVariables): QueryRef<CheckUsernameAvailabilityData, CheckUsernameAvailabilityVariables>;
}
export const checkUsernameAvailabilityRef: CheckUsernameAvailabilityRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the checkUsernameAvailabilityRef:
```typescript
const name = checkUsernameAvailabilityRef.operationName;
console.log(name);
```

### Variables
The `CheckUsernameAvailability` query requires an argument of type `CheckUsernameAvailabilityVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CheckUsernameAvailabilityVariables {
  username: string;
}
```
### Return Type
Recall that executing the `CheckUsernameAvailability` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CheckUsernameAvailabilityData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CheckUsernameAvailabilityData {
  users: ({
    id: string;
    username?: string | null;
  } & User_Key)[];
}
```
### Using `CheckUsernameAvailability`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, checkUsernameAvailability, CheckUsernameAvailabilityVariables } from '@reviewmycoach/dataconnect';

// The `CheckUsernameAvailability` query requires an argument of type `CheckUsernameAvailabilityVariables`:
const checkUsernameAvailabilityVars: CheckUsernameAvailabilityVariables = {
  username: ..., 
};

// Call the `checkUsernameAvailability()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await checkUsernameAvailability(checkUsernameAvailabilityVars);
// Variables can be defined inline as well.
const { data } = await checkUsernameAvailability({ username: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await checkUsernameAvailability(dataConnect, checkUsernameAvailabilityVars);

console.log(data.users);

// Or, you can use the `Promise` API.
checkUsernameAvailability(checkUsernameAvailabilityVars).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `CheckUsernameAvailability`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, checkUsernameAvailabilityRef, CheckUsernameAvailabilityVariables } from '@reviewmycoach/dataconnect';

// The `CheckUsernameAvailability` query requires an argument of type `CheckUsernameAvailabilityVariables`:
const checkUsernameAvailabilityVars: CheckUsernameAvailabilityVariables = {
  username: ..., 
};

// Call the `checkUsernameAvailabilityRef()` function to get a reference to the query.
const ref = checkUsernameAvailabilityRef(checkUsernameAvailabilityVars);
// Variables can be defined inline as well.
const ref = checkUsernameAvailabilityRef({ username: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = checkUsernameAvailabilityRef(dataConnect, checkUsernameAvailabilityVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetCoach
You can execute the `GetCoach` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getCoach(vars: GetCoachVariables): QueryPromise<GetCoachData, GetCoachVariables>;

interface GetCoachRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoachVariables): QueryRef<GetCoachData, GetCoachVariables>;
}
export const getCoachRef: GetCoachRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCoach(dc: DataConnect, vars: GetCoachVariables): QueryPromise<GetCoachData, GetCoachVariables>;

interface GetCoachRef {
  ...
  (dc: DataConnect, vars: GetCoachVariables): QueryRef<GetCoachData, GetCoachVariables>;
}
export const getCoachRef: GetCoachRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCoachRef:
```typescript
const name = getCoachRef.operationName;
console.log(name);
```

### Variables
The `GetCoach` query requires an argument of type `GetCoachVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCoachVariables {
  id: string;
}
```
### Return Type
Recall that executing the `GetCoach` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCoachData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCoachData {
  coach?: {
    id: string;
    username?: string | null;
    userId?: string | null;
    displayName?: string | null;
    email?: string | null;
    bio?: string | null;
    sports?: unknown | null;
    location?: string | null;
    hourlyRate?: number | null;
    averageRating?: number | null;
    totalReviews?: number | null;
    profileImage?: string | null;
    isClaimed?: boolean | null;
    subscriptionStatus?: string | null;
  } & Coach_Key;
}
```
### Using `GetCoach`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCoach, GetCoachVariables } from '@reviewmycoach/dataconnect';

// The `GetCoach` query requires an argument of type `GetCoachVariables`:
const getCoachVars: GetCoachVariables = {
  id: ..., 
};

// Call the `getCoach()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCoach(getCoachVars);
// Variables can be defined inline as well.
const { data } = await getCoach({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCoach(dataConnect, getCoachVars);

console.log(data.coach);

// Or, you can use the `Promise` API.
getCoach(getCoachVars).then((response) => {
  const data = response.data;
  console.log(data.coach);
});
```

### Using `GetCoach`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCoachRef, GetCoachVariables } from '@reviewmycoach/dataconnect';

// The `GetCoach` query requires an argument of type `GetCoachVariables`:
const getCoachVars: GetCoachVariables = {
  id: ..., 
};

// Call the `getCoachRef()` function to get a reference to the query.
const ref = getCoachRef(getCoachVars);
// Variables can be defined inline as well.
const ref = getCoachRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCoachRef(dataConnect, getCoachVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coach);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coach);
});
```

## GetCoachByUsername
You can execute the `GetCoachByUsername` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getCoachByUsername(vars: GetCoachByUsernameVariables): QueryPromise<GetCoachByUsernameData, GetCoachByUsernameVariables>;

interface GetCoachByUsernameRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoachByUsernameVariables): QueryRef<GetCoachByUsernameData, GetCoachByUsernameVariables>;
}
export const getCoachByUsernameRef: GetCoachByUsernameRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCoachByUsername(dc: DataConnect, vars: GetCoachByUsernameVariables): QueryPromise<GetCoachByUsernameData, GetCoachByUsernameVariables>;

interface GetCoachByUsernameRef {
  ...
  (dc: DataConnect, vars: GetCoachByUsernameVariables): QueryRef<GetCoachByUsernameData, GetCoachByUsernameVariables>;
}
export const getCoachByUsernameRef: GetCoachByUsernameRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCoachByUsernameRef:
```typescript
const name = getCoachByUsernameRef.operationName;
console.log(name);
```

### Variables
The `GetCoachByUsername` query requires an argument of type `GetCoachByUsernameVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCoachByUsernameVariables {
  username: string;
}
```
### Return Type
Recall that executing the `GetCoachByUsername` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCoachByUsernameData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
    activeCardId?: string | null;
    activeCardImageUrl?: string | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Coach_Key)[];
}
```
### Using `GetCoachByUsername`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCoachByUsername, GetCoachByUsernameVariables } from '@reviewmycoach/dataconnect';

// The `GetCoachByUsername` query requires an argument of type `GetCoachByUsernameVariables`:
const getCoachByUsernameVars: GetCoachByUsernameVariables = {
  username: ..., 
};

// Call the `getCoachByUsername()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCoachByUsername(getCoachByUsernameVars);
// Variables can be defined inline as well.
const { data } = await getCoachByUsername({ username: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCoachByUsername(dataConnect, getCoachByUsernameVars);

console.log(data.coaches);

// Or, you can use the `Promise` API.
getCoachByUsername(getCoachByUsernameVars).then((response) => {
  const data = response.data;
  console.log(data.coaches);
});
```

### Using `GetCoachByUsername`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCoachByUsernameRef, GetCoachByUsernameVariables } from '@reviewmycoach/dataconnect';

// The `GetCoachByUsername` query requires an argument of type `GetCoachByUsernameVariables`:
const getCoachByUsernameVars: GetCoachByUsernameVariables = {
  username: ..., 
};

// Call the `getCoachByUsernameRef()` function to get a reference to the query.
const ref = getCoachByUsernameRef(getCoachByUsernameVars);
// Variables can be defined inline as well.
const ref = getCoachByUsernameRef({ username: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCoachByUsernameRef(dataConnect, getCoachByUsernameVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coaches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coaches);
});
```

## GetClaimableCoaches
You can execute the `GetClaimableCoaches` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getClaimableCoaches(vars: GetClaimableCoachesVariables): QueryPromise<GetClaimableCoachesData, GetClaimableCoachesVariables>;

interface GetClaimableCoachesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClaimableCoachesVariables): QueryRef<GetClaimableCoachesData, GetClaimableCoachesVariables>;
}
export const getClaimableCoachesRef: GetClaimableCoachesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getClaimableCoaches(dc: DataConnect, vars: GetClaimableCoachesVariables): QueryPromise<GetClaimableCoachesData, GetClaimableCoachesVariables>;

interface GetClaimableCoachesRef {
  ...
  (dc: DataConnect, vars: GetClaimableCoachesVariables): QueryRef<GetClaimableCoachesData, GetClaimableCoachesVariables>;
}
export const getClaimableCoachesRef: GetClaimableCoachesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getClaimableCoachesRef:
```typescript
const name = getClaimableCoachesRef.operationName;
console.log(name);
```

### Variables
The `GetClaimableCoaches` query requires an argument of type `GetClaimableCoachesVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetClaimableCoachesVariables {
  email: string;
}
```
### Return Type
Recall that executing the `GetClaimableCoaches` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetClaimableCoachesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetClaimableCoachesData {
  coaches: ({
    id: string;
    username?: string | null;
    displayName?: string | null;
    email?: string | null;
    organization?: string | null;
    sports?: unknown | null;
  } & Coach_Key)[];
}
```
### Using `GetClaimableCoaches`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getClaimableCoaches, GetClaimableCoachesVariables } from '@reviewmycoach/dataconnect';

// The `GetClaimableCoaches` query requires an argument of type `GetClaimableCoachesVariables`:
const getClaimableCoachesVars: GetClaimableCoachesVariables = {
  email: ..., 
};

// Call the `getClaimableCoaches()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getClaimableCoaches(getClaimableCoachesVars);
// Variables can be defined inline as well.
const { data } = await getClaimableCoaches({ email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getClaimableCoaches(dataConnect, getClaimableCoachesVars);

console.log(data.coaches);

// Or, you can use the `Promise` API.
getClaimableCoaches(getClaimableCoachesVars).then((response) => {
  const data = response.data;
  console.log(data.coaches);
});
```

### Using `GetClaimableCoaches`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getClaimableCoachesRef, GetClaimableCoachesVariables } from '@reviewmycoach/dataconnect';

// The `GetClaimableCoaches` query requires an argument of type `GetClaimableCoachesVariables`:
const getClaimableCoachesVars: GetClaimableCoachesVariables = {
  email: ..., 
};

// Call the `getClaimableCoachesRef()` function to get a reference to the query.
const ref = getClaimableCoachesRef(getClaimableCoachesVars);
// Variables can be defined inline as well.
const ref = getClaimableCoachesRef({ email: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getClaimableCoachesRef(dataConnect, getClaimableCoachesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coaches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coaches);
});
```

## CheckCoachUsernameAvailability
You can execute the `CheckCoachUsernameAvailability` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
checkCoachUsernameAvailability(vars: CheckCoachUsernameAvailabilityVariables): QueryPromise<CheckCoachUsernameAvailabilityData, CheckCoachUsernameAvailabilityVariables>;

interface CheckCoachUsernameAvailabilityRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CheckCoachUsernameAvailabilityVariables): QueryRef<CheckCoachUsernameAvailabilityData, CheckCoachUsernameAvailabilityVariables>;
}
export const checkCoachUsernameAvailabilityRef: CheckCoachUsernameAvailabilityRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
checkCoachUsernameAvailability(dc: DataConnect, vars: CheckCoachUsernameAvailabilityVariables): QueryPromise<CheckCoachUsernameAvailabilityData, CheckCoachUsernameAvailabilityVariables>;

interface CheckCoachUsernameAvailabilityRef {
  ...
  (dc: DataConnect, vars: CheckCoachUsernameAvailabilityVariables): QueryRef<CheckCoachUsernameAvailabilityData, CheckCoachUsernameAvailabilityVariables>;
}
export const checkCoachUsernameAvailabilityRef: CheckCoachUsernameAvailabilityRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the checkCoachUsernameAvailabilityRef:
```typescript
const name = checkCoachUsernameAvailabilityRef.operationName;
console.log(name);
```

### Variables
The `CheckCoachUsernameAvailability` query requires an argument of type `CheckCoachUsernameAvailabilityVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CheckCoachUsernameAvailabilityVariables {
  username: string;
}
```
### Return Type
Recall that executing the `CheckCoachUsernameAvailability` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CheckCoachUsernameAvailabilityData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CheckCoachUsernameAvailabilityData {
  coaches: ({
    id: string;
    username?: string | null;
  } & Coach_Key)[];
}
```
### Using `CheckCoachUsernameAvailability`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, checkCoachUsernameAvailability, CheckCoachUsernameAvailabilityVariables } from '@reviewmycoach/dataconnect';

// The `CheckCoachUsernameAvailability` query requires an argument of type `CheckCoachUsernameAvailabilityVariables`:
const checkCoachUsernameAvailabilityVars: CheckCoachUsernameAvailabilityVariables = {
  username: ..., 
};

// Call the `checkCoachUsernameAvailability()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await checkCoachUsernameAvailability(checkCoachUsernameAvailabilityVars);
// Variables can be defined inline as well.
const { data } = await checkCoachUsernameAvailability({ username: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await checkCoachUsernameAvailability(dataConnect, checkCoachUsernameAvailabilityVars);

console.log(data.coaches);

// Or, you can use the `Promise` API.
checkCoachUsernameAvailability(checkCoachUsernameAvailabilityVars).then((response) => {
  const data = response.data;
  console.log(data.coaches);
});
```

### Using `CheckCoachUsernameAvailability`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, checkCoachUsernameAvailabilityRef, CheckCoachUsernameAvailabilityVariables } from '@reviewmycoach/dataconnect';

// The `CheckCoachUsernameAvailability` query requires an argument of type `CheckCoachUsernameAvailabilityVariables`:
const checkCoachUsernameAvailabilityVars: CheckCoachUsernameAvailabilityVariables = {
  username: ..., 
};

// Call the `checkCoachUsernameAvailabilityRef()` function to get a reference to the query.
const ref = checkCoachUsernameAvailabilityRef(checkCoachUsernameAvailabilityVars);
// Variables can be defined inline as well.
const ref = checkCoachUsernameAvailabilityRef({ username: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = checkCoachUsernameAvailabilityRef(dataConnect, checkCoachUsernameAvailabilityVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coaches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coaches);
});
```

## SearchCoaches
You can execute the `SearchCoaches` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
searchCoaches(vars?: SearchCoachesVariables): QueryPromise<SearchCoachesData, SearchCoachesVariables>;

interface SearchCoachesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: SearchCoachesVariables): QueryRef<SearchCoachesData, SearchCoachesVariables>;
}
export const searchCoachesRef: SearchCoachesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
searchCoaches(dc: DataConnect, vars?: SearchCoachesVariables): QueryPromise<SearchCoachesData, SearchCoachesVariables>;

interface SearchCoachesRef {
  ...
  (dc: DataConnect, vars?: SearchCoachesVariables): QueryRef<SearchCoachesData, SearchCoachesVariables>;
}
export const searchCoachesRef: SearchCoachesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the searchCoachesRef:
```typescript
const name = searchCoachesRef.operationName;
console.log(name);
```

### Variables
The `SearchCoaches` query has an optional argument of type `SearchCoachesVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SearchCoachesVariables {
  sport?: string | null;
  location?: string | null;
  limit?: number | null;
}
```
### Return Type
Recall that executing the `SearchCoaches` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SearchCoachesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `SearchCoaches`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, searchCoaches, SearchCoachesVariables } from '@reviewmycoach/dataconnect';

// The `SearchCoaches` query has an optional argument of type `SearchCoachesVariables`:
const searchCoachesVars: SearchCoachesVariables = {
  sport: ..., // optional
  location: ..., // optional
  limit: ..., // optional
};

// Call the `searchCoaches()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await searchCoaches(searchCoachesVars);
// Variables can be defined inline as well.
const { data } = await searchCoaches({ sport: ..., location: ..., limit: ..., });
// Since all variables are optional for this query, you can omit the `SearchCoachesVariables` argument.
const { data } = await searchCoaches();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await searchCoaches(dataConnect, searchCoachesVars);

console.log(data.coaches);

// Or, you can use the `Promise` API.
searchCoaches(searchCoachesVars).then((response) => {
  const data = response.data;
  console.log(data.coaches);
});
```

### Using `SearchCoaches`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, searchCoachesRef, SearchCoachesVariables } from '@reviewmycoach/dataconnect';

// The `SearchCoaches` query has an optional argument of type `SearchCoachesVariables`:
const searchCoachesVars: SearchCoachesVariables = {
  sport: ..., // optional
  location: ..., // optional
  limit: ..., // optional
};

// Call the `searchCoachesRef()` function to get a reference to the query.
const ref = searchCoachesRef(searchCoachesVars);
// Variables can be defined inline as well.
const ref = searchCoachesRef({ sport: ..., location: ..., limit: ..., });
// Since all variables are optional for this query, you can omit the `SearchCoachesVariables` argument.
const ref = searchCoachesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = searchCoachesRef(dataConnect, searchCoachesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coaches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coaches);
});
```

## SearchCoachesAdvanced
You can execute the `SearchCoachesAdvanced` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
searchCoachesAdvanced(vars?: SearchCoachesAdvancedVariables): QueryPromise<SearchCoachesAdvancedData, SearchCoachesAdvancedVariables>;

interface SearchCoachesAdvancedRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: SearchCoachesAdvancedVariables): QueryRef<SearchCoachesAdvancedData, SearchCoachesAdvancedVariables>;
}
export const searchCoachesAdvancedRef: SearchCoachesAdvancedRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
searchCoachesAdvanced(dc: DataConnect, vars?: SearchCoachesAdvancedVariables): QueryPromise<SearchCoachesAdvancedData, SearchCoachesAdvancedVariables>;

interface SearchCoachesAdvancedRef {
  ...
  (dc: DataConnect, vars?: SearchCoachesAdvancedVariables): QueryRef<SearchCoachesAdvancedData, SearchCoachesAdvancedVariables>;
}
export const searchCoachesAdvancedRef: SearchCoachesAdvancedRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the searchCoachesAdvancedRef:
```typescript
const name = searchCoachesAdvancedRef.operationName;
console.log(name);
```

### Variables
The `SearchCoachesAdvanced` query has an optional argument of type `SearchCoachesAdvancedVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `SearchCoachesAdvanced` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SearchCoachesAdvancedData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SearchCoachesAdvancedData {
  coaches: ({
    id: string;
    username?: string | null;
    userId?: string | null;
    displayName?: string | null;
    bio?: string | null;
    sports?: unknown | null;
    specialties?: unknown | null;
    certifications?: unknown | null;
    location?: string | null;
    organization?: string | null;
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
```
### Using `SearchCoachesAdvanced`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, searchCoachesAdvanced, SearchCoachesAdvancedVariables } from '@reviewmycoach/dataconnect';

// The `SearchCoachesAdvanced` query has an optional argument of type `SearchCoachesAdvancedVariables`:
const searchCoachesAdvancedVars: SearchCoachesAdvancedVariables = {
  searchTerm: ..., // optional
  sport: ..., // optional
  location: ..., // optional
  gender: ..., // optional
  organization: ..., // optional
  minRating: ..., // optional
  maxRate: ..., // optional
  isVerified: ..., // optional
  offset: ..., // optional
  limit: ..., // optional
};

// Call the `searchCoachesAdvanced()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await searchCoachesAdvanced(searchCoachesAdvancedVars);
// Variables can be defined inline as well.
const { data } = await searchCoachesAdvanced({ searchTerm: ..., sport: ..., location: ..., gender: ..., organization: ..., minRating: ..., maxRate: ..., isVerified: ..., offset: ..., limit: ..., });
// Since all variables are optional for this query, you can omit the `SearchCoachesAdvancedVariables` argument.
const { data } = await searchCoachesAdvanced();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await searchCoachesAdvanced(dataConnect, searchCoachesAdvancedVars);

console.log(data.coaches);

// Or, you can use the `Promise` API.
searchCoachesAdvanced(searchCoachesAdvancedVars).then((response) => {
  const data = response.data;
  console.log(data.coaches);
});
```

### Using `SearchCoachesAdvanced`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, searchCoachesAdvancedRef, SearchCoachesAdvancedVariables } from '@reviewmycoach/dataconnect';

// The `SearchCoachesAdvanced` query has an optional argument of type `SearchCoachesAdvancedVariables`:
const searchCoachesAdvancedVars: SearchCoachesAdvancedVariables = {
  searchTerm: ..., // optional
  sport: ..., // optional
  location: ..., // optional
  gender: ..., // optional
  organization: ..., // optional
  minRating: ..., // optional
  maxRate: ..., // optional
  isVerified: ..., // optional
  offset: ..., // optional
  limit: ..., // optional
};

// Call the `searchCoachesAdvancedRef()` function to get a reference to the query.
const ref = searchCoachesAdvancedRef(searchCoachesAdvancedVars);
// Variables can be defined inline as well.
const ref = searchCoachesAdvancedRef({ searchTerm: ..., sport: ..., location: ..., gender: ..., organization: ..., minRating: ..., maxRate: ..., isVerified: ..., offset: ..., limit: ..., });
// Since all variables are optional for this query, you can omit the `SearchCoachesAdvancedVariables` argument.
const ref = searchCoachesAdvancedRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = searchCoachesAdvancedRef(dataConnect, searchCoachesAdvancedVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coaches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coaches);
});
```

## GetPublicCoaches
You can execute the `GetPublicCoaches` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getPublicCoaches(vars?: GetPublicCoachesVariables): QueryPromise<GetPublicCoachesData, GetPublicCoachesVariables>;

interface GetPublicCoachesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetPublicCoachesVariables): QueryRef<GetPublicCoachesData, GetPublicCoachesVariables>;
}
export const getPublicCoachesRef: GetPublicCoachesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPublicCoaches(dc: DataConnect, vars?: GetPublicCoachesVariables): QueryPromise<GetPublicCoachesData, GetPublicCoachesVariables>;

interface GetPublicCoachesRef {
  ...
  (dc: DataConnect, vars?: GetPublicCoachesVariables): QueryRef<GetPublicCoachesData, GetPublicCoachesVariables>;
}
export const getPublicCoachesRef: GetPublicCoachesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPublicCoachesRef:
```typescript
const name = getPublicCoachesRef.operationName;
console.log(name);
```

### Variables
The `GetPublicCoaches` query has an optional argument of type `GetPublicCoachesVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetPublicCoachesVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `GetPublicCoaches` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPublicCoachesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
    role?: string | null;
    hourlyRate?: number | null;
    averageRating?: number | null;
    totalReviews?: number | null;
    profileImage?: string | null;
    isVerified?: boolean | null;
    hasActiveServices?: boolean | null;
  } & Coach_Key)[];
}
```
### Using `GetPublicCoaches`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPublicCoaches, GetPublicCoachesVariables } from '@reviewmycoach/dataconnect';

// The `GetPublicCoaches` query has an optional argument of type `GetPublicCoachesVariables`:
const getPublicCoachesVars: GetPublicCoachesVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `getPublicCoaches()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPublicCoaches(getPublicCoachesVars);
// Variables can be defined inline as well.
const { data } = await getPublicCoaches({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `GetPublicCoachesVariables` argument.
const { data } = await getPublicCoaches();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPublicCoaches(dataConnect, getPublicCoachesVars);

console.log(data.coaches);

// Or, you can use the `Promise` API.
getPublicCoaches(getPublicCoachesVars).then((response) => {
  const data = response.data;
  console.log(data.coaches);
});
```

### Using `GetPublicCoaches`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPublicCoachesRef, GetPublicCoachesVariables } from '@reviewmycoach/dataconnect';

// The `GetPublicCoaches` query has an optional argument of type `GetPublicCoachesVariables`:
const getPublicCoachesVars: GetPublicCoachesVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `getPublicCoachesRef()` function to get a reference to the query.
const ref = getPublicCoachesRef(getPublicCoachesVars);
// Variables can be defined inline as well.
const ref = getPublicCoachesRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `GetPublicCoachesVariables` argument.
const ref = getPublicCoachesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPublicCoachesRef(dataConnect, getPublicCoachesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coaches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coaches);
});
```

## GetCoachReviews
You can execute the `GetCoachReviews` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getCoachReviews(vars: GetCoachReviewsVariables): QueryPromise<GetCoachReviewsData, GetCoachReviewsVariables>;

interface GetCoachReviewsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoachReviewsVariables): QueryRef<GetCoachReviewsData, GetCoachReviewsVariables>;
}
export const getCoachReviewsRef: GetCoachReviewsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCoachReviews(dc: DataConnect, vars: GetCoachReviewsVariables): QueryPromise<GetCoachReviewsData, GetCoachReviewsVariables>;

interface GetCoachReviewsRef {
  ...
  (dc: DataConnect, vars: GetCoachReviewsVariables): QueryRef<GetCoachReviewsData, GetCoachReviewsVariables>;
}
export const getCoachReviewsRef: GetCoachReviewsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCoachReviewsRef:
```typescript
const name = getCoachReviewsRef.operationName;
console.log(name);
```

### Variables
The `GetCoachReviews` query requires an argument of type `GetCoachReviewsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCoachReviewsVariables {
  coachId: string;
  limit?: number | null;
}
```
### Return Type
Recall that executing the `GetCoachReviews` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCoachReviewsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetCoachReviews`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCoachReviews, GetCoachReviewsVariables } from '@reviewmycoach/dataconnect';

// The `GetCoachReviews` query requires an argument of type `GetCoachReviewsVariables`:
const getCoachReviewsVars: GetCoachReviewsVariables = {
  coachId: ..., 
  limit: ..., // optional
};

// Call the `getCoachReviews()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCoachReviews(getCoachReviewsVars);
// Variables can be defined inline as well.
const { data } = await getCoachReviews({ coachId: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCoachReviews(dataConnect, getCoachReviewsVars);

console.log(data.reviews);

// Or, you can use the `Promise` API.
getCoachReviews(getCoachReviewsVars).then((response) => {
  const data = response.data;
  console.log(data.reviews);
});
```

### Using `GetCoachReviews`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCoachReviewsRef, GetCoachReviewsVariables } from '@reviewmycoach/dataconnect';

// The `GetCoachReviews` query requires an argument of type `GetCoachReviewsVariables`:
const getCoachReviewsVars: GetCoachReviewsVariables = {
  coachId: ..., 
  limit: ..., // optional
};

// Call the `getCoachReviewsRef()` function to get a reference to the query.
const ref = getCoachReviewsRef(getCoachReviewsVars);
// Variables can be defined inline as well.
const ref = getCoachReviewsRef({ coachId: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCoachReviewsRef(dataConnect, getCoachReviewsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.reviews);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.reviews);
});
```

## GetRecentReviews
You can execute the `GetRecentReviews` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getRecentReviews(vars?: GetRecentReviewsVariables): QueryPromise<GetRecentReviewsData, GetRecentReviewsVariables>;

interface GetRecentReviewsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetRecentReviewsVariables): QueryRef<GetRecentReviewsData, GetRecentReviewsVariables>;
}
export const getRecentReviewsRef: GetRecentReviewsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getRecentReviews(dc: DataConnect, vars?: GetRecentReviewsVariables): QueryPromise<GetRecentReviewsData, GetRecentReviewsVariables>;

interface GetRecentReviewsRef {
  ...
  (dc: DataConnect, vars?: GetRecentReviewsVariables): QueryRef<GetRecentReviewsData, GetRecentReviewsVariables>;
}
export const getRecentReviewsRef: GetRecentReviewsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getRecentReviewsRef:
```typescript
const name = getRecentReviewsRef.operationName;
console.log(name);
```

### Variables
The `GetRecentReviews` query has an optional argument of type `GetRecentReviewsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetRecentReviewsVariables {
  limit?: number | null;
}
```
### Return Type
Recall that executing the `GetRecentReviews` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetRecentReviewsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetRecentReviews`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getRecentReviews, GetRecentReviewsVariables } from '@reviewmycoach/dataconnect';

// The `GetRecentReviews` query has an optional argument of type `GetRecentReviewsVariables`:
const getRecentReviewsVars: GetRecentReviewsVariables = {
  limit: ..., // optional
};

// Call the `getRecentReviews()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getRecentReviews(getRecentReviewsVars);
// Variables can be defined inline as well.
const { data } = await getRecentReviews({ limit: ..., });
// Since all variables are optional for this query, you can omit the `GetRecentReviewsVariables` argument.
const { data } = await getRecentReviews();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getRecentReviews(dataConnect, getRecentReviewsVars);

console.log(data.reviews);

// Or, you can use the `Promise` API.
getRecentReviews(getRecentReviewsVars).then((response) => {
  const data = response.data;
  console.log(data.reviews);
});
```

### Using `GetRecentReviews`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getRecentReviewsRef, GetRecentReviewsVariables } from '@reviewmycoach/dataconnect';

// The `GetRecentReviews` query has an optional argument of type `GetRecentReviewsVariables`:
const getRecentReviewsVars: GetRecentReviewsVariables = {
  limit: ..., // optional
};

// Call the `getRecentReviewsRef()` function to get a reference to the query.
const ref = getRecentReviewsRef(getRecentReviewsVars);
// Variables can be defined inline as well.
const ref = getRecentReviewsRef({ limit: ..., });
// Since all variables are optional for this query, you can omit the `GetRecentReviewsVariables` argument.
const ref = getRecentReviewsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getRecentReviewsRef(dataConnect, getRecentReviewsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.reviews);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.reviews);
});
```

## GetCoachReviewsPaginated
You can execute the `GetCoachReviewsPaginated` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getCoachReviewsPaginated(vars: GetCoachReviewsPaginatedVariables): QueryPromise<GetCoachReviewsPaginatedData, GetCoachReviewsPaginatedVariables>;

interface GetCoachReviewsPaginatedRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoachReviewsPaginatedVariables): QueryRef<GetCoachReviewsPaginatedData, GetCoachReviewsPaginatedVariables>;
}
export const getCoachReviewsPaginatedRef: GetCoachReviewsPaginatedRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCoachReviewsPaginated(dc: DataConnect, vars: GetCoachReviewsPaginatedVariables): QueryPromise<GetCoachReviewsPaginatedData, GetCoachReviewsPaginatedVariables>;

interface GetCoachReviewsPaginatedRef {
  ...
  (dc: DataConnect, vars: GetCoachReviewsPaginatedVariables): QueryRef<GetCoachReviewsPaginatedData, GetCoachReviewsPaginatedVariables>;
}
export const getCoachReviewsPaginatedRef: GetCoachReviewsPaginatedRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCoachReviewsPaginatedRef:
```typescript
const name = getCoachReviewsPaginatedRef.operationName;
console.log(name);
```

### Variables
The `GetCoachReviewsPaginated` query requires an argument of type `GetCoachReviewsPaginatedVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCoachReviewsPaginatedVariables {
  coachId: string;
  offset?: number | null;
  limit?: number | null;
}
```
### Return Type
Recall that executing the `GetCoachReviewsPaginated` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCoachReviewsPaginatedData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetCoachReviewsPaginated`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCoachReviewsPaginated, GetCoachReviewsPaginatedVariables } from '@reviewmycoach/dataconnect';

// The `GetCoachReviewsPaginated` query requires an argument of type `GetCoachReviewsPaginatedVariables`:
const getCoachReviewsPaginatedVars: GetCoachReviewsPaginatedVariables = {
  coachId: ..., 
  offset: ..., // optional
  limit: ..., // optional
};

// Call the `getCoachReviewsPaginated()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCoachReviewsPaginated(getCoachReviewsPaginatedVars);
// Variables can be defined inline as well.
const { data } = await getCoachReviewsPaginated({ coachId: ..., offset: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCoachReviewsPaginated(dataConnect, getCoachReviewsPaginatedVars);

console.log(data.reviews);

// Or, you can use the `Promise` API.
getCoachReviewsPaginated(getCoachReviewsPaginatedVars).then((response) => {
  const data = response.data;
  console.log(data.reviews);
});
```

### Using `GetCoachReviewsPaginated`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCoachReviewsPaginatedRef, GetCoachReviewsPaginatedVariables } from '@reviewmycoach/dataconnect';

// The `GetCoachReviewsPaginated` query requires an argument of type `GetCoachReviewsPaginatedVariables`:
const getCoachReviewsPaginatedVars: GetCoachReviewsPaginatedVariables = {
  coachId: ..., 
  offset: ..., // optional
  limit: ..., // optional
};

// Call the `getCoachReviewsPaginatedRef()` function to get a reference to the query.
const ref = getCoachReviewsPaginatedRef(getCoachReviewsPaginatedVars);
// Variables can be defined inline as well.
const ref = getCoachReviewsPaginatedRef({ coachId: ..., offset: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCoachReviewsPaginatedRef(dataConnect, getCoachReviewsPaginatedVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.reviews);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.reviews);
});
```

## CountAllCoaches
You can execute the `CountAllCoaches` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
countAllCoaches(): QueryPromise<CountAllCoachesData, undefined>;

interface CountAllCoachesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<CountAllCoachesData, undefined>;
}
export const countAllCoachesRef: CountAllCoachesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
countAllCoaches(dc: DataConnect): QueryPromise<CountAllCoachesData, undefined>;

interface CountAllCoachesRef {
  ...
  (dc: DataConnect): QueryRef<CountAllCoachesData, undefined>;
}
export const countAllCoachesRef: CountAllCoachesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the countAllCoachesRef:
```typescript
const name = countAllCoachesRef.operationName;
console.log(name);
```

### Variables
The `CountAllCoaches` query has no variables.
### Return Type
Recall that executing the `CountAllCoaches` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CountAllCoachesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CountAllCoachesData {
  coaches: ({
    id: string;
  } & Coach_Key)[];
}
```
### Using `CountAllCoaches`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, countAllCoaches } from '@reviewmycoach/dataconnect';


// Call the `countAllCoaches()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await countAllCoaches();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await countAllCoaches(dataConnect);

console.log(data.coaches);

// Or, you can use the `Promise` API.
countAllCoaches().then((response) => {
  const data = response.data;
  console.log(data.coaches);
});
```

### Using `CountAllCoaches`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, countAllCoachesRef } from '@reviewmycoach/dataconnect';


// Call the `countAllCoachesRef()` function to get a reference to the query.
const ref = countAllCoachesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = countAllCoachesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coaches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coaches);
});
```

## GetTierCards
You can execute the `GetTierCards` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getTierCards(): QueryPromise<GetTierCardsData, undefined>;

interface GetTierCardsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetTierCardsData, undefined>;
}
export const getTierCardsRef: GetTierCardsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getTierCards(dc: DataConnect): QueryPromise<GetTierCardsData, undefined>;

interface GetTierCardsRef {
  ...
  (dc: DataConnect): QueryRef<GetTierCardsData, undefined>;
}
export const getTierCardsRef: GetTierCardsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getTierCardsRef:
```typescript
const name = getTierCardsRef.operationName;
console.log(name);
```

### Variables
The `GetTierCards` query has no variables.
### Return Type
Recall that executing the `GetTierCards` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetTierCardsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetTierCards`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getTierCards } from '@reviewmycoach/dataconnect';


// Call the `getTierCards()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getTierCards();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getTierCards(dataConnect);

console.log(data.tierCards);

// Or, you can use the `Promise` API.
getTierCards().then((response) => {
  const data = response.data;
  console.log(data.tierCards);
});
```

### Using `GetTierCards`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getTierCardsRef } from '@reviewmycoach/dataconnect';


// Call the `getTierCardsRef()` function to get a reference to the query.
const ref = getTierCardsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getTierCardsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tierCards);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tierCards);
});
```

## GetEligibleTierCards
You can execute the `GetEligibleTierCards` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getEligibleTierCards(vars: GetEligibleTierCardsVariables): QueryPromise<GetEligibleTierCardsData, GetEligibleTierCardsVariables>;

interface GetEligibleTierCardsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEligibleTierCardsVariables): QueryRef<GetEligibleTierCardsData, GetEligibleTierCardsVariables>;
}
export const getEligibleTierCardsRef: GetEligibleTierCardsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getEligibleTierCards(dc: DataConnect, vars: GetEligibleTierCardsVariables): QueryPromise<GetEligibleTierCardsData, GetEligibleTierCardsVariables>;

interface GetEligibleTierCardsRef {
  ...
  (dc: DataConnect, vars: GetEligibleTierCardsVariables): QueryRef<GetEligibleTierCardsData, GetEligibleTierCardsVariables>;
}
export const getEligibleTierCardsRef: GetEligibleTierCardsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getEligibleTierCardsRef:
```typescript
const name = getEligibleTierCardsRef.operationName;
console.log(name);
```

### Variables
The `GetEligibleTierCards` query requires an argument of type `GetEligibleTierCardsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetEligibleTierCardsVariables {
  requiredXp: number;
}
```
### Return Type
Recall that executing the `GetEligibleTierCards` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetEligibleTierCardsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetEligibleTierCards`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getEligibleTierCards, GetEligibleTierCardsVariables } from '@reviewmycoach/dataconnect';

// The `GetEligibleTierCards` query requires an argument of type `GetEligibleTierCardsVariables`:
const getEligibleTierCardsVars: GetEligibleTierCardsVariables = {
  requiredXp: ..., 
};

// Call the `getEligibleTierCards()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getEligibleTierCards(getEligibleTierCardsVars);
// Variables can be defined inline as well.
const { data } = await getEligibleTierCards({ requiredXp: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getEligibleTierCards(dataConnect, getEligibleTierCardsVars);

console.log(data.tierCards);

// Or, you can use the `Promise` API.
getEligibleTierCards(getEligibleTierCardsVars).then((response) => {
  const data = response.data;
  console.log(data.tierCards);
});
```

### Using `GetEligibleTierCards`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getEligibleTierCardsRef, GetEligibleTierCardsVariables } from '@reviewmycoach/dataconnect';

// The `GetEligibleTierCards` query requires an argument of type `GetEligibleTierCardsVariables`:
const getEligibleTierCardsVars: GetEligibleTierCardsVariables = {
  requiredXp: ..., 
};

// Call the `getEligibleTierCardsRef()` function to get a reference to the query.
const ref = getEligibleTierCardsRef(getEligibleTierCardsVars);
// Variables can be defined inline as well.
const ref = getEligibleTierCardsRef({ requiredXp: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getEligibleTierCardsRef(dataConnect, getEligibleTierCardsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tierCards);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tierCards);
});
```

## GetMarketplaceCards
You can execute the `GetMarketplaceCards` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getMarketplaceCards(vars?: GetMarketplaceCardsVariables): QueryPromise<GetMarketplaceCardsData, GetMarketplaceCardsVariables>;

interface GetMarketplaceCardsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetMarketplaceCardsVariables): QueryRef<GetMarketplaceCardsData, GetMarketplaceCardsVariables>;
}
export const getMarketplaceCardsRef: GetMarketplaceCardsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMarketplaceCards(dc: DataConnect, vars?: GetMarketplaceCardsVariables): QueryPromise<GetMarketplaceCardsData, GetMarketplaceCardsVariables>;

interface GetMarketplaceCardsRef {
  ...
  (dc: DataConnect, vars?: GetMarketplaceCardsVariables): QueryRef<GetMarketplaceCardsData, GetMarketplaceCardsVariables>;
}
export const getMarketplaceCardsRef: GetMarketplaceCardsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMarketplaceCardsRef:
```typescript
const name = getMarketplaceCardsRef.operationName;
console.log(name);
```

### Variables
The `GetMarketplaceCards` query has an optional argument of type `GetMarketplaceCardsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetMarketplaceCardsVariables {
  category?: string | null;
  tier?: string | null;
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `GetMarketplaceCards` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMarketplaceCardsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMarketplaceCards`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMarketplaceCards, GetMarketplaceCardsVariables } from '@reviewmycoach/dataconnect';

// The `GetMarketplaceCards` query has an optional argument of type `GetMarketplaceCardsVariables`:
const getMarketplaceCardsVars: GetMarketplaceCardsVariables = {
  category: ..., // optional
  tier: ..., // optional
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `getMarketplaceCards()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMarketplaceCards(getMarketplaceCardsVars);
// Variables can be defined inline as well.
const { data } = await getMarketplaceCards({ category: ..., tier: ..., limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `GetMarketplaceCardsVariables` argument.
const { data } = await getMarketplaceCards();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMarketplaceCards(dataConnect, getMarketplaceCardsVars);

console.log(data.marketplaceCards);

// Or, you can use the `Promise` API.
getMarketplaceCards(getMarketplaceCardsVars).then((response) => {
  const data = response.data;
  console.log(data.marketplaceCards);
});
```

### Using `GetMarketplaceCards`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMarketplaceCardsRef, GetMarketplaceCardsVariables } from '@reviewmycoach/dataconnect';

// The `GetMarketplaceCards` query has an optional argument of type `GetMarketplaceCardsVariables`:
const getMarketplaceCardsVars: GetMarketplaceCardsVariables = {
  category: ..., // optional
  tier: ..., // optional
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `getMarketplaceCardsRef()` function to get a reference to the query.
const ref = getMarketplaceCardsRef(getMarketplaceCardsVars);
// Variables can be defined inline as well.
const ref = getMarketplaceCardsRef({ category: ..., tier: ..., limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `GetMarketplaceCardsVariables` argument.
const ref = getMarketplaceCardsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMarketplaceCardsRef(dataConnect, getMarketplaceCardsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.marketplaceCards);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.marketplaceCards);
});
```

## GetMarketplaceCard
You can execute the `GetMarketplaceCard` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getMarketplaceCard(vars: GetMarketplaceCardVariables): QueryPromise<GetMarketplaceCardData, GetMarketplaceCardVariables>;

interface GetMarketplaceCardRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMarketplaceCardVariables): QueryRef<GetMarketplaceCardData, GetMarketplaceCardVariables>;
}
export const getMarketplaceCardRef: GetMarketplaceCardRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMarketplaceCard(dc: DataConnect, vars: GetMarketplaceCardVariables): QueryPromise<GetMarketplaceCardData, GetMarketplaceCardVariables>;

interface GetMarketplaceCardRef {
  ...
  (dc: DataConnect, vars: GetMarketplaceCardVariables): QueryRef<GetMarketplaceCardData, GetMarketplaceCardVariables>;
}
export const getMarketplaceCardRef: GetMarketplaceCardRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMarketplaceCardRef:
```typescript
const name = getMarketplaceCardRef.operationName;
console.log(name);
```

### Variables
The `GetMarketplaceCard` query requires an argument of type `GetMarketplaceCardVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetMarketplaceCardVariables {
  id: string;
}
```
### Return Type
Recall that executing the `GetMarketplaceCard` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMarketplaceCardData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMarketplaceCard`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMarketplaceCard, GetMarketplaceCardVariables } from '@reviewmycoach/dataconnect';

// The `GetMarketplaceCard` query requires an argument of type `GetMarketplaceCardVariables`:
const getMarketplaceCardVars: GetMarketplaceCardVariables = {
  id: ..., 
};

// Call the `getMarketplaceCard()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMarketplaceCard(getMarketplaceCardVars);
// Variables can be defined inline as well.
const { data } = await getMarketplaceCard({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMarketplaceCard(dataConnect, getMarketplaceCardVars);

console.log(data.marketplaceCard);

// Or, you can use the `Promise` API.
getMarketplaceCard(getMarketplaceCardVars).then((response) => {
  const data = response.data;
  console.log(data.marketplaceCard);
});
```

### Using `GetMarketplaceCard`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMarketplaceCardRef, GetMarketplaceCardVariables } from '@reviewmycoach/dataconnect';

// The `GetMarketplaceCard` query requires an argument of type `GetMarketplaceCardVariables`:
const getMarketplaceCardVars: GetMarketplaceCardVariables = {
  id: ..., 
};

// Call the `getMarketplaceCardRef()` function to get a reference to the query.
const ref = getMarketplaceCardRef(getMarketplaceCardVars);
// Variables can be defined inline as well.
const ref = getMarketplaceCardRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMarketplaceCardRef(dataConnect, getMarketplaceCardVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.marketplaceCard);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.marketplaceCard);
});
```

## GetUserCards
You can execute the `GetUserCards` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getUserCards(vars: GetUserCardsVariables): QueryPromise<GetUserCardsData, GetUserCardsVariables>;

interface GetUserCardsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserCardsVariables): QueryRef<GetUserCardsData, GetUserCardsVariables>;
}
export const getUserCardsRef: GetUserCardsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserCards(dc: DataConnect, vars: GetUserCardsVariables): QueryPromise<GetUserCardsData, GetUserCardsVariables>;

interface GetUserCardsRef {
  ...
  (dc: DataConnect, vars: GetUserCardsVariables): QueryRef<GetUserCardsData, GetUserCardsVariables>;
}
export const getUserCardsRef: GetUserCardsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserCardsRef:
```typescript
const name = getUserCardsRef.operationName;
console.log(name);
```

### Variables
The `GetUserCards` query requires an argument of type `GetUserCardsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserCardsVariables {
  userId: string;
}
```
### Return Type
Recall that executing the `GetUserCards` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserCardsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetUserCards`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserCards, GetUserCardsVariables } from '@reviewmycoach/dataconnect';

// The `GetUserCards` query requires an argument of type `GetUserCardsVariables`:
const getUserCardsVars: GetUserCardsVariables = {
  userId: ..., 
};

// Call the `getUserCards()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserCards(getUserCardsVars);
// Variables can be defined inline as well.
const { data } = await getUserCards({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserCards(dataConnect, getUserCardsVars);

console.log(data.userCards);

// Or, you can use the `Promise` API.
getUserCards(getUserCardsVars).then((response) => {
  const data = response.data;
  console.log(data.userCards);
});
```

### Using `GetUserCards`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserCardsRef, GetUserCardsVariables } from '@reviewmycoach/dataconnect';

// The `GetUserCards` query requires an argument of type `GetUserCardsVariables`:
const getUserCardsVars: GetUserCardsVariables = {
  userId: ..., 
};

// Call the `getUserCardsRef()` function to get a reference to the query.
const ref = getUserCardsRef(getUserCardsVars);
// Variables can be defined inline as well.
const ref = getUserCardsRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserCardsRef(dataConnect, getUserCardsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userCards);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userCards);
});
```

## GetCoachCards
You can execute the `GetCoachCards` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getCoachCards(vars: GetCoachCardsVariables): QueryPromise<GetCoachCardsData, GetCoachCardsVariables>;

interface GetCoachCardsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoachCardsVariables): QueryRef<GetCoachCardsData, GetCoachCardsVariables>;
}
export const getCoachCardsRef: GetCoachCardsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCoachCards(dc: DataConnect, vars: GetCoachCardsVariables): QueryPromise<GetCoachCardsData, GetCoachCardsVariables>;

interface GetCoachCardsRef {
  ...
  (dc: DataConnect, vars: GetCoachCardsVariables): QueryRef<GetCoachCardsData, GetCoachCardsVariables>;
}
export const getCoachCardsRef: GetCoachCardsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCoachCardsRef:
```typescript
const name = getCoachCardsRef.operationName;
console.log(name);
```

### Variables
The `GetCoachCards` query requires an argument of type `GetCoachCardsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCoachCardsVariables {
  coachUsername: string;
}
```
### Return Type
Recall that executing the `GetCoachCards` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCoachCardsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetCoachCards`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCoachCards, GetCoachCardsVariables } from '@reviewmycoach/dataconnect';

// The `GetCoachCards` query requires an argument of type `GetCoachCardsVariables`:
const getCoachCardsVars: GetCoachCardsVariables = {
  coachUsername: ..., 
};

// Call the `getCoachCards()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCoachCards(getCoachCardsVars);
// Variables can be defined inline as well.
const { data } = await getCoachCards({ coachUsername: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCoachCards(dataConnect, getCoachCardsVars);

console.log(data.userCards);

// Or, you can use the `Promise` API.
getCoachCards(getCoachCardsVars).then((response) => {
  const data = response.data;
  console.log(data.userCards);
});
```

### Using `GetCoachCards`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCoachCardsRef, GetCoachCardsVariables } from '@reviewmycoach/dataconnect';

// The `GetCoachCards` query requires an argument of type `GetCoachCardsVariables`:
const getCoachCardsVars: GetCoachCardsVariables = {
  coachUsername: ..., 
};

// Call the `getCoachCardsRef()` function to get a reference to the query.
const ref = getCoachCardsRef(getCoachCardsVars);
// Variables can be defined inline as well.
const ref = getCoachCardsRef({ coachUsername: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCoachCardsRef(dataConnect, getCoachCardsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userCards);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userCards);
});
```

## GetCoachActiveCard
You can execute the `GetCoachActiveCard` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getCoachActiveCard(vars: GetCoachActiveCardVariables): QueryPromise<GetCoachActiveCardData, GetCoachActiveCardVariables>;

interface GetCoachActiveCardRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoachActiveCardVariables): QueryRef<GetCoachActiveCardData, GetCoachActiveCardVariables>;
}
export const getCoachActiveCardRef: GetCoachActiveCardRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCoachActiveCard(dc: DataConnect, vars: GetCoachActiveCardVariables): QueryPromise<GetCoachActiveCardData, GetCoachActiveCardVariables>;

interface GetCoachActiveCardRef {
  ...
  (dc: DataConnect, vars: GetCoachActiveCardVariables): QueryRef<GetCoachActiveCardData, GetCoachActiveCardVariables>;
}
export const getCoachActiveCardRef: GetCoachActiveCardRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCoachActiveCardRef:
```typescript
const name = getCoachActiveCardRef.operationName;
console.log(name);
```

### Variables
The `GetCoachActiveCard` query requires an argument of type `GetCoachActiveCardVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCoachActiveCardVariables {
  coachUsername: string;
}
```
### Return Type
Recall that executing the `GetCoachActiveCard` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCoachActiveCardData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCoachActiveCardData {
  userCards: ({
    id: string;
    cardId?: string | null;
    cardName?: string | null;
    cardImageUrl?: string | null;
    isActive?: boolean | null;
  } & UserCard_Key)[];
}
```
### Using `GetCoachActiveCard`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCoachActiveCard, GetCoachActiveCardVariables } from '@reviewmycoach/dataconnect';

// The `GetCoachActiveCard` query requires an argument of type `GetCoachActiveCardVariables`:
const getCoachActiveCardVars: GetCoachActiveCardVariables = {
  coachUsername: ..., 
};

// Call the `getCoachActiveCard()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCoachActiveCard(getCoachActiveCardVars);
// Variables can be defined inline as well.
const { data } = await getCoachActiveCard({ coachUsername: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCoachActiveCard(dataConnect, getCoachActiveCardVars);

console.log(data.userCards);

// Or, you can use the `Promise` API.
getCoachActiveCard(getCoachActiveCardVars).then((response) => {
  const data = response.data;
  console.log(data.userCards);
});
```

### Using `GetCoachActiveCard`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCoachActiveCardRef, GetCoachActiveCardVariables } from '@reviewmycoach/dataconnect';

// The `GetCoachActiveCard` query requires an argument of type `GetCoachActiveCardVariables`:
const getCoachActiveCardVars: GetCoachActiveCardVariables = {
  coachUsername: ..., 
};

// Call the `getCoachActiveCardRef()` function to get a reference to the query.
const ref = getCoachActiveCardRef(getCoachActiveCardVars);
// Variables can be defined inline as well.
const ref = getCoachActiveCardRef({ coachUsername: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCoachActiveCardRef(dataConnect, getCoachActiveCardVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userCards);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userCards);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `reviewmycoach` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  id: string;
  email: string;
  displayName?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@reviewmycoach/dataconnect';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  id: ..., 
  email: ..., 
  displayName: ..., // optional
  username: ..., // optional
  firstName: ..., // optional
  lastName: ..., // optional
  role: ..., // optional
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ id: ..., email: ..., displayName: ..., username: ..., firstName: ..., lastName: ..., role: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@reviewmycoach/dataconnect';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  id: ..., 
  email: ..., 
  displayName: ..., // optional
  username: ..., // optional
  firstName: ..., // optional
  lastName: ..., // optional
  role: ..., // optional
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ id: ..., email: ..., displayName: ..., username: ..., firstName: ..., lastName: ..., role: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateUser
You can execute the `UpdateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateUser(vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;

interface UpdateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
}
export const updateUserRef: UpdateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUser(dc: DataConnect, vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;

interface UpdateUserRef {
  ...
  (dc: DataConnect, vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
}
export const updateUserRef: UpdateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserRef:
```typescript
const name = updateUserRef.operationName;
console.log(name);
```

### Variables
The `UpdateUser` mutation requires an argument of type `UpdateUserVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUserVariables {
  id: string;
  displayName?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  onboardingCompleted?: boolean | null;
}
```
### Return Type
Recall that executing the `UpdateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUser, UpdateUserVariables } from '@reviewmycoach/dataconnect';

// The `UpdateUser` mutation requires an argument of type `UpdateUserVariables`:
const updateUserVars: UpdateUserVariables = {
  id: ..., 
  displayName: ..., // optional
  username: ..., // optional
  firstName: ..., // optional
  lastName: ..., // optional
  onboardingCompleted: ..., // optional
};

// Call the `updateUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUser(updateUserVars);
// Variables can be defined inline as well.
const { data } = await updateUser({ id: ..., displayName: ..., username: ..., firstName: ..., lastName: ..., onboardingCompleted: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUser(dataConnect, updateUserVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUser(updateUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserRef, UpdateUserVariables } from '@reviewmycoach/dataconnect';

// The `UpdateUser` mutation requires an argument of type `UpdateUserVariables`:
const updateUserVars: UpdateUserVariables = {
  id: ..., 
  displayName: ..., // optional
  username: ..., // optional
  firstName: ..., // optional
  lastName: ..., // optional
  onboardingCompleted: ..., // optional
};

// Call the `updateUserRef()` function to get a reference to the mutation.
const ref = updateUserRef(updateUserVars);
// Variables can be defined inline as well.
const ref = updateUserRef({ id: ..., displayName: ..., username: ..., firstName: ..., lastName: ..., onboardingCompleted: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserRef(dataConnect, updateUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## CompleteOnboarding
You can execute the `CompleteOnboarding` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
completeOnboarding(vars: CompleteOnboardingVariables): MutationPromise<CompleteOnboardingData, CompleteOnboardingVariables>;

interface CompleteOnboardingRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CompleteOnboardingVariables): MutationRef<CompleteOnboardingData, CompleteOnboardingVariables>;
}
export const completeOnboardingRef: CompleteOnboardingRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
completeOnboarding(dc: DataConnect, vars: CompleteOnboardingVariables): MutationPromise<CompleteOnboardingData, CompleteOnboardingVariables>;

interface CompleteOnboardingRef {
  ...
  (dc: DataConnect, vars: CompleteOnboardingVariables): MutationRef<CompleteOnboardingData, CompleteOnboardingVariables>;
}
export const completeOnboardingRef: CompleteOnboardingRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the completeOnboardingRef:
```typescript
const name = completeOnboardingRef.operationName;
console.log(name);
```

### Variables
The `CompleteOnboarding` mutation requires an argument of type `CompleteOnboardingVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CompleteOnboardingVariables {
  id: string;
}
```
### Return Type
Recall that executing the `CompleteOnboarding` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CompleteOnboardingData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CompleteOnboardingData {
  user_update?: User_Key | null;
}
```
### Using `CompleteOnboarding`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, completeOnboarding, CompleteOnboardingVariables } from '@reviewmycoach/dataconnect';

// The `CompleteOnboarding` mutation requires an argument of type `CompleteOnboardingVariables`:
const completeOnboardingVars: CompleteOnboardingVariables = {
  id: ..., 
};

// Call the `completeOnboarding()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await completeOnboarding(completeOnboardingVars);
// Variables can be defined inline as well.
const { data } = await completeOnboarding({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await completeOnboarding(dataConnect, completeOnboardingVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
completeOnboarding(completeOnboardingVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `CompleteOnboarding`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, completeOnboardingRef, CompleteOnboardingVariables } from '@reviewmycoach/dataconnect';

// The `CompleteOnboarding` mutation requires an argument of type `CompleteOnboardingVariables`:
const completeOnboardingVars: CompleteOnboardingVariables = {
  id: ..., 
};

// Call the `completeOnboardingRef()` function to get a reference to the mutation.
const ref = completeOnboardingRef(completeOnboardingVars);
// Variables can be defined inline as well.
const ref = completeOnboardingRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = completeOnboardingRef(dataConnect, completeOnboardingVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## CreateCoach
You can execute the `CreateCoach` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createCoach(vars: CreateCoachVariables): MutationPromise<CreateCoachData, CreateCoachVariables>;

interface CreateCoachRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCoachVariables): MutationRef<CreateCoachData, CreateCoachVariables>;
}
export const createCoachRef: CreateCoachRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCoach(dc: DataConnect, vars: CreateCoachVariables): MutationPromise<CreateCoachData, CreateCoachVariables>;

interface CreateCoachRef {
  ...
  (dc: DataConnect, vars: CreateCoachVariables): MutationRef<CreateCoachData, CreateCoachVariables>;
}
export const createCoachRef: CreateCoachRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCoachRef:
```typescript
const name = createCoachRef.operationName;
console.log(name);
```

### Variables
The `CreateCoach` mutation requires an argument of type `CreateCoachVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateCoachVariables {
  id: string;
  username: string;
  userId: string;
  displayName: string;
  email: string;
}
```
### Return Type
Recall that executing the `CreateCoach` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCoachData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCoachData {
  coach_insert: Coach_Key;
}
```
### Using `CreateCoach`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCoach, CreateCoachVariables } from '@reviewmycoach/dataconnect';

// The `CreateCoach` mutation requires an argument of type `CreateCoachVariables`:
const createCoachVars: CreateCoachVariables = {
  id: ..., 
  username: ..., 
  userId: ..., 
  displayName: ..., 
  email: ..., 
};

// Call the `createCoach()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCoach(createCoachVars);
// Variables can be defined inline as well.
const { data } = await createCoach({ id: ..., username: ..., userId: ..., displayName: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCoach(dataConnect, createCoachVars);

console.log(data.coach_insert);

// Or, you can use the `Promise` API.
createCoach(createCoachVars).then((response) => {
  const data = response.data;
  console.log(data.coach_insert);
});
```

### Using `CreateCoach`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCoachRef, CreateCoachVariables } from '@reviewmycoach/dataconnect';

// The `CreateCoach` mutation requires an argument of type `CreateCoachVariables`:
const createCoachVars: CreateCoachVariables = {
  id: ..., 
  username: ..., 
  userId: ..., 
  displayName: ..., 
  email: ..., 
};

// Call the `createCoachRef()` function to get a reference to the mutation.
const ref = createCoachRef(createCoachVars);
// Variables can be defined inline as well.
const ref = createCoachRef({ id: ..., username: ..., userId: ..., displayName: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCoachRef(dataConnect, createCoachVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.coach_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.coach_insert);
});
```

## UpdateCoach
You can execute the `UpdateCoach` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateCoach(vars: UpdateCoachVariables): MutationPromise<UpdateCoachData, UpdateCoachVariables>;

interface UpdateCoachRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCoachVariables): MutationRef<UpdateCoachData, UpdateCoachVariables>;
}
export const updateCoachRef: UpdateCoachRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateCoach(dc: DataConnect, vars: UpdateCoachVariables): MutationPromise<UpdateCoachData, UpdateCoachVariables>;

interface UpdateCoachRef {
  ...
  (dc: DataConnect, vars: UpdateCoachVariables): MutationRef<UpdateCoachData, UpdateCoachVariables>;
}
export const updateCoachRef: UpdateCoachRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateCoachRef:
```typescript
const name = updateCoachRef.operationName;
console.log(name);
```

### Variables
The `UpdateCoach` mutation requires an argument of type `UpdateCoachVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
}
```
### Return Type
Recall that executing the `UpdateCoach` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateCoachData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateCoachData {
  coach_update?: Coach_Key | null;
}
```
### Using `UpdateCoach`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateCoach, UpdateCoachVariables } from '@reviewmycoach/dataconnect';

// The `UpdateCoach` mutation requires an argument of type `UpdateCoachVariables`:
const updateCoachVars: UpdateCoachVariables = {
  id: ..., 
  bio: ..., // optional
  sports: ..., // optional
  location: ..., // optional
  hourlyRate: ..., // optional
  profileImage: ..., // optional
  isPublic: ..., // optional
  activeCardId: ..., // optional
  activeCardImageUrl: ..., // optional
};

// Call the `updateCoach()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateCoach(updateCoachVars);
// Variables can be defined inline as well.
const { data } = await updateCoach({ id: ..., bio: ..., sports: ..., location: ..., hourlyRate: ..., profileImage: ..., isPublic: ..., activeCardId: ..., activeCardImageUrl: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateCoach(dataConnect, updateCoachVars);

console.log(data.coach_update);

// Or, you can use the `Promise` API.
updateCoach(updateCoachVars).then((response) => {
  const data = response.data;
  console.log(data.coach_update);
});
```

### Using `UpdateCoach`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateCoachRef, UpdateCoachVariables } from '@reviewmycoach/dataconnect';

// The `UpdateCoach` mutation requires an argument of type `UpdateCoachVariables`:
const updateCoachVars: UpdateCoachVariables = {
  id: ..., 
  bio: ..., // optional
  sports: ..., // optional
  location: ..., // optional
  hourlyRate: ..., // optional
  profileImage: ..., // optional
  isPublic: ..., // optional
  activeCardId: ..., // optional
  activeCardImageUrl: ..., // optional
};

// Call the `updateCoachRef()` function to get a reference to the mutation.
const ref = updateCoachRef(updateCoachVars);
// Variables can be defined inline as well.
const ref = updateCoachRef({ id: ..., bio: ..., sports: ..., location: ..., hourlyRate: ..., profileImage: ..., isPublic: ..., activeCardId: ..., activeCardImageUrl: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateCoachRef(dataConnect, updateCoachVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.coach_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.coach_update);
});
```

## ClaimCoach
You can execute the `ClaimCoach` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
claimCoach(vars: ClaimCoachVariables): MutationPromise<ClaimCoachData, ClaimCoachVariables>;

interface ClaimCoachRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ClaimCoachVariables): MutationRef<ClaimCoachData, ClaimCoachVariables>;
}
export const claimCoachRef: ClaimCoachRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
claimCoach(dc: DataConnect, vars: ClaimCoachVariables): MutationPromise<ClaimCoachData, ClaimCoachVariables>;

interface ClaimCoachRef {
  ...
  (dc: DataConnect, vars: ClaimCoachVariables): MutationRef<ClaimCoachData, ClaimCoachVariables>;
}
export const claimCoachRef: ClaimCoachRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the claimCoachRef:
```typescript
const name = claimCoachRef.operationName;
console.log(name);
```

### Variables
The `ClaimCoach` mutation requires an argument of type `ClaimCoachVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ClaimCoachVariables {
  id: string;
  userId: string;
}
```
### Return Type
Recall that executing the `ClaimCoach` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ClaimCoachData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ClaimCoachData {
  coach_update?: Coach_Key | null;
}
```
### Using `ClaimCoach`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, claimCoach, ClaimCoachVariables } from '@reviewmycoach/dataconnect';

// The `ClaimCoach` mutation requires an argument of type `ClaimCoachVariables`:
const claimCoachVars: ClaimCoachVariables = {
  id: ..., 
  userId: ..., 
};

// Call the `claimCoach()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await claimCoach(claimCoachVars);
// Variables can be defined inline as well.
const { data } = await claimCoach({ id: ..., userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await claimCoach(dataConnect, claimCoachVars);

console.log(data.coach_update);

// Or, you can use the `Promise` API.
claimCoach(claimCoachVars).then((response) => {
  const data = response.data;
  console.log(data.coach_update);
});
```

### Using `ClaimCoach`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, claimCoachRef, ClaimCoachVariables } from '@reviewmycoach/dataconnect';

// The `ClaimCoach` mutation requires an argument of type `ClaimCoachVariables`:
const claimCoachVars: ClaimCoachVariables = {
  id: ..., 
  userId: ..., 
};

// Call the `claimCoachRef()` function to get a reference to the mutation.
const ref = claimCoachRef(claimCoachVars);
// Variables can be defined inline as well.
const ref = claimCoachRef({ id: ..., userId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = claimCoachRef(dataConnect, claimCoachVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.coach_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.coach_update);
});
```

## CreateReview
You can execute the `CreateReview` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createReview(vars: CreateReviewVariables): MutationPromise<CreateReviewData, CreateReviewVariables>;

interface CreateReviewRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateReviewVariables): MutationRef<CreateReviewData, CreateReviewVariables>;
}
export const createReviewRef: CreateReviewRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createReview(dc: DataConnect, vars: CreateReviewVariables): MutationPromise<CreateReviewData, CreateReviewVariables>;

interface CreateReviewRef {
  ...
  (dc: DataConnect, vars: CreateReviewVariables): MutationRef<CreateReviewData, CreateReviewVariables>;
}
export const createReviewRef: CreateReviewRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createReviewRef:
```typescript
const name = createReviewRef.operationName;
console.log(name);
```

### Variables
The `CreateReview` mutation requires an argument of type `CreateReviewVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateReview` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateReviewData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateReviewData {
  review_insert: Review_Key;
}
```
### Using `CreateReview`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createReview, CreateReviewVariables } from '@reviewmycoach/dataconnect';

// The `CreateReview` mutation requires an argument of type `CreateReviewVariables`:
const createReviewVars: CreateReviewVariables = {
  id: ..., 
  coachId: ..., 
  coachUsername: ..., 
  userId: ..., // optional
  email: ..., // optional
  studentName: ..., 
  rating: ..., 
  reviewText: ..., 
  sport: ..., 
};

// Call the `createReview()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createReview(createReviewVars);
// Variables can be defined inline as well.
const { data } = await createReview({ id: ..., coachId: ..., coachUsername: ..., userId: ..., email: ..., studentName: ..., rating: ..., reviewText: ..., sport: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createReview(dataConnect, createReviewVars);

console.log(data.review_insert);

// Or, you can use the `Promise` API.
createReview(createReviewVars).then((response) => {
  const data = response.data;
  console.log(data.review_insert);
});
```

### Using `CreateReview`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createReviewRef, CreateReviewVariables } from '@reviewmycoach/dataconnect';

// The `CreateReview` mutation requires an argument of type `CreateReviewVariables`:
const createReviewVars: CreateReviewVariables = {
  id: ..., 
  coachId: ..., 
  coachUsername: ..., 
  userId: ..., // optional
  email: ..., // optional
  studentName: ..., 
  rating: ..., 
  reviewText: ..., 
  sport: ..., 
};

// Call the `createReviewRef()` function to get a reference to the mutation.
const ref = createReviewRef(createReviewVars);
// Variables can be defined inline as well.
const ref = createReviewRef({ id: ..., coachId: ..., coachUsername: ..., userId: ..., email: ..., studentName: ..., rating: ..., reviewText: ..., sport: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createReviewRef(dataConnect, createReviewVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.review_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.review_insert);
});
```

## UpdateCoachRatingStats
You can execute the `UpdateCoachRatingStats` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateCoachRatingStats(vars: UpdateCoachRatingStatsVariables): MutationPromise<UpdateCoachRatingStatsData, UpdateCoachRatingStatsVariables>;

interface UpdateCoachRatingStatsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCoachRatingStatsVariables): MutationRef<UpdateCoachRatingStatsData, UpdateCoachRatingStatsVariables>;
}
export const updateCoachRatingStatsRef: UpdateCoachRatingStatsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateCoachRatingStats(dc: DataConnect, vars: UpdateCoachRatingStatsVariables): MutationPromise<UpdateCoachRatingStatsData, UpdateCoachRatingStatsVariables>;

interface UpdateCoachRatingStatsRef {
  ...
  (dc: DataConnect, vars: UpdateCoachRatingStatsVariables): MutationRef<UpdateCoachRatingStatsData, UpdateCoachRatingStatsVariables>;
}
export const updateCoachRatingStatsRef: UpdateCoachRatingStatsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateCoachRatingStatsRef:
```typescript
const name = updateCoachRatingStatsRef.operationName;
console.log(name);
```

### Variables
The `UpdateCoachRatingStats` mutation requires an argument of type `UpdateCoachRatingStatsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateCoachRatingStatsVariables {
  coachId: string;
  averageRating: number;
  totalReviews: number;
}
```
### Return Type
Recall that executing the `UpdateCoachRatingStats` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateCoachRatingStatsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateCoachRatingStatsData {
  coach_update?: Coach_Key | null;
}
```
### Using `UpdateCoachRatingStats`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateCoachRatingStats, UpdateCoachRatingStatsVariables } from '@reviewmycoach/dataconnect';

// The `UpdateCoachRatingStats` mutation requires an argument of type `UpdateCoachRatingStatsVariables`:
const updateCoachRatingStatsVars: UpdateCoachRatingStatsVariables = {
  coachId: ..., 
  averageRating: ..., 
  totalReviews: ..., 
};

// Call the `updateCoachRatingStats()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateCoachRatingStats(updateCoachRatingStatsVars);
// Variables can be defined inline as well.
const { data } = await updateCoachRatingStats({ coachId: ..., averageRating: ..., totalReviews: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateCoachRatingStats(dataConnect, updateCoachRatingStatsVars);

console.log(data.coach_update);

// Or, you can use the `Promise` API.
updateCoachRatingStats(updateCoachRatingStatsVars).then((response) => {
  const data = response.data;
  console.log(data.coach_update);
});
```

### Using `UpdateCoachRatingStats`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateCoachRatingStatsRef, UpdateCoachRatingStatsVariables } from '@reviewmycoach/dataconnect';

// The `UpdateCoachRatingStats` mutation requires an argument of type `UpdateCoachRatingStatsVariables`:
const updateCoachRatingStatsVars: UpdateCoachRatingStatsVariables = {
  coachId: ..., 
  averageRating: ..., 
  totalReviews: ..., 
};

// Call the `updateCoachRatingStatsRef()` function to get a reference to the mutation.
const ref = updateCoachRatingStatsRef(updateCoachRatingStatsVars);
// Variables can be defined inline as well.
const ref = updateCoachRatingStatsRef({ coachId: ..., averageRating: ..., totalReviews: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateCoachRatingStatsRef(dataConnect, updateCoachRatingStatsVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.coach_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.coach_update);
});
```

## CreateMarketplaceCard
You can execute the `CreateMarketplaceCard` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createMarketplaceCard(vars: CreateMarketplaceCardVariables): MutationPromise<CreateMarketplaceCardData, CreateMarketplaceCardVariables>;

interface CreateMarketplaceCardRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMarketplaceCardVariables): MutationRef<CreateMarketplaceCardData, CreateMarketplaceCardVariables>;
}
export const createMarketplaceCardRef: CreateMarketplaceCardRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createMarketplaceCard(dc: DataConnect, vars: CreateMarketplaceCardVariables): MutationPromise<CreateMarketplaceCardData, CreateMarketplaceCardVariables>;

interface CreateMarketplaceCardRef {
  ...
  (dc: DataConnect, vars: CreateMarketplaceCardVariables): MutationRef<CreateMarketplaceCardData, CreateMarketplaceCardVariables>;
}
export const createMarketplaceCardRef: CreateMarketplaceCardRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createMarketplaceCardRef:
```typescript
const name = createMarketplaceCardRef.operationName;
console.log(name);
```

### Variables
The `CreateMarketplaceCard` mutation requires an argument of type `CreateMarketplaceCardVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateMarketplaceCard` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateMarketplaceCardData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateMarketplaceCardData {
  marketplaceCard_insert: MarketplaceCard_Key;
}
```
### Using `CreateMarketplaceCard`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createMarketplaceCard, CreateMarketplaceCardVariables } from '@reviewmycoach/dataconnect';

// The `CreateMarketplaceCard` mutation requires an argument of type `CreateMarketplaceCardVariables`:
const createMarketplaceCardVars: CreateMarketplaceCardVariables = {
  id: ..., 
  name: ..., 
  description: ..., 
  imageUrl: ..., 
  category: ..., // optional
  tier: ..., // optional
  rarity: ..., // optional
  price: ..., 
  stripePriceId: ..., // optional
  stripeProductId: ..., // optional
  isFeatured: ..., // optional
  sortOrder: ..., // optional
};

// Call the `createMarketplaceCard()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createMarketplaceCard(createMarketplaceCardVars);
// Variables can be defined inline as well.
const { data } = await createMarketplaceCard({ id: ..., name: ..., description: ..., imageUrl: ..., category: ..., tier: ..., rarity: ..., price: ..., stripePriceId: ..., stripeProductId: ..., isFeatured: ..., sortOrder: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createMarketplaceCard(dataConnect, createMarketplaceCardVars);

console.log(data.marketplaceCard_insert);

// Or, you can use the `Promise` API.
createMarketplaceCard(createMarketplaceCardVars).then((response) => {
  const data = response.data;
  console.log(data.marketplaceCard_insert);
});
```

### Using `CreateMarketplaceCard`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createMarketplaceCardRef, CreateMarketplaceCardVariables } from '@reviewmycoach/dataconnect';

// The `CreateMarketplaceCard` mutation requires an argument of type `CreateMarketplaceCardVariables`:
const createMarketplaceCardVars: CreateMarketplaceCardVariables = {
  id: ..., 
  name: ..., 
  description: ..., 
  imageUrl: ..., 
  category: ..., // optional
  tier: ..., // optional
  rarity: ..., // optional
  price: ..., 
  stripePriceId: ..., // optional
  stripeProductId: ..., // optional
  isFeatured: ..., // optional
  sortOrder: ..., // optional
};

// Call the `createMarketplaceCardRef()` function to get a reference to the mutation.
const ref = createMarketplaceCardRef(createMarketplaceCardVars);
// Variables can be defined inline as well.
const ref = createMarketplaceCardRef({ id: ..., name: ..., description: ..., imageUrl: ..., category: ..., tier: ..., rarity: ..., price: ..., stripePriceId: ..., stripeProductId: ..., isFeatured: ..., sortOrder: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createMarketplaceCardRef(dataConnect, createMarketplaceCardVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.marketplaceCard_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.marketplaceCard_insert);
});
```

## UpdateMarketplaceCard
You can execute the `UpdateMarketplaceCard` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateMarketplaceCard(vars: UpdateMarketplaceCardVariables): MutationPromise<UpdateMarketplaceCardData, UpdateMarketplaceCardVariables>;

interface UpdateMarketplaceCardRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMarketplaceCardVariables): MutationRef<UpdateMarketplaceCardData, UpdateMarketplaceCardVariables>;
}
export const updateMarketplaceCardRef: UpdateMarketplaceCardRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateMarketplaceCard(dc: DataConnect, vars: UpdateMarketplaceCardVariables): MutationPromise<UpdateMarketplaceCardData, UpdateMarketplaceCardVariables>;

interface UpdateMarketplaceCardRef {
  ...
  (dc: DataConnect, vars: UpdateMarketplaceCardVariables): MutationRef<UpdateMarketplaceCardData, UpdateMarketplaceCardVariables>;
}
export const updateMarketplaceCardRef: UpdateMarketplaceCardRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateMarketplaceCardRef:
```typescript
const name = updateMarketplaceCardRef.operationName;
console.log(name);
```

### Variables
The `UpdateMarketplaceCard` mutation requires an argument of type `UpdateMarketplaceCardVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdateMarketplaceCard` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateMarketplaceCardData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateMarketplaceCardData {
  marketplaceCard_update?: MarketplaceCard_Key | null;
}
```
### Using `UpdateMarketplaceCard`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateMarketplaceCard, UpdateMarketplaceCardVariables } from '@reviewmycoach/dataconnect';

// The `UpdateMarketplaceCard` mutation requires an argument of type `UpdateMarketplaceCardVariables`:
const updateMarketplaceCardVars: UpdateMarketplaceCardVariables = {
  id: ..., 
  name: ..., // optional
  description: ..., // optional
  imageUrl: ..., // optional
  price: ..., // optional
  isActive: ..., // optional
  isFeatured: ..., // optional
  sortOrder: ..., // optional
};

// Call the `updateMarketplaceCard()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateMarketplaceCard(updateMarketplaceCardVars);
// Variables can be defined inline as well.
const { data } = await updateMarketplaceCard({ id: ..., name: ..., description: ..., imageUrl: ..., price: ..., isActive: ..., isFeatured: ..., sortOrder: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateMarketplaceCard(dataConnect, updateMarketplaceCardVars);

console.log(data.marketplaceCard_update);

// Or, you can use the `Promise` API.
updateMarketplaceCard(updateMarketplaceCardVars).then((response) => {
  const data = response.data;
  console.log(data.marketplaceCard_update);
});
```

### Using `UpdateMarketplaceCard`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateMarketplaceCardRef, UpdateMarketplaceCardVariables } from '@reviewmycoach/dataconnect';

// The `UpdateMarketplaceCard` mutation requires an argument of type `UpdateMarketplaceCardVariables`:
const updateMarketplaceCardVars: UpdateMarketplaceCardVariables = {
  id: ..., 
  name: ..., // optional
  description: ..., // optional
  imageUrl: ..., // optional
  price: ..., // optional
  isActive: ..., // optional
  isFeatured: ..., // optional
  sortOrder: ..., // optional
};

// Call the `updateMarketplaceCardRef()` function to get a reference to the mutation.
const ref = updateMarketplaceCardRef(updateMarketplaceCardVars);
// Variables can be defined inline as well.
const ref = updateMarketplaceCardRef({ id: ..., name: ..., description: ..., imageUrl: ..., price: ..., isActive: ..., isFeatured: ..., sortOrder: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateMarketplaceCardRef(dataConnect, updateMarketplaceCardVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.marketplaceCard_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.marketplaceCard_update);
});
```

## PurchaseCard
You can execute the `PurchaseCard` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
purchaseCard(vars: PurchaseCardVariables): MutationPromise<PurchaseCardData, PurchaseCardVariables>;

interface PurchaseCardRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: PurchaseCardVariables): MutationRef<PurchaseCardData, PurchaseCardVariables>;
}
export const purchaseCardRef: PurchaseCardRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
purchaseCard(dc: DataConnect, vars: PurchaseCardVariables): MutationPromise<PurchaseCardData, PurchaseCardVariables>;

interface PurchaseCardRef {
  ...
  (dc: DataConnect, vars: PurchaseCardVariables): MutationRef<PurchaseCardData, PurchaseCardVariables>;
}
export const purchaseCardRef: PurchaseCardRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the purchaseCardRef:
```typescript
const name = purchaseCardRef.operationName;
console.log(name);
```

### Variables
The `PurchaseCard` mutation requires an argument of type `PurchaseCardVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface PurchaseCardVariables {
  id: string;
  userId: string;
  coachUsername: string;
  cardId: string;
  cardName: string;
  cardImageUrl: string;
  stripePaymentId?: string | null;
}
```
### Return Type
Recall that executing the `PurchaseCard` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `PurchaseCardData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface PurchaseCardData {
  userCard_insert: UserCard_Key;
}
```
### Using `PurchaseCard`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, purchaseCard, PurchaseCardVariables } from '@reviewmycoach/dataconnect';

// The `PurchaseCard` mutation requires an argument of type `PurchaseCardVariables`:
const purchaseCardVars: PurchaseCardVariables = {
  id: ..., 
  userId: ..., 
  coachUsername: ..., 
  cardId: ..., 
  cardName: ..., 
  cardImageUrl: ..., 
  stripePaymentId: ..., // optional
};

// Call the `purchaseCard()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await purchaseCard(purchaseCardVars);
// Variables can be defined inline as well.
const { data } = await purchaseCard({ id: ..., userId: ..., coachUsername: ..., cardId: ..., cardName: ..., cardImageUrl: ..., stripePaymentId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await purchaseCard(dataConnect, purchaseCardVars);

console.log(data.userCard_insert);

// Or, you can use the `Promise` API.
purchaseCard(purchaseCardVars).then((response) => {
  const data = response.data;
  console.log(data.userCard_insert);
});
```

### Using `PurchaseCard`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, purchaseCardRef, PurchaseCardVariables } from '@reviewmycoach/dataconnect';

// The `PurchaseCard` mutation requires an argument of type `PurchaseCardVariables`:
const purchaseCardVars: PurchaseCardVariables = {
  id: ..., 
  userId: ..., 
  coachUsername: ..., 
  cardId: ..., 
  cardName: ..., 
  cardImageUrl: ..., 
  stripePaymentId: ..., // optional
};

// Call the `purchaseCardRef()` function to get a reference to the mutation.
const ref = purchaseCardRef(purchaseCardVars);
// Variables can be defined inline as well.
const ref = purchaseCardRef({ id: ..., userId: ..., coachUsername: ..., cardId: ..., cardName: ..., cardImageUrl: ..., stripePaymentId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = purchaseCardRef(dataConnect, purchaseCardVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userCard_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userCard_insert);
});
```

## UnlockTierCard
You can execute the `UnlockTierCard` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
unlockTierCard(vars: UnlockTierCardVariables): MutationPromise<UnlockTierCardData, UnlockTierCardVariables>;

interface UnlockTierCardRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UnlockTierCardVariables): MutationRef<UnlockTierCardData, UnlockTierCardVariables>;
}
export const unlockTierCardRef: UnlockTierCardRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
unlockTierCard(dc: DataConnect, vars: UnlockTierCardVariables): MutationPromise<UnlockTierCardData, UnlockTierCardVariables>;

interface UnlockTierCardRef {
  ...
  (dc: DataConnect, vars: UnlockTierCardVariables): MutationRef<UnlockTierCardData, UnlockTierCardVariables>;
}
export const unlockTierCardRef: UnlockTierCardRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the unlockTierCardRef:
```typescript
const name = unlockTierCardRef.operationName;
console.log(name);
```

### Variables
The `UnlockTierCard` mutation requires an argument of type `UnlockTierCardVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UnlockTierCardVariables {
  id: string;
  userId: string;
  coachUsername: string;
  cardId: string;
  cardName: string;
  cardImageUrl: string;
}
```
### Return Type
Recall that executing the `UnlockTierCard` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UnlockTierCardData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UnlockTierCardData {
  userCard_insert: UserCard_Key;
}
```
### Using `UnlockTierCard`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, unlockTierCard, UnlockTierCardVariables } from '@reviewmycoach/dataconnect';

// The `UnlockTierCard` mutation requires an argument of type `UnlockTierCardVariables`:
const unlockTierCardVars: UnlockTierCardVariables = {
  id: ..., 
  userId: ..., 
  coachUsername: ..., 
  cardId: ..., 
  cardName: ..., 
  cardImageUrl: ..., 
};

// Call the `unlockTierCard()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await unlockTierCard(unlockTierCardVars);
// Variables can be defined inline as well.
const { data } = await unlockTierCard({ id: ..., userId: ..., coachUsername: ..., cardId: ..., cardName: ..., cardImageUrl: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await unlockTierCard(dataConnect, unlockTierCardVars);

console.log(data.userCard_insert);

// Or, you can use the `Promise` API.
unlockTierCard(unlockTierCardVars).then((response) => {
  const data = response.data;
  console.log(data.userCard_insert);
});
```

### Using `UnlockTierCard`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, unlockTierCardRef, UnlockTierCardVariables } from '@reviewmycoach/dataconnect';

// The `UnlockTierCard` mutation requires an argument of type `UnlockTierCardVariables`:
const unlockTierCardVars: UnlockTierCardVariables = {
  id: ..., 
  userId: ..., 
  coachUsername: ..., 
  cardId: ..., 
  cardName: ..., 
  cardImageUrl: ..., 
};

// Call the `unlockTierCardRef()` function to get a reference to the mutation.
const ref = unlockTierCardRef(unlockTierCardVars);
// Variables can be defined inline as well.
const ref = unlockTierCardRef({ id: ..., userId: ..., coachUsername: ..., cardId: ..., cardName: ..., cardImageUrl: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = unlockTierCardRef(dataConnect, unlockTierCardVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userCard_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userCard_insert);
});
```

## UpdateCoachActiveCard
You can execute the `UpdateCoachActiveCard` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateCoachActiveCard(vars: UpdateCoachActiveCardVariables): MutationPromise<UpdateCoachActiveCardData, UpdateCoachActiveCardVariables>;

interface UpdateCoachActiveCardRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCoachActiveCardVariables): MutationRef<UpdateCoachActiveCardData, UpdateCoachActiveCardVariables>;
}
export const updateCoachActiveCardRef: UpdateCoachActiveCardRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateCoachActiveCard(dc: DataConnect, vars: UpdateCoachActiveCardVariables): MutationPromise<UpdateCoachActiveCardData, UpdateCoachActiveCardVariables>;

interface UpdateCoachActiveCardRef {
  ...
  (dc: DataConnect, vars: UpdateCoachActiveCardVariables): MutationRef<UpdateCoachActiveCardData, UpdateCoachActiveCardVariables>;
}
export const updateCoachActiveCardRef: UpdateCoachActiveCardRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateCoachActiveCardRef:
```typescript
const name = updateCoachActiveCardRef.operationName;
console.log(name);
```

### Variables
The `UpdateCoachActiveCard` mutation requires an argument of type `UpdateCoachActiveCardVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateCoachActiveCardVariables {
  coachId: string;
  activeCardId?: string | null;
  activeCardImageUrl?: string | null;
}
```
### Return Type
Recall that executing the `UpdateCoachActiveCard` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateCoachActiveCardData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateCoachActiveCardData {
  coach_update?: Coach_Key | null;
}
```
### Using `UpdateCoachActiveCard`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateCoachActiveCard, UpdateCoachActiveCardVariables } from '@reviewmycoach/dataconnect';

// The `UpdateCoachActiveCard` mutation requires an argument of type `UpdateCoachActiveCardVariables`:
const updateCoachActiveCardVars: UpdateCoachActiveCardVariables = {
  coachId: ..., 
  activeCardId: ..., // optional
  activeCardImageUrl: ..., // optional
};

// Call the `updateCoachActiveCard()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateCoachActiveCard(updateCoachActiveCardVars);
// Variables can be defined inline as well.
const { data } = await updateCoachActiveCard({ coachId: ..., activeCardId: ..., activeCardImageUrl: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateCoachActiveCard(dataConnect, updateCoachActiveCardVars);

console.log(data.coach_update);

// Or, you can use the `Promise` API.
updateCoachActiveCard(updateCoachActiveCardVars).then((response) => {
  const data = response.data;
  console.log(data.coach_update);
});
```

### Using `UpdateCoachActiveCard`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateCoachActiveCardRef, UpdateCoachActiveCardVariables } from '@reviewmycoach/dataconnect';

// The `UpdateCoachActiveCard` mutation requires an argument of type `UpdateCoachActiveCardVariables`:
const updateCoachActiveCardVars: UpdateCoachActiveCardVariables = {
  coachId: ..., 
  activeCardId: ..., // optional
  activeCardImageUrl: ..., // optional
};

// Call the `updateCoachActiveCardRef()` function to get a reference to the mutation.
const ref = updateCoachActiveCardRef(updateCoachActiveCardVars);
// Variables can be defined inline as well.
const ref = updateCoachActiveCardRef({ coachId: ..., activeCardId: ..., activeCardImageUrl: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateCoachActiveCardRef(dataConnect, updateCoachActiveCardVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.coach_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.coach_update);
});
```

