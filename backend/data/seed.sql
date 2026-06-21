INSERT INTO users (full_name, username, password, role, status)
VALUES
('Quản trị viên', 'admin', '123456', 'admin', 'active'),
('Nhân viên bán hàng', 'staff', '123456', 'staff', 'active');

INSERT INTO categories (name, description)
VALUES
('Cafe', 'Các loại cafe'),
('Trà', 'Các loại trà'),
('Nước ép', 'Các loại nước ép'),
('Đồ ăn nhẹ', 'Bánh và đồ ăn nhẹ'),
('Topping', 'Các loại topping thêm');

INSERT INTO products (name, price, category_id, image, status)
VALUES
('Cà phê sữa', 25000, 1, NULL, 'active'),
('Cà phê đen', 20000, 1, NULL, 'active'),
('Bạc xỉu', 30000, 1, NULL, 'active'),
('Trà đào', 35000, 2, NULL, 'active'),
('Trà chanh', 25000, 2, NULL, 'active'),
('Nước cam', 30000, 3, NULL, 'active'),
('Bánh ngọt', 20000, 4, NULL, 'active'),
('Trân châu', 5000, 5, NULL, 'active');

INSERT INTO tables (name, status)
VALUES
('Bàn 1', 'empty'),
('Bàn 2', 'empty'),
('Bàn 3', 'empty'),
('Bàn 4', 'empty'),
('Bàn 5', 'empty'),
('Mang về', 'empty');

INSERT INTO orders (table_id, user_id, total_amount, status)
VALUES
(1, 1, 50000, 'pending'),
(2, 1, 75000, 'paid');

INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
VALUES
(1, 1, 2, 25000, 50000),
(2, 2, 1, 20000, 20000),
(2, 4, 1, 35000, 35000),
(2, 8, 2, 5000, 10000);