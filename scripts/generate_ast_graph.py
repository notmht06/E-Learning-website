#!/usr/bin/env python3
"""
Graphify AST Knowledge Graph Generator for Dr. Zanjirzan Platform.
Analyzes cross-layer fullstack dependencies:
Frontend Components -> apiClient.ts -> FastAPI Endpoints -> Services -> SQLAlchemy Models.
Outputs:
1. docs/ast_knowledge_graph.json
2. docs/AST_ARCHITECTURE_GRAPH.md
"""

import ast
import json
import os
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend" / "app"
FRONTEND_DIR = ROOT_DIR / "frontend" / "src"
DOCS_DIR = ROOT_DIR / "docs"

def parse_sqlalchemy_models():
    models_file = BACKEND_DIR / "models" / "models.py"
    if not models_file.exists():
        return {}
    
    with open(models_file, "r", encoding="utf-8") as f:
        tree = ast.parse(f.read())
        
    models = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            tablename = None
            columns = []
            relationships = []
            for item in node.body:
                if isinstance(item, ast.Assign):
                    for target in item.targets:
                        if isinstance(target, ast.Name):
                            if target.id == "__tablename__" and isinstance(item.value, ast.Constant):
                                tablename = item.value.value
                            elif isinstance(item.value, ast.Call):
                                func_id = getattr(item.value.func, "id", None)
                                if func_id == "Column":
                                    columns.append(target.id)
                                elif func_id == "relationship":
                                    target_model = None
                                    if item.value.args and isinstance(item.value.args[0], ast.Constant):
                                        target_model = item.value.args[0].value
                                    relationships.append({"field": target.id, "target": target_model})
            if tablename:
                models[node.name] = {
                    "table": tablename,
                    "columns": columns,
                    "relationships": relationships
                }
    return models

def parse_fastapi_endpoints():
    endpoints_dir = BACKEND_DIR / "api" / "v1" / "endpoints"
    endpoints = []
    
    if not endpoints_dir.exists():
        return endpoints

    for file in sorted(endpoints_dir.glob("*.py")):
        if file.name.startswith("__"):
            continue
        with open(file, "r", encoding="utf-8") as f:
            content = f.read()
            tree = ast.parse(content)
            
        module_name = file.stem
        for node in ast.walk(tree):
            if isinstance(node, ast.AsyncFunctionDef) or isinstance(node, ast.FunctionDef):
                for decorator in node.decorator_list:
                    if isinstance(decorator, ast.Call) and hasattr(decorator.func, "attr"):
                        method = decorator.func.attr.upper()
                        if method in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
                            path = ""
                            if decorator.args and isinstance(decorator.args[0], ast.Constant):
                                path = decorator.args[0].value
                            
                            # Extract docstring
                            doc = ast.get_docstring(node) or ""
                            doc_first_line = doc.strip().split("\n")[0] if doc else ""
                            
                            # Check auth dependency
                            has_auth = "get_current_user" in content or "get_current_admin" in content
                            is_admin = "get_current_admin" in content
                            
                            full_route = f"/api/v1/{module_name}{path}".replace("//", "/")
                            if full_route.endswith("/") and len(full_route) > 8:
                                full_route = full_route[:-1]

                            endpoints.append({
                                "module": module_name,
                                "method": method,
                                "path": path,
                                "full_route": full_route,
                                "handler": node.name,
                                "summary": doc_first_line,
                                "is_admin": is_admin,
                                "file": str(file.relative_to(ROOT_DIR)).replace("\\", "/")
                            })
    return endpoints

