<?php
// Arquivo para debug - coloque na raiz do projeto
echo "<h1>🔍 Debug do Sistema</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .info { background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 10px 0; }
    .success { background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0; }
    .error { background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0; }
    pre { background: #f8f9fa; padding: 15px; border-radius: 5px; }
</style>";

echo "<div class='info'><strong>📍 Localização atual:</strong> " . __DIR__ . "</div>";
echo "<div class='info'><strong>🌐 URL atual:</strong> " . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'] . "</div>";
echo "<div class='info'><strong>🔧 Versão PHP:</strong> " . phpversion() . "</div>";

// Verificar estrutura de arquivos
echo "<h2>📁 Estrutura de Arquivos</h2>";
$files = [
    'index.html',
    'config/database.php',
    'api/itens.php',
    'assets/style.css',
    'assets/script.js',
    'banco.sql'
];

foreach ($files as $file) {
    if (file_exists($file)) {
        echo "<div class='success'>✅ $file - ENCONTRADO</div>";
    } else {
        echo "<div class='error'>❌ $file - NÃO ENCONTRADO</div>";
    }
}

// Verificar permissões
echo "<h2>🔐 Verificar Permissões</h2>";
if (is_readable('.')) {
    echo "<div class='success'>✅ Diretório atual é legível</div>";
} else {
    echo "<div class='error'>❌ Problema de permissão no diretório</div>";
}

// Listar todos os arquivos no diretório
echo "<h2>📋 Arquivos no Diretório Atual</h2>";
$dir_contents = scandir('.');
echo "<pre>";
foreach ($dir_contents as $item) {
    if ($item != '.' && $item != '..') {
        $type = is_dir($item) ? '[DIR]' : '[FILE]';
        echo "$type $item\n";
    }
}
echo "</pre>";

// Testar MySQL
echo "<h2>🗄️ Teste MySQL</h2>";
try {
    $pdo = new PDO("mysql:host=localhost", "root", "");
    echo "<div class='success'>✅ Conexão MySQL: OK</div>";
    
    $stmt = $pdo->query("SHOW DATABASES");
    $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "<div class='info'><strong>Bancos disponíveis:</strong><br>" . implode(', ', $databases) . "</div>";
    
} catch (Exception $e) {
    echo "<div class='error'>❌ Erro MySQL: " . $e->getMessage() . "</div>";
}
?>
