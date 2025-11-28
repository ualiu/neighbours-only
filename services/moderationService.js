const Post = require('../models/Post');
const User = require('../models/User');
const ModerationLearning = require('../models/ModerationLearning');

/**
 * Moderate a new post using Claude AI with three-lane system
 * @param {string} text - Post content
 * @param {string} imageUrl - Optional image URL
 * @param {string} userId - User ID who created the post
 * @returns {Object} Moderation result
 */
const moderateNewPost = async (text, imageUrl = null, userId) => {
  console.log('\n🔍 ===== AI MODERATION STARTED =====');
  console.log('Post text:', text.substring(0, 100) + '...');
  console.log('User ID:', userId);

  try {
    // Get user posting frequency
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const userPostCount = await Post.countDocuments({
      userId,
      createdAt: { $gte: last24h },
    });

    const user = await User.findById(userId);
    const accountAgeDays =
      (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);

    console.log('User context:', {
      postCount24h: userPostCount,
      accountAgeDays: Math.floor(accountAgeDays),
      hasVerifiedAddress: !!user.address?.sublocality,
    });

    // Detect business-related content
    const businessDetection = detectBusinessPost(text, {
      postFrequency: userPostCount,
      accountAgeDays,
      hasVerifiedAddress: !!user.address?.sublocality,
    });

    // Build the moderation prompt
    const prompt = `You are a community moderation AI for a hyper-local neighborhood social network.
Analyze this post using a THREE-LANE moderation system: ALLOW, FLAG, or BLOCK.

CRITICAL: Be VERY LENIENT. This is a private neighborhood community where neighbors should feel comfortable posting freely. Only flag truly suspicious content and only block clear violations.

POST CONTENT:
${text}

USER CONTEXT:
- Posts in last 24h: ${userPostCount}
- Member since: ${Math.floor(accountAgeDays)} days ago
- Address verified: ${!!user.address?.sublocality}
- Promotional score: ${businessDetection.promotionalScore}

=== THREE-LANE MODERATION SYSTEM ===

🟢 ALLOW (Green Lane) - Normal Neighbor Behavior (DEFAULT - USE THIS MOST):
- Asking for recommendations ("Anyone know a good plumber?")
- Borrowing/lending items
- Sharing news, safety alerts, or lost pets
- Community events and gatherings
- Selling/giving away household items (garage sales, used furniture)
- General neighborly conversation
- Neighborhood micro-entrepreneurship ("I do snow shoveling if anyone needs help")
- Test posts, casual messages, friendly chatter
- Questions about the neighborhood or app
- ANY post that seems like genuine neighbor interaction

🟡 FLAG (Yellow Lane) - ONLY for genuinely suspicious patterns:
- Multiple promotional posts per day (3+ similar posts)
- Professional marketing language with booking links
- Repeated copy-paste spam across multiple posts
- Possible outside business masquerading as neighbor (strong signals only)

🔴 BLOCK (Red Lane) - ONLY for clear, obvious violations:
- Hateful slurs, explicit harassment, or threats
- Obvious scams or phishing attempts
- Bot-generated spam (crypto, MLM, get-rich-quick)
- Sexual or highly inappropriate content
- Clear outside advertising with no neighbor context

=== SMART BUSINESS DETECTION (BE LENIENT) ===

ALLOWED Business Posts (default to allowing these):
✓ Neighbor offering occasional services to neighbors
✓ "I do X if anyone needs help" (genuine community offer)
✓ Asking if anyone wants to buy their personal item
✓ Recommending a business they used (not self-promo)
✓ First or second promotional post - give benefit of doubt
✓ Neighbor promoting their small side business occasionally

ONLY BLOCK if ALL of these are true:
✗ Professional corporate marketing language
✗ Posted 5+ promotional messages in 24h
✗ Commercial booking links + no neighbor indicators
✗ Clear signs of outside business (no local address, corporate speak)

ONLY FLAG if:
⚠ 3-4 promotional posts in 24h (frequent but not spam)
⚠ Professional marketing language but could be enthusiastic neighbor

=== YOUR TASK ===

Analyze the post and respond with ONLY valid JSON (no markdown code blocks):

{
  "lane": "green" | "yellow" | "red",
  "decision": "allow" | "flag" | "block",
  "confidence": 0-100,
  "reason": "clear explanation of why",
  "categories": ["category1", "category2"],
  "business_detection": {
    "is_business_related": true/false,
    "is_neighbor_entrepreneur": true/false,
    "is_outside_business": true/false,
    "promotional_score": 0-100
  },
  "user_message": "what to tell the user",
  "revision_suggestion": "how to fix it (if blocked/flagged)" | null
}

CRITICAL RULES - READ CAREFULLY:
1. DEFAULT TO ALLOW - Be extremely lenient with all neighbor interactions
2. Test posts, casual messages, friendly banter = ALL ALLOWED
3. Only FLAG if you see genuine spam patterns (3+ similar posts in 24h)
4. Only BLOCK if content is clearly hateful, scam, or explicit harassment
5. When in doubt between ALLOW and FLAG → choose ALLOW
6. When in doubt between FLAG and BLOCK → choose FLAG
7. Neighbor businesses are ALLOWED unless posting 5+ times per day
8. "Anyone know...", "Looking for...", "Test post" = ALWAYS ALLOW
9. New users (0-7 days old) should be given extra leniency
10. Single posts are almost never spam - default to ALLOW

If you're uncertain, ALLOW it. The community can report truly bad content later.`;

    console.log('📡 Calling Claude API for moderation...');

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error:', response.status, response.statusText);
      console.error('Error details:', errorText);
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    let resultText = data.content[0].text;

    // Strip markdown code blocks if present
    resultText = resultText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const result = JSON.parse(resultText);

    console.log('✅ AI Moderation Result:', {
      lane: result.lane,
      decision: result.decision,
      confidence: result.confidence,
      reason: result.reason.substring(0, 100) + '...',
    });

    const moderationResult = {
      lane: result.lane,
      decision: result.decision,
      status:
        result.decision === 'allow'
          ? 'approved'
          : result.decision === 'flag'
          ? 'flagged'
          : 'rejected',
      reason: result.reason,
      confidence: result.confidence,
      categories: result.categories,
      userMessage: result.user_message,
      revisionSuggestion: result.revision_suggestion,
      businessDetection: {
        ...businessDetection,
        ...result.business_detection,
      },
      isVisible: result.decision === 'allow',
      needsRevision: result.decision === 'block',
    };

    console.log('===== AI MODERATION COMPLETE =====\n');
    return moderationResult;
  } catch (error) {
    console.error('❌❌❌ MODERATION ERROR:', error.message);
    console.error('Full error:', error);
    console.log('⚠️  FAIL-SAFE ACTIVATED: Defaulting to ALLOW');
    console.log('===== AI MODERATION FAILED =====\n');

    // Fail open: if moderation fails, allow post but log error
    return {
      lane: 'green',
      decision: 'allow',
      status: 'approved',
      reason: 'Moderation service unavailable - defaulting to allow',
      confidence: 0,
      categories: [],
      isVisible: true,
      needsRevision: false,
      error: true,
      businessDetection: {},
    };
  }
};

