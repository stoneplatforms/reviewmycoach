-- Delete kevinvera test accounts from Firebase DataConnect
-- Run this in Firebase DataConnect SQL shell: firebase dataconnect:sql:shell

DELETE FROM coaches WHERE username IN ('kevinvera1', 'kevinvera2', 'kevinvera3', 'kevinvera4', 'kevinvera5', 'kevinvera6', 'kevinvera7');

-- Verify deletion
SELECT username, display_name, email FROM coaches WHERE username LIKE 'kevinvera%';
