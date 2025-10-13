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
- **Ajuste de dificuldade adaptativo**: Respeita o patamar de 70% para avançar, usa sequências de acertos/erros para subir ou aliviar a dificuldade e exige consistência antes de liberar desafios difíceis
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
- Usa o patamar de desbloqueio (70%) como referência para promover a dificuldade
- Exige consistência antes de enviar o usuário para desafios difíceis
- Possui modo de recuperação que reduz a pressão após quedas de performance ou sequências de erro

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

# Sistema de Trilhas de Estudo - Bônus e Criação

## Visão Geral

O sistema de trilhas de estudo é uma funcionalidade inspirada no Duolingo que permite aos usuários seguirem uma jornada de aprendizado estruturada por **categoria de habilidade** (skill_category). O sistema inclui um sofisticado esquema de bônus e pontuação que recompensa diferentes aspectos da performance do usuário.

## 🎯 Sistema de Criação de Trilhas

### Processo de Criação

1. **Validação de Categoria**: O sistema verifica se a `skill_category_id` existe
2. **Verificação de Duplicatas**: Impede criação de múltiplas trilhas ativas para a mesma categoria
3. **Criação da Trilha**: Gera uma trilha com 5 paradas sequenciais
4. **Primeira Parada**: A primeira parada é automaticamente desbloqueada
5. **Paradas Dinâmicas**: As demais paradas são criadas dinamicamente conforme o usuário progride

### Estrutura de uma Trilha

```typescript
interface StudyTrail {
  id: number;
  user_id: number;
  skill_category_id: number;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'paused';
  current_stop_position: number; // 1-5
  total_stops: number; // Sempre 5
  completion_percentage: number;
  total_xp_earned: number;
  average_performance: number;
}
```

### Endpoint de Criação

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

## 🏆 Sistema de Bônus e XP

### XP Base por Questão

- **XP Base**: 10 pontos por questão
- **Multiplicadores**:
  - Resposta correta: `1.5x`
  - Resposta rápida (<30s): `+0.5x`
  - Sem usar dica: `+0.3x`

### Cálculo de XP

O sistema calcula XP individual para cada questão baseado em múltiplos fatores:

```typescript
// Cálculo de XP por questão
const baseXP = 10;
let xpMultiplier = 1;

if (isCorrect) {
  xpMultiplier = 1.5; // Resposta correta
  
  if (responseTime < 30) {
    xpMultiplier += 0.5; // Bônus por velocidade (<30s)
  }
  
  if (!usedHint) {
    xpMultiplier += 0.3; // Bônus por não usar dica
  }
}

const finalXP = Math.round(baseXP * xpMultiplier);
```

### Exemplos de Cálculo de XP

| Cenário | Base XP | Multiplicador | XP Final |
|---------|---------|---------------|----------|
| Resposta incorreta | 10 | 1.0 | 10 |
| Correta + lenta + dica | 10 | 1.5 | 15 |
| Correta + rápida + dica | 10 | 2.0 | 20 |
| Correta + lenta + sem dica | 10 | 1.8 | 18 |
| Correta + rápida + sem dica | 10 | 2.3 | 23 |

### Sistema de Bônus Especiais

O sistema calcula três tipos de bônus baseados na performance geral da parada:

#### 1. Streak Bonus (Bônus por Sequência) 🎯

O **Streak Bonus** recompensa sequências consecutivas de acertos, incentivando consistência e concentração.

**Como Funciona:**
- **Cálculo**: Maior sequência de acertos consecutivos × 2
- **Máximo**: 20 pontos (equivalente a 10 acertos seguidos)
- **Reset**: Qualquer erro zera a sequência atual
- **Objetivo**: Incentivar respostas corretas consecutivas

