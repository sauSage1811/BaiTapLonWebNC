# Cafe PKA Management System

Hệ thống quản lý bán hàng dành cho quán cafe, được xây dựng theo mô hình tách biệt frontend và backend. Dự án cung cấp các nghiệp vụ quản lý danh mục, sản phẩm, bàn, đơn hàng, thanh toán, lịch sử hóa đơn và doanh thu với cơ chế xác thực JWT và phân quyền Admin/Nhân viên.

Dự án được thực hiện phục vụ môn Thiết kế Web nâng cao.

## 1. Tổng quan

Cafe PKA Management System hỗ trợ hai nhóm người dùng:

- Admin: quản lý toàn bộ dữ liệu hệ thống và theo dõi doanh thu.
- Nhân viên: tạo đơn, thêm món, thanh toán và xem lịch sử đơn hàng.

Hệ thống sử dụng React để xây dựng giao diện, Express.js để cung cấp REST API và SQLite để lưu trữ dữ liệu.

## 2. Chức năng chính

### Xác thực và tài khoản

- Đăng nhập và đăng xuất.
- Đăng ký tài khoản nhân viên hoặc Admin.
- Bảo vệ tài khoản Admin bằng mã mời `ADMIN_INVITE_CODE`.
- Khôi phục mật khẩu thông qua câu hỏi bảo mật.
- Mã hóa mật khẩu và câu trả lời bảo mật bằng bcrypt.
- Xác thực phiên đăng nhập bằng JSON Web Token.
- Tự động kiểm tra thông tin người dùng khi tải lại trang.

### Phân quyền

| Chức năng | Admin | Nhân viên |
|---|:---:|:---:|
| Dashboard | Có | Có |
| Tạo và xử lý đơn hàng | Có | Có |
| Xem lịch sử đơn hàng | Có | Có |
| Quản lý danh mục | Có | Không |
| Quản lý sản phẩm | Có | Không |
| Quản lý bàn | Có | Không |
| Xem doanh thu | Có | Không |

Việc phân quyền được kiểm tra ở cả frontend và backend. Các API thay đổi dữ liệu quản trị đều yêu cầu tài khoản có vai trò `admin`.

### Quản lý danh mục

- Xem danh sách danh mục.
- Thêm, sửa và xóa danh mục.
- Kiểm tra tên danh mục trùng lặp không phân biệt chữ hoa, chữ thường và khoảng trắng.
- Không cho phép xóa danh mục đang được sản phẩm sử dụng.

### Quản lý sản phẩm

- Xem danh sách sản phẩm kèm tên danh mục.
- Thêm, sửa và xóa sản phẩm.
- Tìm kiếm và lọc sản phẩm trên giao diện.
- Quản lý giá bán, hình ảnh và trạng thái hiển thị.
- Hỗ trợ hai trạng thái `active` và `inactive`.

### Quản lý bàn

- Xem danh sách và thống kê số lượng bàn theo trạng thái.
- Thêm, sửa và xóa bàn.
- Quản lý tên bàn, sức chứa, tầng, khu vực và thời gian sử dụng.
- Hỗ trợ ba trạng thái:
  - `empty`: bàn trống.
  - `using`: đang sử dụng.
  - `maintenance`: đang bảo trì.

### Quản lý đơn hàng

- Chọn bàn trống để tạo đơn.
- Tự động chuyển bàn sang trạng thái `using` sau khi tạo đơn.
- Thêm sản phẩm vào đơn hàng.
- Tăng, giảm hoặc xóa món trong đơn đang chờ thanh toán.
- Tự động tính lại tổng tiền sau mỗi thay đổi.
- Xem chi tiết đơn hàng.
- Thanh toán bằng tiền mặt hoặc mã QR trên giao diện.
- Hủy đơn hàng.
- Tự động trả bàn về trạng thái `empty` sau khi thanh toán hoặc hủy đơn.
- Xem lịch sử đơn đã thanh toán và đơn đang chờ xử lý.

### Doanh thu

- Tổng hợp doanh thu từ các đơn có trạng thái `paid`.
- Hiển thị số đơn đã thanh toán.
- Lọc và tổng hợp dữ liệu doanh thu từ lịch sử đơn hàng.
- Chỉ Admin được phép truy cập trang doanh thu và API thống kê.

## 3. Quy trình nghiệp vụ đơn hàng

