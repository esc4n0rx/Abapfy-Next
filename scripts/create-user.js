// scripts/create-user.js
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// Função para carregar variáveis de ambiente do .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

// Carregar variáveis de ambiente
loadEnvFile();

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validações
if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
  console.error('\n❌ Erro: NEXT_PUBLIC_SUPABASE_URL não configurada');
  console.log('📝 Configure sua URL do Supabase no arquivo .env.local');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co');
  process.exit(1);
}

if (!supabaseServiceKey || supabaseServiceKey === 'your_supabase_service_role_key') {
  console.error('\n❌ Erro: SUPABASE_SERVICE_ROLE_KEY não configurada');
  console.log('📝 Configure sua Service Role Key no arquivo .env.local');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJ...');
  process.exit(1);
}

let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} catch (error) {
  console.error('\n❌ Erro ao conectar com Supabase:', error.message);
  console.log('📝 Verifique se as credenciais no .env.local estão corretas');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const questionHidden = (prompt) => {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.resume();
    stdin.setEncoding('utf8');
    
    // Verificar se o terminal suporta modo raw
    if (typeof stdin.setRawMode === 'function') {
      stdin.setRawMode(true);
    }
    
    process.stdout.write(prompt);
    
    let password = '';
    
    const onData = (char) => {
      char = char.toString();
      
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D
          if (typeof stdin.setRawMode === 'function') {
            stdin.setRawMode(false);
          }
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          process.stdout.write('\n');
          process.exit(0);
          break;
        case '\u0008': // Backspace
        case '\u007f': // Delete
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          if (char.charCodeAt(0) >= 32) { // Apenas caracteres imprimíveis
            password += char;
            process.stdout.write('*');
          }
          break;
      }
    };
    
    stdin.on('data', onData);
  });
};

async function createUser() {
  try {
    console.log('🚀 Abapfy - Criador de Usuários');
    console.log('=====================================\n');

    // Testar conexão com Supabase
    console.log('🔗 Testando conexão com Supabase...');
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error && !error.message.includes('relation "users" does not exist')) {
        throw error;
      }
      console.log('✅ Conexão estabelecida com sucesso!\n');
    } catch (error) {
      console.error('❌ Erro na conexão:', error.message);
      if (error.message.includes('relation "users" does not exist')) {
        console.log('\n📝 Execute o script SQL no Supabase para criar a tabela users:');
        console.log('   1. Acesse o SQL Editor no dashboard do Supabase');
        console.log('   2. Execute o conteúdo do arquivo supabase-schema.sql\n');
      }
      process.exit(1);
    }

    const email = await question('📧 Email: ');
    const firstName = await question('👤 Nome: ');
    const lastName = await question('👤 Sobrenome: ');
    const company = await question('🏢 Empresa (opcional): ');
    
    let password, confirmPassword;
    do {
      password = await questionHidden('🔒 Senha (mín. 6 caracteres): ');
      if (password.length < 6) {
        console.log('❌ A senha deve ter pelo menos 6 caracteres\n');
        continue;
      }
      confirmPassword = await questionHidden('🔒 Confirmar senha: ');
      if (password !== confirmPassword) {
        console.log('❌ As senhas não coincidem\n');
      }
    } while (password !== confirmPassword || password.length < 6);

    // Validações
    if (!email || !firstName || !lastName || !password) {
      console.error('\n❌ Todos os campos obrigatórios devem ser preenchidos');
      process.exit(1);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('\n❌ Email inválido');
      process.exit(1);
    }

    console.log('\n🔄 Processando...');

    // Verificar se usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      console.error('\n❌ Email já está em uso');
      process.exit(1);
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12);

    // Criar usuário
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        company: company || null,
        role: 'developer'
      })
      .select()
      .single();

    if (error) {
      console.error('\n❌ Erro ao criar usuário:', error.message);
      process.exit(1);
    }

    console.log('\n✅ Usuário criado com sucesso!');
    console.log('=====================================');
    console.log('📧 Email:', user.email);
    console.log('👤 Nome:', `${user.first_name} ${user.last_name}`);
    console.log('🏢 Empresa:', user.company || 'Não informado');
    console.log('👥 Perfil:', user.role);
    console.log('📅 Criado em:', new Date(user.created_at).toLocaleString('pt-BR'));
    console.log('=====================================');
    console.log('\n🎉 Agora você pode fazer login no Abapfy!');

  } catch (error) {
    console.error('\n❌ Erro inesperado:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Executar função principal
createUser();