**Algoritmo Detalhado:**
```typescript
let maxStreak = 0;        // Maior sequência encontrada
let currentStreak = 0;     // Sequência atual

for (const question of questions) {
  if (question.answer_status === 'CORRECT') {
    currentStreak++;                    // Incrementa sequência
    maxStreak = Math.max(maxStreak, currentStreak); // Atualiza máximo
  } else {
    currentStreak = 0;                  // Reset na sequência
  }
}

const streakBonus = Math.min(maxStreak * 2, 20); // Máximo 20 pontos
```

**Exemplos Práticos:**

| Sequência de Respostas | Streak Máximo | Cálculo | Bônus |
|------------------------|---------------|---------|-------|
| ✅✅✅❌✅✅ | 3 | 3 × 2 | 6 pontos |
| ✅✅✅✅✅❌✅✅ | 5 | 5 × 2 | 10 pontos |
| ✅✅✅✅✅✅✅✅✅✅✅ | 11 | 11 × 2 = 22 → 20 | 20 pontos (máximo) |
| ✅❌✅❌✅❌ | 1 | 1 × 2 | 2 pontos |

**Estratégias para Maximizar:**
- **Concentração**: Evitar distrações durante a sequência
- **Ritmo**: Manter velocidade constante sem pressa excessiva
- **Conhecimento**: Focar em questões que domina bem

#### 2. Speed Bonus (Bônus por Velocidade) ⚡

O **Speed Bonus** recompensa respostas rápidas, incentivando agilidade e conhecimento consolidado.

**Como Funciona:**
- **Cálculo**: Número de respostas rápidas (<20s) × 1
- **Máximo**: 15 pontos (equivalente a 15 respostas rápidas)
- **Critério**: Tempo de resposta ≤ 20 segundos
- **Objetivo**: Incentivar conhecimento consolidado e agilidade

**Algoritmo Detalhado:**
```typescript
// Filtra apenas respostas rápidas (≤20s)
const fastAnswers = questions.filter(q => q.response_time_seconds <= 20).length;

// Calcula bônus (1 ponto por resposta rápida)
const speedBonus = Math.min(fastAnswers * 1, 15); // Máximo 15 pontos
```

**Exemplos Práticos:**

| Cenário | Respostas Rápidas | Cálculo | Bônus |
|----------|-------------------|---------|-------|
| 10 questões, 5 rápidas | 5 | 5 × 1 | 5 pontos |
| 10 questões, 8 rápidas | 8 | 8 × 1 | 8 pontos |
| 10 questões, 12 rápidas | 10 | 10 × 1 | 10 pontos |
| 20 questões, 18 rápidas | 15 | 15 × 1 | 15 pontos (máximo) |

**Distribuição de Tempos Típica:**
- **≤10s**: Conhecimento muito consolidado
- **11-20s**: Conhecimento bom, resposta confiante
- **21-30s**: Conhecimento médio, alguma hesitação
- **>30s**: Conhecimento fraco ou questão difícil

**Estratégias para Maximizar:**
- **Estudo Prévio**: Revisar conceitos antes de começar
- **Prática Regular**: Familiaridade com tipos de questão
- **Concentração**: Evitar distrações durante resposta
- **Confiança**: Não hesitar em respostas que sabe

### 🔄 Interação entre Streak e Speed Bonus

Os dois bônus podem ser maximizados simultaneamente, mas requerem estratégias diferentes:

**Cenário Ideal:**
- **Streak**: Manter sequência longa de acertos
- **Speed**: Responder rapidamente sem comprometer precisão
- **Resultado**: Máximo de 35 pontos (20 + 15)

**Exemplo de Performance Excelente:**
```
Questão 1: ✅ (15s) - Streak: 1, Speed: 1
Questão 2: ✅ (12s) - Streak: 2, Speed: 2  
Questão 3: ✅ (18s) - Streak: 3, Speed: 3
Questão 4: ✅ (8s)  - Streak: 4, Speed: 4
Questão 5: ✅ (14s) - Streak: 5, Speed: 5
...
Questão 10: ✅ (16s) - Streak: 10, Speed: 10

Resultado Final:
- Streak Bonus: 20 pontos (máximo)
- Speed Bonus: 10 pontos
- Total Bônus: 30 pontos
```