```text
Bàn trống
   ↓
Tạo đơn hàng
   ↓
Bàn chuyển sang đang sử dụng
   ↓
Thêm / sửa / xóa món
   ↓
Đơn ở trạng thái pending
   ↓
Thanh toán hoặc hủy đơn
   ↓
Đơn chuyển sang paid hoặc cancelled
   ↓
Bàn trở lại trạng thái empty
```

Một bàn không thể tạo thêm đơn mới khi đang có đơn `pending`. Chỉ đơn đang chờ thanh toán mới được phép thay đổi danh sách món.

## 4. Công nghệ sử dụng

### Frontend

- React 19
- Vite 8
- React Router DOM 7
- Axios
- CSS thuần
- Context API

### Backend

- Node.js
- Express.js 5
- SQLite3
- JSON Web Token
- bcrypt
- CORS
- dotenv
- nodemon

### Cơ sở dữ liệu

- SQLite
- Foreign key constraints
- Indexes
- Trigger tự động đồng bộ tổng tiền đơn hàng
- Transaction cho các nghiệp vụ đơn hàng quan trọng

## 5. Kiến trúc dự án

```text
BaiTapLonWebNC-an2/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── revenueController.js
│   │   └── tableController.js
│   ├── data/
│   │   ├── coffee.sqlite
│   │   ├── initDatabase.js
│   │   ├── runMigrations.js
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env.example
│   ├── app.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

Backend được tổ chức theo hướng Route → Controller → Model → Database. Frontend được chia theo Page, Component, Layout, Context, Hook và Service.

## 6. Thiết kế cơ sở dữ liệu

File cơ sở dữ liệu mặc định:

```text
backend/data/coffee.sqlite
```

Các bảng chính:

| Bảng | Mục đích |
|---|---|
| `users` | Lưu tài khoản, vai trò, trạng thái và thông tin bảo mật |
| `categories` | Lưu danh mục đồ uống và món ăn |
| `products` | Lưu sản phẩm, giá bán, danh mục và trạng thái |
| `tables` | Lưu thông tin và trạng thái bàn |
| `orders` | Lưu đơn hàng, nhân viên tạo đơn, tổng tiền và trạng thái |
| `order_items` | Lưu các sản phẩm thuộc từng đơn hàng |

Quan hệ chính:

```text
categories 1 ─── n products
users      1 ─── n orders
tables     1 ─── n orders
orders     1 ─── n order_items
products   1 ─── n order_items
```

Tổng tiền trong bảng `orders` được tính từ tổng `subtotal` của các bản ghi `order_items`. SQLite trigger tự động cập nhật tổng tiền khi thêm, sửa hoặc xóa món.

## 7. Yêu cầu môi trường

Cần cài đặt:

- Node.js 18 trở lên.
- npm.
- Git nếu chạy dự án từ repository.

Khuyến nghị sử dụng Node.js 20 LTS hoặc mới hơn.

## 8. Cài đặt và chạy dự án

### Bước 1: Clone repository

```bash
git clone https://github.com/sauSage1811/BaiTapLonWebNC.git
cd BaiTapLonWebNC
```

Nếu đang sử dụng source code tải trực tiếp, chỉ cần giải nén và mở thư mục dự án.

### Bước 2: Cấu hình backend

Di chuyển vào thư mục backend:

```bash
cd backend
```

Cài đặt thư viện:

```bash
npm install
```

Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

Trên Windows Command Prompt:

```cmd
copy .env.example .env
```

Cấu hình file `backend/.env`:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
ADMIN_INVITE_CODE=replace_with_admin_invite_code
BCRYPT_SALT_ROUNDS=12
```

Hai biến `JWT_SECRET` và `ADMIN_INVITE_CODE` là bắt buộc. Backend sẽ không khởi động nếu thiếu một trong hai biến này.

### Bước 3: Khởi tạo cơ sở dữ liệu

Chạy lệnh sau khi cài đặt project lần đầu hoặc khi muốn tạo lại toàn bộ dữ liệu mẫu:

```bash
npm run db:init
```

Cảnh báo: lệnh này chạy lại schema, xóa các bảng hiện có và tạo lại dữ liệu mẫu.

Nếu chỉ cần chạy các migration có sẵn:

```bash
npm run db:migrate
```

### Bước 4: Khởi động backend

