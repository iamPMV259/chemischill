# Deploy ChemisChill

## Backend on Render

Repo đã có sẵn [render.yaml](/home/pmv259/Documents/freelance/chemischill/render.yaml).

Trên Render:

1. Chọn `New` -> `Blueprint`.
2. Kết nối repo này.
3. Render sẽ đọc `render.yaml` và tạo web service backend.
4. Điền các biến môi trường còn thiếu:

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

5. Sau deploy đầu tiên, mở Shell của service và chạy:

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

7. Thêm env:

```env
VITE_API_URL=https://<your-render-domain>
VITE_ADMIN_ZALO_URL=<optional-zalo-url>
VITE_ADMIN_ZALO_LABEL=Admin ChemisChill
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
