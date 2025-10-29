entities -> Ficam as estruturas das tabelas


# INICIAR UM MODULO
nest g m modules/plans
nest g co modules/plans
nest g s modules/plans

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
  start_date DATE,
  end_date DATE,
  status ENUM('active', 'inactive', 'cancelled'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

Vamos criar o schema type e a entity em
/Users/lcsschmidt/Documents/_Projects/iaprovei-api/src/modules/plans/,
usando como referência:

/Users/lcsschmidt/Documents/_Projects/iaprovei-api/src/entities/user.entity.ts

/Users/lcsschmidt/Documents/_Projects/iaprovei-api/src/modules/user/user.service.ts

Abaixo está o SQL da tabela plans para que você saiba quais são os campos:

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


Vamos criar as funções de busca (retrieve functions) em
/Users/lcsschmidt/Documents/_Projects/iaprovei-api/src/modules/plans/.
Sempre utilize o padrão SOLID e leve em consideração que a API precisa ser rápida.
Por enquanto não é necessário criar o controller, pois isso será usado apenas internamente.

Existe o arquivo
/Users/lcsschmidt/Documents/_Projects/iaprovei-api/src/common/utils/query-utils.ts
caso precise usar ou criar algo que possa ser aproveitado por todos os serviços,
e também o
/Users/lcsschmidt/Documents/_Projects/iaprovei-api/src/common/schemas/pagination.schema.ts
se for necessário usar ou criar algum novo tipo relacionado à paginação.

Validações compartilhadas, como verificação de existência (assert existence),
devem ser colocadas em:
/Users/lcsschmidt/Documents/_Projects/iaprovei-api/src/shared/