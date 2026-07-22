/**
 * Automated REST API End-to-End Test Suite
 */

const BASE_URL = 'http://localhost:3000';
const ADMIN_PASSCODE = '1234';

async function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAIL] ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runApiTests() {
  console.log('\n====================================================');
  console.log(' Starting REST API Verification Test Suite');
  console.log('====================================================\n');

  try {
    // 1. Healthcheck & Active Painting
    console.log('--- 1. Testing GET /api/health & /api/active-painting ---');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const health = await healthRes.json();
    await assert(health.status === 'ok', 'Health endpoint status is ok');

    const activeRes = await fetch(`${BASE_URL}/api/active-painting`);
    const activeData = await activeRes.json();
    await assert(activeData.painting.name === 'Starry Night', 'Initial active painting is Starry Night');
    await assert(activeData.frames.length === 6, 'Painting has 6 frames');
    await assert(activeData.completionPercentage === 0, 'Initial completion is 0%');

    // 2. Start Frame for Tablet A & B
    console.log('\n--- 2. Testing POST /api/start-frame ---');
    const startARes = await fetch(`${BASE_URL}/api/start-frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tablet_id: 'A', participant_name: 'Alice', participant_avatar: 'avatar_alice' })
    });
    const startA = await startARes.json();
    await assert(startA.success === true, 'Tablet A session started successfully');
    await assert(startA.frame.frame_number === 1, 'Tablet A assigned Frame #1 (interleaved: 1,3,5)');

    const startBRes = await fetch(`${BASE_URL}/api/start-frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tablet_id: 'B', participant_name: 'Bob', participant_avatar: 'avatar_bob' })
    });
    const startB = await startBRes.json();
    await assert(startB.success === true, 'Tablet B session started successfully');
    await assert(startB.frame.frame_number === 2, 'Tablet B assigned Frame #2 (interleaved: 2,4,6)');

    // 3. Update Pixels Batch
    console.log('\n--- 3. Testing POST /api/update-pixels-batch ---');
    const dummyGrid = Array.from({ length: 24 }, () => Array(24).fill('#3b82f6'));
    const updateRes = await fetch(`${BASE_URL}/api/update-pixels-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tablet_id: 'A', frame_id: startA.frame.id, pixel_grid: dummyGrid })
    });
    const updateData = await updateRes.json();
    await assert(updateData.success === true, 'Batched pixel update saved successfully');

    // 4. Check Active Drawers Feed
    console.log('\n--- 4. Testing GET /api/active-drawers ---');
    const drawersRes = await fetch(`${BASE_URL}/api/active-drawers`);
    const drawers = await drawersRes.json();
    await assert(drawers.tabletA.participant_name === 'Alice', 'Active drawers feed shows Alice on Tablet A');
    await assert(drawers.tabletB.participant_name === 'Bob', 'Active drawers feed shows Bob on Tablet B');

    // 5. Submit Frames & Test Painting Auto-Progression
    console.log('\n--- 5. Testing Frame Submissions & Auto-Progression ---');
    // Lock Frame 1 (Tablet A)
    const sub1Res = await fetch(`${BASE_URL}/api/submit-frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tablet_id: 'A', frame_id: startA.frame.id })
    });
    const sub1 = await sub1Res.json();
    await assert(sub1.frame_locked === true, 'Frame 1 submitted and locked');
    await assert(sub1.painting_completed === false, 'Painting not complete after 1 frame');

    // Submit remaining frames 2, 3, 4, 5, 6
    const framesList = activeData.frames;
    for (let i = 1; i < framesList.length; i++) {
      const f = framesList[i];
      // Mark in_progress first
      const tabletId = (f.frame_number % 2 !== 0) ? 'A' : 'B';
      await fetch(`${BASE_URL}/api/start-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tablet_id: tabletId, participant_name: `Drawer${f.frame_number}`, participant_avatar: 'avatar' })
      });

      const subRes = await fetch(`${BASE_URL}/api/submit-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tablet_id: tabletId, frame_id: f.id })
      });
      const sub = await subRes.json();

      if (i === 5) {
        await assert(sub.painting_completed === true, 'Painting auto-completed upon 6th frame submission!');
        await assert(sub.next_painting && sub.next_painting.name === 'The Great Wave off Kanagawa', 'Auto-advanced active painting to "The Great Wave off Kanagawa"');
      }
    }

    // Verify Active Painting updated to Painting #2
    const newActiveRes = await fetch(`${BASE_URL}/api/active-painting`);
    const newActive = await newActiveRes.json();
    await assert(newActive.painting.name === 'The Great Wave off Kanagawa', 'Active painting is now The Great Wave off Kanagawa');

    // 6. Test Admin Endpoints
    console.log('\n--- 6. Testing Passcode-Protected Admin Endpoints ---');
    const adminVerifyRes = await fetch(`${BASE_URL}/api/admin/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Passcode': ADMIN_PASSCODE }
    });
    const adminVerify = await adminVerifyRes.json();
    await assert(adminVerify.success === true, 'Admin passcode verified');

    // Reset Painting #1 back to active via Admin override
    const setRes = await fetch(`${BASE_URL}/api/admin/set-active-painting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Passcode': ADMIN_PASSCODE },
      body: JSON.stringify({ painting_id: activeData.painting.id })
    });
    const set = await setRes.json();
    await assert(set.success === true, 'Admin set active painting back to Starry Night');

    const resetPRes = await fetch(`${BASE_URL}/api/admin/reset-painting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Passcode': ADMIN_PASSCODE },
      body: JSON.stringify({ painting_id: activeData.painting.id })
    });
    const resetP = await resetPRes.json();
    await assert(resetP.success === true, 'Admin reset painting #1 frames to unclaimed');

    console.log('\n====================================================');
    console.log(' ALL REST API TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ Test Suite Failed:', error.message);
    process.exit(1);
  }
}

runApiTests();