**Trade-offs Comuns:**
- **Velocidade vs Precisão**: Respostas muito rápidas podem gerar erros
- **Sequência vs Velocidade**: Manter streak pode exigir mais tempo
- **Estratégia Balanceada**: Encontrar ritmo ideal para ambos

### 📊 Análise de Performance por Bônus

**Perfil de Usuário Rápido:**
- Speed Bonus: Alto (12-15 pontos)
- Streak Bonus: Médio (6-12 pontos)
- Característica: Conhecimento consolidado, respostas instintivas

**Perfil de Usuário Consistente:**
- Streak Bonus: Alto (15-20 pontos)
- Speed Bonus: Médio (8-12 pontos)
- Característica: Metódico, evita erros, ritmo constante

**Perfil de Usuário Balanceado:**
- Speed Bonus: Médio (8-12 pontos)
- Streak Bonus: Médio (8-15 pontos)
- Característica: Equilibrio entre velocidade e precisão

#### 3. Accuracy Bonus (Bônus por Precisão)
- **Taxa ≥ 90%**: 10 pontos
- **Taxa ≥ 80%**: 5 pontos
- **Taxa < 80%**: 0 pontos

```typescript
const accuracyRate = correctAnswers.length / questions.length;
const accuracyBonus = accuracyRate >= 0.9 ? 10 : accuracyRate >= 0.8 ? 5 : 0;
```

### 🎯 Casos de Uso Práticos

#### Cenário 1: Usuário Iniciante
```
Performance: 6/10 acertos, tempo médio 45s
- Streak Bonus: 3 × 2 = 6 pontos (sequência máxima)
- Speed Bonus: 1 × 1 = 1 ponto (1 resposta <20s)
- Accuracy Bonus: 0 pontos (<80%)
- Total Bônus: 7 pontos
```

#### Cenário 2: Usuário Intermediário
```
Performance: 8/10 acertos, tempo médio 25s
- Streak Bonus: 5 × 2 = 10 pontos (sequência máxima)
- Speed Bonus: 4 × 1 = 4 pontos (4 respostas <20s)
- Accuracy Bonus: 5 pontos (80%+)
- Total Bônus: 19 pontos
```

#### Cenário 3: Usuário Avançado
```
Performance: 9/10 acertos, tempo médio 15s
- Streak Bonus: 7 × 2 = 14 pontos (sequência máxima)
- Speed Bonus: 8 × 1 = 8 pontos (8 respostas <20s)
- Accuracy Bonus: 10 pontos (90%+)
- Total Bônus: 32 pontos
```

### 💡 Dicas Avançadas para Maximizar Bônus

#### Para Streak Bonus:
1. **Comece Devagar**: Primeiras questões com mais cuidado
2. **Evite Pressa**: Melhor perder speed bonus que quebrar streak
3. **Conheça Seus Pontos Fortes**: Foque em questões que domina
4. **Mantenha Ritmo**: Não mude drasticamente a velocidade

#### Para Speed Bonus:
1. **Estude Antes**: Revisão prévia aumenta confiança
2. **Pratique Regularmente**: Familiaridade gera velocidade
3. **Elimine Distrações**: Ambiente focado para respostas rápidas
4. **Confie no Primeiro Instinto**: Hesitação consome tempo

#### Estratégia Híbrida (Máximo Bônus):
1. **Fase 1 (Questões 1-3)**: Foco em streak, velocidade moderada
2. **Fase 2 (Questões 4-7)**: Aumentar velocidade mantendo precisão
3. **Fase 3 (Questões 8-10)**: Velocidade máxima se streak está seguro

### 🔍 Análise de Dados do Sistema

O sistema coleta métricas detalhadas para cada tipo de bônus:

