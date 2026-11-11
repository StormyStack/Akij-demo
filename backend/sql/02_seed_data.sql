-- ==========================================================
-- Oracle Database 3-Tier Demo Initial Seed Data
-- ==========================================================

INSERT INTO items (name, sku, category, price, stock_quantity, description, status) 
VALUES ('Dell UltraSharp 27" 4K Monitor', 'MON-DEL-4K27', 'Electronics', 449.99, 28, '4K UHD IPS display with USB-C Hub and HDR400', 'ACTIVE');

INSERT INTO items (name, sku, category, price, stock_quantity, description, status) 
VALUES ('Logitech MX Master 3S Wireless Mouse', 'ACC-LOG-MX3S', 'Accessories', 99.99, 65, 'Quiet clicks with 8K DPI sensor and ergonomic thumb scroll', 'ACTIVE');

INSERT INTO items (name, sku, category, price, stock_quantity, description, status) 
VALUES ('Keychron Q1 Pro Mechanical Keyboard', 'KEY-KCH-Q1P', 'Peripherals', 199.00, 18, 'Custom wireless QMK/VIA gasket-mounted mechanical keyboard', 'ACTIVE');

INSERT INTO items (name, sku, category, price, stock_quantity, description, status) 
VALUES ('Sony WH-1000XM5 Noise Canceling Headphones', 'AUD-SNY-XM5', 'Audio', 398.00, 42, 'Industry leading noise cancellation with auto NC optimizer', 'ACTIVE');

INSERT INTO items (name, sku, category, price, stock_quantity, description, status) 
VALUES ('Ergonomic Mesh Office Chair', 'FUR-ERG-OC01', 'Furniture', 320.50, 15, 'Breathable mesh high-back chair with adjustable lumbar support', 'ACTIVE');

INSERT INTO items (name, sku, category, price, stock_quantity, description, status) 
VALUES ('Electric Standing Desk 60x30', 'FUR-DSK-ESD60', 'Furniture', 540.00, 8, 'Dual-motor motorized standing desk with programmable memory presets', 'ACTIVE');

INSERT INTO items (name, sku, category, price, stock_quantity, description, status) 
VALUES ('Anker 737 Power Bank (PowerCore 24K)', 'PWR-ANK-737', 'Accessories', 149.99, 50, '140W fast-charging portable power bank with smart digital display', 'ACTIVE');

INSERT INTO items (name, sku, category, price, stock_quantity, description, status) 
VALUES ('Apple MacBook Pro 16" M3 Max', 'LAP-APL-MBP16', 'Computers', 3499.00, 5, 'Space Black, 36GB Unified Memory, 1TB SSD Storage', 'ACTIVE');

COMMIT;
