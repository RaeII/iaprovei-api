# Sistema de Trilha de Estudos (Study Trail)

## Visão Geral

O sistema de trilha de estudos é uma funcionalidade inspirada no Duolingo que permite aos usuários seguirem uma jornada de aprendizado estruturada por **categoria de habilidade** (skill_category). Cada trilha é composta por 5 paradas (stops) que são desbloqueadas progressivamente baseadas na performance do usuário.

**Importante**: As trilhas são baseadas em `skill_category` e não em `subject` específico. Isso significa que diferentes concursos podem ter o mesmo assunto (português, matemática, etc.) mas compartilham a mesma categoria de habilidade, permitindo um aprendizado mais consolidado e métricas mais precisas.

## Características Principais

### 🎯 Trilha Adaptativa
- **5 paradas por categoria de habilidade**: Cada trilha possui exatamente 5 paradas sequenciais
- **Desbloqueio progressivo**: Paradas são desbloqueadas conforme o usuário completa as anteriores
- **Geração dinâmica**: As paradas são criadas dinamicamente quando o usuário clica nelas

### 📊 Sistema de Performance
- **Métricas por skill_category**: Taxa de acerto, tempo de resposta, sequências de acertos/erros agrupadas por categoria de habilidade
- **Ajuste de dificuldade**: Baseado na performance, a próxima parada pode ser mais difícil ou manter a mesma dificuldade
- **XP e recompensas**: Sistema de pontuação baseado em performance
- **Consolidação de aprendizado**: Performance é compartilhada entre diferentes concursos da mesma categoria

### 🧠 Seleção Inteligente de Questões
- **3 níveis de dificuldade**: Fácil, Médio, Difícil
- **Busca por skill_category**: Questões são buscadas de todos os subjects que pertencem à mesma categoria de habilidade
- **Seleção aleatória**: Questões são selecionadas aleatoriamente dentro do nível de dificuldade
- **Estratégias modulares**: Sistema permite trocar a estratégia de seleção de dificuldade

## Estrutura do Banco de Dados

### Tabelas Principais

1. **study_trails**: Trilhas de estudo do usuário
2. **study_trail_stops**: Paradas individuais da trilha
3. **study_trail_stop_questions**: Questões de cada parada
4. **study_trail_performance**: Métricas de performance por usuário/skill_category

## API Endpoints

### Criar Trilha de Estudos
```http
POST /study-trails
Content-Type: application/json
Authorization: Bearer {token}

{
  "skill_category_id": 1,
  "name": "Trilha de Matemática", // opcional
  "description": "Trilha focada em álgebra básica" // opcional
}
```

### Listar Trilhas do Usuário
```http
GET /study-trails
Authorization: Bearer {token}
```

### Obter Detalhes da Trilha
```http
GET /study-trails/{id}
Authorization: Bearer {token}
```

### Iniciar uma Parada
```http
POST /study-trails/stops/start
Content-Type: application/json
Authorization: Bearer {token}

{
  "study_trail_id": 1,
  "stop_position": 1
}
```

### Responder Questão
```http
POST /study-trails/questions/answer
Content-Type: application/json
Authorization: Bearer {token}

{
  "study_trail_stop_id": 1,
  "question_id": 123,
  "selected_option_id": 456,
  "response_time_seconds": 15,
  "used_hint": false,
  "confidence_level": 85
}
```

## Estratégias de Dificuldade

O sistema suporta múltiplas estratégias para seleção de dificuldade:

### 1. Adaptativa (Padrão)
- Ajusta dificuldade baseada na performance da última parada
- Boa performance (≥80%) → aumenta dificuldade
- Performance ruim (<60%) → mantém mesma dificuldade

### 2. Progressiva
- Aumenta dificuldade gradualmente conforme o número de paradas completadas
- Paradas 1-2: Fácil
- Paradas 3-4: Médio  
- Parada 5+: Difícil

### 3. Conservadora
- Mantém dificuldade baixa até alta confiança
- Só aumenta com performance muito alta (≥90%) e consistente

### 4. Agressiva
- Aumenta dificuldade rapidamente
- Já começa com nível médio
- Performance ≥60% → Difícil

### 5. Baseada em Tempo
- Considera velocidade de resposta além da precisão
- Respostas rápidas + alta precisão → aumenta dificuldade

## Como Usar as Estratégias

```typescript
// No service
studyTrailService.setDifficultyStrategyByName('progressive');

// Ou criar estratégia customizada
const customStrategy = new MyCustomDifficultyStrategy();
studyTrailService.setDifficultyStrategy(customStrategy);

// Listar estratégias disponíveis
const strategies = studyTrailService.getAvailableStrategies();
```

## Regras de Negócio

### Desbloqueio de Paradas
- Primeira parada sempre desbloqueada
- Paradas seguintes desbloqueadas ao atingir taxa mínima de sucesso (70% padrão)
- Última parada completa a trilha

### Sistema de XP
- XP base por questão: 10 pontos
- Multiplicadores:
  - Resposta correta: 1.5x
  - Resposta rápida (<30s): +0.5x
  - Sem usar dica: +0.3x

### Performance Tracking
- Métricas atualizadas em tempo real
- Histórico de performance por dificuldade
- Tendências de melhoria/declínio

## Extensibilidade

### Adicionando Nova Estratégia
1. Implementar interface `DifficultySelectionStrategy`
2. Adicionar no `DifficultyStrategyFactory`
3. Registrar nome na lista de estratégias disponíveis

### Personalizações Futuras
- Número de paradas configurável
- Tipos de parada diferentes (lição, prática, desafio, revisão)
- Critérios de desbloqueio personalizáveis
- Integração com sistema de conquistas

## Monitoramento e Analytics

O sistema coleta métricas detalhadas para análise:
- Taxa de conclusão de trilhas
- Tempo médio por parada
- Eficácia das diferentes estratégias de dificuldade
- Padrões de abandono e engajamento
