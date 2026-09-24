-- beneficiaries (matches Person A's beneficiaryHandlers.js FIELDS list)
CREATE TABLE IF NOT EXISTS beneficiaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER,
  education_qualification TEXT,
  sex TEXT,
  occupation TEXT,
  contact_no TEXT,
  alternate_contact_no TEXT,
  income_before_lp REAL,
  income_after_lp REAL,
  address TEXT,
  associated_before_lp TEXT,
  year TEXT,
  courses_completed INTEGER,
  course_names TEXT,
  joining_date TEXT,
  work_experience TEXT,
  skills TEXT,
  aadhar_pan TEXT,
  work_profile TEXT,
  expert TEXT,
  designation TEXT,
  reporting_to TEXT,
  created_at TEXT
);

-- production_log: Manufacturing + Sell entries (Person B's module)
CREATE TABLE IF NOT EXISTS production_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_type TEXT NOT NULL,   -- MANUFACTURING or SELL
  item_name TEXT NOT NULL,
  category TEXT,
  quantity REAL NOT NULL,
  unit TEXT,
  sold_to TEXT,               -- SELL only
  created_at TEXT
);

-- stall_sales (matches Person C's stallSalesHandlers.js / dashboardHandlers.js)
CREATE TABLE IF NOT EXISTS stall_sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  product_name TEXT NOT NULL,
  customer_name TEXT,
  rate REAL,
  quantity REAL NOT NULL,
  amount REAL,                -- rate * quantity
  contact_no TEXT,
  stall_name TEXT,
  location TEXT,
  created_at TEXT
);
