# IMPLMENTATION PLAN: Photo/Tweet Feature

## Goal

Enable users to upload and share Photos (with captions) on VidNest. These "Posts" (internally `Tweets`) will support Likes and Comments, offering a community engagement feature alongside videos.

## Proposed Changes

### Backend

1.  **New Model**: `src/models/tweet.model.js`
    - Fields: `content` (string), `image` (string, Cloudinary URL), `owner` (Ref User), `likes` (number, default 0).
2.  **Update Models**:
    - `src/models/like.model.js`: Add `tweet` field (Ref Tweet). Add unique index for `[tweet, likedBy]`.
    - `src/models/comment.model.js`: Add `tweet` field (Ref Tweet). Make `video` field optional.
3.  **New Controller**: `src/controllers/tweet.controller.js`
    - `createTweet`: Handle image upload + create doc.
    - `getUserTweets`: Get posts for a specific user (channel feed).
    - `deleteTweet`: Remove post.
4.  **Update Controllers**:
    - `src/controllers/like.controller.js`: Add `toggleTweetLike`.
    - `src/controllers/comment.controller.js`: Update `addComment` to handle `tweetId` or `videoId`. Update `getVideoComments` (rename/refactor or add `getTweetComments`).
5.  **Routes**:
    - `src/routes/tweet.routes.js`: Define endpoints.
    - `src/app.js`: Mount tweet routes.

### Frontend

1.  **API Service**: `src/api/tweetApi.js`
    - `createTweet(data)`, `getUserTweets(userId)`, `toggleTweetLike(id)`.
2.  **Upload Page**:
    - Add "Post Type" toggle: **Video** vs **Photo**.
    - If Photo: Show file input for image + text area for caption.
3.  **Components**:
    - `TweetCard.jsx`: Stylized card to show the photo, caption, like/comment buttons.
    - `TweetList.jsx`: Grid/Masonry layout for posts.
4.  **Channel Page**:
    - Add "Community" tab.
    - Fetch and display `TweetList` there.

## Verification Plan

### Manual Verification

1.  **Upload**: Go to Upload Page -> Select Photo -> Upload -> Verify "Post Created".
2.  **View**: Go to User Profile -> Community Tab -> Verify Photo appears.
3.  **Interact**: Click Like on Photo -> Refresh -> Verify Like persists.
4.  **Comment**: Add comment on Photo -> Verify Comment appears.
