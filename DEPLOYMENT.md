# Deploy ChemisChill

## Backend on Render

Repo đã có sẵn [render.yaml](/home/pmv259/Documents/freelance/chemischill/render.yaml).

Trên Render:

1. Chọn `New` -> `Blueprint`.
2. Kết nối repo này.
3. Render sẽ đọc `render.yaml` và tạo web service backend.
4. Tạm thời bạn chưa cần có domain Vercel thật ngay. Có 2 cách:

- Cách đơn giản nhất: deploy backend trước với `FRONTEND_URL` là một placeholder tạm, rồi sửa lại sau khi Vercel có domain
- Cách tốt hơn: sau khi tạo project trên Vercel, bạn sẽ biết ngay domain dạng `https://<project>.vercel.app`, kể cả trước khi app hoàn tất dùng production

5. Điền các biến môi trường còn thiếu:

```env
FRONTEND_URL=https://<your-vercel-domain>
FRONTEND_ORIGIN_REGEX=^https://.*\.vercel\.app$
DATABASE_URL=<your-postgres-url>
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-secret>
CLOUDINARY_CLOUD_NAME=<cloudinary-name>
CLOUDINARY_API_KEY=<cloudinary-key>
CLOUDINARY_API_SECRET=<cloudinary-secret>
R2_ACCOUNT_ID=<r2-account-id>
R2_ACCESS_KEY_ID=<r2-access-key-id>
R2_SECRET_ACCESS_KEY=<r2-secret-access-key>
R2_BUCKET=<r2-bucket>
R2_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
R2_PUBLIC_BASE_URL=https://<your-r2-public-domain>
```

6. Sau deploy đầu tiên, mở Shell của service và chạy:

```bash
alembic upgrade head
python seed.py
```

API URL thường có dạng:

```text
https://chemischill-backend.onrender.com
```

## Frontend on Vercel

Frontend nằm trong thư mục `FrontEnd/`.

Trên Vercel:

1. `Add New Project`
2. Import repo này
3. Set `Root Directory` = `FrontEnd`
4. Framework preset: `Vite`
5. Build command:

```bash
npm run build
```

6. Output directory:

```bash
dist
```

7. Thêm env. Có 2 kiểu cấu hình:

Kiểu 1, dùng URL đầy đủ:

```env
VITE_API_URL=https://<your-render-domain>
VITE_ADMIN_ZALO_URL=<optional-zalo-url>
VITE_ADMIN_ZALO_LABEL=Admin ChemisChill
```

Kiểu 2, dùng tách riêng protocol/domain/host/port:

```env
VITE_API_PROTOCOL=https
VITE_API_DOMAIN=<your-render-domain-without-https>
VITE_API_HOST=
VITE_API_PORT=
VITE_ADMIN_ZALO_URL=<optional-zalo-url>
VITE_ADMIN_ZALO_LABEL=Admin ChemisChill
```

Hoặc nếu bạn muốn cấu hình bằng host/port:

```env
VITE_API_PROTOCOL=http
VITE_API_HOST=127.0.0.1
VITE_API_PORT=8000
VITE_API_DOMAIN=
```

Repo đã có sẵn [FrontEnd/vercel.json](/home/pmv259/Documents/freelance/chemischill/FrontEnd/vercel.json) để rewrite route SPA về `index.html`.

## Production auth and CORS

Backend đã được chỉnh để chạy cross-domain:

- `CORS` cho phép `FRONTEND_URL`
- có thể cho phép preview domain qua `FRONTEND_ORIGIN_REGEX`
- refresh cookie trong production dùng:
  - `Secure=true`
  - `SameSite=None`

Điều này cần thiết khi frontend nằm ở `Vercel` và backend nằm ở `Render`.

## Recommended values

Nếu dùng domain mặc định:

```env
FRONTEND_URL=https://chemischill.vercel.app
FRONTEND_ORIGIN_REGEX=^https://.*\.vercel\.app$
VITE_API_URL=https://chemischill-backend.onrender.com
```

Nếu dùng custom domain:

```env
FRONTEND_URL=https://chemischill.vn
FRONTEND_ORIGIN_REGEX=
VITE_API_URL=https://api.chemischill.vn
```

## Deploy order

Thứ tự nên làm:

1. Deploy backend lên Render trước
2. Lấy backend URL từ Render, ví dụ `https://chemischill-backend.onrender.com`
3. Tạo project frontend trên Vercel và set env `VITE_API_URL` hoặc `VITE_API_DOMAIN`
4. Sau khi Vercel cấp domain thật, quay lại Render sửa:

```env
FRONTEND_URL=https://<your-vercel-domain>
FRONTEND_ORIGIN_REGEX=^https://.*\.vercel\.app$
```

Nếu lúc đầu chưa có frontend domain, có thể tạm set:

```env
FRONTEND_URL=https://placeholder.vercel.app
FRONTEND_ORIGIN_REGEX=^https://.*\.vercel\.app$
```

Rồi đổi lại sau. Cách này ổn vì backend đã hỗ trợ regex cho mọi subdomain `vercel.app`.
