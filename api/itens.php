<?php
include_once '../config/database.php';

// Instanciar banco de dados
$database = new Database();
$db = $database->getConnection();

// Obter método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Roteamento baseado no método HTTP
switch($method) {
    case 'GET':
        getItens($db);
        break;
    case 'POST':
        createItem($db);
        break;
    case 'PUT':
        updateItem($db);
        break;
    case 'DELETE':
        deleteItem($db);
        break;
    case 'OPTIONS':
        http_response_code(200);
        break;
    default:
        http_response_code(405);
        echo json_encode(['message' => 'Método não permitido']);
        break;
}

// Função para listar itens
function getItens($db) {
    $filtro = isset($_GET['filtro']) ? $_GET['filtro'] : '';
    $tipo = isset($_GET['tipo']) ? $_GET['tipo'] : '';
    
    $query = "SELECT * FROM itens WHERE 1=1";
    $params = [];
    
    if (!empty($filtro)) {
        $query .= " AND nome LIKE ?";
        $params[] = "%$filtro%";
    }
    
    if (!empty($tipo)) {
        $query .= " AND tipo = ?";
        $params[] = $tipo;
    }
    
    $query .= " ORDER BY data_atualizacao DESC";
    
    try {
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $itens = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $itens
        ]);
    } catch(PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao buscar itens: ' . $e->getMessage()
        ]);
    }
}

// Função para criar item
function createItem($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->nome) || !isset($data->tipo) || !isset($data->quantidade)) {
        echo json_encode([
            'success' => false,
            'message' => 'Dados incompletos'
        ]);
        return;
    }
    
    $query = "INSERT INTO itens (nome, tipo, quantidade) VALUES (?, ?, ?)";
    
    try {
        $stmt = $db->prepare($query);
        $stmt->execute([$data->nome, $data->tipo, $data->quantidade]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Item criado com sucesso',
            'id' => $db->lastInsertId()
        ]);
    } catch(PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao criar item: ' . $e->getMessage()
        ]);
    }
}

// Função para atualizar item
function updateItem($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->id) || !isset($data->nome) || !isset($data->tipo) || !isset($data->quantidade)) {
        echo json_encode([
            'success' => false,
            'message' => 'Dados incompletos'
        ]);
        return;
    }
    
    $query = "UPDATE itens SET nome = ?, tipo = ?, quantidade = ? WHERE id = ?";
    
    try {
        $stmt = $db->prepare($query);
        $stmt->execute([$data->nome, $data->tipo, $data->quantidade, $data->id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Item atualizado com sucesso'
        ]);
    } catch(PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao atualizar item: ' . $e->getMessage()
        ]);
    }
}

// Função para deletar item
function deleteItem($db) {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$id) {
        echo json_encode([
            'success' => false,
            'message' => 'ID não fornecido'
        ]);
        return;
    }
    
    $query = "DELETE FROM itens WHERE id = ?";
    
    try {
        $stmt = $db->prepare($query);
        $stmt->execute([$id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Item deletado com sucesso'
        ]);
    } catch(PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao deletar item: ' . $e->getMessage()
        ]);
    }
}
?>