```typescript
// Métricas de Streak
interface StreakMetrics {
  maxStreak: number;           // Maior sequência da sessão
  currentStreak: number;       // Sequência atual
  streakBreaks: number;        // Número de quebras
  averageStreakLength: number; // Comprimento médio das sequências
}

// Métricas de Speed
interface SpeedMetrics {
  fastAnswers: number;         // Respostas <20s
  averageSpeed: number;        // Tempo médio de resposta
  speedConsistency: number;    // Consistência da velocidade
  fastestAnswer: number;       // Resposta mais rápida
}
```

### 📈 Evolução dos Bônus ao Longo do Tempo

**Primeira Semana:**
- Streak Bonus: 2-6 pontos (sequências curtas)
- Speed Bonus: 1-3 pontos (poucas respostas rápidas)

**Primeiro Mês:**
- Streak Bonus: 6-12 pontos (sequências médias)
- Speed Bonus: 4-8 pontos (mais respostas rápidas)

**Usuário Experiente:**
- Streak Bonus: 12-20 pontos (sequências longas)
- Speed Bonus: 8-15 pontos (maioria das respostas rápidas)

## 🧠 Sistema Adaptativo de Dificuldade

### Estratégias Disponíveis

O sistema possui 5 estratégias diferentes para seleção de dificuldade:

#### 1. **Adaptativa (Padrão)** - `AdaptiveDifficultyStrategy`
Sincroniza a progressão com a regra de desbloqueio (70%), valoriza sequências positivas e aplica um modo de recuperação quando o usuário precisa reconstruir confiança:

```typescript
selectDifficulty(performance: StudyTrailPerformance, lastStopPerformance?: number): DifficultyLevel {
  // Primeira parada sempre começa fácil
  if (!performance || performance.total_questions_answered === 0) {
    return DifficultyLevel.EASY;
  }

  const overallSuccess = Number(performance.success_rate) || 0;
  const consecutiveCorrect = performance.consecutive_correct_answers || 0;
  const consecutiveIncorrect = performance.consecutive_incorrect_answers || 0;
  const lastStop = typeof lastStopPerformance === 'number' ? lastStopPerformance : undefined;
  const fewAnswers = performance.total_questions_answered < 15;

  // Modo de recuperação: aliviar pressão até que o usuário reconstrua confiança
  if ((lastStop !== undefined && lastStop < 70) || consecutiveIncorrect >= 4) {
    if (overallSuccess >= 75 && consecutiveCorrect >= 3) {
      return DifficultyLevel.MEDIUM;
    }
    return DifficultyLevel.EASY;
  }

  const consistentHighPerformance = overallSuccess >= 85 && consecutiveCorrect >= 6;
  const excellentLastStop = lastStop !== undefined && lastStop >= 90;
  const strongMomentum = lastStop !== undefined && lastStop >= 80 && consecutiveCorrect >= 5;

  // Só promove para hard com histórico consistente e tempo de casa suficiente
  if (!fewAnswers && (excellentLastStop || consistentHighPerformance || strongMomentum)) {
    return DifficultyLevel.HARD;
  }

  // Patamar de progressão: 70% garante dificuldade média
  if ((lastStop !== undefined && lastStop >= 70) || overallSuccess >= 70) {
    return DifficultyLevel.MEDIUM;
  }

  return DifficultyLevel.EASY;
}
```

#### 2. **Progressiva** - `ProgressiveDifficultyStrategy`
Aumenta dificuldade gradualmente conforme número de paradas:

```typescript
selectDifficulty(performance: StudyTrailPerformance, lastStopPerformance?: number): DifficultyLevel {
  const totalStops = Math.floor(performance.total_questions_answered / 10);
  
  if (totalStops <= 2) return DifficultyLevel.EASY;
  if (totalStops <= 4) return DifficultyLevel.MEDIUM;
  return DifficultyLevel.HARD;
}
```

#### 3. **Conservadora** - `ConservativeDifficultyStrategy`
Mantém dificuldade baixa até alta confiança:

