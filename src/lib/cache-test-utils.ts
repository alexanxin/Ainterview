import { cacheService } from "./cache-service";
import { localStorageCacheService } from "./local-storage-cache";

// Utility function to test cache performance
export async function testCachePerformance(): Promise<void> {
  console.log("Testing cache performance...");

  // Measure cache access time
  const startTime = performance.now();

  // Test setting and getting data from cache
  const testUserId = "test-user-id-performance";
  const testProfile = {
    id: testUserId,
    full_name: "Test User",
    email: "test@example.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Set data in cache
  cacheService.setUserProfile(testUserId, testProfile);

  // Get data from cache multiple times to measure performance
  for (let i = 0; i < 100; i++) {
    const cachedProfile = cacheService.getUserProfile(testUserId);
    if (cachedProfile === undefined) {
      console.error("Cache miss detected during performance test");
    }
  }

  const endTime = performance.now();
  const duration = endTime - startTime;

  console.log(
    `Cache performance test completed in ${duration.toFixed(
      2
    )} milliseconds for 100 operations`
  );
  console.log(
    `Average cache access time: ${(duration / 100).toFixed(4)} milliseconds`
  );

  // Test cache statistics
  const stats = cacheService.getStats();
  console.log("Cache statistics:", stats);
}

// Utility function to test cache invalidation
export async function testCacheInvalidation(): Promise<void> {
  console.log("Testing cache invalidation...");

  const testUserId = "test-user-id-invalidation";
  const testProfile = {
    id: testUserId,
    full_name: "Test User Invalidation",
    email: "test-invalidation@example.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Set data in cache
  cacheService.setUserProfile(testUserId, testProfile);

  // Verify data is in cache
  const cachedProfile = cacheService.getUserProfile(testUserId);
  if (cachedProfile && cachedProfile.full_name === testProfile.full_name) {
    console.log("✓ Cache set/get working correctly");
  } else {
    console.error("✗ Cache set/get failed");
  }

  // Invalidate the cache
  cacheService.invalidateUserProfile(testUserId);

  // Verify data is no longer in cache
  const invalidatedProfile = cacheService.getUserProfile(testUserId);
  if (invalidatedProfile === undefined) {
    console.log("✓ Cache invalidation working correctly");
  } else {
    console.error("✗ Cache invalidation failed");
  }
}

// Utility function to test local storage cache
export async function testLocalStorageCache(): Promise<void> {
  console.log("Testing local storage cache...");

  const testUserId = "test-user-id-localstorage";
  const testProfile = {
    id: testUserId,
    full_name: "Test User Local Storage",
    email: "test-localstorage@example.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Set data in local storage cache
  localStorageCacheService.setUserProfile(testUserId, testProfile);

  // Get data from local storage cache
  const cachedProfile = localStorageCacheService.getUserProfile(testUserId);
  if (cachedProfile && cachedProfile?.full_name === testProfile.full_name) {
    console.log("✓ Local storage cache set/get working correctly");
  } else {
    console.error("✗ Local storage cache set/get failed", cachedProfile);
  }

  // Remove data from local storage cache
  localStorageCacheService.remove(`cache_user_profile_${testUserId}`);

  // Verify data is no longer in local storage cache
  const removedProfile = localStorageCacheService.getUserProfile(testUserId);
  if (removedProfile === undefined) {
    console.log("✓ Local storage cache removal working correctly");
  } else {
    console.error("✗ Local storage cache removal failed");
  }
}

// Run all cache tests
export async function runCacheTests(): Promise<void> {
  console.log("Running cache tests...\n");

  await testCachePerformance();
  console.log("");

  await testCacheInvalidation();
  console.log("");

  await testLocalStorageCache();
  console.log("");

  console.log("Cache tests completed!");
}
