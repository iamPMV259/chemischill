# ChemisChill — Project Description

## 1. Project Overview

**ChemisChill** is a web platform built for sharing **Chemistry learning materials**, with a main focus on **advanced/specialized Chemistry** and some support for standard Chemistry content.

The platform serves as a small learning community where:

- Admins can upload and manage Chemistry documents
- Users can preview and optionally download learning materials
- Admins can create quick community quizzes
- Users can join quizzes and appear on a leaderboard
- Users can create community questions with images
- Other users can comment and answer those questions, also with images
- Community questions must be **approved by an admin** before becoming public

The product should feel like a focused educational platform for Chemistry learners, especially students interested in advanced problem solving and specialized Chemistry topics.

---

## 2. Main Goals

The system should support these goals:

1. Build a document-sharing platform for Chemistry study resources
2. Allow community interaction through quizzes and Q&A
3. Keep moderation under admin control
4. Make the platform simple enough for an MVP, but structured so it can scale later

---

## 3. Core User Roles

There are 2 main roles:

### 3.1 Admin
Admin can:
- Upload study materials
- Set document permissions:
  - **view only**
  - **view + download**
- Manage uploaded materials
- Create quizzes for the community
- Review and approve/reject user-submitted community questions
- Moderate platform content

### 3.2 End User
End users can:
- Browse Chemistry documents
- Search and filter documents
- Preview documents
- Download documents if permission allows
- Participate in quizzes
- View leaderboard
- Submit community questions
- Upload images when posting questions
- Comment/answer other questions
- Upload images inside answers/comments

---

## 4. Functional Scope

## 4.1 Document Sharing

### Admin features
- Upload documents in these formats:
  - PDF
  - DOC / DOCX
  - Image files
- Add metadata for each document:
  - title
  - description
  - tags
  - optional category / topic
- Set permission for each document:
  - **view only**
  - **view and download**

### User features
- View document list
- Search documents by keyword
- Filter documents by tag
- Open document detail page
- Preview document directly on the website
- Download document only if admin enabled download permission

### Notes
- Since the platform is mainly for Chemistry materials, tags may include:
  - Organic Chemistry
  - Inorganic Chemistry
  - Physical Chemistry
  - Advanced Chemistry
  - Olympiad / Specialized Chemistry
  - Grade 10 / 11 / 12
  - Exam preparation
- The preview system should support PDFs and images nicely
- For DOC/DOCX, a fallback strategy may be needed:
  - show file info and download button if preview is difficult
  - or convert for preview if implemented later

---

## 4.2 Quiz Feature

### Admin features
- Create quick quizzes for the community
- Each quiz should contain:
  - title
  - description
  - multiple questions
  - answer options
  - correct answer
- A quiz may optionally contain explanation for answers
- Admin can publish/unpublish quizzes

### User features
- Browse available quizzes
- Start and complete quizzes
- Submit answers
- See result after submission

### Leaderboard
The platform should have a leaderboard that ranks users based on:

- users who completed the most quizzes

For MVP, leaderboard can be based primarily on:
- total number of quizzes completed

Possible future improvements:
- total score
- accuracy rate
- weekly / monthly rankings

---

## 4.3 Community Q&A Feature

### User question submission
Users can create a community question with:
- title
- text content / description
- optional image upload

However, user-submitted questions should **not become public immediately**.

### Admin moderation
Before a question is shown publicly:
- admin must review it
- admin can accept or reject it

Only **accepted** questions are visible to the community.

### Community interaction
For approved/public questions:
- other users can comment / answer
- answers/comments can include:
  - text
  - optional image upload

This allows Chemistry problem solving with equations, handwritten solutions, screenshots, or reaction images.

---

## 5. Suggested MVP Pages

The initial MVP should include at least these pages/screens.

## 5.1 Public/User Pages
1. **Home page**
   - intro to the platform
   - featured documents
   - featured quizzes
   - community section preview

2. **Document list page**
   - search
   - filter by tag
   - document cards/list

3. **Document detail page**
   - metadata
   - preview
   - download button if allowed

4. **Quiz list page**
   - available quizzes
   - quick access to start quiz

5. **Quiz taking page**
   - display questions and answer options
   - submit flow

6. **Quiz result page**
   - score/result summary

7. **Leaderboard page**
   - rank users by number of quizzes completed

8. **Community questions page**
   - list of approved questions

9. **Community question detail page**
   - question content
   - image if any
   - comments/answers
   - reply form with optional image upload

10. **Create question page**
   - form to submit question
   - note that admin approval is required

## 5.2 Admin Pages
1. **Admin dashboard**
   - summary counts:
     - total documents
     - total quizzes
     - pending questions