Chế độ phát triển:

```bash
npm run dev
```

Hoặc chế độ thông thường:

```bash
npm start
```

Backend mặc định chạy tại:

```text
http://localhost:3000
```

### Bước 5: Cấu hình frontend

Mở terminal mới và di chuyển vào thư mục frontend:

```bash
cd frontend
npm install
```

Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

Trên Windows Command Prompt:

```cmd
copy .env.example .env
```

Nội dung mặc định:

```env
VITE_API_URL=http://localhost:3000/api
```

### Bước 6: Khởi động frontend

```bash
npm run dev
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

## 9. Tài khoản dữ liệu mẫu

Sau khi chạy `npm run db:init`, hệ thống tạo hai tài khoản:

| Vai trò | Tên đăng nhập | Mật khẩu |
|---|---|---|
| Admin | `admin` | `123456` |
| Nhân viên | `staff` | `123456` |

Các tài khoản này chỉ phục vụ chạy thử trong môi trường học tập. Nên đổi mật khẩu và thông tin bảo mật trước khi sử dụng ở môi trường khác.

Lưu ý: quy tắc đăng ký tài khoản mới yêu cầu mật khẩu có ít nhất 8 ký tự, bao gồm chữ cái và chữ số.

## 10. REST API

Base URL mặc định:

```text
http://localhost:3000/api
```

Các endpoint yêu cầu xác thực phải gửi JWT theo header:

```http
Authorization: Bearer <access_token>
```

### Authentication

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/auth/login` | Công khai | Đăng nhập |
| POST | `/auth/register` | Công khai | Đăng ký tài khoản |
| POST | `/auth/forgot-password` | Công khai | Lấy câu hỏi bảo mật |
| POST | `/auth/reset-password` | Công khai | Đặt lại mật khẩu |
| GET | `/auth/me` | Đã đăng nhập | Lấy thông tin tài khoản hiện tại |
| POST | `/auth/logout` | Công khai | Kết thúc phiên phía client |

### Categories

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/categories` | Đã đăng nhập | Lấy danh sách danh mục |
| GET | `/categories/:id` | Đã đăng nhập | Lấy chi tiết danh mục |
| POST | `/categories` | Admin | Tạo danh mục |
| PUT | `/categories/:id` | Admin | Cập nhật danh mục |
| DELETE | `/categories/:id` | Admin | Xóa danh mục |

### Products

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/products` | Đã đăng nhập | Lấy danh sách sản phẩm |
| GET | `/products/:id` | Đã đăng nhập | Lấy chi tiết sản phẩm |
| POST | `/products` | Admin | Tạo sản phẩm |
| PUT | `/products/:id` | Admin | Cập nhật sản phẩm |
| DELETE | `/products/:id` | Admin | Xóa sản phẩm |

### Tables

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/tables` | Đã đăng nhập | Lấy danh sách bàn |
| GET | `/tables/:id` | Đã đăng nhập | Lấy chi tiết bàn |
| POST | `/tables` | Admin | Tạo bàn |
| PUT | `/tables/:id` | Admin | Cập nhật bàn |
| PUT | `/tables/:id/status` | Đã đăng nhập | Cập nhật trạng thái bàn |
| DELETE | `/tables/:id` | Admin | Xóa bàn |

### Orders

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/orders` | Đã đăng nhập | Lấy danh sách đơn; hỗ trợ `table_id` |
| GET | `/orders/history` | Đã đăng nhập | Lấy lịch sử đơn hàng |
| GET | `/orders/:id` | Đã đăng nhập | Lấy chi tiết đơn hàng |
| POST | `/orders` | Đã đăng nhập | Tạo đơn cho một bàn |
| POST | `/orders/:id/items` | Đã đăng nhập | Thêm món vào đơn |
| PATCH | `/orders/:id/items/:itemId` | Đã đăng nhập | Cập nhật số lượng món |
| DELETE | `/orders/:id/items/:itemId` | Đã đăng nhập | Xóa món khỏi đơn |
| POST | `/orders/:id/pay` | Đã đăng nhập | Thanh toán đơn |
| POST | `/orders/:id/cancel` | Đã đăng nhập | Hủy đơn |
| DELETE | `/orders/:id` | Đã đăng nhập | Hủy đơn theo endpoint tương thích |

