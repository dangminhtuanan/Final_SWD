# Deploy len Vercel

Du an nay nen deploy thanh 2 project rieng:

1. `backend` tren Vercel
2. `frontend` tren Vercel

## Backend

- Tao mot project moi tren Vercel voi `Root Directory = backend`
- Backend da duoc tach thanh Express app tai `backend/src/app.js`, phu hop de Vercel detect va deploy
- Dat Node.js version la `22.x`
- Khai bao bien moi truong theo `backend/.env.example`

Bien quan trong nhat:

- `MONGODB_CONNECTIONSTRING`
- `JWT_SECRET`
- `CORS_ORIGINS=https://your-frontend-project.vercel.app,http://localhost:5173`
- `VNPAY_RETURN_URL=https://your-frontend-project.vercel.app/payment/vnpay-return`
- `GEMINI_API_KEY` neu co dung chatbot AI
- `EMAIL_*` neu can gui email

Sau khi deploy, luu lai URL backend, vi du:

`https://your-backend-project.vercel.app`

Kiem tra nhanh:

- `https://your-backend-project.vercel.app/`
- `https://your-backend-project.vercel.app/api/products`
- `https://your-backend-project.vercel.app/swagger`

## Frontend

- Tao project thu hai tren Vercel voi `Root Directory = frontend`
- Dat bien moi truong:

`VITE_API_URL=https://your-backend-project.vercel.app/api`

- File `frontend/vercel.json` da them rewrite cho React Router, nen refresh cac route nhu `/profile` hay `/admin/dashboard` se khong bi 404

## Sau khi deploy

- Quay lai backend va cap nhat `CORS_ORIGINS` bang domain frontend that
- Neu dung VNPay, dam bao dashboard/config cua VNPay cung tro toi:

`https://your-frontend-project.vercel.app/payment/vnpay-return`

## Gioi han can biet

- `node-cron` khong phu hop de xem nhu tien trinh chay thuong truc tren Vercel serverless
- Chuc nang tu dong doi trang thai don hang tu `delivered` sang `completed` sau 2 ngay hien chi nen xem la dung cho local/server thuong truc
- Neu muon giu chuc nang nay tren production, can doi sang Vercel Cron hoac mot scheduler ngoai
