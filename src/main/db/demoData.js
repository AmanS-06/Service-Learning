// Demo and test data for rehearsals and live demos.
// Only used by the Demo menu in main/index.js, which appears in `npm run dev`
// (or in the installed app when it is started with --demo), never for everyday users.
//
// Products come from Purnkuti's own product list (the Production unit sheet). Jewellery rates
// are from its jewellery price list; that sheet has no rates for other products, so those
// rates are estimates. Dates are worked out from today, so the dashboard always has this
// week's sales and recent activity. Phone and ID numbers are placeholders, not real people.
//
// After loading, the dashboard should show:
//   12 beneficiaries (2 male, 10 female), average income Rs 2,950 to Rs 6,940 (+135%, 10 people)
//   stall revenue Rs 12,750 from 23 sales, Rs 5,600 in the last 7 days, 3 sales today
//   7 stock items: 4 OK, 2 Low Stock, 1 Out of Stock
// Denim sling bag is left at 26: recording a Sell of 10 live turns it Low Stock.

const BENEFICIARY_COLUMNS = [
  'name', 'age', 'education_qualification', 'sex', 'occupation', 'contact_no',
  'alternate_contact_no', 'income_before_lp', 'income_after_lp', 'address',
  'associated_before_lp', 'year', 'courses_completed', 'course_names', 'joining_date',
  'work_experience', 'skills', 'aadhar_pan', 'work_profile', 'expert', 'designation',
  'reporting_to'
]

// ---------- Dates (local time, stored in the same formats the app uses) ----------

const pad = (n) => String(n).padStart(2, '0')

// Calendar date n days ago as YYYY-MM-DD, as the date picker saves it.
function dayISO(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// A time of day n days ago (1 or more). For today, use minutesAgo.
function onDay(daysAgo, hour, minute = 0) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, 0, 0)
  return d
}

// Earlier today, but never before just after midnight, so "today" entries stay today.
function minutesAgo(minutes) {
  const now = new Date()
  const justAfterMidnight = new Date(now)
  justAfterMidnight.setHours(0, 1, 0, 0)
  return new Date(Math.max(now.getTime() - minutes * 60000, justAfterMidnight.getTime()))
}

// datetime('now') format, used by the beneficiary and production handlers (UTC).
const sqliteTime = (date) => date.toISOString().replace('T', ' ').slice(0, 19)

// ---------- Records ----------

