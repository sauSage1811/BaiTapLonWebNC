# Coffee Management System

Dự án **Coffee Management System** là website quản lý bán cafe được xây dựng bằng **React + Vite** cho frontend và **Express.js + SQLite** cho backend.

Hệ thống hỗ trợ quản lý các chức năng cơ bản như đăng nhập, phân quyền, quản lý danh mục đồ uống, quản lý sản phẩm, quản lý bàn và nền tảng cho các chức năng bán hàng.

## Công nghệ sử dụng

### Frontend

* React
* Vite
* React Router DOM
* Axios
* CSS thuần

### Backend

* Node.js
* Express.js
* SQLite
* JSON Web Token

## Chức năng chính

### Phần quản trị

* Đăng nhập / đăng xuất
* Phân quyền Admin / Nhân viên
* Quản lý danh mục đồ uống
* Quản lý sản phẩm
* Quản lý bàn
* Giao diện dashboard quản trị
* Sidebar có thể đóng / mở
* Lưu token đăng nhập bằng localStorage

### Phần mở rộng

* Tạo đơn hàng
* Thêm món vào đơn hàng
* Thanh toán đơn hàng
* Tìm kiếm sản phẩm
* Thống kê doanh thu

## Cấu trúc thư mục

```txt
coffee-management/
├─ backend/
│  ├─ config/
│  ├─ controllers/
│  ├─ data/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ app.js
│  └─ package.json
│
├─ frontend/
│  ├─ public/
│  ├─ src/
│  │  ├─ assets/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ hooks/
│  │  ├─ layouts/
│  │  ├─ pages/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ App.jsx
│  │  ├─ main.jsx
│  │  └─ index.css
│  └─ package.json
│
└─ README.md
```

## Database

Dự án sử dụng SQLite. File database nằm tại:

```txt
backend/data/coffee.sqlite
```

Các bảng chính:

```txt
users
categories
products
tables
orders
order_items
```

## Tài khoản đăng nhập mẫu

### Admin

```txt
Username: admin
Password: 123456
```

### Nhân viên

```txt
Username: staff
Password: 123456
```

## Cách chạy dự án

### 1. Clone project

```bash
git clone https://github.com/sauSage1811/BaiTapLonWebNC.git
cd BaiTapLonWebNC
```

### 2. Chạy backend

```bash
cd backend
npm install
npm run dev
```

Backend chạy tại:

```txt
http://localhost:3000
```

Test API:

```txt
http://localhost:3000/api
```

### 3. Chạy frontend

Mở terminal mới:

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại:

```txt
http://localhost:5173
```

## Một số API chính

### Auth

```txt
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Products

```txt
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Categories

```txt
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Tables

```txt
GET    /api/tables
GET    /api/tables/:id
POST   /api/tables
PUT    /api/tables/:id
DELETE /api/tables/:id
```

## Mô tả dự án

Hệ thống được xây dựng nhằm hỗ trợ quán cafe quản lý hoạt động bán hàng cơ bản. Admin có thể đăng nhập vào hệ thống để quản lý danh mục, sản phẩm và bàn. Nhân viên có thể sử dụng hệ thống để phục vụ các nghiệp vụ bán hàng như tạo đơn, thêm món và thanh toán.

Dự án được tổ chức theo hướng tách riêng frontend và backend. Frontend sử dụng React để xây dựng giao diện người dùng, backend sử dụng Express.js để xây dựng REST API, dữ liệu được lưu trong SQLite.

## Thành viên thực hiện

```txt
Nguyễn Thành Đại Sơn
Cao Văn An
```

## Ghi chú

Dự án phục vụ mục đích học tập môn Thiết kế web nâng cao.
