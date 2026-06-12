<?php
// api.php - RESTful CRUD API for Categories & Slides

require_once 'config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db  = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$path   = trim($_GET['path'] ?? '', '/');
$parts  = explode('/', $path);
$resource = $parts[0] ?? '';
$id       = isset($parts[1]) ? (int)$parts[1] : null;

// ──────────────────────────────────────────────
// CATEGORIES CRUD
// ──────────────────────────────────────────────
if ($resource === 'categories') {

    if ($method === 'GET') {
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            $cat = $stmt->fetch();
            $cat ? jsonResponse($cat) : jsonResponse(['error' => 'Not found'], 404);
        } else {
            $stmt = $db->query("SELECT * FROM categories ORDER BY sort_order ASC");
            jsonResponse($stmt->fetchAll());
        }
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $name = sanitize($data['name'] ?? '');
        $slug = sanitize($data['slug'] ?? strtolower(str_replace(' ', '-', $name)));
        $sort = (int)($data['sort_order'] ?? 0);

        if (!$name) jsonResponse(['error' => 'Name is required'], 422);

        $stmt = $db->prepare("INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)");
        $stmt->execute([$name, $slug, $sort]);
        jsonResponse(['id' => $db->lastInsertId(), 'message' => 'Category created'], 201);
    }

    if ($method === 'PUT' && $id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $name = sanitize($data['name'] ?? '');
        $slug = sanitize($data['slug'] ?? '');
        $sort = (int)($data['sort_order'] ?? 0);

        if (!$name) jsonResponse(['error' => 'Name is required'], 422);

        $stmt = $db->prepare("UPDATE categories SET name=?, slug=?, sort_order=? WHERE id=?");
        $stmt->execute([$name, $slug, $sort, $id]);
        $stmt->rowCount() ? jsonResponse(['message' => 'Category updated']) : jsonResponse(['error' => 'Not found'], 404);
    }

    if ($method === 'DELETE' && $id) {
        $stmt = $db->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        $stmt->rowCount() ? jsonResponse(['message' => 'Category deleted']) : jsonResponse(['error' => 'Not found'], 404);
    }
}

// ──────────────────────────────────────────────
// SLIDES CRUD
// ──────────────────────────────────────────────
elseif ($resource === 'slides') {

    if ($method === 'GET') {
        if ($id) {
            $stmt = $db->prepare("SELECT s.*, c.name AS category_name FROM slides s
                                  JOIN categories c ON s.category_id = c.id WHERE s.id = ?");
            $stmt->execute([$id]);
            $slide = $stmt->fetch();
            $slide ? jsonResponse($slide) : jsonResponse(['error' => 'Not found'], 404);
        } else {
            $catId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;
            if ($catId) {
                $stmt = $db->prepare("SELECT s.*, c.name AS category_name FROM slides s
                                      JOIN categories c ON s.category_id = c.id
                                      WHERE s.category_id = ? AND s.is_active = 1
                                      ORDER BY s.sort_order ASC");
                $stmt->execute([$catId]);
            } else {
                $stmt = $db->query("SELECT s.*, c.name AS category_name FROM slides s
                                    JOIN categories c ON s.category_id = c.id
                                    WHERE s.is_active = 1 ORDER BY c.sort_order, s.sort_order ASC");
            }
            jsonResponse($stmt->fetchAll());
        }
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $catId   = (int)($data['category_id'] ?? 0);
        $title   = sanitize($data['title'] ?? '');
        $desc    = sanitize($data['description'] ?? '');
        $sImg    = sanitize($data['slide_image'] ?? '');
        $tImg    = sanitize($data['thumbnail_image'] ?? '');
        $sort    = (int)($data['sort_order'] ?? 0);
        $active  = (int)($data['is_active'] ?? 1);

        if (!$catId || !$title) jsonResponse(['error' => 'category_id and title are required'], 422);

        $stmt = $db->prepare("INSERT INTO slides (category_id, title, description, slide_image, thumbnail_image, sort_order, is_active)
                              VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$catId, $title, $desc, $sImg, $tImg, $sort, $active]);
        jsonResponse(['id' => $db->lastInsertId(), 'message' => 'Slide created'], 201);
    }

    if ($method === 'PUT' && $id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $catId   = (int)($data['category_id'] ?? 0);
        $title   = sanitize($data['title'] ?? '');
        $desc    = sanitize($data['description'] ?? '');
        $sImg    = sanitize($data['slide_image'] ?? '');
        $tImg    = sanitize($data['thumbnail_image'] ?? '');
        $sort    = (int)($data['sort_order'] ?? 0);
        $active  = (int)($data['is_active'] ?? 1);

        if (!$catId || !$title) jsonResponse(['error' => 'category_id and title are required'], 422);

        $stmt = $db->prepare("UPDATE slides SET category_id=?, title=?, description=?, slide_image=?,
                              thumbnail_image=?, sort_order=?, is_active=? WHERE id=?");
        $stmt->execute([$catId, $title, $desc, $sImg, $tImg, $sort, $active, $id]);
        $stmt->rowCount() ? jsonResponse(['message' => 'Slide updated']) : jsonResponse(['error' => 'Not found'], 404);
    }

    if ($method === 'DELETE' && $id) {
        $stmt = $db->prepare("DELETE FROM slides WHERE id = ?");
        $stmt->execute([$id]);
        $stmt->rowCount() ? jsonResponse(['message' => 'Slide deleted']) : jsonResponse(['error' => 'Not found'], 404);
    }
}

// ──────────────────────────────────────────────
// ALL DATA (categories with their slides)
// ──────────────────────────────────────────────
elseif ($resource === 'all') {
    $cats = $db->query("SELECT * FROM categories ORDER BY sort_order ASC")->fetchAll();
    foreach ($cats as &$cat) {
        $stmt = $db->prepare("SELECT * FROM slides WHERE category_id = ? AND is_active = 1 ORDER BY sort_order ASC");
        $stmt->execute([$cat['id']]);
        $cat['slides'] = $stmt->fetchAll();
    }
    jsonResponse($cats);
}

else {
    jsonResponse(['error' => 'Unknown endpoint. Use /categories, /slides, or /all'], 404);
}
