# Missing Backend APIs

File này tổng hợp các button, luồng UI, và phần thông tin trên frontend hiện vẫn chưa thể chạy thật hoàn toàn vì backend chưa có API tương ứng, hoặc API hiện có chưa đủ dữ liệu cho màn hình.

## 1. Button/Flow đang thiếu API backend

| UI / Button | Screen bị ảnh hưởng | Backend thiếu gì |
| --- | --- | --- |
| `Quên mật khẩu?` | `FrontEnd/src/app/pages/user/LoginPage.tsx` -> `ForgotPasswordPage.tsx` | API yêu cầu reset password, gửi OTP/email reset, xác minh token reset, đổi mật khẩu mới |
| `Liên Hệ` / `Gửi Email` giảng viên | `FrontEnd/src/app/pages/user/TeacherProfilePage.tsx` -> `TeacherContactPage.tsx` | API gửi contact form tới giảng viên, tạo cuộc hội thoại, hoặc tạo lịch hẹn |
| `Lưu` tài liệu | `FrontEnd/src/app/pages/user/DocumentDetailPage.tsx` -> `SavedItemsPage.tsx` | API bookmark/save document, bỏ save, lấy danh sách tài liệu đã lưu của user |
| Tab `Saved` trong hồ sơ người dùng | `FrontEnd/src/app/pages/user/UserProfilePage.tsx` | Cùng nhóm API bookmark/save document ở trên |
| Chia sẻ kết quả quiz | `FrontEnd/src/app/pages/user/QuizResultPage.tsx` -> `QuizSharePage.tsx` | API tạo public share token/link, metadata chia sẻ, hoặc trang public cho kết quả quiz |

## 2. Phần thông tin frontend chưa có dữ liệu thật vì backend chưa đủ API

| Phần thông tin | Screen bị ảnh hưởng | API còn thiếu / chưa đủ |
| --- | --- | --- |
| Danh sách giảng viên | `FrontEnd/src/app/pages/user/AboutPage.tsx` | API list teachers/instructors |
| Hồ sơ giảng viên chi tiết | `FrontEnd/src/app/pages/user/TeacherProfilePage.tsx` | API teacher detail, education, achievements, contact metadata |
| Preview tài liệu thật trên web | `FrontEnd/src/app/pages/user/DocumentDetailPage.tsx` | API hoặc field `preview_url`/viewer source cho PDF/image/DOCX; hiện UI chỉ có khung placeholder |
| Tài liệu đã tải của user | `FrontEnd/src/app/pages/user/UserProfilePage.tsx` | API download history / document activity history |
| Quiz history của user | `FrontEnd/src/app/pages/user/UserProfilePage.tsx` | API danh sách submission theo user, điểm gần nhất, thời gian làm bài |
| Câu hỏi đã đăng của chính user | `FrontEnd/src/app/pages/user/UserProfilePage.tsx` | API community questions theo `user_id`, kể cả pending/rejected của chính user |
| Hoạt động public của user khác | `FrontEnd/src/app/pages/user/PublicProfilePage.tsx` | API public profile activity: quiz gần đây, câu hỏi public của user |
| Kết quả quiz khi reload trang `/quizzes/:id/result` | `FrontEnd/src/app/pages/user/QuizResultPage.tsx` | Backend có `GET /quizzes/:id/submissions/me` cho latest submission, nhưng chưa có API lấy đầy đủ payload review tương thích với state hiện tại hoặc lịch sử nhiều lần làm bài |
| Xem nhiều lần làm quiz / lịch sử làm bài | `FrontEnd/src/app/pages/user/PublicProfilePage.tsx`, `UserProfilePage.tsx` | API list quiz submissions theo user |

## 3. Chỗ UI đang lệch với backend hiện tại

| Vấn đề | Screen bị ảnh hưởng | Ghi chú |
| --- | --- | --- |
| UI nói hỗ trợ `Email hoặc Số Điện Thoại` khi đăng nhập/đăng ký | `LoginPage.tsx`, `RegisterPage.tsx` | Backend auth hiện chỉ có email/password. Chưa có phone login hoặc OTP flow |
| Ý tưởng sản phẩm ưu tiên phone OTP | Toàn bộ auth flow | Backend chưa có API OTP send/verify/login/register bằng số điện thoại |
| Profile setup hiện là flow onboarding nhưng không có endpoint riêng | `ProfileSetupPage.tsx` | Có thể dùng lại `PATCH /users/me`, nhưng hiện chưa có API/onboarding status riêng nếu muốn bắt buộc hoàn tất hồ sơ |

## 4. Những API backend đã có rồi, không thiếu

Các phần dưới đây hiện đã có API và frontend đã nối được:

- Auth cơ bản: login, register, refresh, logout
- User: `get me`, `update me`, upload avatar, public profile cơ bản, leaderboard
- Documents: list, featured, detail, increment view, download URL, admin CRUD cơ bản
- Quizzes: list, featured, take quiz, submit quiz, latest submission, admin CRUD/publish/duplicate/delete
- Community: list question, detail, answers, create question, create answer, upvote, admin moderation
- Tags và categories: list + admin CRUD
- Admin users/statistics cơ bản

## 5. Screen placeholder đã thêm để hoàn thiện click flow

- `FrontEnd/src/app/pages/user/ForgotPasswordPage.tsx`
- `FrontEnd/src/app/pages/user/TeacherContactPage.tsx`
- `FrontEnd/src/app/pages/user/SavedItemsPage.tsx`
- `FrontEnd/src/app/pages/user/QuizSharePage.tsx`

Các screen này mới chỉ là UI placeholder, chờ backend có API thật để hoàn thiện chức năng.
