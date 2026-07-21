INSERT INTO users (full_name, username, password, role, status, security_question, security_answer)
VALUES
('Quản trị viên', 'admin', '$2b$12$T.s4loLS.mLHQpbB0VieReIzhRjF6SXjQtU7b1sRGrXlHxj8KWxnS', 'admin', 'active', 'Tên quán cafe của bạn là gì?', '$2b$12$O1dOcLTWs2BXuneVAtVtuuC/Qy3rbm0VpzHvj92RoWe8SsbP5KbfS'),
('Nhân viên bán hàng', 'staff', '$2b$12$T.s4loLS.mLHQpbB0VieReIzhRjF6SXjQtU7b1sRGrXlHxj8KWxnS', 'staff', 'active', 'Thành phố bạn sống là gì?', '$2b$12$O1dOcLTWs2BXuneVAtVtuuC/Qy3rbm0VpzHvj92RoWe8SsbP5KbfS');

INSERT INTO store_settings (id, store_name, phone, address, contact_email, opening_time, closing_time)
VALUES (1, '', '', '', '', '', '');

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

INSERT INTO tables (name, capacity, floor, area, status, use_time)
VALUES
('Bàn T01', '2-4', 'Tầng 1', 'Khu trong nhà', 'empty', NULL),
('Bàn T02', '2-4', 'Tầng 1', 'Khu trong nhà', 'using', '00:45:12'),
('Bàn T03', '4-6', 'Tầng 1', 'Khu trong nhà', 'empty', NULL),
('Bàn T04', '2-4', 'Tầng 1', 'Khu trong nhà', 'maintenance', NULL),
('Bàn T05', '4-6', 'Tầng 1', 'Khu trong nhà', 'empty', NULL),
('Bàn T06', '2-4', 'Tầng 1', 'Khu trong nhà', 'using', '01:12:08'),
('Bàn T07', '6-8', 'Tầng 1', 'Khu trong nhà', 'empty', NULL),
('Bàn T08', '2-4', 'Tầng 1', 'Khu trong nhà', 'maintenance', NULL),
('Bàn T09', '2-4', 'Tầng 2', 'Khu ban công', 'empty', NULL),
('Bàn T10', '4-6', 'Tầng 2', 'Khu ban công', 'empty', NULL),
('Bàn T11', '2-4', 'Tầng 2', 'Khu ban công', 'using', '00:22:35');

INSERT INTO orders (table_id, user_id, total_amount, status, paid_at)
VALUES
(1, 1, 0, 'pending', NULL),
(2, 1, 0, 'paid', CURRENT_TIMESTAMP);

INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
VALUES
(1, 1, 2, 25000, 50000),
(2, 2, 1, 20000, 20000),
(2, 4, 1, 35000, 35000),
(2, 8, 2, 5000, 10000);
