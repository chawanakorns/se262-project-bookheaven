const express = require("express");
const app = express();
const db = require("./config/db");
const bodyParser = require("body-parser");
const session = require('express-session');

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'secret', // Change this to a secure key for production
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 60 * 1000,
    sameSite: true,
    httpOnly: true,
    secure: false,
  }
}));


app.get('/', async function (req, res) {
  //Query product
  //For query image
  var sql = "SELECT product_id, product_name, product_price, product_price_promotion, ImageSrc_table.Image_Path AS Path FROM product_table JOIN ImageSrc_table ON product_table.product_imageID = ImageSrc_table.product_imageID WHERE product_price_promotion > 0 GROUP BY product_id ORDER BY product_price_promotion ASC LIMIT 8;";
  db.queryCallback(sql, function (err, result) {
    const flase = result;
    console.log(flase);
    if (err) throw err;
    var sql2 = "SELECT product_table.product_id, product_name, product_price, product_price_promotion ,product_description, ImageSrc_table.Image_Path AS Path ,number_of_items FROM product_table JOIN ImageSrc_table ON product_table.product_imageID = ImageSrc_table.product_imageID JOIN order_table On product_table.product_id = order_table.product_id group by product_id ORDER BY number_of_items DESC LIMIT 8;"
    db.queryCallback(sql2, function (err, result) {
      const bsale = result;
      var sql3 = "SELECT product_id, product_name, product_price, product_price_promotion , ImageSrc_table.Image_Path AS Path FROM product_table JOIN ImageSrc_table ON product_table.product_imageID = ImageSrc_table.product_imageID group by product_id ORDER BY product_id DESC LIMIT 8;"
      db.queryCallback(sql3, function (err, result) {
        console.log("session-/: ", req.sessionID);
        res.render('homepage', { ListItems: flase , BestSale : bsale , NewRelease : result});

      });

    });

  });

});