// Oldest registration first, so the newest appear at the top of the list.
function beneficiaries() {
  const joined = (daysAgo) => ({ joining_date: dayISO(daysAgo), year: dayISO(daysAgo).slice(0, 4) })
  return [
    {
      name: 'Meera Joshi', age: 41, sex: 'Female', education_qualification: 'Graduate',
      occupation: 'Supervisor', contact_no: '9000000102', alternate_contact_no: '9000000202',
      income_before_lp: 6000, income_after_lp: 11000, address: 'Shanti Nagar, near the post office',
      associated_before_lp: 'Yes', courses_completed: 3,
      course_names: 'Tailoring basics, Quality control, Team leadership', ...joined(640),
      work_experience: '8 years', skills: 'Quality checks, training new members',
      aadhar_pan: 'XXXX-XXXX-1934', work_profile: 'Production supervision',
      expert: 'Quality control', designation: 'Production supervisor',
      reporting_to: 'Programme coordinator', registered: onDay(640, 11)
    },
    {
      name: 'Ramesh Kumar', age: 45, sex: 'Male', education_qualification: '10th pass',
      occupation: 'Tailoring (cutting)', contact_no: '9000000106', income_before_lp: 4500,
      income_after_lp: 8200, address: 'Old city, behind the bus stand',
      associated_before_lp: 'Yes', courses_completed: 1, course_names: 'Cutting and pattern layout',
      ...joined(560), work_experience: '15 years', skills: 'Fabric cutting, pattern layout',
      aadhar_pan: 'XXXX-XXXX-5502', work_profile: 'Cutting and packing', expert: 'Cutting',
      designation: 'Cutting in-charge', reporting_to: 'Programme coordinator',
      registered: onDay(560, 10)
    },
    {
      name: 'Geeta Patel', age: 48, sex: 'Female', education_qualification: 'Primary school',
      occupation: 'Jute products', contact_no: '9000000109', income_before_lp: 2200,
      income_after_lp: 5000, address: 'Main market, lane 2', associated_before_lp: 'Yes',
      courses_completed: 1, course_names: 'Jute bags and file folders', ...joined(500),
      work_experience: '3 years', skills: 'Jute stitching, folder making',
      aadhar_pan: 'XXXX-XXXX-3318', work_profile: 'Jute products', designation: 'Artisan',
      reporting_to: 'Meera Joshi', registered: onDay(500, 12)
    },
    {
      name: 'Sunita Devi', age: 34, sex: 'Female', education_qualification: '10th pass',
      occupation: 'Tailoring', contact_no: '9000000101', income_before_lp: 3000,
      income_after_lp: 7500, address: 'Ward 4, near the community hall',
      associated_before_lp: 'No', courses_completed: 2,
      course_names: 'Tailoring basics, Embroidery', ...joined(420), work_experience: '2 years',
      skills: 'Machine stitching, denim upcycling', aadhar_pan: 'XXXX-XXXX-4821',
      work_profile: 'Denim bags', expert: 'Sling bags',
      designation: 'Senior artisan', reporting_to: 'Meera Joshi', registered: onDay(420, 11)
    },
    {
      name: 'Pooja Sharma', age: 26, sex: 'Female', education_qualification: 'Graduate',
      occupation: 'Trainer', contact_no: '9000000107', income_before_lp: 3500,
      income_after_lp: 9000, address: 'College road', associated_before_lp: 'No',
      courses_completed: 3, course_names: 'Tailoring basics, Embroidery, Trainer training',
      ...joined(380), work_experience: '4 years', skills: 'Teaching, pattern making',
      aadhar_pan: 'XXXX-XXXX-6620', work_profile: 'Training new members',
      expert: 'Pattern making', designation: 'Trainer', reporting_to: 'Meera Joshi',
      registered: onDay(380, 15)
    },
    {
      // Hindi name, to check Hindi text in lists, search and CSV export.
      name: 'कमला बाई', age: 52, sex: 'Female', education_qualification: 'Primary school',
      occupation: 'Diya making', contact_no: '9000000103', income_before_lp: 2000,
      income_after_lp: 5200, address: 'Potters colony', associated_before_lp: 'No',
      courses_completed: 1, course_names: 'Clay work', ...joined(300),
      work_experience: '20 years (family craft)', skills: 'Shaping and painting diyas',
      aadhar_pan: 'XXXX-XXXX-7710', work_profile: 'Diyas and festive items',
      expert: 'Diya painting', designation: 'Artisan', reporting_to: 'Meera Joshi',
      registered: onDay(300, 10)
    },
    {
      name: 'Rekha Verma', age: 29, sex: 'Female', education_qualification: '12th pass',
      occupation: 'Jewellery making', contact_no: '9000000104', income_before_lp: 2500,
      income_after_lp: 6800, address: 'Railway colony', associated_before_lp: 'No',
      courses_completed: 2, course_names: 'Beadwork, Jewellery design', ...joined(260),
      work_experience: '1 year', skills: 'Beadwork, oxidised jewellery',
      aadhar_pan: 'XXXX-XXXX-2087', work_profile: 'Jewellery', expert: 'Nath making',
      designation: 'Artisan', reporting_to: 'Meera Joshi', registered: onDay(260, 14)
    },
    {
      // Earned nothing before joining, to check the "+Rs 4,800 a month" wording.
      name: 'Anita Yadav', age: 37, sex: 'Female', education_qualification: '8th pass',
      occupation: 'Kitchen linen', contact_no: '9000000105', income_before_lp: 0,
      income_after_lp: 4800, address: 'Gandhi Nagar', associated_before_lp: 'No',
      courses_completed: 1, course_names: 'Tailoring basics', ...joined(200),
      skills: 'Roti rumals, napkins', aadhar_pan: 'XXXX-XXXX-9143',
      work_profile: 'Kitchen linen', designation: 'Artisan', reporting_to: 'Meera Joshi',
      registered: onDay(200, 11)
    },
    {
      name: 'Salma Khan', age: 33, sex: 'Female', education_qualification: '10th pass',
      occupation: 'Embroidery', contact_no: '9000000108', income_before_lp: 2800,
      income_after_lp: 6400, address: 'Station road', associated_before_lp: 'No',
      courses_completed: 2, course_names: 'Embroidery, Toran making', ...joined(150),
      work_experience: '5 years', skills: 'Hand embroidery, Khan torans',
      aadhar_pan: 'XXXX-XXXX-4456', work_profile: 'Home decor', expert: 'Torans',
      designation: 'Artisan', reporting_to: 'Meera Joshi', registered: onDay(150, 12)
    },
    {
      name: 'Mohan Lal', age: 58, sex: 'Male', education_qualification: 'None',
      occupation: 'Stall sales', contact_no: '9000000110', income_before_lp: 3000,
      income_after_lp: 5500, address: 'Community hall road', associated_before_lp: 'No',
      courses_completed: 0, ...joined(90), work_experience: '10 years (vegetable vendor)',
      skills: 'Selling, handling cash', aadhar_pan: 'XXXX-XXXX-8801',
      work_profile: 'Stall sales', designation: 'Stall assistant', reporting_to: 'Ramesh Kumar',
      registered: onDay(90, 16)
    },
    {
      // Income after LP not known yet, so she is left out of the dashboard average.
      name: 'Farida Begum', age: 39, sex: 'Female', education_qualification: '8th pass',
      occupation: 'Tailoring', contact_no: '9000000112', income_before_lp: 2600,
      address: 'Station road', associated_before_lp: 'No', courses_completed: 0, ...joined(4),
      skills: 'Hand stitching', aadhar_pan: 'XXXX-XXXX-3390',
      work_profile: 'Tailoring (in training)', designation: 'Trainee',
      reporting_to: 'Pooja Sharma', registered: onDay(4, 12)
    },
    {
      // Registered today, so she shows in Recent activity.
      name: 'Priya Singh', age: 22, sex: 'Female', education_qualification: '12th pass',
      occupation: 'Tailoring', contact_no: '9000000111', address: 'College road',
      associated_before_lp: 'No', courses_completed: 0, ...joined(0),
      aadhar_pan: 'XXXX-XXXX-7264', work_profile: 'Tailoring (in training)',
      designation: 'Trainee', reporting_to: 'Pooja Sharma', registered: minutesAgo(180)
    }
  ]
}

