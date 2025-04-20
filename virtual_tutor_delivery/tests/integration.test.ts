import { test, expect } from '@playwright/test';

// Integration test suite for Virtual Tutor application
test.describe('Virtual Tutor Integration Tests', () => {
  // Test user credentials
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '1234567890'
  };

  // Test admin credentials
  const testAdmin = {
    email: `admin_${Date.now()}@example.com`,
    password: 'AdminPass123!',
    firstName: 'Admin',
    lastName: 'User',
    phoneNumber: '0987654321'
  };

  test('End-to-end student registration and course enrollment flow', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Virtual Tutor/);

    // Navigate to registration page
    await page.click('text=Register');
    await expect(page).toHaveURL(/.*register/);

    // Fill registration form
    await page.fill('input[name="firstName"]', testUser.firstName);
    await page.fill('input[name="lastName"]', testUser.lastName);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="phoneNumber"]', testUser.phoneNumber);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);

    // Submit registration form
    await page.click('button[type="submit"]');

    // Should be redirected to dashboard after registration
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Navigate to courses page
    await page.click('text=Explore Courses');
    await expect(page).toHaveURL(/.*courses/);

    // Select a course
    await page.click('.course-card:first-child');
    await expect(page).toHaveURL(/.*courses\/\w+/);

    // Enroll in the course
    await page.click('text=Enroll Now');

    // Should see enrollment confirmation
    await expect(page.locator('.enrollment-success')).toBeVisible();

    // Navigate back to dashboard
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*dashboard/);

    // Should see enrolled course in dashboard
    await expect(page.locator('.enrolled-course')).toBeVisible();
  });

  test('Tutor session with speech and memory capabilities', async ({ page }) => {
    // Login as test user
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate to enrolled course
    await page.click('.enrolled-course:first-child');
    await expect(page).toHaveURL(/.*courses\/\w+/);

    // Start tutor session
    await page.click('text=Start Session');
    await expect(page).toHaveURL(/.*tutor-session/);

    // Check if avatar is visible
    await expect(page.locator('.avatar-section')).toBeVisible();

    // Check if chat interface is visible
    await expect(page.locator('.chat-section')).toBeVisible();

    // Send a message to the tutor
    await page.fill('.message-input input', 'Hello, can you help me with this course?');
    await page.click('button:has-text("Send")');

    // Should see user message in chat
    await expect(page.locator('.user-message')).toContainText('Hello, can you help me with this course?');

    // Should receive a response from the tutor
    await expect(page.locator('.tutor-message')).toBeVisible({ timeout: 10000 });

    // Send another message to test memory
    await page.fill('.message-input input', 'My name is Test User');
    await page.click('button:has-text("Send")');

    // Wait for tutor response
    await expect(page.locator('.tutor-message:nth-child(4)')).toBeVisible({ timeout: 10000 });

    // Refresh the page to test memory persistence
    await page.reload();

    // Send a message asking about name
    await page.fill('.message-input input', 'Do you remember my name?');
    await page.click('button:has-text("Send")');

    // Tutor should remember the name
    const tutorResponse = await page.locator('.tutor-message:nth-child(6)').textContent({ timeout: 10000 });
    expect(tutorResponse).toContain('Test User');
  });

  test('Admin course creation to student visibility flow', async ({ page }) => {
    // Register admin user
    await page.goto('/register');
    await page.fill('input[name="firstName"]', testAdmin.firstName);
    await page.fill('input[name="lastName"]', testAdmin.lastName);
    await page.fill('input[name="email"]', testAdmin.email);
    await page.fill('input[name="phoneNumber"]', testAdmin.phoneNumber);
    await page.fill('input[name="password"]', testAdmin.password);
    await page.fill('input[name="confirmPassword"]', testAdmin.password);
    await page.click('button[type="submit"]');

    // Manually set admin role in database (would be done by superadmin in real app)
    // This step would be handled differently in a real application

    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', testAdmin.email);
    await page.fill('input[name="password"]', testAdmin.password);
    await page.click('button[type="submit"]');

    // Navigate to admin panel
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*admin/);

    // Navigate to course management
    await page.click('text=Courses');
    await expect(page).toHaveURL(/.*admin\/courses/);

    // Create new course
    await page.click('text=Create New Course');
    await expect(page).toHaveURL(/.*admin\/courses\/new/);

    // Fill course form
    const courseTitle = `Test Course ${Date.now()}`;
    await page.fill('input[name="title"]', courseTitle);
    await page.fill('input[name="subject"]', 'Integration Testing');
    await page.fill('textarea[name="description"]', 'This is a test course created during integration testing');
    await page.fill('input[name="gradeLevel"]', 'All Levels');
    await page.fill('input[name="thumbnail"]', 'https://example.com/test-thumbnail.jpg');
    await page.fill('input[name="duration"]', '5 hours');
    await page.selectOption('select[name="skillLevels"]', ['Beginner', 'Intermediate']);

    // Submit course form
    await page.click('button:has-text("Create Course")');
    await expect(page).toHaveURL(/.*admin\/courses/);

    // Verify course was created
    await expect(page.locator('.course-card')).toContainText(courseTitle);

    // Logout as admin
    await page.click('text=Logout');
    await expect(page).toHaveURL(/.*login/);

    // Login as student
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate to courses page
    await page.click('text=Explore Courses');
    await expect(page).toHaveURL(/.*courses/);

    // Verify new course is visible to student
    await expect(page.locator('.course-card')).toContainText(courseTitle);
  });

  test('Avatar creation to tutor session usage flow', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', testAdmin.email);
    await page.fill('input[name="password"]', testAdmin.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate to admin panel
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*admin/);

    // Navigate to avatar management
    await page.click('text=Avatars');
    await expect(page).toHaveURL(/.*admin\/avatars/);

    // Create new avatar
    await page.click('text=Create New Avatar');
    await expect(page).toHaveURL(/.*admin\/avatars\/new/);

    // Fill avatar form
    const avatarName = `Test Avatar ${Date.now()}`;
    await page.fill('input[name="name"]', avatarName);
    await page.fill('input[name="modelUrl"]', 'https://example.com/test-model.glb');
    await page.fill('input[name="thumbnailUrl"]', 'https://example.com/test-avatar.jpg');
    await page.fill('input[name="voiceId"]', 'en-US-Standard-A');
    await page.fill('input[name="personality"]', 'Friendly, Patient');
    await page.fill('input[name="specialization"]', 'Integration Testing');
    await page.fill('input[name="teachingStyle"]', 'Interactive');

    // Submit avatar form
    await page.click('button:has-text("Create Avatar")');
    await expect(page).toHaveURL(/.*admin\/avatars/);

    // Verify avatar was created
    await expect(page.locator('.avatar-card')).toContainText(avatarName);

    // Logout as admin
    await page.click('text=Logout');
    await expect(page).toHaveURL(/.*login/);

    // Login as student
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate to enrolled course
    await page.click('.enrolled-course:first-child');
    await expect(page).toHaveURL(/.*courses\/\w+/);

    // Start tutor session
    await page.click('text=Start Session');
    await expect(page).toHaveURL(/.*tutor-session/);

    // Verify new avatar is used in tutor session
    // This would check if the avatar is loaded correctly
    await expect(page.locator('.avatar-section')).toBeVisible();
  });
});