```typescript
selectDifficulty(performance: StudyTrailPerformance, lastStopPerformance?: number): DifficultyLevel {
  if (performance.success_rate >= 90) return DifficultyLevel.MEDIUM;
  return DifficultyLevel.EASY;
}
```

#### 4. **Agressiva** - `AggressiveDifficultyStrategy`
Aumenta dificuldade rapidamente:

```typescript
selectDifficulty(performance: StudyTrailPerformance, lastStopPerformance?: number): DifficultyLevel {
  if (!performance || performance.total_questions_answered === 0) {
    return DifficultyLevel.MEDIUM; // Já começa com médio
  }
  
  if (performance.success_rate >= 60) return DifficultyLevel.HARD;
  if (performance.success_rate >= 40) return DifficultyLevel.MEDIUM;
  return DifficultyLevel.EASY;
}
```

#### 5. **Baseada em Tempo** - `TimeBasedDifficultyStrategy`
Considera velocidade de resposta além da precisão:

```typescript
selectDifficulty(performance: StudyTrailPerformance, lastStopPerformance?: number): DifficultyLevel {
  const avgResponseTime = performance.average_response_time;
  const successRate = performance.success_rate;

  // Respostas rápidas + alta precisão → aumenta dificuldade
  if (avgResponseTime <= 20 && successRate >= 80) return DifficultyLevel.HARD;
  if (avgResponseTime <= 30 && successRate >= 70) return DifficultyLevel.MEDIUM;
  if (avgResponseTime <= 40 && successRate >= 60) return DifficultyLevel.MEDIUM;
  return DifficultyLevel.EASY;
}
```

### Processo de Seleção de Questões

1. **Busca por skill_category**: Questões são buscadas de todos os subjects que pertencem à mesma categoria
2. **Filtro por dificuldade**: Apenas questões do nível selecionado pela estratégia
3. **Seleção aleatória**: Questões são embaralhadas e selecionadas aleatoriamente
4. **Variedade**: Sistema pega 2x mais questões que o necessário para garantir variedade

```typescript
// Busca questões por skill_category e dificuldade
const questions = await this.questionRepository
  .createQueryBuilder('question')
  .innerJoin('question.origin_subject', 'subject')
  .where('subject.skill_category_id = :skillCategoryId', { skillCategoryId })
  .andWhere('question.difficulty_level = :difficulty', { difficulty })
  .andWhere('question.is_active = :isActive', { isActive: true })
  .orderBy('question.id', 'DESC')
  .take(totalQuestions * 2) // 2x para variedade
  .getMany();

// Seleção aleatória
const selectedQuestions = this.shuffleArray(questions)
  .slice(0, Math.min(totalQuestions, questions.length));
```

### Atualização de Performance em Tempo Real

O sistema atualiza as métricas de performance a cada resposta:

```typescript
private async updateUserPerformance(userId: number, skillCategoryId: number, isCorrect: boolean, responseTime: number): Promise<void> {
  const performance = await this.getUserPerformance(userId, skillCategoryId);

  performance.total_questions_answered += 1;
  if (isCorrect) {
    performance.correct_answers += 1;
    performance.consecutive_correct_answers += 1;
    performance.consecutive_incorrect_answers = 0;
  } else {
    performance.incorrect_answers += 1;
    performance.consecutive_incorrect_answers += 1;
    performance.consecutive_correct_answers = 0;
  }

  // Cálculo da taxa de sucesso
  performance.success_rate = (performance.correct_answers / performance.total_questions_answered) * 100;

  // Atualização do tempo médio de resposta (média móvel)
  const totalResponseTime = performance.average_response_time * (performance.total_questions_answered - 1) + responseTime;
  performance.average_response_time = totalResponseTime / performance.total_questions_answered;

  performance.last_activity_date = new Date();
  performance.updated_at = new Date();

  await this.studyTrailPerformanceRepository.save(performance);
}
```

## 📊 Sistema de Performance

### Notas de Performance

O sistema atribui notas de A+ a F baseadas na combinação de taxa de acerto e tempo médio de resposta:

