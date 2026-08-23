USE krest_center_db;

INSERT INTO users (name,email,password_hash,phone,role,status)
VALUES
('Myo Min','seller1@example.com','not-for-login-seed','09111111111','SELLER','ACTIVE'),
('Su Su','seller2@example.com','not-for-login-seed','09222222222','SELLER','ACTIVE'),
('May Thu','buyer1@example.com','not-for-login-seed','09333333333','BUYER','ACTIVE'),
('Ko Ko','buyer2@example.com','not-for-login-seed','09444444444','BUYER','ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name);

SET @seller1=(SELECT id FROM users WHERE email='seller1@example.com');
SET @seller2=(SELECT id FROM users WHERE email='seller2@example.com');
SET @buyer1=(SELECT id FROM users WHERE email='buyer1@example.com');

INSERT INTO center_requests (seller_id,center_name,category,description,location,status)
SELECT @seller1,'Tech Harbor','Electronics','Electronics and accessories center','Yangon','PENDING'
WHERE NOT EXISTS (SELECT 1 FROM center_requests WHERE seller_id=@seller1 AND center_name='Tech Harbor');

INSERT INTO center_requests (seller_id,center_name,category,description,location,status)
SELECT @seller2,'Urban Street','Fashion','Fashion and footwear center','Mandalay','PENDING'
WHERE NOT EXISTS (SELECT 1 FROM center_requests WHERE seller_id=@seller2 AND center_name='Urban Street');
