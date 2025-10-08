17:45:26.561 Running build in Washington, D.C., USA (East) – iad1
17:45:26.562 Build machine configuration: 2 cores, 8 GB
17:45:26.621 Cloning github.com/BuscadorPXT/financeiro (Branch: main, Commit: 519b9e0)
17:45:26.851 Previous build caches not available
17:45:27.062 Cloning completed: 441.000ms
17:45:27.425 Running "vercel build"
17:45:27.824 Vercel CLI 48.2.4
17:45:28.433 Installing dependencies...
17:46:07.275 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
17:46:07.719 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
17:46:09.814 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
17:46:09.857 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
17:46:16.845 
17:46:16.846 > financasbuscador@1.0.0 postinstall
17:46:16.846 > cd frontend && npm install
17:46:16.846 
17:46:51.514 
17:46:51.515 added 462 packages, and audited 463 packages in 35s
17:46:51.515 
17:46:51.516 102 packages are looking for funding
17:46:51.516   run `npm fund` for details
17:46:51.521 
17:46:51.521 1 high severity vulnerability
17:46:51.521 
17:46:51.521 Some issues need review, and may require choosing
17:46:51.521 a different dependency.
17:46:51.521 
17:46:51.521 Run `npm audit` for details.
17:46:51.632 
17:46:51.633 added 514 packages in 1m
17:46:51.633 
17:46:51.633 80 packages are looking for funding
17:46:51.633   run `npm fund` for details
17:46:51.677 Running "npm run build"
17:46:51.792 
17:46:51.793 > financasbuscador@1.0.0 build
17:46:51.797 > npm run build:backend && npm run build:frontend
17:46:51.797 
17:46:51.950 
17:46:51.950 > financasbuscador@1.0.0 build:backend
17:46:51.950 > tsc -p tsconfig.backend.json
17:46:51.951 
17:46:56.710 
17:46:56.711 > financasbuscador@1.0.0 build:frontend
17:46:56.711 > cd frontend && npm run build
17:46:56.711 
17:46:56.826 
17:46:56.826 > frontend@0.0.0 build
17:46:56.826 > tsc -b && vite build
17:46:56.827 
17:47:04.738 src/components/agenda/AgendaTable.tsx(5,1): error TS6133: 'Checkbox' is declared but its value is never read.
17:47:04.739 src/components/common/Alert.tsx(1,10): error TS1484: 'ReactNode' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
17:47:04.740 src/components/common/Badge.tsx(1,10): error TS1484: 'ReactNode' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
17:47:04.740 src/components/common/Button.tsx(1,10): error TS1484: 'ButtonHTMLAttributes' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
17:47:04.740 src/components/common/Button.tsx(1,32): error TS1484: 'ReactNode' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
17:47:04.740 src/components/common/Button.tsx(89,6): error TS2322: Type '{ children: Element; form?: string | undefined; formAction?: string | ((formData: FormData) => void | Promise<void>) | undefined; formEncType?: string | undefined; ... 285 more ...; whileTap: { ...; }; }' is not assignable to type 'Omit<HTMLMotionProps<"button">, "ref">'.
17:47:04.741   Types of property 'onDrag' are incompatible.
17:47:04.741     Type 'DragEventHandler<HTMLButtonElement> | undefined' is not assignable to type '((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void) | undefined'.
17:47:04.741       Type 'DragEventHandler<HTMLButtonElement>' is not assignable to type '(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void'.
17:47:04.741         Types of parameters 'event' and 'event' are incompatible.
17:47:04.741           Type 'MouseEvent | TouchEvent | PointerEvent' is not assignable to type 'DragEvent<HTMLButtonElement>'.
17:47:04.741             Type 'MouseEvent' is missing the following properties from type 'DragEvent<HTMLButtonElement>': dataTransfer, nativeEvent, isDefaultPrevented, isPropagationStopped, persist
17:47:04.742 src/components/common/Card.tsx(1,10): error TS1484: 'ReactNode' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
17:47:04.742 src/components/common/FilterBar.tsx(1,17): error TS1484: 'ReactNode' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
17:47:04.742 src/components/common/FormInput.tsx(1,10): error TS1484: 'InputHTMLAttributes' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
17:47:04.743 src/components/common/FormInput.tsx(1,43): error TS1484: 'ReactNode' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
17:47:04.743 src/components/common/Modal.tsx(1,10): error TS1484: 'ReactNode' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
17:47:04.743 src/components/common/Modal.tsx(4,1): error TS6133: 'Button' is declared but its value is never read.
17:47:04.743 src/components/common/SearchInput.tsx(1,10): error TS1484: 'InputHTMLAttributes' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
17:47:04.746 src/components/common/Select.tsx(1,10): error TS1484: 'SelectHTMLAttributes' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
17:47:04.747 src/components/common/Table.tsx(1,10): error TS1484: 'ReactNode' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
17:47:04.747 src/components/common/Tooltip.tsx(1,10): error TS1484: 'ReactNode' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
17:47:04.747 src/components/common/__tests__/Button.test.tsx(85,20): error TS2322: Type '{ children: string; icon: Element; }' is not assignable to type 'IntrinsicAttributes & ButtonProps'.
17:47:04.747   Property 'icon' does not exist on type 'IntrinsicAttributes & ButtonProps'.
17:47:04.747 src/components/common/__tests__/Button.test.tsx(100,15): error TS2322: Type '{ children: string; as: string; href: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps'.
17:47:04.747   Property 'as' does not exist on type 'IntrinsicAttributes & ButtonProps'.
17:47:04.747 src/components/common/__tests__/Modal.test.tsx(87,8): error TS2741: Property 'title' is missing in type '{ children: string; isOpen: true; onClose: Mock<Procedure>; size: "sm"; }' but required in type 'ModalProps'.
17:47:04.747 src/components/common/__tests__/Modal.test.tsx(96,8): error TS2741: Property 'title' is missing in type '{ children: string; isOpen: true; onClose: Mock<Procedure>; size: "lg"; }' but required in type 'ModalProps'.
17:47:04.747 src/components/common/__tests__/Modal.test.tsx(105,8): error TS2741: Property 'title' is missing in type '{ children: string; isOpen: true; onClose: Mock<Procedure>; size: "xl"; }' but required in type 'ModalProps'.
17:47:04.748 src/components/common/__tests__/Modal.test.tsx(150,50): error TS2322: Type '{ children: Element; isOpen: true; onClose: Mock<Procedure>; closeOnEscape: boolean; }' is not assignable to type 'IntrinsicAttributes & ModalProps'.
17:47:04.748   Property 'closeOnEscape' does not exist on type 'IntrinsicAttributes & ModalProps'.
17:47:04.748 src/components/common/__tests__/Modal.test.tsx(163,50): error TS2322: Type '{ children: Element; isOpen: true; onClose: Mock<Procedure>; closeOnBackdrop: boolean; }' is not assignable to type 'IntrinsicAttributes & ModalProps'.
17:47:04.748   Property 'closeOnBackdrop' does not exist on type 'IntrinsicAttributes & ModalProps'.
17:47:04.748 src/components/common/__tests__/Modal.test.tsx(176,8): error TS2741: Property 'title' is missing in type '{ children: string; isOpen: true; onClose: Mock<Procedure>; }' but required in type 'ModalProps'.
17:47:04.749 src/components/common/__tests__/Modal.test.tsx(191,8): error TS2741: Property 'title' is missing in type '{ children: string; isOpen: false; onClose: Mock<Procedure>; }' but required in type 'ModalProps'.
17:47:04.749 src/components/common/__tests__/Modal.test.tsx(198,8): error TS2741: Property 'title' is missing in type '{ children: string; isOpen: true; onClose: Mock<Procedure>; }' but required in type 'ModalProps'.
17:47:04.749 src/components/common/__tests__/Modal.test.tsx(216,9): error TS2322: Type '{ children: string; isOpen: true; onClose: Mock<Procedure>; header: Element; }' is not assignable to type 'IntrinsicAttributes & ModalProps'.
17:47:04.749   Property 'header' does not exist on type 'IntrinsicAttributes & ModalProps'.
17:47:04.749 src/components/common/__tests__/Modal.test.tsx(236,9): error TS2322: Type '{ children: string; isOpen: true; onClose: Mock<Procedure>; className: string; }' is not assignable to type 'IntrinsicAttributes & ModalProps'.
17:47:04.749   Property 'className' does not exist on type 'IntrinsicAttributes & ModalProps'.
17:47:04.749 src/components/common/__tests__/Modal.test.tsx(248,8): error TS2741: Property 'title' is missing in type '{ children: Element[]; isOpen: true; onClose: Mock<Procedure>; }' but required in type 'ModalProps'.
17:47:04.751 src/components/common/__tests__/Modal.test.tsx(256,11): error TS6133: 'lastInput' is declared but its value is never read.
17:47:04.751 src/components/common/__tests__/Modal.test.tsx(270,46): error TS2322: Type '{ children: Element; isOpen: true; onClose: Mock<Procedure>; loading: true; }' is not assignable to type 'IntrinsicAttributes & ModalProps'.
17:47:04.751   Property 'loading' does not exist on type 'IntrinsicAttributes & ModalProps'.
17:47:04.751 src/components/common/__tests__/Table.test.tsx(2,37): error TS6133: 'within' is declared but its value is never read.
17:47:04.752 src/components/common/__tests__/Table.test.tsx(33,35): error TS2322: Type '({ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; })[]' is not assignable to type 'Column<TestData>[]'.
17:47:04.752   Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; }' is not assignable to type 'Column<TestData>'.
17:47:04.752     Property 'label' is missing in type '{ key: string; header: string; sortable: boolean; }' but required in type 'Column<TestData>'.
17:47:04.752 src/components/common/__tests__/Table.test.tsx(49,29): error TS2322: Type '({ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; })[]' is not assignable to type 'Column<never>[]'.
17:47:04.752   Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; }' is not assignable to type 'Column<never>'.
17:47:04.753     Property 'label' is missing in type '{ key: string; header: string; sortable: boolean; }' but required in type 'Column<never>'.
17:47:04.753 src/components/common/__tests__/Table.test.tsx(59,9): error TS2322: Type '({ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; })[]' is not assignable to type 'Column<TestData>[]'.
17:47:04.753   Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; }' is not assignable to type 'Column<TestData>'.
17:47:04.753     Property 'label' is missing in type '{ key: string; header: string; sortable: boolean; }' but required in type 'Column<TestData>'.
17:47:04.753 src/components/common/__tests__/Table.test.tsx(81,9): error TS2322: Type '({ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; })[]' is not assignable to type 'Column<TestData>[]'.
17:47:04.753   Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; }' is not assignable to type 'Column<TestData>'.
17:47:04.754     Property 'label' is missing in type '{ key: string; header: string; sortable: boolean; }' but required in type 'Column<TestData>'.
17:47:04.754 src/components/common/__tests__/Table.test.tsx(96,35): error TS2322: Type '({ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; })[]' is not assignable to type 'Column<TestData>[]'.
17:47:04.754   Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; }' is not assignable to type 'Column<TestData>'.
17:47:04.754     Property 'label' is missing in type '{ key: string; header: string; sortable: boolean; }' but required in type 'Column<TestData>'.
17:47:04.754 src/components/common/__tests__/Table.test.tsx(113,9): error TS2322: Type '({ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; })[]' is not assignable to type 'Column<TestData>[]'.
17:47:04.755   Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; }' is not assignable to type 'Column<TestData>'.
17:47:04.755     Property 'label' is missing in type '{ key: string; header: string; sortable: boolean; }' but required in type 'Column<TestData>'.
17:47:04.755 src/components/common/__tests__/Table.test.tsx(128,9): error TS2322: Type '({ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; })[]' is not assignable to type 'Column<TestData>[]'.
17:47:04.755   Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; }' is not assignable to type 'Column<TestData>'.
17:47:04.755     Property 'label' is missing in type '{ key: string; header: string; sortable: boolean; }' but required in type 'Column<TestData>'.
17:47:04.755 src/components/common/__tests__/Table.test.tsx(131,11): error TS2353: Object literal may only specify known properties, and 'pageSize' does not exist in type '{ page: number; limit: number; total: number; totalPages: number; }'.
17:47:04.756 src/components/common/__tests__/Table.test.tsx(171,35): error TS2322: Type '{ key: string; header: string; render: (value: string) => Element; }[]' is not assignable to type 'Column<TestData>[]'.
17:47:04.756   Property 'label' is missing in type '{ key: string; header: string; render: (value: string) => JSX.Element; }' but required in type 'Column<TestData>'.
17:47:04.756 src/components/common/__tests__/Table.test.tsx(181,35): error TS2322: Type '({ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; })[]' is not assignable to type 'Column<TestData>[]'.
17:47:04.756   Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; }' is not assignable to type 'Column<TestData>'.
17:47:04.756     Property 'label' is missing in type '{ key: string; header: string; sortable: boolean; }' but required in type 'Column<TestData>'.
17:47:04.756 src/components/common/__tests__/Table.test.tsx(191,35): error TS2322: Type '({ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; })[]' is not assignable to type 'Column<TestData>[]'.
17:47:04.757   Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; }' is not assignable to type 'Column<TestData>'.
17:47:04.757     Property 'label' is missing in type '{ key: string; header: string; sortable: boolean; }' but required in type 'Column<TestData>'.
17:47:04.757 src/components/common/__tests__/Table.test.tsx(198,35): error TS2322: Type '({ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; })[]' is not assignable to type 'Column<TestData>[]'.
17:47:04.757   Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; }' is not assignable to type 'Column<TestData>'.
17:47:04.757     Property 'label' is missing in type '{ key: string; header: string; sortable: boolean; }' but required in type 'Column<TestData>'.
17:47:04.758 src/components/common/__tests__/Table.test.tsx(206,29): error TS2322: Type '({ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; })[]' is not assignable to type 'Column<never>[]'.
17:47:04.758   Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; }' is not assignable to type 'Column<never>'.
17:47:04.758     Property 'label' is missing in type '{ key: string; header: string; sortable: boolean; }' but required in type 'Column<never>'.
17:47:04.758 src/components/common/__tests__/Table.test.tsx(232,35): error TS2322: Type '({ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; } | { key: string; header: string; render: (_: any, row: TestData) => Element; })[]' is not assignable to type 'Column<TestData>[]'.
17:47:04.758   Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; } | { key: string; header: string; render: (_: any, row: TestData) => Element; }' is not assignable to type 'Column<TestData>'.
17:47:04.759     Property 'label' is missing in type '{ key: string; header: string; sortable: boolean; }' but required in type 'Column<TestData>'.
17:47:04.759 src/components/common/__tests__/Table.test.tsx(248,56): error TS2322: Type '({ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; })[]' is not assignable to type 'Column<TestData>[]'.
17:47:04.759   Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; }' is not assignable to type 'Column<TestData>'.
17:47:04.759     Property 'label' is missing in type '{ key: string; header: string; sortable: boolean; }' but required in type 'Column<TestData>'.
17:47:04.759 src/components/common/__tests__/Table.test.tsx(255,37): error TS2322: Type '({ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; })[]' is not assignable to type 'Column<TestData>[]'.
17:47:04.760   Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; }' is not assignable to type 'Column<TestData>'.
17:47:04.760     Property 'label' is missing in type '{ key: string; header: string; sortable: boolean; }' but required in type 'Column<TestData>'.
17:47:04.760 src/components/common/__tests__/Table.test.tsx(263,35): error TS2322: Type '({ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; })[]' is not assignable to type 'Column<TestData>[]'.
17:47:04.760   Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; }' is not assignable to type 'Column<TestData>'.
17:47:04.760     Property 'label' is missing in type '{ key: string; header: string; sortable: boolean; }' but required in type 'Column<TestData>'.
17:47:04.760 src/components/despesas/DespesasTable.tsx(21,57): error TS2345: Argument of type '"created_at"' is not assignable to parameter of type 'keyof Despesa | (() => keyof Despesa)'.
17:47:04.761 src/components/despesas/DespesasTable.tsx(110,43): error TS2345: Argument of type '"competencia_mes"' is not assignable to parameter of type 'keyof Despesa'.
17:47:04.761 src/components/despesas/DespesasTable.tsx(113,30): error TS2367: This comparison appears to be unintentional because the types 'keyof Despesa' and '"competencia_mes"' have no overlap.
17:47:04.761 src/components/prospeccao/ConversaoModal.tsx(26,16): error TS2551: Property 'email_login' does not exist on type 'Usuario'. Did you mean 'emailLogin'?
17:47:04.761 src/components/prospeccao/ConversaoModal.tsx(29,28): error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<number | null>'.
17:47:04.761 src/components/prospeccao/ConversaoModal.tsx(35,9): error TS2551: Property 'email_login' does not exist on type 'Usuario'. Did you mean 'emailLogin'?
17:47:04.761 src/components/prospeccao/ConversaoModal.tsx(36,9): error TS2551: Property 'nome_completo' does not exist on type 'Usuario'. Did you mean 'nomeCompleto'?
17:47:04.762 src/components/prospeccao/ConversaoModal.tsx(45,48): error TS2367: This comparison appears to be unintentional because the types 'string' and 'number | null' have no overlap.
17:47:04.762 src/components/prospeccao/ConversaoModal.tsx(85,11): error TS2322: Type '{ type: "info"; message: string; }' is not assignable to type 'IntrinsicAttributes & AlertProps'.
17:47:04.762   Property 'message' does not exist on type 'IntrinsicAttributes & AlertProps'.
17:47:04.762 src/components/prospeccao/ConversaoModal.tsx(119,57): error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<number | null>'.
17:47:04.762 src/components/prospeccao/ConversaoModal.tsx(121,23): error TS2367: This comparison appears to be unintentional because the types 'number | null' and 'string' have no overlap.
17:47:04.762 src/components/prospeccao/ConversaoModal.tsx(129,36): error TS2551: Property 'nome_completo' does not exist on type 'Usuario'. Did you mean 'nomeCompleto'?
17:47:04.763 src/components/prospeccao/ConversaoModal.tsx(131,86): error TS2551: Property 'email_login' does not exist on type 'Usuario'. Did you mean 'emailLogin'?
17:47:04.763 src/components/prospeccao/ConversaoModal.tsx(136,24): error TS2367: This comparison appears to be unintentional because the types 'number | null' and 'string' have no overlap.
17:47:04.763 src/components/prospeccao/ConversaoModal.tsx(167,77): error TS2551: Property 'nome_completo' does not exist on type 'Usuario'. Did you mean 'nomeCompleto'?
17:47:04.763 src/components/prospeccao/ConversaoModal.tsx(170,78): error TS2551: Property 'email_login' does not exist on type 'Usuario'. Did you mean 'emailLogin'?
17:47:04.763 src/components/relatorios/DashboardCards.tsx(75,31): error TS2551: Property 'data_churn' does not exist on type 'Churn'. Did you mean 'dataChurn'?
17:47:04.763 src/components/relatorios/RelatorioPorIndicador.tsx(49,30): error TS2551: Property 'mes_ref' does not exist on type 'Comissao'. Did you mean 'mesRef'?
17:47:04.764 src/components/relatorios/RelatorioPorIndicador.tsx(67,15): error TS2551: Property 'regra_tipo' does not exist on type 'Comissao'. Did you mean 'regraTipo'?
17:47:04.764 src/components/relatorios/RelatorioPorMes.tsx(93,33): error TS2551: Property 'data_churn' does not exist on type 'Churn'. Did you mean 'dataChurn'?
17:47:04.764 src/components/usuarios/UsuarioForm.tsx(7,10): error TS6133: 'validators' is declared but its value is never read.
17:47:04.764 src/components/usuarios/UsuarioHistoricoModal.tsx(47,37): error TS2551: Property 'nome_completo' does not exist on type 'Usuario'. Did you mean 'nomeCompleto'?
17:47:04.764 src/components/usuarios/UsuarioHistoricoModal.tsx(54,82): error TS2551: Property 'email_login' does not exist on type 'Usuario'. Did you mean 'emailLogin'?
17:47:04.764 src/components/usuarios/UsuarioHistoricoModal.tsx(59,29): error TS2551: Property 'status_final' does not exist on type 'Usuario'. Did you mean 'statusFinal'?
17:47:04.765 src/components/usuarios/UsuarioHistoricoModal.tsx(60,13): error TS2322: Type '"default" | "success" | "warning" | "error"' is not assignable to type '"default" | "success" | "danger" | "warning" | "info" | undefined'.
17:47:04.765   Type '"error"' is not assignable to type '"default" | "success" | "danger" | "warning" | "info" | undefined'.
17:47:04.765 src/components/usuarios/UsuarioHistoricoModal.tsx(61,23): error TS2551: Property 'status_final' does not exist on type 'Usuario'. Did you mean 'statusFinal'?
17:47:04.765 src/components/usuarios/UsuarioHistoricoModal.tsx(63,27): error TS2551: Property 'status_final' does not exist on type 'Usuario'. Did you mean 'statusFinal'?
17:47:04.765 src/components/usuarios/UsuarioHistoricoModal.tsx(65,27): error TS2551: Property 'status_final' does not exist on type 'Usuario'. Did you mean 'statusFinal'?
17:47:04.765 src/components/usuarios/UsuarioHistoricoModal.tsx(77,82): error TS2551: Property 'total_ciclos_usuario' does not exist on type 'Usuario'. Did you mean 'totalCiclosUsuario'?
17:47:04.766 src/components/usuarios/UsuarioHistoricoModal.tsx(86,22): error TS2551: Property 'data_venc' does not exist on type 'Usuario'. Did you mean 'dataVenc'?
17:47:04.766 src/components/usuarios/UsuarioHistoricoModal.tsx(86,53): error TS2551: Property 'data_venc' does not exist on type 'Usuario'. Did you mean 'dataVenc'?
17:47:04.766 src/components/usuarios/UsuarioHistoricoModal.tsx(93,24): error TS2551: Property 'dias_para_vencer' does not exist on type 'Usuario'. Did you mean 'diasParaVencer'?
17:47:04.766 src/components/usuarios/UsuarioHistoricoModal.tsx(95,28): error TS2551: Property 'dias_para_vencer' does not exist on type 'Usuario'. Did you mean 'diasParaVencer'?
17:47:04.766 src/components/usuarios/UsuarioHistoricoModal.tsx(100,22): error TS2551: Property 'dias_para_vencer' does not exist on type 'Usuario'. Did you mean 'diasParaVencer'?
17:47:04.766 src/components/usuarios/UsuarioHistoricoModal.tsx(100,61): error TS2551: Property 'dias_para_vencer' does not exist on type 'Usuario'. Did you mean 'diasParaVencer'?
17:47:04.767 src/components/usuarios/UsuarioHistoricoModal.tsx(157,45): error TS2551: Property 'data_pagto' does not exist on type 'Pagamento'. Did you mean 'dataPagto'?
17:47:04.767 src/components/usuarios/UsuarioHistoricoModal.tsx(167,37): error TS2551: Property 'regra_tipo' does not exist on type 'Pagamento'. Did you mean 'regraTipo'?
17:47:04.767 src/components/usuarios/UsuarioHistoricoModal.tsx(172,36): error TS2551: Property 'regra_tipo' does not exist on type 'Pagamento'. Did you mean 'regraTipo'?
17:47:04.767 src/components/usuarios/UsuarioHistoricoModal.tsx(176,34): error TS2551: Property 'elegivel_comissao' does not exist on type 'Pagamento'. Did you mean 'elegivelComissao'?
17:47:04.767 src/components/usuarios/UsuarioHistoricoModal.tsx(177,52): error TS2551: Property 'comissao_valor' does not exist on type 'Pagamento'. Did you mean 'comissaoValor'?
17:47:04.768 src/components/usuarios/UsuariosTable.tsx(57,5): error TS6133: 'goToPage' is declared but its value is never read.
17:47:04.768 src/components/usuarios/UsuariosTable.tsx(175,21): error TS2322: Type '"default" | "success" | "warning" | "error"' is not assignable to type '"default" | "success" | "danger" | "warning" | "info" | undefined'.
17:47:04.768   Type '"error"' is not assignable to type '"default" | "success" | "danger" | "warning" | "info" | undefined'.
17:47:04.768 src/contexts/ThemeContext.tsx(1,58): error TS1484: 'ReactNode' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
17:47:04.768 src/hooks/__tests__/usePagination.test.ts(7,41): error TS2554: Expected 1-2 arguments, but got 0.
17:47:04.768 src/hooks/__tests__/usePagination.test.ts(9,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.769 src/hooks/__tests__/usePagination.test.ts(10,27): error TS2339: Property 'pageSize' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.769 src/hooks/__tests__/usePagination.test.ts(11,27): error TS2339: Property 'total' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.769 src/hooks/__tests__/usePagination.test.ts(18,9): error TS2353: Object literal may only specify known properties, and 'initialPage' does not exist in type 'unknown[]'.
17:47:04.769 src/hooks/__tests__/usePagination.test.ts(24,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.769 src/hooks/__tests__/usePagination.test.ts(25,27): error TS2339: Property 'pageSize' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.770 src/hooks/__tests__/usePagination.test.ts(26,27): error TS2339: Property 'total' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.770 src/hooks/__tests__/usePagination.test.ts(31,57): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.770 src/hooks/__tests__/usePagination.test.ts(34,22): error TS2339: Property 'setPage' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.770 src/hooks/__tests__/usePagination.test.ts(37,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.770 src/hooks/__tests__/usePagination.test.ts(41,57): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.770 src/hooks/__tests__/usePagination.test.ts(44,22): error TS2339: Property 'setPage' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.771 src/hooks/__tests__/usePagination.test.ts(47,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.771 src/hooks/__tests__/usePagination.test.ts(50,22): error TS2339: Property 'setPage' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.771 src/hooks/__tests__/usePagination.test.ts(53,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.771 src/hooks/__tests__/usePagination.test.ts(57,57): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.771 src/hooks/__tests__/usePagination.test.ts(63,22): error TS2339: Property 'setPage' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.772 src/hooks/__tests__/usePagination.test.ts(66,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.772 src/hooks/__tests__/usePagination.test.ts(71,23): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.772 src/hooks/__tests__/usePagination.test.ts(74,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.772 src/hooks/__tests__/usePagination.test.ts(77,22): error TS2339: Property 'setPageSize' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.772 src/hooks/__tests__/usePagination.test.ts(80,27): error TS2339: Property 'pageSize' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.772 src/hooks/__tests__/usePagination.test.ts(81,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.773 src/hooks/__tests__/usePagination.test.ts(86,41): error TS2554: Expected 1-2 arguments, but got 0.
17:47:04.773 src/hooks/__tests__/usePagination.test.ts(89,22): error TS2339: Property 'setTotal' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.773 src/hooks/__tests__/usePagination.test.ts(92,27): error TS2339: Property 'total' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.773 src/hooks/__tests__/usePagination.test.ts(97,57): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.773 src/hooks/__tests__/usePagination.test.ts(99,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.773 src/hooks/__tests__/usePagination.test.ts(105,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.774 src/hooks/__tests__/usePagination.test.ts(111,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.774 src/hooks/__tests__/usePagination.test.ts(116,23): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.774 src/hooks/__tests__/usePagination.test.ts(123,22): error TS2339: Property 'setPage' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.774 src/hooks/__tests__/usePagination.test.ts(130,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.793 src/hooks/__tests__/usePagination.test.ts(135,23): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.794 src/hooks/__tests__/usePagination.test.ts(138,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.794 src/hooks/__tests__/usePagination.test.ts(144,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.794 src/hooks/__tests__/usePagination.test.ts(150,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.795 src/hooks/__tests__/usePagination.test.ts(154,57): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.795 src/hooks/__tests__/usePagination.test.ts(156,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.795 src/hooks/__tests__/usePagination.test.ts(162,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.795 src/hooks/__tests__/usePagination.test.ts(167,23): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.795 src/hooks/__tests__/usePagination.test.ts(170,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.795 src/hooks/__tests__/usePagination.test.ts(173,22): error TS2339: Property 'firstPage' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.796 src/hooks/__tests__/usePagination.test.ts(176,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.796 src/hooks/__tests__/usePagination.test.ts(180,57): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.796 src/hooks/__tests__/usePagination.test.ts(182,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.796 src/hooks/__tests__/usePagination.test.ts(186,22): error TS2339: Property 'lastPage' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.796 src/hooks/__tests__/usePagination.test.ts(189,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.796 src/hooks/__tests__/usePagination.test.ts(194,23): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.797 src/hooks/__tests__/usePagination.test.ts(197,27): error TS2339: Property 'offset' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.797 src/hooks/__tests__/usePagination.test.ts(200,22): error TS2339: Property 'setPage' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.797 src/hooks/__tests__/usePagination.test.ts(203,27): error TS2339: Property 'offset' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.797 src/hooks/__tests__/usePagination.test.ts(206,22): error TS2339: Property 'setPage' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.797 src/hooks/__tests__/usePagination.test.ts(209,27): error TS2339: Property 'offset' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.797 src/hooks/__tests__/usePagination.test.ts(214,23): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.797 src/hooks/__tests__/usePagination.test.ts(217,33): error TS2339: Property 'paginationInfo' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.798 src/hooks/__tests__/usePagination.test.ts(229,57): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.798 src/hooks/__tests__/usePagination.test.ts(232,27): error TS2339: Property 'paginationInfo' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.798 src/hooks/__tests__/usePagination.test.ts(233,27): error TS2339: Property 'paginationInfo' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.799 src/hooks/__tests__/usePagination.test.ts(234,27): error TS2339: Property 'paginationInfo' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.799 src/hooks/__tests__/usePagination.test.ts(235,27): error TS2339: Property 'paginationInfo' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.800 src/hooks/__tests__/usePagination.test.ts(240,23): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.800 src/hooks/__tests__/usePagination.test.ts(244,33): error TS2339: Property 'paginationInfo' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.800 src/hooks/__tests__/usePagination.test.ts(254,23): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.800 src/hooks/__tests__/usePagination.test.ts(257,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.800 src/hooks/__tests__/usePagination.test.ts(260,22): error TS2339: Property 'setTotal' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.800 src/hooks/__tests__/usePagination.test.ts(263,27): error TS2339: Property 'page' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.801 src/hooks/__tests__/usePagination.test.ts(269,23): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'unknown[]'.
17:47:04.801 src/hooks/__tests__/usePagination.test.ts(272,34): error TS2339: Property 'getPageRange' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.801 src/hooks/__tests__/usePagination.test.ts(277,22): error TS2339: Property 'setPage' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.801 src/hooks/__tests__/usePagination.test.ts(280,41): error TS2339: Property 'getPageRange' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.801 src/hooks/__tests__/usePagination.test.ts(284,22): error TS2339: Property 'setPage' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.801 src/hooks/__tests__/usePagination.test.ts(287,39): error TS2339: Property 'getPageRange' does not exist on type '{ currentPage: number; itemsPerPage: number; totalPages: number; paginatedData: unknown[]; goToPage: (page: number) => void; nextPage: () => void; previousPage: () => void; changeItemsPerPage: (newItemsPerPage: number) => void; totalItems: number; }'.
17:47:04.803 src/hooks/__tests__/useUsuarios.test.ts(36,30): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.803 src/hooks/__tests__/useUsuarios.test.ts(55,27): error TS2339: Property 'total' does not exist on type '{ usuarios: Usuario[]; loading: boolean; error: string | null; fetchAll: () => Promise<void>; create: (data: CreateUsuarioDTO) => Promise<Usuario>; update: (id: string, data: UpdateUsuarioDTO) => Promise<...>; remove: (id: string) => Promise<...>; }'.
17:47:04.803 src/hooks/__tests__/useUsuarios.test.ts(60,30): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.803 src/hooks/__tests__/useUsuarios.test.ts(68,30): error TS2554: Expected 0 arguments, but got 1.
17:47:04.803 src/hooks/__tests__/useUsuarios.test.ts(78,27): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.804 src/hooks/__tests__/useUsuarios.test.ts(87,30): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.804 src/hooks/__tests__/useUsuarios.test.ts(97,29): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.804 src/hooks/__tests__/useUsuarios.test.ts(108,30): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.804 src/hooks/__tests__/useUsuarios.test.ts(122,26): error TS2339: Property 'setPage' does not exist on type '{ usuarios: Usuario[]; loading: boolean; error: string | null; fetchAll: () => Promise<void>; create: (data: CreateUsuarioDTO) => Promise<Usuario>; update: (id: string, data: UpdateUsuarioDTO) => Promise<...>; remove: (id: string) => Promise<...>; }'.
17:47:04.804 src/hooks/__tests__/useUsuarios.test.ts(125,29): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.804 src/hooks/__tests__/useUsuarios.test.ts(129,26): error TS2339: Property 'setPageSize' does not exist on type '{ usuarios: Usuario[]; loading: boolean; error: string | null; fetchAll: () => Promise<void>; create: (data: CreateUsuarioDTO) => Promise<Usuario>; update: (id: string, data: UpdateUsuarioDTO) => Promise<...>; remove: (id: string) => Promise<...>; }'.
17:47:04.805 src/hooks/__tests__/useUsuarios.test.ts(132,29): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.805 src/hooks/__tests__/useUsuarios.test.ts(138,30): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.805 src/hooks/__tests__/useUsuarios.test.ts(162,30): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.805 src/hooks/__tests__/useUsuarios.test.ts(169,30): error TS2339: Property 'createUsuario' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.805 src/hooks/__tests__/useUsuarios.test.ts(177,26): error TS2339: Property 'createUsuario' does not exist on type '{ usuarios: Usuario[]; loading: boolean; error: string | null; fetchAll: () => Promise<void>; create: (data: CreateUsuarioDTO) => Promise<Usuario>; update: (id: string, data: UpdateUsuarioDTO) => Promise<...>; remove: (id: string) => Promise<...>; }'.
17:47:04.806 src/hooks/__tests__/useUsuarios.test.ts(179,27): error TS2339: Property 'createUsuario' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.806 src/hooks/__tests__/useUsuarios.test.ts(183,29): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.806 src/hooks/__tests__/useUsuarios.test.ts(192,30): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.806 src/hooks/__tests__/useUsuarios.test.ts(199,30): error TS2339: Property 'updateUsuario' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.806 src/hooks/__tests__/useUsuarios.test.ts(210,26): error TS2339: Property 'updateUsuario' does not exist on type '{ usuarios: Usuario[]; loading: boolean; error: string | null; fetchAll: () => Promise<void>; create: (data: CreateUsuarioDTO) => Promise<Usuario>; update: (id: string, data: UpdateUsuarioDTO) => Promise<...>; remove: (id: string) => Promise<...>; }'.
17:47:04.807 src/hooks/__tests__/useUsuarios.test.ts(212,27): error TS2339: Property 'updateUsuario' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.807 src/hooks/__tests__/useUsuarios.test.ts(216,29): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.807 src/hooks/__tests__/useUsuarios.test.ts(221,30): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.807 src/hooks/__tests__/useUsuarios.test.ts(228,30): error TS2339: Property 'deleteUsuario' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.807 src/hooks/__tests__/useUsuarios.test.ts(236,26): error TS2339: Property 'deleteUsuario' does not exist on type '{ usuarios: Usuario[]; loading: boolean; error: string | null; fetchAll: () => Promise<void>; create: (data: CreateUsuarioDTO) => Promise<Usuario>; update: (id: string, data: UpdateUsuarioDTO) => Promise<...>; remove: (id: string) => Promise<...>; }'.
17:47:04.807 src/hooks/__tests__/useUsuarios.test.ts(238,27): error TS2339: Property 'deleteUsuario' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.808 src/hooks/__tests__/useUsuarios.test.ts(242,29): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.808 src/hooks/__tests__/useUsuarios.test.ts(247,30): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.808 src/hooks/__tests__/useUsuarios.test.ts(260,27): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.808 src/hooks/__tests__/useUsuarios.test.ts(265,27): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.808 src/hooks/__tests__/useUsuarios.test.ts(268,26): error TS2339: Property 'refresh' does not exist on type '{ usuarios: Usuario[]; loading: boolean; error: string | null; fetchAll: () => Promise<void>; create: (data: CreateUsuarioDTO) => Promise<Usuario>; update: (id: string, data: UpdateUsuarioDTO) => Promise<...>; remove: (id: string) => Promise<...>; }'.
17:47:04.814 src/hooks/__tests__/useUsuarios.test.ts(271,29): error TS2339: Property 'getUsuarios' does not exist on type 'typeof import("/vercel/path0/frontend/src/services/usuarioService")'.
17:47:04.815 src/hooks/useChurn.ts(43,39): error TS2367: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
17:47:04.815 src/hooks/useChurn.ts(58,42): error TS2367: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
17:47:04.815 src/hooks/useChurn.ts(72,39): error TS2367: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
17:47:04.815 src/pages/Agenda.tsx(136,37): error TS2322: Type '{ type: "error"; message: string; className: string; }' is not assignable to type 'IntrinsicAttributes & AlertProps'.
17:47:04.815   Property 'message' does not exist on type 'IntrinsicAttributes & AlertProps'.
17:47:04.816 src/pages/Churn.tsx(106,22): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
17:47:04.816 src/pages/Churn.tsx(150,37): error TS2322: Type '{ type: "error"; message: string; className: string; }' is not assignable to type 'IntrinsicAttributes & AlertProps'.
17:47:04.816   Property 'message' does not exist on type 'IntrinsicAttributes & AlertProps'.
17:47:04.816 src/pages/Comissoes.tsx(5,1): error TS6133: 'Button' is declared but its value is never read.
17:47:04.816 src/pages/Comissoes.tsx(128,37): error TS2322: Type '{ type: "error"; message: string; className: string; }' is not assignable to type 'IntrinsicAttributes & AlertProps'.
17:47:04.816   Property 'message' does not exist on type 'IntrinsicAttributes & AlertProps'.
17:47:04.817 src/pages/Dashboard.tsx(17,10): error TS6133: 'LineChart' is declared but its value is never read.
17:47:04.817 src/pages/Dashboard.tsx(17,21): error TS6133: 'Line' is declared but its value is never read.
17:47:04.817 src/pages/Dashboard.tsx(18,1): error TS6133: 'api' is declared but its value is never read.
17:47:04.817 src/pages/Dashboard.tsx(89,11): error TS6133: 'currentYear' is declared but its value is never read.
17:47:04.817 src/pages/Despesas.tsx(116,37): error TS2322: Type '{ type: "error"; message: string; className: string; }' is not assignable to type 'IntrinsicAttributes & AlertProps'.
17:47:04.817   Property 'message' does not exist on type 'IntrinsicAttributes & AlertProps'.
17:47:04.817 src/pages/Despesas.tsx(210,28): error TS2345: Argument of type 'CreateDespesaDTO | UpdateDespesaDTO' is not assignable to parameter of type 'CreateDespesaDTO'.
17:47:04.818   Type 'UpdateDespesaDTO' is not assignable to type 'CreateDespesaDTO'.
17:47:04.818     Types of property 'categoria' are incompatible.
17:47:04.818       Type 'string | undefined' is not assignable to type 'string'.
17:47:04.818         Type 'undefined' is not assignable to type 'string'.
17:47:04.818 src/pages/Listas.tsx(10,1): error TS6133: 'StatusBadge' is declared but its value is never read.
17:47:04.819 src/pages/Pagamentos.tsx(124,37): error TS2322: Type '{ type: "error"; message: string; className: string; }' is not assignable to type 'IntrinsicAttributes & AlertProps'.
17:47:04.819   Property 'message' does not exist on type 'IntrinsicAttributes & AlertProps'.
17:47:04.819 src/pages/Pagamentos.tsx(204,28): error TS2345: Argument of type 'CreatePagamentoDTO | UpdatePagamentoDTO' is not assignable to parameter of type 'CreatePagamentoDTO'.
17:47:04.819   Property 'usuarioId' is missing in type 'UpdatePagamentoDTO' but required in type 'CreatePagamentoDTO'.
17:47:04.819 src/pages/Prospeccao.tsx(169,37): error TS2322: Type '{ type: "error"; message: string; className: string; }' is not assignable to type 'IntrinsicAttributes & AlertProps'.
17:47:04.819   Property 'message' does not exist on type 'IntrinsicAttributes & AlertProps'.
17:47:04.820 src/pages/Relatorios.tsx(11,1): error TS6133: 'Alert' is declared but its value is never read.
17:47:04.820 src/pages/Relatorios.tsx(49,30): error TS2551: Property 'data_pagto' does not exist on type 'Pagamento'. Did you mean 'dataPagto'?
17:47:04.820 src/pages/Relatorios.tsx(76,33): error TS2551: Property 'data_pagto' does not exist on type 'Pagamento'. Did you mean 'dataPagto'?
17:47:04.820 src/pages/Usuarios.tsx(162,37): error TS2322: Type '{ type: "error"; message: string; className: string; }' is not assignable to type 'IntrinsicAttributes & AlertProps'.
17:47:04.820   Property 'message' does not exist on type 'IntrinsicAttributes & AlertProps'.
17:47:04.830 src/pages/Usuarios.tsx(237,71): error TS2551: Property 'nome_completo' does not exist on type 'Usuario'. Did you mean 'nomeCompleto'?
17:47:04.831 src/pages/Usuarios.tsx(263,28): error TS2345: Argument of type 'CreateUsuarioDTO | UpdateUsuarioDTO' is not assignable to parameter of type 'CreateUsuarioDTO'.
17:47:04.831   Type 'UpdateUsuarioDTO' is not assignable to type 'CreateUsuarioDTO'.
17:47:04.831     Types of property 'emailLogin' are incompatible.
17:47:04.831       Type 'string | undefined' is not assignable to type 'string'.
17:47:04.831         Type 'undefined' is not assignable to type 'string'.
17:47:04.831 src/test/setup.ts(13,10): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(13,37): error TS7006: Parameter 'query' implicitly has an 'any' type.
17:47:04.831 src/test/setup.ts(17,18): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(18,21): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(19,23): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(20,26): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(21,20): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(26,31): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(27,12): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(28,14): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(29,15): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(33,25): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(34,12): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(35,14): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(36,15): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(40,19): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(44,12): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(45,12): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(46,15): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/test/setup.ts(47,10): error TS2304: Cannot find name 'vi'.
17:47:04.831 src/utils/exportUtils.ts(1,18): error TS7016: Could not find a declaration file for module 'papaparse'. '/vercel/path0/frontend/node_modules/papaparse/papaparse.js' implicitly has an 'any' type.
17:47:04.831   Try `npm i --save-dev @types/papaparse` if it exists or add a new declaration (.d.ts) file containing `declare module 'papaparse';`
17:47:04.831 src/utils/exportUtils.ts(112,18): error TS7006: Parameter 'results' implicitly has an 'any' type.
17:47:04.831 src/utils/exportUtils.ts(115,15): error TS7006: Parameter 'error' implicitly has an 'any' type.
17:47:04.831 src/utils/formatters.ts(42,19): error TS2339: Property 'DateFormat' does not exist on type 'typeof Intl'.
17:47:04.831 src/utils/validators.ts(95,25): error TS2554: Expected 2 arguments, but got 1.
17:47:04.831 src/utils/validators.ts(96,9): error TS2322: Type 'string | ((min: number) => string)' is not assignable to type 'string | null'.
17:47:04.831   Type '(min: number) => string' is not assignable to type 'string'.
17:47:04.831 src/utils/validators.ts(101,42): error TS2556: A spread argument must either have a tuple type or be passed to a rest parameter.
17:47:04.832 src/utils/validators.ts(104,26): error TS2556: A spread argument must either have a tuple type or be passed to a rest parameter.
17:47:04.832 src/utils/xlsxExporter.ts(16,5): error TS6133: 'data' is declared but its value is never read.
17:47:04.832 src/utils/xlsxExporter.ts(17,5): error TS6133: 'options' is declared but its value is never read.
17:47:05.121 Error: Command "npm run build" exited with 2