```typescript
function calculatePerformanceGrade(successRate: number, averageResponseTime: number) {
  // Nota S (Special) - Performance perfeita
  if (successRate === 100 && averageResponseTime <= 10) return 'S';
  
  // Nota A+ - Excelente performance
  if (successRate >= 95 && averageResponseTime <= 20) return 'A+';
  
  // Nota A - Muito boa performance
  if (successRate >= 90 && averageResponseTime <= 30) return 'A';
  
  // Nota B+ - Boa performance
  if (successRate >= 85 && averageResponseTime <= 40) return 'B+';
  
  // Nota B - Performance satisfatória
  if (successRate >= 80 && averageResponseTime <= 50) return 'B';
  
  // Nota C+ - Performance regular
  if (successRate >= 75 && averageResponseTime <= 60) return 'C+';
  
  // Nota C - Performance mínima aceitável
  if (successRate >= 70 && averageResponseTime <= 70) return 'C';
  
  // Nota D - Performance abaixo do esperado
  if (successRate >= 60) return 'D';
  
  // Nota F - Performance insuficiente
  return 'F';
}
```

### Critérios de Desbloqueio

- **Primeira Parada**: Sempre desbloqueada
- **Paradas Seguintes**: Desbloqueadas ao atingir 70% de taxa de sucesso
- **Status FAILED**: Se não atingir 70%, parada fica como FAILED (preserva histórico)
- **Retry Inteligente**: Questões são resetadas apenas no próximo start

### Sistema de Retry Inteligente

O sistema implementa um mecanismo sofisticado de retry que preserva o histórico de performance:

```typescript
// Verificação se parada pode ser refeita
private async canRetryStop(stopId: number): Promise<boolean> {
  const stop = await this.studyTrailStopRepository.findOne({
    where: { id: stopId },
  });
  
  return stop?.status === StudyTrailStopStatus.FAILED;
}

// Reset de questões para retry
if (stopQuestion.answer_status !== QuestionAnswerStatus.NOT_ANSWERED) {
  const canRetry = await this.canRetryStop(answerData.study_trail_stop_id);
  if (!canRetry) {
    throw new BadRequestException('Esta questão já foi respondida e a parada não pode ser refeita');
  }

  // Resetar a questão para permitir nova tentativa
  stopQuestion.selected_option_id = null;
  stopQuestion.answer_status = QuestionAnswerStatus.NOT_ANSWERED;
  stopQuestion.response_time_seconds = 0;
  stopQuestion.used_hint = false;
  stopQuestion.confidence_level = null;
  stopQuestion.answered_at = null;
  stopQuestion.xp_earned = 0;
}
```

**Vantagens do Sistema de Retry:**
- **Preserva Histórico**: Performance anterior é mantida para análise
- **Flexibilidade**: Usuário pode tentar novamente quando quiser
- **Análise de Tendências**: Permite identificar padrões de erro
- **Motivação**: Usuário não perde progresso ao falhar


## 🎮 Fluxo de Jogo

### 1. Criação da Trilha
```typescript
// Usuário cria trilha para uma skill_category
const trail = await createStudyTrail(userId, {
  skill_category_id: 1,
  name: "Trilha de Matemática"
});
```

### 2. Início de Parada
```typescript
// Sistema gera questões dinamicamente
const stop = await startStudyTrailStop(trailId, stopPosition);
// Questões são selecionadas baseadas na performance anterior
```

### 3. Resposta a Questões
```typescript
// Para cada questão respondida
const result = await answerQuestion({
  study_trail_stop_id: stopId,
  question_id: questionId,
  selected_option_id: optionId,
  response_time_seconds: 15,
  used_hint: false,
  confidence_level: 85
});
```

### 4. Finalização da Parada
```typescript
// Na última questão, sistema calcula:
const performance = {
  total_questions: 10,
  correct_answers: 8,
  success_rate: 80.0,
  performance_grade: "B",
  streak_bonus: 12,
  speed_bonus: 8,
  accuracy_bonus: 0,
  total_xp_earned: 120
};
```

