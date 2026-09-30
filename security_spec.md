# Security Specification & Threat Model: JODOH by A.I

## 1. Data Invariants
1. **Attendee Identity**: A participant document `/participants/{id}` can only be created by an authenticated user with verified credentials or by an authorized administrator (`isAdmin()`).
2. **Immutability of Ownership**: `ownerId` must remain identical during updates (`incoming().ownerId == existing().ownerId`).
3. **Attendee Payload Sanitization**: String limits are strictly bounded (e.g. `name` <= 150 chars, `ideal` <= 1000 chars, `photo` base64/URL <= 500,000 chars) to prevent Denial of Wallet attacks.
4. **Algorithmic Match Integrity**: Match results in `/matches/{id}` can only be written, updated, or removed by verified event administrators.
5. **Session Publication Isolation**: Archived match sessions in `/saved_match_sessions/{id}` are strictly draft/hidden from attendees until explicitly published (`isPublished == true`) by administrators. Unauthenticated or non-admin users cannot list draft sessions.
6. **Path Hardening**: Single document access paths must strictly validate against ID poisoning using alphanumeric/underscore/hyphen character constraints up to 128 characters (`isValidId()`).
7. **Strict Admin Verification**: Admin privileges require `request.auth.token.email_verified == true` matching bootstrapped admin emails (`hfirdaus2000@gmail.com` or `irfanhaikal03@gmail.com`) or presence in `/admins/{adminId}`.
8. **Catch-All Safety Net**: Default deny-all wildcard root match `match /{document=**} { allow read, write: if false; }`.

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)

1. **Unauthenticated Write**: Anonymous or unauthenticated write to `/participants/test1`.
2. **Spoofed Admin Email**: Attacker provides `email: 'hfirdaus2000@gmail.com'` with `email_verified: false` attempting to delete `/saved_match_sessions/session-1`.
3. **ID Poisoning Attack**: Document ID containing directory traversal or junk characters (`/participants/..%2Fhack`).
4. **Oversized Name Payload**: Creating participant with `name` exceeding 150 characters (e.g. 500 characters).
5. **Invalid Gender Enum**: Setting `gender: "Alien"` instead of `"Male"` or `"Female"`.
6. **Age Boundary Violation**: Participant with `age: 12` (minimum required is 18).
7. **Owner ID Hijack on Create**: Authenticated user `user-123` attempting to set `ownerId: 'user-999'`.
8. **Owner ID Hijack on Update**: Modifying existing participant to switch `ownerId` to another user.
9. **Attendee Write to Matches**: Non-admin participant attempting to write or inject into `/matches/{matchId}`.
10. **Draft Session Snooping**: Non-admin participant attempting to read `/saved_match_sessions/{sessionId}` where `isPublished: false`.
11. **Draft Session Creation**: Non-admin participant attempting to create a match session in `/saved_match_sessions`.
12. **Denial of Wallet Photo Bomb**: Attacker submitting `photo` payload string exceeding 500,000 characters.

## 3. Test Verification Matrix
All 12 dirty payloads are verified to fail against `firestore.rules` validation helpers (`isValidId`, `isValidParticipant`, `isValidMatch`, `isValidSavedSession`, and `isAdmin`).