app.get('/product', async (req, res) => {
  try {
    var sql = "SELECT product_id, product_name, product_price, product_price_promotion , ImageSrc_table.Image_Path AS Path FROM product_table JOIN ImageSrc_table ON product_table.product_imageID = ImageSrc_table.product_imageID group by product_id;";
    db.queryCallback(sql, function (err, result) {
      if (err) throw err;
    console.log("session-/: ", req.sessionID);
    const Carouselitems = result;
    const bookID = req.query.bookID;

    const imageSql = `SELECT product_id, product_name, product_price, product_price_promotion ,product_description, ImageSrc_table.Image_Path AS Path 
                      FROM product_table 
                      JOIN ImageSrc_table ON product_table.product_imageID = ImageSrc_table.product_imageID 
                      WHERE product_table.product_id = ${bookID}`;
    db.queryCallback(imageSql, function (err, result) {
      if (err) throw err; // Handle error appropriately
      const product = result;
      console.log(product);
      res.render('product', { ListItems :product, CaroItem: Carouselitems});
    });
  });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/search', function(req, res) {
  const searchQuery = req.body.searchBar;
  res.redirect('/search?q=' + searchQuery);
});

app.get('/search', async function(req, res) {
    try {
        const searchQuery = req.query.q;
        const categories = req.query.categories ? req.query.categories.split(',') : [];
        const page = parseInt(req.query.page) || 1;
        const limit = 16;
        const offset = (page - 1) * limit;

        // Query to fetch products with pagination and category filtering
        let productQuery = `
            SELECT p.*, MIN(i.Image_Path) AS Image_Path, c.category_name, c.number_of_items
            FROM product_table p 
            JOIN ImageSrc_table i ON p.product_imageID = i.product_imageID 
            JOIN category_table c ON p.category_id = c.category_id
            WHERE p.product_name LIKE ?
        `;

        let productParams = ['%' + searchQuery + '%'];

        if (categories.length > 0) {
            productQuery += ` AND c.category_id IN (?) `;
            productParams.push(categories);
        }

        productQuery += `
            GROUP BY p.product_id
            ORDER BY p.product_id
            LIMIT ? OFFSET ?
        `;

        productParams.push(limit, offset);

        // Query to fetch total count for pagination
        let countQuery = `
            SELECT COUNT(*) AS totalCount
            FROM product_table p 
            JOIN category_table c ON p.category_id = c.category_id
            WHERE p.product_name LIKE ?
        `;

        let countParams = ['%' + searchQuery + '%'];

        if (categories.length > 0) {
            countQuery += ` AND c.category_id IN (?) `;
            countParams.push(categories);
        }

        const [products, categoriesData, totalCount] = await Promise.all([
            executeQuery(productQuery, productParams),
            executeQuery('SELECT * FROM category_table'),
            executeQuery(countQuery, countParams)
        ]);

        const totalPages = Math.ceil(totalCount[0].totalCount / limit);

        res.render('search', {
            searchQuery,
            products,
            categories: categoriesData,
            selectedCategories: categories, // Send selected categories to the view
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send('Internal Server Error');
    }
});

// Function to execute a DB query with parameters
function executeQuery(query, params) {
    return new Promise((resolve, reject) => {
        db.queryCallback(query, params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}





//Handle /account request
/* app.get('/account',async function (req,res) {
  var sql = 'SELECT account_info_table.user_first_name AS user_name FROM account_info_table JOIN session_table ON account_info_table.user_name = session_table.user_name WHERE session_table.description = "Logged in";';
  db.query(sql, function (err, result) {
    if (err) throw err;
      res.render('account-main' , {name : result});
  });
});   */

//Handle /profile request
app.get('/profile', async function (req, res) {
  // Get the session ID
  const sessionId = req.sessionID;

  // Query the session table to get the user_name associated with the session ID
  const sessionSql = 'SELECT user_name FROM session_table WHERE session_id = ?';

  db.queryCallback(sessionSql, [sessionId], function (sessionErr, sessionResult) {
    if (sessionErr) {
      console.error('Error querying session table:', sessionErr);
      return res.status(500).send('Internal Server Error');
    }

    if (sessionResult.length === 0) {
      // No session found for the given session ID
      return res.status(404).send('Session not found');
    }

    const userName = sessionResult[0].user_name;

    // Now, use the retrieved user_name to fetch user profile information from the account_info_table
    const profileSql = 'SELECT account_info_table.user_id, account_info_table.user_email,account_info_table.user_first_name,account_info_table.user_last_name, account_info_table.user_gender, account_info_table.user_birth_date, account_info_table.user_member_date, account_info_table.user_name, account_info_table.user_phone FROM account_info_table WHERE account_info_table.user_name = ?';

    db.queryCallback(profileSql, [userName], function (profileErr, profileResult) {
      if (profileErr) {
        console.error('Error querying profile:', profileErr);
        return res.status(500).send('Internal Server Error');
      }
      console.log(profileResult[0]);
      // If user profile found, render the profile page with the profile data
      res.render('profile', { profile: profileResult[0] });
    });
  });
});

app.get('/account', async function (req, res) {
  try {
    // Check if there is an active session
    if (req.session && req.sessionID) {
      var sql = 'SELECT register_table.user_name AS user_name, permission FROM register_table JOIN session_table ON register_table.user_name = session_table.user_name WHERE session_table.session_id = ? AND session_table.description = "Logged in";';
      db.queryCallback(sql, [req.sessionID], function (err, result) {
        if (err) {
          console.error('Error querying database:', err);
          res.status(500).send('Internal Server Error');
          return;
        }
        if (result.length > 0) {
          // User is logged in, render the account page
          console.log(result);
          // Pass the username as a string, not an array
          res.render('account-main', { name: result });
        } else {
          // Session ID not found or user is not logged in, redirect to the login page
          res.redirect('/login');
        }
      });
    } else {
      // No session found, redirect to the login page
      res.redirect('/login');
    }
  } catch (error) {
    console.error('Error accessing account page:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/profile-edit' , function(req, res) {
  res.render('edit-Profile')
})

// POST route to handle profile editing
app.post('/profile_edit', (req, res) => {

  const sessionId = req.sessionID;

  // Query the session table to get the user_name associated with the session ID
  const sessionSql = 'SELECT user_name FROM session_table WHERE session_id = ?';

  db.queryCallback(sessionSql, [sessionId], function (sessionErr, sessionResult) {
    if (sessionErr) {
      console.error('Error querying session table:', sessionErr);
      return res.status(500).send('Internal Server Error');
    }

    if (sessionResult.length === 0) {
      // No session found for the given session ID
      return res.status(404).send('Session not found');
    }

    const userName = sessionResult[0].user_name;

    // Now, use the retrieved user_name to fetch user profile information from the account_info_table
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const gender = req.body.gender;
    const birthDate = req.body.birthday;
    const phoneNumber = req.body.phone_number;
    const profileImage = req.body.profile_image;
  
    const updateSql = 'UPDATE account_info_table SET user_first_name=?, user_last_name=?, user_gender=?, user_birth_date=?, user_phone=? WHERE user_name =?';
  
    db.queryCallback(updateSql, [firstName, lastName, gender, birthDate, phoneNumber, userName], function (err, result) {
      if (err) {
        console.error('Error updating profile:', err);
        return res.status(500).send('Internal Server Error');
      }
      console.log('Profile updated successfully!');
      res.redirect('/profile'); // Redirect to the profile page after updating
    });
  });
});


app.get('/login', function (req, res) {
      res.render('login')
  });

app.get('/contact' ,  function (req, res) {
  res.render('contact')
});


app.post('/login', function (req, res) {
    const USER_NAME = req.body.USER_NAME;
    const PASSWORD = req.body.PASSWORD;
    if (!USER_NAME || !PASSWORD) {
        return res.send("Username and Password are required.");
    }

    const sql = "SELECT * FROM register_table WHERE USER_NAME = ? AND PASSWORD = ?";
    db.queryCallback(sql, [USER_NAME, PASSWORD], function (err, result) {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (result.length > 0) {
            req.session.user = USER_NAME;

            // Insert the login session with SESSION_ID
            const insertSessionSql = "INSERT INTO session_table (USER_NAME, DESCRIPTION, SESSION_ID) VALUES (?, ?, ?)";
            const sessionId = req.session.id; // Get the session ID
            db.queryCallback(insertSessionSql, [USER_NAME, 'Logged in', sessionId], function (err, result) {
                if (err) {
                    console.error('Error inserting session:', err);
                    return res.status(500).send('Internal Server Error');
                }
                console.log("Session inserted successfully:", result);
            });

            res.redirect('/');
        } else {
            res.redirect('/login?error=1');
        }
    });
});

app.get('/register', function (req, res) {
  res.render('register')
});


app.post('/register', function (req, res) {
  const USER_NAME = req.body.USER_NAME;
  const PASSWORD = req.body.PASSWORD;
  const PASSWORD_confirm = req.body.PASSWORD_confirm;
  const EMAIL = req.body.EMAIL;

  if (PASSWORD != PASSWORD_confirm) {
    return res.redirect('/register?error=1');
  }
  if (!USER_NAME || !PASSWORD) {
    return res.status(400).send('Username and password are required');
  }
  
  const sql = "INSERT INTO register_table (USER_NAME, PASSWORD) VALUES (?, ?)";
  db.queryCallback(sql, [USER_NAME, PASSWORD], function (err, result) {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).send('This user already exists.');
    }
    const currentDate = new Date();

    // Format the date to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
    const mysqlDateTime = currentDate.toISOString().slice(0, 19).replace('T', ' ');
    const user_id = result.insertId

    // First, insert into address_table to get the generated address_id
    const sqlInsertAddress = "INSERT INTO address_table () VALUES ()";
    db.queryCallback(sqlInsertAddress, function (err, addressResult) {
      if (err) {
        console.error('Error inserting address:', err);
        return res.status(500).send('Error inserting address.');
      }

      // Get the generated address_id from the inserted address record
      const addressId = addressResult.insertId;

      // First, insert into payment_info_table to get the generated user_cardId
      const sqlInsertPayment = "INSERT INTO payment_info_table () VALUES ()";
      db.queryCallback(sqlInsertPayment, function (err, paymentResult) {
        if (err) {
          console.error('Error inserting payment info:', err);
          return res.status(500).send('Error inserting payment info.');
        }

        // Get the generated user_cardId from the inserted payment info record
        const userCardId = paymentResult.insertId;

        // Now, insert into account_info_table with the obtained address_id and user_cardId
        const sqlInsertAccountInfo = "INSERT INTO account_info_table (user_id, user_name, user_email, user_member_date, user_addressId, user_cardId) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [user_id, USER_NAME, EMAIL, mysqlDateTime, addressId, userCardId];
        db.queryCallback(sqlInsertAccountInfo, values, function (err, accountInfoResult) {
          if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).send('Error inserting user.');
          }

          // Both address and account info inserted successfully
          console.log('User and address inserted successfully:', accountInfoResult);
          // Proceed with other operations
        });
      });
    });

    const sessionId = req.session.id;
    const insertSessionSql = "INSERT INTO session_table (USER_NAME, SESSION_ID, DESCRIPTION) VALUES (?, ?, ?)";
    
    db.queryCallback(insertSessionSql, [USER_NAME, sessionId,  'Logged in' ], function (err, sessionResult) {
      if (err) {
        console.error('Error inserting session:', err);
        return res.status(500).send('Internal Server Error');
      }

      res.redirect('/');
    });
  });
});

app.get('/security' , function(req,res) {
  var sql = 'SELECT register_table.user_name AS user_name , register_table.password AS user_password FROM register_table JOIN session_table ON register_table.user_name = session_table.user_name WHERE session_table.session_id = ? AND session_table.description = "Logged in";';
      db.queryCallback(sql, [req.sessionID], function (err, result) {
        if (err) {
          console.error('Error querying database:', err);
          res.status(500).send('Internal Server Error');
        }
        console.log(result);
        res.render('login-n-Security', {data : result});
});
});

app.get


app.post('/security-username', (req, res) => {
  const sessionId = req.sessionID;
  const sessionSql = 'SELECT user_name FROM session_table WHERE session_id = ?';

  db.queryCallback(sessionSql, [sessionId], function (sessionErr, sessionResult) {
    if (sessionErr) {
      console.error('Error querying session table:', sessionErr);
      return res.status(500).send('Internal Server Error');
    }

    if (sessionResult.length === 0) {
      // No session found for the given session ID
      return res.status(404).send('Session not found');
    }

    const userName = sessionResult[0].user_name;
    const newUsername = req.body['new-username']; // Access field using square brackets
    console.log(newUsername);
    const updateUsernameSql = 'UPDATE register_table SET user_name = ? WHERE user_name = ?';
    db.queryCallback(updateUsernameSql, [newUsername, userName], (err, result) => {
        if (err) {
            console.error('Error updating username:', err);
            return res.status(500).send('Internal Server Error');
        }
        console.log('Username updated successfully!');
        res.redirect('/security'); // Send a success response
    })
  });
});

app.post('/security-password', (req, res) => {
  const sessionId = req.sessionID;
  const sessionSql = 'SELECT user_name FROM session_table WHERE session_id = ?';

  db.queryCallback(sessionSql, [sessionId], function (sessionErr, sessionResult) {
    if (sessionErr) {
      console.error('Error querying session table:', sessionErr);
      return res.status(500).send('Internal Server Error');
    }

    if (sessionResult.length === 0) {
      // No session found for the given session ID
      return res.status(404).send('Session not found');
    }

    const userName = sessionResult[0].user_name;
    const newPassword = req.body['new-password']; // Access field using square brackets
    console.log(newPassword);
    const updateUsernameSql = 'UPDATE register_table SET password = ? WHERE user_name = ?';
    db.queryCallback(updateUsernameSql, [newPassword, userName], (err, result) => {
        if (err) {
            console.error('Error updating username:', err);
            return res.status(500).send('Internal Server Error');
        }
        console.log('Username updated successfully!');
        res.redirect('/security'); // Send a success response
    })
  });
});

app.get('/logout', function(req, res) {
  if (req.session && req.sessionID) {
      const sessionId = req.sessionID;

      req.session.destroy(function(err) {
          if(err) {
              console.error('Error destroying session:', err);
              return res.status(500).send('Internal Server Error');
          }

          // Update the logout session with SESSION_ID
          const updateSessionSql = "UPDATE session_table SET DESCRIPTION = 'Logged out' WHERE SESSION_ID = ?";
          db.queryCallback(updateSessionSql, [sessionId], function (err, result) {
              if (err) {
                  console.error('Error updating session:', err);
                  return res.status(500).send('Internal Server Error');
              }
              console.log("Session updated successfully:", result);
              res.redirect('/');
          });
      });
  } else {
      res.redirect('/');
  }
});

app.get('/address' , function(req,res) {
  res.render("address");
});

app.get('/payment' , function(req,res) {
  res.render("payment-main");
});

app.get('/cart', async function(req, res) {
  // Retrieve cart items from the user's session
  const cartItems = req.session.cartItems || [];

  try {
      // Check if there are any items in the cart
      if (cartItems.length === 0) {
          // Render the cart page with an empty array of items
          return res.render("cart", { cartItems: [], total: 0 });
      }

      // Construct the SQL query to fetch product details based on the product IDs in the cart
      const sql = `
      SELECT 
        p.product_id, p.product_name, p.product_price, p.product_price_promotion, i.Image_Path
      FROM 
        product_table p
      JOIN
        ImageSrc_table i
      ON
        p.product_imageID = i.product_imageID
      WHERE 
        p.product_id IN (?)
      GROUP BY
        p.product_id;
      `;
      
      // Execute the SQL query passing the list of product IDs from the cart
      db.queryCallback(sql, [cartItems], function(err, result) {
          if (err) {
              console.error('Error fetching product details:', err);
              return res.status(500).send('Internal Server Error');
          }

          // Calculate total price
          let total = 0;
          result.forEach((item) => {
              total += item.product_price_promotion || item.product_price;
          });
          console.log(result);
          // Pass the fetched product details and total to the cart page
          res.render("cart", { cartItems: result, total: total });
      });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.post('/add-to-cart' , function(req,res) {
  const productId = req.body.productId;
  const sessionId = req.sessionID;

  // Check if the user already has a cart in their session
  if (!req.session.cartItems) {
      // If not, initialize an empty array to store cart items
      req.session.cartItems = [];
  }

  req.session.cartItems.push(productId);
  console.log("Session Cart Items:", req.session.cartItems);

  // Redirect back to the previous page
  res.redirect('back');
});

app.post('/remove-from-cart', function(req, res) {
  const productId = req.body.productId;

  // Check if the user has a cart in their session
  if (!req.session.cartItems) {
    return res.redirect('/cart');
  }

  // Find the index of the product in the cartItems array
  const index = req.session.cartItems.indexOf(productId);

  if (index !== -1) {
    // If the product is found, remove it from the cartItems array
    req.session.cartItems.splice(index, 1);
  }

  console.log("Session Cart Items after removal:", req.session.cartItems);

  // Redirect back to the cart page
  res.redirect('/cart');
});

app.post('/cart/checkout', async (req, res) => {
  const { items } = req.body;
  console.log('Received items for checkout:', items); // Check received items

  if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Invalid request: items missing or not an array');
      return res.status(400).send('Invalid request. Please provide items for checkout.');
  }

  try {
      for (const item of items) {
          console.log('Processing item:', item); // Check each item
          const result = db.queryCallback('INSERT INTO order_table (request_from, request_type, product_id, number_of_items) VALUES (?, ?, ?, ?)', ["Customer", "Customer Request", item.productId, item.quantity]);
          console.log('Database Insert Result:', result); // Log database insert result
      }

      console.log('Checkout successful');
      res.sendStatus(200); // Send a success response
  } catch (err) {
      console.error('Error creating checkout order', err);
      res.status(500).send('Server Error: ' + err.message); // Send detailed error message
  }
});

app.get('/thank-you' , function(req,res) {
  res.render("shipping-done");
});

//BackOffice

// Function to get product sales data from database
async function getProductSalesData() {
  try {
      const [rows, fields] = await db.queryPromise('SELECT product_name, product_sales_count FROM product_table ORDER BY product_sales_count DESC LIMIT 10');
      const labels = rows.map(row => row.product_name);
      const data = rows.map(row => row.product_sales_count);
      return { labels, data };
  } catch (err) {
      console.error('Error fetching product sales data:', err);
      throw err;
  }
}

// Route for home page
app.get('/back-office-homepage', async (req, res) => {
  try {
      const permissionTwoCountQuery = await db.queryPromise('SELECT COUNT(*) as total FROM register_table WHERE permission = 2');
      const permissionTwoCount = permissionTwoCountQuery[0][0].total;

      // Fetch product sales data
      const productSalesData = await getProductSalesData();
      console.log('Product Sales Data:', productSalesData);

      // Fetch total sales
      const totalSalesQuery = await db.queryPromise('SELECT SUM(product_sales_count) as totalSales FROM product_table');
      const totalSales = totalSalesQuery[0][0].totalSales || 0;

      // Fetch total stocks
      const totalStocksQuery = await db.queryPromise('SELECT SUM(stock) as totalStocks FROM product_table');
      const totalStocks = totalStocksQuery[0][0].totalStocks || 0;

      res.render('back-office-homepage', {
          employeeCount: permissionTwoCount,
          productSalesData: JSON.stringify(productSalesData),
          totalSales: totalSales,
          totalStocks: totalStocks
      });
  } catch (err) {
      console.error('Error rendering home page:', err);
      res.status(500).send('Server Error');
  }
});



// Get category data table
app.get('/back-office-category', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10; // Number of items per page

  try {
      let totalCount, totalPages, rows;
      const offset = (page - 1) * limit;

      // Update number_of_items before fetching the data
      await db.queryPromise(`UPDATE category_table c JOIN (SELECT p.category_id, SUM(p.stock) AS number_of_items FROM product_table p GROUP BY p.category_id) AS counts ON c.category_id = counts.category_id SET c.number_of_items = counts.number_of_items`);

      // Now fetch the data for the page
      if (req.query.search) {
          const searchTerm = '%' + req.query.search + '%';

          const countQuery = await db.queryPromise('SELECT COUNT(*) as total FROM category_table WHERE category_name LIKE ?', [searchTerm]);
          totalCount = countQuery[0][0].total;
          totalPages = Math.ceil(totalCount / limit);

          [rows, fields] = await db.queryPromise('SELECT * FROM category_table WHERE category_name LIKE ? ORDER BY category_name ASC LIMIT ?, ?;', [searchTerm, offset, limit]);
      } else {
          const countQuery = await db.queryPromise('SELECT COUNT(*) as total FROM category_table');
          totalCount = countQuery[0][0].total;
          totalPages = Math.ceil(totalCount / limit);

          [rows, fields] = await db.queryPromise('SELECT * FROM category_table ORDER BY category_name ASC LIMIT ?, ?;', [offset, limit]);
      }

      res.render('back-office-category', { data: rows, currentPage: page, totalPages });
  } catch (err) {
      console.error('Error fetching data', err);
      res.status(500).send('Server Error');
  }
});

// Add table category data
app.post('/back-office-category/add', async (req, res) => {
  const { category_name } = req.body;
  try {
      await db.queryPromise('INSERT INTO category_table (category_name) VALUES (?)', ['<New Category>']);

      res.redirect('/back-office-category');
  } catch (err) {
      console.error('Error adding category', err);
      res.status(500).send('Server Error');
  }
});

// Remove table category data
app.post('/back-office-category/delete', async (req, res) => {
  const selectedCategories = Array.isArray(req.body.selectedCategories)
      ? req.body.selectedCategories
      : [req.body.selectedCategories];

  if (selectedCategories.length === 0) {
      return res.status(400).send('No categories selected for deletion.');
  }

  try {
      // Delete rows based on selected category IDs
      await db.queryPromise('DELETE FROM category_table WHERE category_id IN (?)', [selectedCategories]);

      res.redirect('/back-office-category');
  } catch (err) {
      console.error('Error deleting categories', err);
      res.status(500).send('Server Error');
  }
});

// Update category data
app.post('/back-office-category/update', async (req, res) => {
  const { category_id, category_name } = req.body;

  try {
      const updatePromises = category_id.map((id, index) => {
          return db.queryPromise('UPDATE category_table SET category_name = ? WHERE category_id = ?', [category_name[index], id]);
      });

      await Promise.all(updatePromises);

      res.redirect('/back-office-category');
  } catch (err) {
      console.error('Error updating category', err);
      res.status(500).send('Server Error');
  }
});

// Get products by category ID from product_table
app.get('/back-office-category/products/:categoryId', async (req, res) => {
  const categoryId = req.params.categoryId;
  try {
      const [products, fields] = await db.queryPromise('SELECT * FROM product_table WHERE category_id = ? ORDER BY product_sales_count DESC', [categoryId]);
      res.json(products); // Send products as JSON response
  } catch (err) {
      console.error('Error fetching products by category ID', err);
      res.status(500).send('Server Error');
  }
});


// Get product data table
app.get('/back-office-product', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20; // Number of items per page

  try {
      let totalCount, totalPages, rows;
      const offset = (page - 1) * limit;

      // Check if there is a search query
      if (req.query.search) {
          const searchTerm = '%' + req.query.search + '%';

          const countQuery = await db.queryPromise('SELECT COUNT(*) as total FROM product_table WHERE product_name LIKE ?', [searchTerm]);
          totalCount = countQuery[0][0].total;
          totalPages = Math.ceil(totalCount / limit);

          [rows, fields] = await db.queryPromise('SELECT * FROM product_table WHERE product_name LIKE ? LIMIT ?, ?;', [searchTerm, offset, limit]);
      } else {
          const countQuery = await db.queryPromise('SELECT COUNT(*) as total FROM product_table');
          totalCount = countQuery[0][0].total;
          totalPages = Math.ceil(totalCount / limit);

          [rows, fields] = await db.queryPromise('SELECT * FROM product_table LIMIT ?, ?;', [offset, limit]);
      }

      res.render('back-office-product', { data: rows, currentPage: page, totalPages });
  } catch (err) {
      console.error('Error fetching data', err);
      res.status(500).send('Server Error');
  }
});

// Add table product data
app.post('/back-office-product/add', async (req, res) => {
  try {
      // Perform validation or processing here if needed
      await db.queryPromise('INSERT INTO product_table (product_name, category_id, stock, product_price, product_price_promotion) VALUES (?, ?, ?, ?, ?)', ['New Product', 1, 0, 0, 0]);

      res.redirect('/back-office-product');
  } catch (err) {
      console.error('Error adding product', err);
      res.status(500).send('Server Error');
  }
});

// Remove table product data
app.post('/back-office-product/delete', async (req, res) => {
  const selectedProducts = Array.isArray(req.body.selectedProducts)
      ? req.body.selectedProducts
      : [req.body.selectedProducts];

  if (selectedProducts.length === 0) {
      return res.status(400).send('No products selected for deletion.');
  }

  try {
      // Delete rows based on selected product IDs
      await db.queryPromise('DELETE FROM product_table WHERE product_id IN (?)', [selectedProducts]);

      res.redirect('/back-office-product');
  } catch (err) {
      console.error('Error deleting products', err);
      res.status(500).send('Server Error');
  }
});

// Update product data
app.post('/back-office-product/update', async (req, res) => {
  const { product_id, product_name, category_id, stock, product_price, product_price_promotion } = req.body;

  try {
      const updatePromises = product_id.map((id, index) => {
          return db.queryPromise('UPDATE product_table SET product_name = ?, category_id = ?, stock = ?, product_price = ?, product_price_promotion = ? WHERE product_id = ?',
              [product_name[index], category_id[index], stock[index], product_price[index], product_price_promotion[index], id]);
      });

      await Promise.all(updatePromises);

      res.redirect('/back-office-product');
  } catch (err) {
      console.error('Error updating product', err);
      res.status(500).send('Server Error');
  }
});

// Handle Restock Order
app.post('/back-office-product/restock', async (req, res) => {
  const { productId, restockQuantity } = req.body;

  if (!productId || !restockQuantity || restockQuantity <= 0) {
      return res.status(400).send('Invalid request. Please provide product ID and restock quantity.');
  }

  try {
      // Simplified query for debugging
      await db.queryPromise('INSERT INTO order_table (request_from, request_type, product_id, number_of_items) VALUES (?, ?, ?, ?)',
          ['Product Manager', 'Restock Request', productId, restockQuantity]);

      res.sendStatus(200); // Send a success response
  } catch (err) {
      console.error('Error creating restock order', err);
      res.status(500).send('Server Error: ' + err.message); // Send detailed error message
  }
});

app.get('/back-office-order', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20; // Number of items per page

  try {
      let totalCount, totalPages, rows;
      const offset = (page - 1) * limit;

      // Check if there is a search query
      if (req.query.search) {
          let searchTerm = '%' + req.query.search + '%';

          // Check if there is a request_type filter
          if (req.query.request_type && req.query.request_type !== 'all') {
              const countQuery = await db.queryPromise('SELECT COUNT(*) as total FROM order_table WHERE (order_table.order_id LIKE ? OR order_table.product_id LIKE ?) AND order_table.request_type = ?', [searchTerm, searchTerm, req.query.request_type]);
              totalCount = countQuery[0][0].total;
              totalPages = Math.ceil(totalCount / limit);

              [rows, fields] = await db.queryPromise('SELECT order_table.order_id, order_table.request_date, order_table.request_from, order_table.request_type, order_table.product_id, order_table.number_of_items, SUM((CASE WHEN product_table.product_price_promotion != 0 THEN product_table.product_price_promotion ELSE product_table.product_price END) * order_table.number_of_items) AS total_price FROM order_table LEFT JOIN product_table ON order_table.product_id = product_table.product_id WHERE (order_table.order_id LIKE ? OR order_table.product_id LIKE ?) AND order_table.request_type = ? AND order_table.order_status IS NULL GROUP BY order_table.order_id, order_table.request_date, order_table.request_from, order_table.request_type, order_table.product_id, order_table.number_of_items LIMIT ?, ?;', [searchTerm, searchTerm, req.query.request_type, offset, limit]);
          } else {
              const countQuery = await db.queryPromise('SELECT COUNT(*) as total FROM order_table WHERE order_id LIKE ? OR product_id LIKE ?', [searchTerm, searchTerm]);
              totalCount = countQuery[0][0].total;
              totalPages = Math.ceil(totalCount / limit);

              [rows, fields] = await db.queryPromise('SELECT order_table.order_id, order_table.request_date, order_table.request_from, order_table.request_type, order_table.product_id, order_table.number_of_items, SUM((CASE WHEN product_table.product_price_promotion != 0 THEN product_table.product_price_promotion ELSE product_table.product_price END) * order_table.number_of_items) AS total_price FROM order_table LEFT JOIN product_table ON order_table.product_id = product_table.product_id WHERE order_table.order_id LIKE ? OR order_table.product_id LIKE ? AND order_table.order_status IS NULL GROUP BY order_table.order_id, order_table.request_date, order_table.request_from, order_table.request_type, order_table.product_id, order_table.number_of_items LIMIT ?, ?;', [searchTerm, searchTerm, offset, limit]);
          }
      } else {
          // Check if there is a request_type filter
          if (req.query.request_type && req.query.request_type !== 'all') {
              const countQuery = await db.queryPromise('SELECT COUNT(*) as total FROM order_table WHERE request_type = ?', [req.query.request_type]);
              totalCount = countQuery[0][0].total;
              totalPages = Math.ceil(totalCount / limit);

              [rows, fields] = await db.queryPromise('SELECT order_table.order_id, order_table.request_date, order_table.request_from, order_table.request_type, order_table.product_id, order_table.number_of_items, SUM((CASE WHEN product_table.product_price_promotion != 0 THEN product_table.product_price_promotion ELSE product_table.product_price END) * order_table.number_of_items) AS total_price FROM order_table LEFT JOIN product_table ON order_table.product_id = product_table.product_id WHERE order_table.request_type = ? AND order_table.order_status IS NULL GROUP BY order_table.order_id, order_table.request_date, order_table.request_from, order_table.request_type, order_table.product_id, order_table.number_of_items LIMIT ?, ?;', [req.query.request_type, offset, limit]);
          } else {
              const countQuery = await db.queryPromise('SELECT COUNT(*) as total FROM order_table WHERE order_status IS NULL'); // Check if order_status is null
              totalCount = countQuery[0][0].total;
              totalPages = Math.ceil(totalCount / limit);

              [rows, fields] = await db.queryPromise('SELECT order_table.order_id, order_table.request_date, order_table.request_from, order_table.request_type, order_table.product_id, order_table.number_of_items, SUM((CASE WHEN product_table.product_price_promotion != 0 THEN product_table.product_price_promotion ELSE product_table.product_price END) * order_table.number_of_items) AS total_price FROM order_table LEFT JOIN product_table ON order_table.product_id = product_table.product_id WHERE order_table.order_status IS NULL GROUP BY order_table.order_id, order_table.request_date, order_table.request_from, order_table.request_type, order_table.product_id, order_table.number_of_items LIMIT ?, ?;', [offset, limit]);

          }
      }

      res.render('back-office-order', { data: rows, currentPage: page, totalPages, search: req.query.search, requestType: req.query.request_type });
  } catch (err) {
      console.error('Error fetching data', err);
      res.status(500).send('Server Error');
  }
});




// Approve order
app.post('/back-office-order/approve', async (req, res) => {
  const { product_id, order_id } = req.body;

  if (!product_id || !order_id) {
    return res.status(400).send('Invalid request. Please provide product ID and order ID.');
  }

  try {
    // Check if the order exists
    const [orderRows] = await db.queryPromise('SELECT * FROM order_table WHERE product_id = ? AND order_id = ?', [product_id, order_id]);
  
    if (orderRows.length === 0) {
      return res.status(404).send('Order not found.');
    }
    await db.queryPromise('UPDATE order_table SET order_status = "approve" WHERE product_id = ? AND order_id = ?', [product_id, order_id]);
    // Approve row in order_table

    await db.queryPromise('INSERT INTO salehistory_table (product_id, order_id) VALUES (?, ?)', [product_id, order_id]);


    // Redirect back to the order page
    res.redirect('/back-office-order');
  } catch (err) {
    console.error('Error accepting order', err);
    res.status(500).send('Server Error: ' + err.message); // Send detailed error message
  }
});


// Reject order
app.post('/back-office-order/reject', async (req, res) => {
  const { product_id, order_id } = req.body;

  if (!product_id || !order_id) {
    return res.status(400).send('Invalid request. Please provide product ID and order ID.');
  }

  try {
    // Check if the order exists
    const [orderRows] = await db.queryPromise('SELECT * FROM order_table WHERE product_id = ? AND order_id = ?', [product_id, order_id]);

    if (orderRows.length === 0) {
      return res.status(404).send('Order not found.');
    }

    // Delete from salehistory_table first to avoid foreign key constraint error
    await db.queryPromise('DELETE FROM salehistory_table WHERE product_id = ? AND order_id = ?', [product_id, order_id]);

    // Then delete from order_table
    await db.queryPromise('DELETE FROM order_table WHERE product_id = ? AND order_id = ?', [product_id, order_id]);

    // Redirect back to the order page
    res.redirect('/back-office-order');
  } catch (err) {
    console.error('Error accepting order', err);
    res.status(500).send('Server Error: ' + err.message); // Send detailed error message
  }
});


app.get('/back-office-salehistory', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20; // Number of items per page

  try {
      const countQuery = await db.queryPromise('SELECT COUNT(*) as total FROM salehistory_table');
      const totalCount = countQuery[0][0].total;
      const totalPages = Math.ceil(totalCount / limit);

      const offset = (page - 1) * limit;

      const query = `
          SELECT 
              sh.bill_id,
              sh.bill_date,
              p.product_id,
              p.product_name,
              o.number_of_items,
              (p.product_price * o.number_of_items) as total_price
          FROM 
              salehistory_table sh
          JOIN 
              product_table p ON sh.product_id = p.product_id
          JOIN 
              order_table o ON sh.order_id = o.order_id
          ORDER BY 
              sh.bill_date DESC
          LIMIT ?, ?;
      `;

      const [rows, fields] = await db.queryPromise(query, [offset, limit]);

      res.render('back-office-salehistory', { data: rows, currentPage: page, totalPages });
  } catch (err) {
      console.error('Error fetching data', err);
      res.status(500).send('Server Error');
  }
});



app.get('/back-office-bestseller', async (req, res) => {
  try {
      const query = `
          SELECT p.*, MIN(i.Image_Path) AS Image_Path
          FROM product_table p
          INNER JOIN ImageSrc_table i ON p.product_imageID = i.product_imageID
          GROUP BY p.product_id
          ORDER BY p.product_sales_count DESC
          LIMIT 10
      `;
      const [rows, fields] = await db.queryPromise(query);
      res.render('back-office-bestseller', { data: rows });
  } catch (err) {
      console.error('Error fetching bestseller data', err);
      res.status(500).send('Server Error');
  }
});

app.listen(3000, function () {
  console.log(`Example app listening on port` + 3000);
});