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

$db       = Database::getInstance()->getConnection();
$method   = $_SERVER['REQUEST_METHOD'];
$path     = trim($_GET['path'] ?? '', '/');
$parts    = explode('/', $path);
$resource = $parts[0] ?? '';
$id       = isset($parts[1]) && $parts[1] !== '' ? (int)$parts[1] : null;

// ── helper: does the eyebrow column exist? ──
function hasEyebrowColumn($db) {
    try {
        $r = $db->query("SHOW COLUMNS FROM slides LIKE 'eyebrow'");
        return $r->rowCount() > 0;
    } catch (Exception $e) {
        return false;
    }
}

// ──────────────────────────────────────────────
// CATEGORIES
// ──────────────────────────────────────────────
if ($resource === 'categories') {

    switch ($method) {

        case 'GET':
            if ($id) {
                $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
                $stmt->execute([$id]);
                $cat = $stmt->fetch();
                jsonResponse($cat ?: ['error' => 'Not found'], $cat ? 200 : 404);
            }
            $stmt = $db->query("SELECT * FROM categories ORDER BY sort_order ASC");
            jsonResponse($stmt->fetchAll());
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $name = sanitize($data['name'] ?? '');
            $slug = sanitize($data['slug'] ?? strtolower(str_replace(' ', '-', $name)));
            $sort = (int)($data['sort_order'] ?? 0);
            if (!$name) jsonResponse(['error' => 'Name is required'], 422);
            $stmt = $db->prepare("INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)");
            $stmt->execute([$name, $slug, $sort]);
            jsonResponse(['id' => (int)$db->lastInsertId(), 'message' => 'Category created'], 201);
            break;

        case 'PUT':
            if (!$id) jsonResponse(['error' => 'ID required'], 400);
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $name = sanitize($data['name'] ?? '');
            $slug = sanitize($data['slug'] ?? '');
            $sort = (int)($data['sort_order'] ?? 0);
            if (!$name) jsonResponse(['error' => 'Name is required'], 422);
            $stmt = $db->prepare("UPDATE categories SET name=?, slug=?, sort_order=? WHERE id=?");
            $stmt->execute([$name, $slug, $sort, $id]);
            jsonResponse($stmt->rowCount() ? ['message' => 'Category updated'] : ['error' => 'Not found'], $stmt->rowCount() ? 200 : 404);
            break;

        case 'DELETE':
            if (!$id) jsonResponse(['error' => 'ID required'], 400);
            $stmt = $db->prepare("DELETE FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            jsonResponse($stmt->rowCount() ? ['message' => 'Category deleted'] : ['error' => 'Not found'], $stmt->rowCount() ? 200 : 404);
            break;

        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
}

// ──────────────────────────────────────────────
// SLIDES
// ──────────────────────────────────────────────
elseif ($resource === 'slides') {

    $useEyebrow = hasEyebrowColumn($db);

    switch ($method) {

        case 'GET':
            if ($id) {
                $stmt = $db->prepare(
                    "SELECT s.*, c.name AS category_name
                     FROM slides s JOIN categories c ON s.category_id = c.id
                     WHERE s.id = ?"
                );
                $stmt->execute([$id]);
                $slide = $stmt->fetch();
                jsonResponse($slide ?: ['error' => 'Not found'], $slide ? 200 : 404);
            }
            $catId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;
            if ($catId) {
                $stmt = $db->prepare(
                    "SELECT s.*, c.name AS category_name FROM slides s
                     JOIN categories c ON s.category_id = c.id
                     WHERE s.category_id = ? AND s.is_active = 1
                     ORDER BY s.sort_order ASC"
                );
                $stmt->execute([$catId]);
            } else {
                $stmt = $db->query(
                    "SELECT s.*, c.name AS category_name FROM slides s
                     JOIN categories c ON s.category_id = c.id
                     WHERE s.is_active = 1
                     ORDER BY c.sort_order, s.sort_order ASC"
                );
            }
            jsonResponse($stmt->fetchAll());
            break;

        case 'POST':
            $data   = json_decode(file_get_contents('php://input'), true) ?? [];
            $catId  = (int)($data['category_id'] ?? 0);
            $title  = sanitize($data['title']           ?? '');
            $desc   = sanitize($data['description']     ?? '');
            $sImg   = sanitize($data['slide_image']     ?? '');
            $tImg   = sanitize($data['thumbnail_image'] ?? '');
            $sort   = (int)($data['sort_order'] ?? 0);
            $active = (int)($data['is_active']  ?? 1);
            if (!$catId || !$title) jsonResponse(['error' => 'category_id and title are required'], 422);

            if ($useEyebrow) {
                $eyebrow = sanitize($data['eyebrow'] ?? '');
                $stmt = $db->prepare(
                    "INSERT INTO slides (category_id, title, eyebrow, description, slide_image, thumbnail_image, sort_order, is_active)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                );
                $stmt->execute([$catId, $title, $eyebrow, $desc, $sImg, $tImg, $sort, $active]);
            } else {
                $stmt = $db->prepare(
                    "INSERT INTO slides (category_id, title, description, slide_image, thumbnail_image, sort_order, is_active)
                     VALUES (?, ?, ?, ?, ?, ?, ?)"
                );
                $stmt->execute([$catId, $title, $desc, $sImg, $tImg, $sort, $active]);
            }
            jsonResponse(['id' => (int)$db->lastInsertId(), 'message' => 'Slide created'], 201);
            break;

        case 'PUT':
            if (!$id) jsonResponse(['error' => 'ID required'], 400);
            $data   = json_decode(file_get_contents('php://input'), true) ?? [];
            $catId  = (int)($data['category_id'] ?? 0);
            $title  = sanitize($data['title']           ?? '');
            $desc   = sanitize($data['description']     ?? '');
            $sImg   = sanitize($data['slide_image']     ?? '');
            $tImg   = sanitize($data['thumbnail_image'] ?? '');
            $sort   = (int)($data['sort_order'] ?? 0);
            $active = (int)($data['is_active']  ?? 1);
            if (!$catId || !$title) jsonResponse(['error' => 'category_id and title are required'], 422);

            if ($useEyebrow) {
                $eyebrow = sanitize($data['eyebrow'] ?? '');
                $stmt = $db->prepare(
                    "UPDATE slides SET category_id=?, title=?, eyebrow=?, description=?,
                     slide_image=?, thumbnail_image=?, sort_order=?, is_active=? WHERE id=?"
                );
                $stmt->execute([$catId, $title, $eyebrow, $desc, $sImg, $tImg, $sort, $active, $id]);
            } else {
                $stmt = $db->prepare(
                    "UPDATE slides SET category_id=?, title=?, description=?,
                     slide_image=?, thumbnail_image=?, sort_order=?, is_active=? WHERE id=?"
                );
                $stmt->execute([$catId, $title, $desc, $sImg, $tImg, $sort, $active, $id]);
            }
            jsonResponse($stmt->rowCount() ? ['message' => 'Slide updated'] : ['error' => 'Not found'], $stmt->rowCount() ? 200 : 404);
            break;

        case 'DELETE':
            if (!$id) jsonResponse(['error' => 'ID required'], 400);
            $stmt = $db->prepare("DELETE FROM slides WHERE id = ?");
            $stmt->execute([$id]);
            jsonResponse($stmt->rowCount() ? ['message' => 'Slide deleted'] : ['error' => 'Not found'], $stmt->rowCount() ? 200 : 404);
            break;

        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
}

// ──────────────────────────────────────────────
// ALL DATA — categories + their slides (no N+1)
// ──────────────────────────────────────────────
elseif ($resource === 'all') {
    $cats = $db->query("SELECT * FROM categories ORDER BY sort_order ASC")->fetchAll();
    $allSlides = $db->query(
        "SELECT * FROM slides WHERE is_active = 1 ORDER BY category_id, sort_order ASC"
    )->fetchAll();
    $slideMap = [];
    foreach ($allSlides as $s) {
        $slideMap[$s['category_id']][] = $s;
    }
    foreach ($cats as &$cat) {
        $cat['slides'] = $slideMap[$cat['id']] ?? [];
    }
    jsonResponse($cats);
}

else {
    jsonResponse(['error' => 'Unknown endpoint. Use /categories, /slides, or /all'], 404);
}