def parse_apiclient_methods():
    client_file = FRONTEND_DIR / "services" / "apiClient.ts"
    if not client_file.exists():
        return {}
    
    with open(client_file, "r", encoding="utf-8") as f:
        content = f.read()
        
    modules = {}
    current_module = None
    
    for line in content.split("\n"):
        line_clean = line.strip()
        # Look for module definition like: auth = { or courses = {
        mod_match = re.match(r"^([a-zA-Z0-9_]+)\s*=\s*\{", line_clean)
        if mod_match:
            current_module = mod_match.group(1)
            modules[current_module] = []
            continue
            
        if current_module:
            if line_clean.startswith("};"):
                current_module = None
                continue
            # Look for method like: login: (phone: string, ...) => this.request<User>('/auth/login', { method: 'POST' ...
            method_match = re.match(r"^([a-zA-Z0-9_]+):\s*\((.*?)\)\s*=>\s*this\.request(?:<.*?>)?\(\s*['\"`](.*?)['\"`]", line_clean)
            if method_match:
                func_name = method_match.group(1)
                params = method_match.group(2)
                endpoint = method_match.group(3)
                http_verb = "GET"
                if "method: 'POST'" in line_clean or 'method: "POST"' in line_clean:
                    http_verb = "POST"
                elif "method: 'DELETE'" in line_clean or 'method: "DELETE"' in line_clean:
                    http_verb = "DELETE"
                elif "method: 'PUT'" in line_clean or 'method: "PUT"' in line_clean:
                    http_verb = "PUT"
                    
                modules[current_module].append({
                    "method": func_name,
                    "params": params,
                    "endpoint": endpoint,
                    "http_verb": http_verb
                })
    return modules

def main():
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    models = parse_sqlalchemy_models()
    endpoints = parse_fastapi_endpoints()
    client_modules = parse_apiclient_methods()
    
    graph_data = {
        "title": "Dr. Zanjirzan Platform - Cross-Layer AST Dependency Graph",
        "models_count": len(models),
        "endpoints_count": len(endpoints),
        "apiclient_modules_count": len(client_modules),
        "models": models,
        "endpoints": endpoints,
        "client_modules": client_modules
    }
    
    json_path = DOCS_DIR / "ast_knowledge_graph.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(graph_data, f, ensure_ascii=False, indent=2)
        
    md_path = DOCS_DIR / "AST_ARCHITECTURE_GRAPH.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# 🧭 شجره‌نامه و گراف ارتباطی سیستم (Cross-Layer AST Knowledge Graph)\n\n")
        f.write("این سند نقشه دوطرفه وابستگی‌های فرانت‌اند و بک‌اند را نمایش می‌دهد تا ایجنت‌ها بدون مصرف توکن اضافه به لایه‌های مرتبط دسترسی داشته باشند.\n\n")
        
        f.write("## ۱. پایگاه مدل‌های پایگاه داده (SQLAlchemy ORM Models)\n\n")
        f.write("| مدل ORM | جدول SQLite | تعداد ستون‌ها | روابط کلیدی |\n")
        f.write("| :--- | :--- | :---: | :--- |\n")
        for model_name, info in models.items():
            rels = ", ".join([f"`{r['field']}` ➔ {r['target']}" for r in info['relationships']]) or "—"
            f.write(f"| **{model_name}** | `{info['table']}` | {len(info['columns'])} | {rels} |\n")
            
        f.write("\n## ۲. اندپوینت‌های API v1 و سرویس‌های بک‌اند\n\n")
        f.write("| روش | مسیر اندپوینت (Route) | کنترل‌کننده (Handler) | سطح دسترسی | ماژول |\n")
        f.write("| :---: | :--- | :--- | :---: | :--- |\n")
        for ep in endpoints:
            auth_badge = "🔒 ادمین" if ep['is_admin'] else "عمومی / کاربر"
            f.write(f"| `{ep['method']}` | `{ep['full_route']}` | `{ep['handler']}()` | {auth_badge} | `{ep['module']}` |\n")
            
        f.write("\n## ۳. کلاینت یکپارچه فرانت‌اند (`apiClient.ts`)\n\n")
        f.write("| ماژول کلاینت | متد فراخوانی | پروتکل | اندپوینت مقصد |\n")
        f.write("| :--- | :--- | :---: | :--- |\n")
        for mod, funcs in client_modules.items():
            for fn in funcs:
                f.write(f"| `apiClient.{mod}` | `.{fn['method']}({fn['params']})` | `{fn['http_verb']}` | `{fn['endpoint']}` |\n")
                
    print(f"Generated AST Knowledge Graph successfully:")
    print(f"- {json_path}")
    print(f"- {md_path}")
    print(f"Stats: {len(models)} models, {len(endpoints)} endpoints, {len(client_modules)} client modules.")

if __name__ == "__main__":
    main()
