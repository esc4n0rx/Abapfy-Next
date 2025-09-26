import { DebugSolution, AnalysisIssue } from '@/types/codeAnalysis';

export interface DebugAnalysisResult {
  summary: string;
  issues: AnalysisIssue[];
  debugSolutions: DebugSolution[];
  suggestions: string[];
}

export class DebugProcessor {
  static convertToAnalysisIssues: any;
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
   * Processa e valida a resposta de debug da IA
   */
  static processDebugResponse(aiResponse: string): DebugAnalysisResult {
    try {
      const jsonStr = this.extractJSON(aiResponse);
      const parsed = JSON.parse(jsonStr);

      // Validar estrutura mínima
      if (!parsed.summary || !Array.isArray(parsed.issues) || !Array.isArray(parsed.debugSolutions)) {
        throw new Error('Estrutura de resposta inválida');
      }

      // Garantir que issues tenham IDs únicos
      const processedIssues: AnalysisIssue[] = parsed.issues.map((issue: any, index: number) => ({
        id: issue.id || `issue-${index + 1}`,
        line: issue.line,
        column: issue.column,
        severity: issue.severity || 'info',
        category: issue.category || 'general',
        message: issue.message || 'Problema identificado',
        description: issue.description,
        suggestion: issue.suggestion,
        codeSnippet: issue.codeSnippet
      }));

      // Garantir que solutions tenham IDs únicos
      const processedSolutions: DebugSolution[] = parsed.debugSolutions.map((solution: any, index: number) => ({
        id: solution.id || `solution-${index + 1}`,
        title: solution.title || 'Solução',
        description: solution.description || 'Descrição da solução',
        steps: Array.isArray(solution.steps) ? solution.steps : [],
        codeExample: solution.codeExample,
        priority: solution.priority || 'medium',
        confidence: typeof solution.confidence === 'number' ? solution.confidence : 50
      }));

      return {
        summary: parsed.summary,
        issues: processedIssues,
        debugSolutions: processedSolutions,
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
      };

    } catch (error) {
      console.error('Erro ao processar resposta de debug:', error);
      
      // Retornar estrutura padrão em caso de erro
      return {
        summary: 'Erro ao processar análise de debug. Tente novamente.',
        issues: [{
          id: 'parse-error',
          severity: 'error' as const,
          category: 'system',
          message: 'Erro ao processar resposta da IA'
        }],
        debugSolutions: [],
        suggestions: ['Tente executar a análise novamente']
      };
    }
  }

  /**
   * Valida se a resposta contém dados úteis
   */
  static validateDebugResponse(result: DebugAnalysisResult): boolean {
    return !!(
      result.summary && 
      result.summary.length > 10 &&
      (result.issues.length > 0 || result.debugSolutions.length > 0)
    );
  }
}