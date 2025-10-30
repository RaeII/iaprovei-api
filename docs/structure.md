entities -> Ficam as estruturas das tabelas
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlJhZWwiLCJzdWIiOjEsImlhdCI6MTc2MTg0NTQwMywiZXhwIjoxNzYxOTMxODAzfQ.W80-LDUBBm8wMTLe7TwAxua6BQXEFR4ZnyqLZyUoB78

# INICIAR UM MODULO
nest g m modules/user_plans
nest g co modules/user_plans
nest g s modules/user_plans

CREATE TABLE plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,                -- nome do plano (ex: Basic, Premium, Pro)
  description TEXT,                          -- descrição detalhada do plano
  price DECIMAL(10,2) NOT NULL,              -- preço do plano (ex: 99.90)
  duration_in_days INT NOT NULL,             -- duração do plano em dias (ex: 30, 90, 365)
  is_active BOOLEAN DEFAULT TRUE,            -- define se o plano está ativo
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  status ENUM('active', 'inactive', 'cancelled'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

Crie o schema type, sevice e o controller em @user_plans  ,
usando como referência:
@user.schema.ts 
@user.service.ts 
@user.controller.ts 

E a entity em @entities usando como referencia:
@user.entity.ts 

Abaixo está o SQL da tabela user_plans para que você saiba quais são os campos:

CREATE TABLE user_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  status ENUM('active', 'inactive', 'cancelled'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES user_plans(id)
);


Faça funções de busca (retrieve functions) em
@user_plans 
Sempre utilize o padrão SOLID e leve em consideração que a API precisa ser rápida.

Existe o arquivo
@query-utils.ts 
caso precise usar ou criar algo que possa ser aproveitado por todos os serviços,
e também o
@pagination.schema.ts 
se for necessário usar ou criar algum novo tipo relacionado à paginação.

Validações compartilhadas, como verificação de existência (assert existence),
devem ser colocadas em:
@shared 