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

**Resposta (última questão da parada):**
```json
{
  "is_correct": true,
  "xp_earned": 15,
  "correct_option_id": 2,
  "explanation": "A resposta correta é...",
  "is_last_question": true,
  "performance": {
    "stop_id": 1,
    "stop_name": "Parada 1 - Álgebra Básica",
    "total_questions": 10,
    "questions_answered": 10,
    "correct_answers": 8,
    "incorrect_answers": 2,
    "success_rate": 80.0,
    "average_response_time": 25.5,
    "total_xp_earned": 120,
    "performance_grade": "B",
    "is_completed": true,
    "can_retry": false,
    "next_stop_unlocked": true,
    "streak_bonus": 12,
    "speed_bonus": 8,
    "accuracy_bonus": 0
  }
}
```

### Reiniciar Parada (Retry)
```http
POST /study-trails/stops/{stopId}/retry
Authorization: Bearer {token}
```

### Obter Performance da Parada
```http
GET /study-trails/stops/{stopId}/performance
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "stop_id": 1,
  "stop_name": "Parada 1 - Álgebra Básica",
  "total_questions": 10,
  "questions_answered": 10,
  "correct_answers": 8,
  "incorrect_answers": 2,
  "success_rate": 80.0,
  "average_response_time": 25.5,
  "total_xp_earned": 120,
  "performance_grade": "B",
  "is_completed": true,
  "can_retry": false,
  "next_stop_unlocked": true,
  "streak_bonus": 12,
  "speed_bonus": 8,
  "accuracy_bonus": 0
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
- **Status FAILED**: Se não atingir 70%, parada fica como FAILED (preserva performance)
- **Retry inteligente**: Questões só são resetadas no próximo start
- Última parada completa a trilha

### Sistema de Retry Inteligente
- **Problema**: Usuário não pode refazer questões já respondidas
- **Solução**: Sistema de status FAILED que preserva histórico de performance
- **Funcionamento**: 
  - **Performance < 70%**: Parada marcada como `FAILED` (mantém histórico)
  - **Próximo start**: Questões são resetadas automaticamente
  - **Vantagem**: Permite análise de performance mesmo após falha
  - **Flexibilidade**: Usuário pode tentar novamente quando quiser

### Sistema de Performance
- **Métricas calculadas**: Taxa de acerto, tempo médio, XP total
- **Nota de performance**: S a F baseada em acurácia e velocidade
- **Bônus especiais**:
  - **Streak Bonus**: Sequência de acertos consecutivos (até 20 pontos)
  - **Speed Bonus**: Respostas rápidas < 20s (até 15 pontos)
  - **Accuracy Bonus**: Alta taxa de acerto > 90% (10 pontos)
- **Feedback imediato**: Performance retornada na última questão
- **Análise detalhada**: Endpoint dedicado para métricas completas

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
