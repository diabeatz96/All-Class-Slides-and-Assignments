// A tiny in-browser TypeScript checker for the slides.
// Uses the TypeScript 6 compiler API (the last JavaScript version of TypeScript).
// The real projects use TypeScript 7; the error messages are the same.

import ts from "typescript";

const USER = "/playground.ts";
const PRELUDE = "/prelude.d.ts";

export function createChecker(libs) {
  const files = new Map();
  const set = (name, text) => {
    const cur = files.get(name);
    if (cur && cur.text === text) return;
    files.set(name, { text, version: (cur?.version ?? 0) + 1 });
  };
  for (const [name, text] of Object.entries(libs)) set("/" + name, text);
  set(PRELUDE, "");
  set(USER, "");

  const options = {
    strict: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleDetection: ts.ModuleDetectionKind.Force,
    noLib: true,
    noEmit: true,
    skipLibCheck: true,
    types: [],
  };

  const host = {
    getScriptFileNames: () => [...files.keys()],
    getScriptVersion: (f) => String(files.get(f)?.version ?? 0),
    getScriptSnapshot: (f) => {
      const x = files.get(f);
      return x ? ts.ScriptSnapshot.fromString(x.text) : undefined;
    },
    getCurrentDirectory: () => "/",
    getCompilationSettings: () => options,
    getDefaultLibFileName: () => "/lib.es5.d.ts",
    fileExists: (f) => files.has(f),
    readFile: (f) => files.get(f)?.text,
    directoryExists: () => true,
    getDirectories: () => [],
  };
  const service = ts.createLanguageService(host, ts.createDocumentRegistry());

  function check(code, prelude = "") {
    set(PRELUDE, prelude);
    set(USER, code);
    const raw = [...service.getSyntacticDiagnostics(USER), ...service.getSemanticDiagnostics(USER)];
    const program = service.getProgram();
    const sf = program.getSourceFile(USER);
    const checker = program.getTypeChecker();

    const diagnostics = raw
      .filter((d) => d.file && d.start !== undefined)
      .map((d) => {
        const a = sf.getLineAndCharacterOfPosition(d.start);
        const b = sf.getLineAndCharacterOfPosition(d.start + (d.length || 1));
        return {
          line: a.line + 1,
          col: a.character + 1,
          endLine: b.line + 1,
          endCol: b.character + 1,
          start: d.start,
          length: d.length || 1,
          code: d.code,
          message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
        };
      })
      .sort((x, y) => x.start - y.start);

    const types = [];
    const fmt = (node) => checker.typeToString(checker.getTypeAtLocation(node), undefined, ts.TypeFormatFlags.NoTruncation);
    const addName = (nameNode) => {
      if (ts.isIdentifier(nameNode)) types.push({ name: nameNode.text, type: fmt(nameNode) });
      else if (ts.isObjectBindingPattern(nameNode) || ts.isArrayBindingPattern(nameNode)) {
        for (const el of nameNode.elements) if (ts.isBindingElement(el)) addName(el.name);
      }
    };
    for (const st of sf.statements) {
      if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) addName(d.name);
      else if (ts.isFunctionDeclaration(st) && st.name) types.push({ name: st.name.text, type: fmt(st.name), fn: true });
    }
    return { diagnostics, types };
  }

  // Replace every TypeScript-only piece of syntax with spaces, the way Node does.
  function erase(code) {
    const sf = ts.createSourceFile("/erase.ts", code, ts.ScriptTarget.ESNext, true);
    const ranges = [];
    const colonBefore = (pos) => {
      let i = pos - 1;
      while (i >= 0 && /\s/.test(code[i])) i--;
      return code[i] === ":" ? i : pos;
    };
    const visit = (node) => {
      if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
        ranges.push([node.getStart(sf), node.end]);
        return;
      }
      if (ts.isImportDeclaration(node) && node.importClause?.isTypeOnly) {
        ranges.push([node.getStart(sf), node.end]);
        return;
      }
      if (node.type && (ts.isVariableDeclaration(node) || ts.isParameter(node) || ts.isPropertyDeclaration(node) || ts.isFunctionLike(node))) {
        const t = node.type;
        ranges.push([colonBefore(t.getStart(sf)), t.end]);
      }
      if (ts.isParameter(node) && node.questionToken) ranges.push([node.questionToken.getStart(sf), node.questionToken.end]);
      if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) ranges.push([node.expression.end, node.end]);
      if (ts.isNonNullExpression(node)) ranges.push([node.end - 1, node.end]);
      if ((ts.isCallExpression(node) || ts.isNewExpression(node)) && node.typeArguments) {
        ranges.push([node.typeArguments.pos - 1, node.typeArguments.end + 1]);
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
    const chars = code.split("");
    const mask = new Array(chars.length).fill(false);
    for (const [a, b] of ranges) for (let i = a; i < b; i++) if (chars[i] !== "\n") { chars[i] = " "; mask[i] = true; }
    return { text: chars.join(""), mask };
  }

  return { check, erase };
}
