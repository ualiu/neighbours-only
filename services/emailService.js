const { Resend } = require('resend');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Verify Resend is configured
if (process.env.RESEND_API_KEY) {
  console.log('✉️  Email service is ready (Resend)');
} else {
  console.error('❌ RESEND_API_KEY not configured');
}

/**
 * Send email notification when someone comments on a user's post
 */
const sendCommentNotification = async ({ postAuthor, commenter, postText, commentText, postId }) => {
  // Don't send if author commented on their own post
  if (postAuthor._id.toString() === commenter._id.toString()) {
    return;
  }

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NeighboursOnly <onboarding@resend.dev>',
      to: postAuthor.email,
      subject: `${commenter.displayName} commented on your post`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0c0c18; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8f4f0; padding: 30px; border-radius: 0 0 8px 8px; }
          .post-preview { background-color: white; padding: 15px; border-left: 4px solid #0c0c18; margin: 20px 0; border-radius: 4px; }
          .comment-box { background-color: #e4e6eb; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background-color: #0c0c18; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #65676b; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>💬 New Comment</h2>
          </div>
          <div class="content">
            <p>Hi ${postAuthor.displayName.split(' ')[0]},</p>

            <p><strong>${commenter.displayName}</strong> commented on your post:</p>

            <div class="post-preview">
              <p style="color: #65676b; margin: 0;">${postText.length > 100 ? postText.substring(0, 100) + '...' : postText}</p>
            </div>

            <div class="comment-box">
              <p style="margin: 0;"><strong>${commenter.displayName}:</strong> ${commentText}</p>
            </div>

            <a href="${process.env.NODE_ENV === 'production' ? 'https://www.neighboursonly.com' : 'http://localhost:3000'}/neighborhood" class="button">View & Reply</a>

            <p style="color: #65676b; font-size: 13px; margin-top: 20px;">
              You can turn off these notifications anytime in your <a href="${process.env.NODE_ENV === 'production' ? 'https://www.neighboursonly.com' : 'http://localhost:3000'}/settings" style="color: #65676b; text-decoration: underline;">account settings</a>.
            </p>

            <p style="color: #65676b; font-size: 14px; margin-top: 30px;">
              Keep the conversation going in your neighborhood!
            </p>
          </div>
          <div class="footer">
            <p>You're receiving this because someone commented on your post on NeighboursOnly.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    });
    console.log(`✉️  Comment notification sent to ${postAuthor.email}`, result);
  } catch (error) {
    console.error('Error sending comment notification:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
  }
};

/**
 * Send daily digest of new posts in the neighborhood
 */
const sendDailyDigest = async ({ user, posts, neighborhood }) => {
  if (posts.length === 0) {
    return; // Don't send empty digest
  }

  const postsHtml = posts
    .map(
      (post) => `
    <div style="background-color: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #0c0c18;">
      <p style="margin: 0; font-weight: 600;">${post.userId.displayName}</p>
      <p style="margin: 10px 0 0 0; color: #333;">${post.text.length > 150 ? post.text.substring(0, 150) + '...' : post.text}</p>
      ${post.commentCount > 0 ? `<p style="margin: 10px 0 0 0; color: #65676b; font-size: 14px;">💬 ${post.commentCount} ${post.commentCount === 1 ? 'comment' : 'comments'}</p>` : ''}
    </div>
  `
    )
    .join('');

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NeighboursOnly <onboarding@resend.dev>',
      to: user.email,
      subject: `${posts.length} new ${posts.length === 1 ? 'post' : 'posts'} in ${neighborhood.name}`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0c0c18; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8f4f0; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #0c0c18; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #65676b; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📬 Your Daily Digest</h2>
          </div>
          <div class="content">
            <p>Hi ${user.displayName.split(' ')[0]},</p>

            <p>Here's what happened in <strong>${neighborhood.name}</strong> today:</p>

            ${postsHtml}

            <a href="${process.env.NODE_ENV === 'production' ? 'https://www.neighboursonly.com' : 'http://localhost:3000'}/neighborhood" class="button">View All Posts</a>
          </div>
          <div class="footer">
            <p>You're receiving this daily digest from NeighboursOnly.</p>
            <p><a href="${process.env.NODE_ENV === 'production' ? 'https://www.neighboursonly.com' : 'http://localhost:3000'}/settings" style="color: #65676b;">Manage notification settings</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    });
    console.log(`✉️  Daily digest sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending daily digest:', error);
  }
};

/**
 * Send welcome email to new users
 */
const sendWelcomeEmail = async ({ user, neighborhood }) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NeighboursOnly <onboarding@resend.dev>',
      to: user.email,
      subject: `Welcome to ${neighborhood.name} on NeighboursOnly!`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0c0c18; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8f4f0; padding: 30px; border-radius: 0 0 8px 8px; }
          .tip-box { background-color: white; padding: 15px; border-left: 4px solid #0c0c18; margin: 15px 0; border-radius: 4px; }
          .button { display: inline-block; background-color: #0c0c18; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #65676b; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👋 Welcome to NeighboursOnly!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.displayName.split(' ')[0]},</p>

            <p>You're now part of the <strong>${neighborhood.name}</strong> community! Here's how to get started:</p>

            <div class="tip-box">
              <p style="margin: 0;"><strong>1️⃣ Create your first post</strong></p>
              <p style="margin: 5px 0 0 0; color: #65676b;">Introduce yourself, ask for recommendations, or share what you love about the neighborhood.</p>
            </div>

            <div class="tip-box">
              <p style="margin: 0;"><strong>2️⃣ Invite your neighbors</strong></p>
              <p style="margin: 5px 0 0 0; color: #65676b;">Share NeighboursOnly.com in your local Facebook group to grow the community.</p>
            </div>

            <div class="tip-box">
              <p style="margin: 0;"><strong>3️⃣ Stay connected</strong></p>
              <p style="margin: 5px 0 0 0; color: #65676b;">Check back daily to see what's happening in ${neighborhood.name}.</p>
            </div>

            <a href="${process.env.NODE_ENV === 'production' ? 'https://www.neighboursonly.com' : 'http://localhost:3000'}/neighborhood" class="button">Go to Your Neighborhood</a>

            <p style="color: #65676b; font-size: 14px; margin-top: 30px;">
              We're excited to have you here! 🎉
            </p>
          </div>
          <div class="footer">
            <p>Welcome to NeighboursOnly - Your hyper-local social network</p>
          </div>
        </div>
      </body>
      </html>
    `,
    });
    console.log(`✉️  Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

/**
 * Send email notification when a new post is created in the neighborhood
 */
const sendNewPostNotification = async ({ recipient, author, postText, postId, neighborhood }) => {
  // Don't send notification to the post author
  if (recipient._id.toString() === author._id.toString()) {
    return;
  }

  // Check if recipient has new post notifications enabled
  if (recipient.settings?.emailOnNewPost === false) {
    return;
  }

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NeighboursOnly <onboarding@resend.dev>',
      to: recipient.email,
      subject: `${author.displayName} posted in ${neighborhood.name}`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0c0c18; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8f4f0; padding: 30px; border-radius: 0 0 8px 8px; }
          .post-box { background-color: white; padding: 20px; border-left: 4px solid #0c0c18; margin: 20px 0; border-radius: 4px; }
          .author { font-weight: 600; color: #0c0c18; margin-bottom: 10px; }
          .button { display: inline-block; background-color: #0c0c18; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #65676b; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📬 New Post in Your Neighborhood</h2>
          </div>
          <div class="content">
            <p>Hi ${recipient.displayName.split(' ')[0]},</p>

            <p>There's a new post in <strong>${neighborhood.name}</strong>:</p>

            <div class="post-box">
              <div class="author">${author.displayName}</div>
              <p style="margin: 0; color: #333;">${postText.length > 200 ? postText.substring(0, 200) + '...' : postText}</p>
            </div>

            <a href="${process.env.NODE_ENV === 'production' ? 'https://www.neighboursonly.com' : 'http://localhost:3000'}/neighborhood" class="button">View & Reply</a>

            <p style="color: #65676b; font-size: 13px; margin-top: 20px;">
              You can turn off these notifications anytime in your <a href="${process.env.NODE_ENV === 'production' ? 'https://www.neighboursonly.com' : 'http://localhost:3000'}/settings" style="color: #65676b; text-decoration: underline;">account settings</a>.
            </p>

            <p style="color: #65676b; font-size: 14px; margin-top: 30px;">
              Stay connected with your neighbors!
            </p>
          </div>
          <div class="footer">
            <p>You're receiving this because there's new activity in ${neighborhood.name}.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    });
    console.log(`✉️  New post notification sent to ${recipient.email}`, result);
  } catch (error) {
    console.error('Error sending new post notification:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
  }
};

module.exports = {
  sendCommentNotification,
  sendDailyDigest,
  sendWelcomeEmail,
  sendNewPostNotification,
};