2. **Document management page**
   - upload documents
   - edit/delete documents
   - manage permission

3. **Quiz management page**
   - create/edit/publish quizzes

4. **Question moderation page**
   - view pending questions
   - accept/reject questions

---

## 6. Recommended Data Model (High Level)

This section is only a high-level guide for implementation.

### 6.1 User
Fields may include:
- id
- name or username
- phone number
- role (`admin` or `user`)
- created_at

### 6.2 Document
Fields may include:
- id
- title
- description
- file_url / storage path
- file_type
- preview_url (optional)
- permission_type (`view_only`, `view_download`)
- uploaded_by
- created_at
- updated_at

### 6.3 Tag
Fields may include:
- id
- name

### 6.4 DocumentTag
Many-to-many relation between documents and tags.

### 6.5 Quiz
Fields may include:
- id
- title
- description
- is_published
- created_by
- created_at

### 6.6 QuizQuestion
Fields may include:
- id
- quiz_id
- question_text
- question_image_url (optional)
- created_at

### 6.7 QuizOption
Fields may include:
- id
- question_id
- option_text
- is_correct

### 6.8 QuizSubmission
Fields may include:
- id
- user_id
- quiz_id
- score
- submitted_at

### 6.9 CommunityQuestion
Fields may include:
- id
- user_id
- title
- content
- image_url (optional)
- status (`pending`, `accepted`, `rejected`)
- reviewed_by (optional admin id)
- created_at

### 6.10 CommunityAnswer / Comment
Fields may include:
- id
- question_id
- user_id
- content
- image_url (optional)
- created_at

---

## 7. Main Workflows

## 7.1 Document Workflow
1. Admin uploads a document
2. Admin adds title, description, tags
3. Admin sets permission:
   - view only
   - view + download
4. Document becomes visible to users
5. User searches/browses document
6. User previews it
7. User downloads it only if allowed

## 7.2 Quiz Workflow
1. Admin creates quiz
2. Admin publishes quiz
3. User opens quiz list
4. User starts quiz
5. User submits answers
6. System stores result
7. Leaderboard updates based on quiz participation/completion

## 7.3 Community Question Workflow
1. User submits a question with optional image
2. Question status is set to `pending`
3. Admin reviews question
4. If accepted, question becomes public
5. Other users comment/answer with text and optional images

---

## 8. Non-Functional Requirements

### 8.1 Usability
- UI should be simple and clean
- Easy to browse documents and quizzes
- Community feature should be straightforward to use

### 8.2 Moderation
- Questions must not be published without admin approval
- Admin should have simple moderation tools

### 8.3 Storage
- The system must support file upload for:
  - documents
  - question images
  - answer/comment images

### 8.4 Performance
- Document list and quiz list should load efficiently
- Preview flow should be reasonably fast

### 8.5 Security
- Role-based access control:
  - admin-only features must be protected
- Users should not download files if permission is view-only
- Uploaded file handling should be validated properly

---

## 9. Suggested MVP Priorities

To keep development focused, prioritize implementation in this order:

### Phase 1
- Authentication
- Admin upload documents
- Document listing/search/filter
- Preview and permission-based download

### Phase 2
- Admin creates quizzes
- Users take quizzes
- Leaderboard based on quizzes completed

### Phase 3
- Community question submission
- Admin approval flow
- Comments/answers with image upload

---

## 10. Authentication Notes

The product idea mentions phone-number-based access. For MVP, implementation can be chosen depending on development speed.

Preferred:
- phone number login with OTP

Acceptable MVP alternative:
- simple email/password or mock auth during early development
- later replace with phone OTP authentication

But the final product direction should still support:
- **login by phone number**

---

## 11. Suggested UI Direction

The UI should feel:
- educational
- chemistry-focused
- modern and friendly
- lightweight and practical

Suggested style:
- clean cards
- clear tag system
- blue / white / light purple palette
- dashboard-like admin pages
- easy preview and file access flow

---

## 12. Out of Scope for Initial MVP

These features are not required in the first version unless time allows:
- advanced analytics
- reward/payment system for quizzes
- real-time notifications
- social messaging
- advanced recommendation engine
- OCR for Chemistry problems
- AI-generated answer support

---

## 13. Summary

ChemisChill is a Chemistry learning community platform centered around:

1. **Document sharing**
   - admin uploads Chemistry materials
   - users can view and optionally download based on permission

2. **Community quizzes**
   - admin creates quizzes
   - users participate
   - leaderboard ranks users by quiz activity

3. **Community Q&A**
   - users ask Chemistry questions with images
   - admin approves before publication
   - community users comment and answer with text and images

The goal is to deliver a clean MVP that is useful, easy to moderate, and ready for future expansion.