// [when, type, item, category, quantity, sold to]
function productionEntries() {
  const M = 'MANUFACTURING'
  const S = 'SELL'
  return [
    // Jute bottle bag: 140 made, 45 sold, 95 left (OK)
    [onDay(28, 10), M, 'Jute bottle bag', 'Bags', 70],
    [onDay(20, 15), S, 'Jute bottle bag', 'Bags', 30, 'Handicraft emporium'],
    [onDay(9, 11), M, 'Jute bottle bag', 'Bags', 50],
    [onDay(5, 16), S, 'Jute bottle bag', 'Bags', 15, 'Corporate Diwali order'],
    [minutesAgo(95), M, 'Jute bottle bag', 'Bags', 20],
    // Denim sling bag: 60 made, 34 sold, 26 left (OK). Sell 10 in the demo to make it Low Stock.
    [onDay(25, 10), M, 'Denim sling bag', 'Bags', 60],
    [onDay(14, 12), S, 'Denim sling bag', 'Bags', 20, 'Local boutique'],
    [onDay(6, 15), S, 'Denim sling bag', 'Bags', 14, 'Craft fair'],
    // Khan toran: 40 made, 25 sold, 15 left (Low Stock)
    [onDay(22, 11), M, 'Khan toran', 'Home decor', 40],
    [onDay(3, 14), S, 'Khan toran', 'Home decor', 25, 'Handicraft emporium'],
    // Peacock nath: 80 made, 80 sold, 0 left (Out of Stock)
    [onDay(24, 10), M, 'Peacock nath', 'Jewellery', 80],
    [onDay(12, 16), S, 'Peacock nath', 'Jewellery', 50, 'Local boutique'],
    [onDay(2, 11), S, 'Peacock nath', 'Jewellery', 30, 'Craft fair'],
    // Damru diya: 300 made, 120 sold, 180 left (OK)
    [onDay(18, 9), M, 'Damru diya', 'Festive', 300],
    [onDay(4, 13), S, 'Damru diya', 'Festive', 120, 'Temple trust'],
    // Roti rumal: 150 made, 60 sold, 90 left (OK)
    [onDay(16, 10), M, 'Roti rumal', 'Kitchen linen', 150],
    [minutesAgo(240), S, 'Roti rumal', 'Kitchen linen', 60, 'Corporate Diwali order'],
    // Jute file folder: 100 made, 88 sold, 12 left (Low Stock)
    [onDay(27, 12), M, 'Jute file folder', 'Stationery', 100],
    [onDay(7, 10), S, 'Jute file folder', 'Stationery', 88, 'School supplies store']
  ]
}