/**
 * Re-analyze post with user feedback when multiple reports received
 * @param {Object} post - Post document
 * @param {Array} reports - Array of Report documents
 * @returns {Object} Re-analysis result
 */
const reanalyzeWithUserFeedback = async (post, reports) => {
  try {
    const reportsText = reports
      .map(
        (r) =>
          `- Category: ${r.reason}${
            r.details ? `, Explanation: "${r.details}"` : ''
          }`
      )
      .join('\n');

    const prompt = `You previously analyzed this post and placed it in the ${post.moderation.lane} lane (${post.moderation.aiDecision}).

ORIGINAL POST:
${post.text}

YOUR ORIGINAL ANALYSIS:
Lane: ${post.moderation.lane} (${post.moderation.aiDecision})
Reason: ${post.moderation.aiReason}
Confidence: ${post.moderation.aiConfidence}%

USER REPORTS (${reports.length} neighbors flagged this):
${reportsText}

=== RE-EVALUATION WITH COMMUNITY FEEDBACK ===

The neighbors in this community have flagged this post. This is valuable signal.

Consider:
1. Are multiple neighbors seeing something you missed?
2. Is there local context or cultural nuance you didn't catch?
3. Do the reports suggest a pattern (spam, harassment, promotional)?
4. Should you move this post to a different lane?

IMPORTANT: Community reports are STRONG signals. If 3+ neighbors flag something:
- They likely know the local context better than you
- There may be repeated behavior you can't see from one post
- The post may be harmful to community trust even if not obviously violating rules

Re-evaluate using the THREE-LANE system and respond with ONLY valid JSON (no markdown):

{
  "lane": "green" | "yellow" | "red",
  "decision": "allow" | "flag" | "block",
  "confidence": 0-100,
  "reason": "updated explanation considering user feedback",
  "categories": ["category1"],
  "changed_decision": true/false,
  "learning_note": "what this teaches you for future similar posts",
  "action_taken": "Post remains visible" | "Post hidden pending review" | "Post removed"
}

Be responsive to community feedback while avoiding mob mentality. If reports seem coordinated or malicious, note that in your reasoning.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    let resultText = data.content[0].text;
    resultText = resultText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const result = JSON.parse(resultText);

    // Store learning example for future improvement
    if (result.changed_decision) {
      await storeLearningExample({
        postText: post.text,
        originalDecision: post.moderation.aiDecision,
        originalLane: post.moderation.lane,
        newDecision: result.decision,
        newLane: result.lane,
        learningNote: result.learning_note,
        reportCount: reports.length,
        reportCategories: reports.map((r) => r.reason),
        userContext: {
          postFrequency: post.businessDetection?.postFrequency || 0,
          accountAge: 0,
        },
      });
    }

    return result;
  } catch (error) {
    console.error('Reanalysis error:', error);
    return {
      lane: post.moderation.lane,
      decision: post.moderation.aiDecision,
      confidence: 50,
      reason: 'Re-analysis failed, maintaining original decision',
      changed_decision: false,
      error: true,
    };
  }
};

/**
 * Store learning examples for future fine-tuning
 * @param {Object} learningData - Learning data to store
 */
const storeLearningExample = async (learningData) => {
  try {
    const learning = new ModerationLearning({
      postText: learningData.postText,
      originalDecision: learningData.originalDecision,
      originalLane: learningData.originalLane || 'unknown',
      newDecision: learningData.newDecision,
      newLane: learningData.newLane || 'unknown',
      learningNote: learningData.learningNote,
      reportCount: learningData.reportCount || 0,
      reportCategories: learningData.reportCategories || [],
      wasDecisionChanged:
        learningData.originalDecision !== learningData.newDecision,
      userContext: learningData.userContext || {},
    });

    await learning.save();

    console.log(`Learning example stored: ${learningData.learningNote}`);
  } catch (error) {
    console.error('Error storing learning example:', error);
    // Don't fail the main flow if learning storage fails
  }
};

/**
 * Detect business-related content in post
 * @param {string} text - Post text
 * @param {Object} userContext - User context data
 * @returns {Object} Business detection result
 */
const detectBusinessPost = (text, userContext) => {
  const { postFrequency, accountAgeDays, hasVerifiedAddress } = userContext;

  let promotionalScore = 0;

  // Check commercial indicators
  const hasPhone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text);
  const hasWebsite = /https?:\/\/|www\./i.test(text);
  const hasBusinessTerms =
    /licensed|insured|professional|company|LLC|services/i.test(text);
  const hasSalesLanguage =
    /call now|limited time|book|special offer|DM for/i.test(text);

  if (hasPhone) promotionalScore += 20;
  if (hasWebsite) promotionalScore += 25;
  if (hasBusinessTerms) promotionalScore += 15;
  if (hasSalesLanguage) promotionalScore += 30;

  // Check posting frequency
  if (postFrequency >= 6) promotionalScore += 40;
  // Spamming
  else if (postFrequency >= 3) promotionalScore += 20; // Frequent

  // Check account age (newer = more suspicious)
  if (accountAgeDays < 7) promotionalScore += 20;
  else if (accountAgeDays < 30) promotionalScore += 10;

  // Check address verification
  if (!hasVerifiedAddress) promotionalScore += 15;

  // Determine classification
  const isNeighborMicroEntrepreneur =
    promotionalScore < 30 && /I do|happy to help|if anyone needs/i.test(text);

  const isOutsideBusiness =
    promotionalScore >= 60 ||
    (hasBusinessTerms && hasSalesLanguage && postFrequency >= 3);

  return {
    isBusinessRelated: promotionalScore > 0,
    isNeighborMicroEntrepreneur,
    isOutsideBusiness,
    promotionalScore,
    hasCommercialLinks: hasWebsite || hasPhone,
    postFrequency,
  };
};

module.exports = {
  moderateNewPost,
  reanalyzeWithUserFeedback,
  storeLearningExample,
  detectBusinessPost,
};
