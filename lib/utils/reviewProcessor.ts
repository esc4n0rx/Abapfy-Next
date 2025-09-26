import { AnalysisIssue } from '@/types/codeAnalysis';

export interface ReviewAnalysisResult {
  summary: string;
  score: number;
  issues: string[];
  suggestions: string[];
}

export class ReviewProcessor {
  /**
   * Extrai JSON da resposta da IA removendo blocos <think> e outros elementos
   */
  static extractJSON(aiResponse: string): string {
    try {
      // Remover blocos <think>...</think>
      let cleaned = aiResponse.replace(/<think>[\s\S]*?<\/think>/gi, '');
      
      // Remover blocos de código markdown se existirem
      cleaned = cleaned.replace(/```json\s*/gi, '');
      cleaned = cleaned.replace(/```\s*/gi, '');
      
      // Encontrar o primeiro { e o último } para extrair apenas o JSON
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('JSON não encontrado na resposta');
      }
      
      const jsonStr = cleaned.substring(firstBrace, lastBrace + 1);
      
      // Validar se é JSON válido
      JSON.parse(jsonStr);
      
      return jsonStr;
    } catch (error) {
      console.error('Erro ao extrair JSON da resposta:', error);
      throw new Error('Formato de resposta inválido da IA');
    }
  }

  /**
   * Processa e valida a resposta de code review da IA
   */
  static processReviewResponse(aiResponse: string): ReviewAnalysisResult {
    try {
      const jsonStr = this.extractJSON(aiResponse);
      const parsed = JSON.parse(jsonStr);

      // Validar estrutura mínima
      if (!parsed.summary) {
        throw new Error('Estrutura de resposta inválida - summary obrigatório');
      }

      // Garantir score válido
      let score = typeof parsed.score === 'number' ? parsed.score : 0;
      score = Math.max(0, Math.min(100, score)); // Limitar entre 0-100

      return {
        summary: parsed.summary,
        score: score,
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
      };

    } catch (error) {
      console.error('Erro ao processar resposta de review:', error);
      
      // Retornar estrutura padrão em caso de erro
      return {
        summary: 'Erro ao processar análise de code review. Tente novamente.',
        score: 0,
        issues: ['Erro ao processar resposta da IA'],
        suggestions: ['Tente executar a análise novamente']
      };
    }
  }

  /**
   * Valida se a resposta contém dados úteis
   */
  static validateReviewResponse(result: ReviewAnalysisResult): boolean {
    return !!(
      result.summary && 
      result.summary.length > 10 &&
      (result.issues.length > 0 || result.suggestions.length > 0 || result.score > 0)
    );
  }

  /**
   * Converte para o formato AnalysisIssue se necessário
   */
  static convertToAnalysisIssues(issues: string[]): AnalysisIssue[] {
    return issues.map((issue, index) => ({
      id: `review-issue-${index + 1}`,
      severity: 'warning' as const,
      category: 'code-quality',
      message: issue
    }));
  }
}