## 📈 Métricas e Analytics

### Dados Coletados
- **Performance por skill_category**: Taxa de acerto, tempo médio, sequências
- **Tendências**: Melhoria ou declínio ao longo do tempo
- **Histórico de dificuldade**: Performance por nível (Fácil, Médio, Difícil)
- **Engajamento**: Frequência de uso, duração das sessões

### Tabelas de Performance
```sql
-- study_trail_performance
- user_id, skill_category_id, difficulty_level
- total_questions_answered, correct_answers, incorrect_answers
- success_rate, average_response_time
- consecutive_correct_answers, consecutive_incorrect_answers
- performance_trend, last_activity_date
```

## 🚀 Extensibilidade

### Adicionando Nova Estratégia de Dificuldade
1. Implementar interface `DifficultySelectionStrategy`
2. Adicionar no `DifficultyStrategyFactory`
3. Registrar nome na lista de estratégias disponíveis

### Personalizações Futuras
- Número de paradas configurável
- Tipos de parada diferentes (lição, prática, desafio, revisão)
- Critérios de desbloqueio personalizáveis
- Integração com sistema de conquistas

## 💡 Exemplos Práticos

### Exemplo 1: Usuário Excelente
- **10 questões**: 9 corretas, 1 incorreta
- **Tempo médio**: 15 segundos
- **Sem dicas**: Todas as respostas
- **XP por questão**: 10 × 1.8 = 18 pontos
- **Streak Bonus**: 7 × 2 = 14 pontos
- **Speed Bonus**: 9 × 1 = 9 pontos
- **Accuracy Bonus**: 10 pontos (90%+)
- **Total XP**: 180 + 33 = 213 pontos
- **Nota**: A+

### Exemplo 2: Usuário Regular
- **10 questões**: 7 corretas, 3 incorretas
- **Tempo médio**: 35 segundos
- **Com dicas**: 2 questões
- **XP por questão**: 10 × 1.5 = 15 pontos (média)
- **Streak Bonus**: 4 × 2 = 8 pontos
- **Speed Bonus**: 3 × 1 = 3 pontos
- **Accuracy Bonus**: 0 pontos (<80%)
- **Total XP**: 150 + 11 = 161 pontos
- **Nota**: C+

## 🔧 Configurações do Sistema

### Troca de Estratégias de Dificuldade

O sistema permite trocar estratégias dinamicamente:

```typescript
// Trocar estratégia por nome
studyTrailService.setDifficultyStrategyByName('progressive');

// Criar estratégia customizada
const customStrategy = new MyCustomDifficultyStrategy();
studyTrailService.setDifficultyStrategy(customStrategy);

// Listar estratégias disponíveis
const strategies = studyTrailService.getAvailableStrategies();
// Retorna: ['adaptive', 'progressive', 'conservative', 'aggressive', 'time-based']
```

### Parâmetros Ajustáveis
- **XP Base**: 10 pontos (configurável)
- **Taxa Mínima de Sucesso**: 70% (configurável)
- **Número de Paradas**: 5 (configurável)
- **Questões por Parada**: 10 (configurável)
- **Tempo para Bônus de Velocidade**: 20s (configurável)
- **Tempo para Bônus de XP**: 30s (configurável)

### Estratégias de Dificuldade Disponíveis
- **Adaptativa** (padrão): Respeita o patamar de 70%, recompensa sequências positivas e ativa modo de recuperação após quedas
- **Progressiva**: Aumenta dificuldade gradualmente por número de paradas
- **Conservadora**: Mantém dificuldade baixa até alta confiança
- **Agressiva**: Aumenta dificuldade rapidamente
- **Baseada em Tempo**: Considera velocidade de resposta além da precisão

Este sistema garante uma experiência de aprendizado gamificada e adaptativa, incentivando o usuário a melhorar continuamente sua performance através de recompensas tangíveis e feedback imediato.
