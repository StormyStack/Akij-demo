-- ==========================================================
-- Oracle Database ERP System Seed Data
-- ==========================================================

-- 1. Suppliers
INSERT INTO suppliers (name, code, contact_person, email, phone, city, payment_terms, status)
VALUES ('Apex Industrial Supplies Ltd', 'SUP-001', 'Rafiqul Islam', 'rafiqul@apexindustrial.com', '+880-1711-223344', 'Dhaka', 'Net 30', 'ACTIVE');

INSERT INTO suppliers (name, code, contact_person, email, phone, city, payment_terms, status)
VALUES ('Pacific Global Tech Corp', 'SUP-002', 'Tanvir Ahmed', 'tanvir@pacifictech.com', '+880-1819-556677', 'Chittagong', 'Net 15', 'ACTIVE');

INSERT INTO suppliers (name, code, contact_person, email, phone, city, payment_terms, status)
VALUES ('Bengal Packaging & Plastics', 'SUP-003', 'Farhana Yasmin', 'farhana@bengalpack.com', '+880-1912-334455', 'Gazipur', 'Net 45', 'ACTIVE');

-- 2. Customers
INSERT INTO customers (name, customer_code, contact_person, email, phone, city, credit_limit, status)
VALUES ('Dhaka Logistics & Distribution', 'CUST-101', 'Kamrul Hasan', 'kamrul@dhakalogistics.com', '+880-1715-998877', 'Dhaka', 75000.00, 'ACTIVE');

INSERT INTO customers (name, customer_code, contact_person, email, phone, city, credit_limit, status)
VALUES ('Meghna Retail Corporation', 'CUST-102', 'Shahidul Alam', 'shahidul@meghnaretail.com', '+880-1611-443322', 'Narayanganj', 120000.00, 'ACTIVE');

INSERT INTO customers (name, customer_code, contact_person, email, phone, city, credit_limit, status)
VALUES ('Karnafuli Trading International', 'CUST-103', 'Nasreen Sultana', 'nasreen@karnafulitrading.com', '+880-1817-665544', 'Chittagong', 90000.00, 'ACTIVE');

-- 3. Products / Items
INSERT INTO items (name, sku, category, unit_of_measure, cost_price, price, stock_quantity, reorder_level, supplier_id, description, status)
VALUES ('Heavy Duty Industrial Motor 5HP', 'PRD-MTR-5HP', 'Machinery', 'UNIT', 450.00, 680.00, 24, 8, 1, 'Three-phase 5HP AC induction motor with cast iron casing', 'ACTIVE');

INSERT INTO items (name, sku, category, unit_of_measure, cost_price, price, stock_quantity, reorder_level, supplier_id, description, status)
VALUES ('Corrugated Shipping Cartons (500 Pack)', 'PRD-BOX-500', 'Packaging', 'BUNDLE', 120.00, 185.00, 150, 40, 3, 'Heavy duty 5-ply export quality packaging boxes', 'ACTIVE');

INSERT INTO items (name, sku, category, unit_of_measure, cost_price, price, stock_quantity, reorder_level, supplier_id, description, status)
VALUES ('Enterprise Ethernet Switch 48-Port PoE', 'PRD-NET-SW48', 'Electronics', 'UNIT', 820.00, 1250.00, 12, 5, 2, 'Managed Gigabit PoE+ switch with 4x 10G SFP+ uplink ports', 'ACTIVE');

INSERT INTO items (name, sku, category, unit_of_measure, cost_price, price, stock_quantity, reorder_level, supplier_id, description, status)
VALUES ('Polypropylene Pellet Raw Resin (25kg)', 'PRD-RSN-PP25', 'Raw Materials', 'BAG', 38.00, 56.50, 4, 25, 3, 'Virgin grade injection molding polypropylene resin bag', 'ACTIVE'); -- Note: low stock!

INSERT INTO items (name, sku, category, unit_of_measure, cost_price, price, stock_quantity, reorder_level, supplier_id, description, status)
VALUES ('Precision Digital Caliper 150mm', 'PRD-TLS-CALP', 'Tools', 'PCS', 28.00, 48.00, 65, 15, 1, 'Stainless steel IP54 water resistant electronic vernier caliper', 'ACTIVE');

INSERT INTO items (name, sku, category, unit_of_measure, cost_price, price, stock_quantity, reorder_level, supplier_id, description, status)
VALUES ('Thermal Barcode Label Roll (1000 Labels)', 'PRD-LBL-1000', 'Packaging', 'ROLL', 6.50, 12.00, 3, 20, 3, 'Direct thermal self-adhesive 4x6 inch logistics labels', 'ACTIVE'); -- Note: low stock!

-- 4. Sales Orders
INSERT INTO sales_orders (order_number, customer_id, order_date, due_date, total_amount, status, payment_status, notes)
VALUES ('SO-2026-001', 1, SYSDATE - 5, SYSDATE + 10, 4260.00, 'APPROVED', 'PAID', 'Priority dispatch for warehouse expansion');

INSERT INTO sales_orders (order_number, customer_id, order_date, due_date, total_amount, status, payment_status, notes)
VALUES ('SO-2026-002', 2, SYSDATE - 2, SYSDATE + 7, 7400.00, 'PROCESSING', 'PARTIAL', 'Partial payment received. Awaiting packaging dispatch');

INSERT INTO sales_orders (order_number, customer_id, order_date, due_date, total_amount, status, payment_status, notes)
VALUES ('SO-2026-003', 3, SYSDATE - 1, SYSDATE + 14, 2500.00, 'PENDING', 'UNPAID', 'New purchase requisition submitted for verification');

INSERT INTO sales_orders (order_number, customer_id, order_date, due_date, total_amount, status, payment_status, notes)
VALUES ('SO-2026-004', 1, SYSDATE - 12, SYSDATE - 2, 11250.00, 'COMPLETED', 'PAID', 'Full order fulfilled and signed on delivery');

-- 5. Order Items
INSERT INTO order_items (order_id, item_id, quantity, unit_price, subtotal)
VALUES (1, 1, 4, 680.00, 2720.00);

INSERT INTO order_items (order_id, item_id, quantity, unit_price, subtotal)
VALUES (1, 2, 8, 185.00, 1480.00);

INSERT INTO order_items (order_id, item_id, quantity, unit_price, subtotal)
VALUES (2, 3, 4, 1250.00, 5000.00);

INSERT INTO order_items (order_id, item_id, quantity, unit_price, subtotal)
VALUES (2, 2, 12, 185.00, 2220.00);

COMMIT;
