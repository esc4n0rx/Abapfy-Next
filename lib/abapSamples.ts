export const helloProgram = `REPORT zhello_abapfy.

WRITE: / 'Hello ABAPFY - Sua plataforma de desenvolvimento ABAP!',
       / 'Bem-vindo ao futuro do desenvolvimento SAP.'.

* Demonstração de funcionalidade básica
DATA: lv_message TYPE string.
lv_message = 'ABAPFY está funcionando perfeitamente!'.
WRITE: / lv_message.`;

export const findingsMock = [
  {
    id: 1,
    line: 5,
    severity: 'error' as const,
    message: 'Use DATA(...) em vez de declaração separada',
    suggestion: 'DATA(lv_message) = \'Texto\'.',
    category: 'Modernização'
  },
  {
    id: 2,
    line: 12,
    severity: 'warning' as const,
    message: 'Evite SELECT * - especifique apenas campos necessários',
    suggestion: 'SELECT field1, field2 FROM table...',
    category: 'Performance'
  },
  {
    id: 3,
    line: 18,
    severity: 'info' as const,
    message: 'Considere usar nomes com prefixo Z* ou Y*',
    suggestion: 'Renomeie para ZPROGRAM_NAME',
    category: 'Padrões SAP'
  },
  {
    id: 4,
    line: 25,
    severity: 'warning' as const,
    message: 'Falta tratamento de exceções',
    suggestion: 'Adicione TRY...CATCH ou validação',
    category: 'Robustez'
  }
];

export const modulesMock = [
  {
    id: 1,
    name: 'Z_CALC_PRICE',
    package: 'ZFINANCE',
    type: 'Function Module',
    lastModified: '2024-01-15',
    status: 'Ativo',
    description: 'Cálculo de preços com desconto'
  },
  {
    id: 2,
    name: 'Z_VALIDATE_CUSTOMER',
    package: 'ZMASTER_DATA',
    type: 'Function Module',
    lastModified: '2024-01-10',
    status: 'Ativo',
    description: 'Validação de dados de cliente'
  },
  {
    id: 3,
    name: 'ZCL_HELPER_UTILS',
    package: 'ZUTILS',
    type: 'Class',
    lastModified: '2023-12-20',
    status: 'Obsoleto',
    description: 'Utilitários diversos - descontinuado'
  },
  {
    id: 4,
    name: 'ZV_SALES_REPORT',
    package: 'ZSALES',
    type: 'CDS View',
    lastModified: '2024-01-12',
    status: 'Warning',
    description: 'Relatório de vendas - performance lenta'
  }
];

export const debugFramesMock = [
  { line: 15, method: 'START-OF-SELECTION', program: 'ZTEST_PROGRAM' },
  { line: 23, method: 'PERFORM GET_DATA', program: 'ZTEST_PROGRAM' },
  { line: 45, method: 'SELECT FROM TABLE', program: 'ZTEST_PROGRAM' }
];

export const debugVariablesMock = [
  { name: 'LV_COUNT', type: 'I', value: '150' },
  { name: 'LV_MESSAGE', type: 'STRING', value: 'Processamento concluído' },
  { name: 'LT_DATA', type: 'TABLE', value: '[3 linhas]' },
  { name: 'GV_FLAG', type: 'CHAR1', value: 'X' }
];

export const sampleABAPCode = `REPORT ztest_program.

DATA: lt_customers TYPE TABLE OF kna1,
      lv_count     TYPE i,
      lv_message   TYPE string.

START-OF-SELECTION.
  PERFORM get_customer_data.
  PERFORM process_data.
  PERFORM display_results.

FORM get_customer_data.
  SELECT * FROM kna1 INTO TABLE lt_customers
    WHERE land1 = 'BR'.
  DESCRIBE TABLE lt_customers LINES lv_count.
ENDFORM.

FORM process_data.
  lv_message = |Processados { lv_count } clientes|.
ENDFORM.

FORM display_results.
  WRITE: / lv_message.
ENDFORM.`;