### Analytics

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/analytics/revenue` | Admin | Lấy tổng doanh thu từ các đơn đã thanh toán |

## 11. Các route chính của frontend

| Route | Quyền | Trang |
|---|---|---|
| `/login` | Công khai | Đăng nhập |
| `/register` | Công khai | Đăng ký |
| `/forgot-password` | Công khai | Khôi phục mật khẩu |
| `/dashboard` | Đã đăng nhập | Tổng quan hệ thống |
| `/create-order` | Đã đăng nhập | Chọn bàn và tạo đơn |
| `/orders/:orderId/add-item` | Đã đăng nhập | Thêm món vào đơn |
| `/orders/:orderId/payment` | Đã đăng nhập | Thanh toán đơn |
| `/orders/history` | Đã đăng nhập | Lịch sử hóa đơn |
| `/categories` | Admin | Quản lý danh mục |
| `/products` | Admin | Quản lý menu |
| `/tables` | Admin | Quản lý bàn |
| `/revenue` | Admin | Quản lý doanh thu |

## 12. Các lệnh npm

### Backend

| Lệnh | Mô tả |
|---|---|
| `npm start` | Chạy server bằng Node.js |
| `npm run dev` | Chạy server bằng nodemon |
| `npm run db:init` | Tạo lại database và dữ liệu mẫu |
| `npm run db:migrate` | Chạy các migration dữ liệu |

### Frontend

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy Vite development server |
| `npm run build` | Build frontend cho production |
| `npm run preview` | Xem thử bản build |
| `npm run lint` | Kiểm tra mã nguồn bằng ESLint |

## 13. Kiểm tra nhanh hệ thống

Sau khi khởi động backend và frontend:

1. Truy cập `http://localhost:5173`.
2. Đăng nhập bằng tài khoản Admin hoặc Nhân viên.
3. Kiểm tra Dashboard tải được dữ liệu.
4. Chọn một bàn trống tại trang Tạo đơn hàng.
5. Thêm sản phẩm vào đơn.
6. Kiểm tra tổng tiền được cập nhật đúng.
7. Thanh toán đơn.
8. Xác nhận bàn trở lại trạng thái trống.
9. Kiểm tra hóa đơn xuất hiện trong lịch sử.
10. Đăng nhập Admin và kiểm tra trang doanh thu.

## 14. Lưu ý bảo mật và triển khai

- Không commit file `.env` lên GitHub.
- Không sử dụng giá trị mẫu cho `JWT_SECRET` và `ADMIN_INVITE_CODE` ở môi trường thật.
- Không sử dụng tài khoản seed cho hệ thống production.
- File `coffee.sqlite` hiện được loại trừ khỏi Git bởi `.gitignore`; khi clone mới cần chạy `npm run db:init`.
- JWT đang được lưu phía client, vì vậy cần hạn chế chèn script không tin cậy để giảm nguy cơ XSS.
- Endpoint logout hiện không thu hồi JWT ở server; client thực hiện xóa token cục bộ.
- Cần cấu hình đúng `FRONTEND_URL` khi triển khai frontend sang domain khác.
- Nên bổ sung HTTPS, rate limiting, logging, test tự động và cơ chế refresh token trước khi triển khai thực tế.

## 15. Hạn chế hiện tại

- Chưa có bộ test tự động cho frontend và backend.
- Chưa có tài liệu OpenAPI/Swagger.
- Phương thức thanh toán được chọn trên giao diện nhưng chưa được lưu thành trường riêng trong database.
- Trang doanh thu hiện chủ yếu tổng hợp từ lịch sử đơn hàng phía frontend; backend mới cung cấp API tổng doanh thu cơ bản.
- Chưa có chức năng quản lý danh sách tài khoản trong giao diện Admin.
- Chưa có quy trình triển khai production và CI/CD.

## 16. Thành viên thực hiện

- Nguyễn Thành Đại Sơn
- Cao Văn An

## 17. Mục đích sử dụng

Dự án được phát triển cho mục đích học tập và thực hành các nội dung:

- Xây dựng Single Page Application bằng React.
- Thiết kế REST API bằng Express.js.
- Xác thực và phân quyền người dùng.
- Thiết kế cơ sở dữ liệu quan hệ bằng SQLite.
- Tổ chức dự án frontend/backend độc lập.
- Xử lý nghiệp vụ bán hàng và quản lý trạng thái dữ liệu.
