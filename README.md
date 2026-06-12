# Full Stack Developer Test

## Project Overview

This project is developed as part of the WPoets Full Stack Developer Test.

The application provides:

* CRUD functionality using PHP and MySQL
* Responsive frontend using HTML5, CSS3, Bootstrap, and jQuery
* Tab-based content navigation
* Dynamic slider functionality
* Synchronized image display
* Mobile-responsive accordion layout

---

## Features

### Admin CRUD

* Create Tabs
* Read Tabs
* Update Tabs
* Delete Tabs

### Slide Management

* Add slides under tabs
* Edit slide details
* Delete slides
* Upload and manage images

### Frontend Functionality

* Tab navigation in desktop view
* Accordion navigation in mobile view
* Slider connected with image preview
* Responsive design using Bootstrap

---

## Technologies Used

### Backend

* PHP
* MySQL

### Frontend

* HTML5
* CSS3
* Bootstrap
* jQuery

### Database

* MySQL

---

## Installation

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd full-stack-test
```

### 2. Move Project to WAMP/XAMPP

Copy the project folder to:

For WAMP:

```text
C:\wamp64\www\
```

For XAMPP:

```text
C:\xampp\htdocs\
```

### 3. Create Database

Open phpMyAdmin:

```text
http://localhost/phpmyadmin
```

Create a database:

```sql
fullstack_test
```

### 4. Import Database

Import the file:

```text
database.sql
```

### 5. Configure Database Connection

Update the database credentials inside:

```text
php/config.php
```

Example:

```php
$conn = new mysqli(
    "localhost",
    "root",
    "",
    "fullstack_test"
);
```

### 6. Run the Project

Open:

```text
http://localhost/full-stack-test/
```

---

## Project Structure

```text
full-stack-test/
│
├── index.html
├── database.sql
├── README.md
├── Answers to technical questions.md
│
├── css/
│   └── style.css
│
├── js/
│   └── main.js
│
├── php/
│   ├── config.php
│   └── api.php
│
└── uploads/
```

---

## Responsive Behaviour

### Desktop

* Left Column: Tabs
* Middle Column: Slider Content
* Right Column: Image Preview

### Mobile

* Tabs become Accordion
* Images are displayed as slide backgrounds
* Fully responsive layout

---

## Author

Name: Ravikiran
Role: Full Stack Developer
Experience: 2.4+ Years
Skills: PHP, Laravel, MySQL, JavaScript, React.js, WordPress

---

## Notes

This project was developed for evaluation purposes as part of the WPoets Full Stack Developer Test.