// [days ago, when, product, customer, rate, quantity, stall, contact]
// Earrings (Rs 50) and Peacock nath (Rs 120) use the jewellery price list; other rates are estimates.
// Canvas tote bag, Earrings and Shubh Labh are sold at stalls without a production entry.
function stallSales() {
  const MARKET = ['Main market stall', 'Main market']
  const FEST = ['College fest stall', 'College campus']
  const MELA = ['Weekend mela', 'Community ground']
  return [
    // Earlier this month and last month
    [38, onDay(38, 11), 'Denim sling bag', 'Nisha', 350, 2, MARKET],
    [33, onDay(33, 12), 'Jute bottle bag', '', 150, 5, MARKET],
    [26, onDay(26, 17), 'Peacock nath', 'Kiran', 120, 4, MELA],
    [21, onDay(21, 16), 'Roti rumal', 'Ladies club', 80, 10, MELA, '9000000301'],
    [18, onDay(18, 18), 'Khan toran', '', 250, 3, MELA],
    [15, onDay(15, 11), 'Damru diya', 'Suresh', 30, 30, MARKET],
    [13, onDay(13, 13), 'Earrings', 'Shreya', 50, 4, FEST],
    [10, onDay(10, 12), 'Canvas tote bag', '', 200, 4, FEST],
    [10, onDay(10, 14), 'Jute file folder', 'Hostel office', 60, 12, FEST, '9000000302'],
    [9, onDay(9, 15), 'Denim sling bag', 'Meenakshi', 350, 3, FEST],
    // Last 7 days (3 days ago is left empty on purpose, to show an empty day in the chart)
    [6, onDay(6, 10), 'Damru diya', 'Temple committee', 30, 50, MARKET, '9000000303'],
    [6, onDay(6, 12), 'Roti rumal', '', 80, 2, MARKET],
    [5, onDay(5, 17), 'Khan toran', 'Deepa', 250, 2, MARKET],
    [4, onDay(4, 11), 'Denim sling bag', 'Fatima', 350, 1, MARKET],
    [4, onDay(4, 12), 'Jute bottle bag', '', 150, 2, MARKET],
    [4, onDay(4, 16), 'Jute file folder', 'Rohit', 60, 5, MARKET],
    [2, onDay(2, 10), 'Damru diya', '', 30, 20, MARKET],
    [2, onDay(2, 15), 'Earrings', 'Sameer', 50, 3, MARKET],
    [1, onDay(1, 10, 30), 'Shubh Labh (big)', 'Neha', 150, 2, MARKET],
    [1, onDay(1, 17, 45), 'Khan toran', 'Kavita', 250, 1, MARKET],
    // Today
    [0, minutesAgo(130), 'Roti rumal', '', 80, 3, MARKET],
    [0, minutesAgo(50), 'Denim sling bag', 'Anjali', 350, 1, MARKET],
    [0, minutesAgo(15), 'Damru diya', 'Ravi', 30, 20, MARKET]
  ]
}

// ---------- Actions used by the Demo menu ----------

// Deletes every record in all three tables and starts ids from 1 again.
export function clearAllData(db) {
  db.transaction(() => {
    db.prepare('DELETE FROM beneficiaries').run()
    db.prepare('DELETE FROM production_log').run()
    db.prepare('DELETE FROM stall_sales').run()
    const hasSequence = db
      .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'sqlite_sequence'")
      .get()
    if (hasSequence) {
      db.prepare(
        "DELETE FROM sqlite_sequence WHERE name IN ('beneficiaries', 'production_log', 'stall_sales')"
      ).run()
    }
  })()
}

// Replaces everything with the demo set above. Returns how many records were added.
export function resetToDemoData(db) {
  const insertBeneficiary = db.prepare(
    `INSERT INTO beneficiaries (${BENEFICIARY_COLUMNS.join(', ')}, created_at)
     VALUES (${BENEFICIARY_COLUMNS.map((c) => '@' + c).join(', ')}, @created_at)`
  )
  const insertEntry = db.prepare(
    `INSERT INTO production_log (entry_type, item_name, category, quantity, unit, sold_to, created_at)
     VALUES (@entry_type, @item_name, @category, @quantity, @unit, @sold_to, @created_at)`
  )
  const insertSale = db.prepare(
    `INSERT INTO stall_sales (date, product_name, customer_name, rate, quantity, amount,
                              contact_no, stall_name, location, created_at)
     VALUES (@date, @product_name, @customer_name, @rate, @quantity, @amount,
             @contact_no, @stall_name, @location, @created_at)`
  )

  const people = beneficiaries()
  const entries = productionEntries()
  const sales = stallSales()

  db.transaction(() => {
    clearAllData(db)

    for (const person of people) {
      const row = Object.fromEntries(BENEFICIARY_COLUMNS.map((c) => [c, person[c] ?? null]))
      insertBeneficiary.run({ ...row, created_at: sqliteTime(person.registered) })
    }

    for (const [when, type, item, category, quantity, soldTo] of entries) {
      insertEntry.run({
        entry_type: type,
        item_name: item,
        category,
        quantity,
        unit: 'pcs',
        sold_to: soldTo ?? null,
        created_at: sqliteTime(when)
      })
    }

    for (const [daysAgo, when, product, customer, rate, quantity, stall, contact] of sales) {
      insertSale.run({
        date: dayISO(daysAgo),
        product_name: product,
        customer_name: customer || null,
        rate,
        quantity,
        amount: rate * quantity,
        contact_no: contact || null,
        stall_name: stall[0],
        location: stall[1],
        created_at: when.toISOString()
      })
    }
  })()

  return { beneficiaries: people.length, production: entries.length, stallSales: sales.length }
}
