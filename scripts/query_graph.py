#!/usr/bin/env python3
"""
Fast query CLI for Graphify AST Knowledge Graph.
Usage:
  python scripts/query_graph.py --route /courses
  python scripts/query_graph.py --model Course
  python scripts/query_graph.py --client auth
"""

import argparse
import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
GRAPH_FILE = ROOT_DIR / "docs" / "ast_knowledge_graph.json"

def main():
    parser = argparse.ArgumentParser(description="Query the AST Knowledge Graph")
    parser.add_argument("--route", help="Search endpoints by route path or keyword")
    parser.add_argument("--model", help="Search SQLAlchemy models by name")
    parser.add_argument("--client", help="Search frontend apiClient modules")
    args = parser.parse_args()

    if not GRAPH_FILE.exists():
        print("Graph file not found. Run scripts/generate_ast_graph.py first.")
        return

    with open(GRAPH_FILE, "r", encoding="utf-8") as f:
        graph = json.load(f)

    if args.route:
        query = args.route.lower()
        matches = [ep for ep in graph["endpoints"] if query in ep["full_route"].lower() or query in ep["handler"].lower()]
        print(f"=== Found {len(matches)} Endpoints for '{args.route}' ===")
        for ep in matches:
            auth_str = "[ADMIN]" if ep["is_admin"] else ""
            print(f"[{ep['method']}] {ep['full_route']} -> {ep['handler']}() in {ep['file']} {auth_str}")
            if ep["summary"]:
                print(f"   Summary: {ep['summary']}")

    elif args.model:
        query = args.model.lower()
        matches = {k: v for k, v in graph["models"].items() if query in k.lower() or query in v["table"].lower()}
        print(f"=== Found {len(matches)} Models for '{args.model}' ===")
        for name, info in matches.items():
            print(f"Model: {name} (Table: {info['table']})")
            print(f"   Columns: {', '.join(info['columns'])}")
            if info["relationships"]:
                rels = [f"{r['field']} -> {r['target']}" for r in info["relationships"]]
                print(f"   Relationships: {', '.join(rels)}")

    elif args.client:
        query = args.client.lower()
        matches = {k: v for k, v in graph["client_modules"].items() if query in k.lower()}
        print(f"=== Found {len(matches)} Client Modules for '{args.client}' ===")
        for mod, methods in matches.items():
            print(f"Module: apiClient.{mod}")
            for m in methods:
                print(f"   .{m['method']}({m['params']}) [{m['http_verb']}] -> {m['endpoint']}")
    else:
        print(f"AST Knowledge Graph loaded.")
        print(f"- Models: {graph['models_count']}")
        print(f"- Endpoints: {graph['endpoints_count']}")
        print(f"- Client Modules: {graph['apiclient_modules_count']}")
        print("\nTry running:")
        print("  python scripts/query_graph.py --route /courses")
        print("  python scripts/query_graph.py --model Course")
        print("  python scripts/query_graph.py --client auth")

if __name__ == "__main__":
    main()
