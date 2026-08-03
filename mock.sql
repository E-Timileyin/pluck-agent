-- Mock tutorial material, for testing the flow before the real Drive links exist.
--   npx wrangler d1 execute pluck-training --local --file=./mock.sql
--
-- Points /learn at two local stand-in pages so the embeds render without Drive
-- sharing permissions, and shortens the gate so a full run takes a minute.
-- Paste the real links in Admin → Settings and this is overwritten.

UPDATE settings
   SET slides_url = '/mock-slides.html',
       video_url  = '/mock-video.html',
       min_tutorial_seconds = 10,
       updated_at = datetime('now')
 WHERE id = 1;
