"""
Empirical Challenger 2 Verification Harness for Milestone 4 (Phase 9)
Empirically stress-tests:
1. Multi-tenant Student Data Isolation in Notes (/api/v1/notes)
2. Cross-student mutation protection (PUT / DELETE across tenants)
3. Scholarly Q&A Lifecycle & RBAC (/api/v1/qa) - Student 403 & Admin 200
4. Concurrent access and thread-safety under multi-user workloads
5. Edge cases and boundary validations
"""
import sys
import os
import warnings
warnings.filterwarnings("ignore")
sys.path.insert(0, os.path.abspath("."))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import uuid
import concurrent.futures
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def get_token(phone: str, full_name: str, password: str = "TestPass123!"):
    # Try register first, fallback to login
    reg = client.post("/api/v1/auth/register", json={
        "full_name": full_name,
        "phone": phone,
        "password": password
    })
    if reg.status_code == 200:
        return reg.json()["access_token"]
    login = client.post("/api/v1/auth/login", json={
        "phone": phone,
        "password": password
    })
    assert login.status_code == 200, f"Login failed for {phone}: {login.text}"
    return login.json()["access_token"]


def test_notes_multi_tenant_isolation_and_cross_attack():
    print("\n--- [CHALLENGER 2] STRESS TEST 1: Notes Multi-Tenant Isolation & Cross-Tenant Attack Defense ---")
    num_students = 5
    students = []
    
    # Create 5 distinct students
    for i in range(num_students):
        phone = f"0913{uuid.uuid4().int % 10000000:07d}"
        name = f"دانشجوی فلسفه شماره {i+1}"
        token = get_token(phone, name)
        students.append({
            "idx": i,
            "name": name,
            "phone": phone,
            "token": token,
            "headers": {"Authorization": f"Bearer {token}"},
            "notes": []
        })

    # Each student creates 3 notes
    for s in students:
        for n_idx in range(3):
            payload = {
                "course_id": f"course-ishraq-{s['idx']}",
                "chapter_id": n_idx + 1,
                "title": f"یادداشت {n_idx+1} از {s['name']}",
                "content": f"محتوای تحلیلی در باب حکمت اشراق برای {s['name']}",
                "timestamp_sec": 100 * (n_idx + 1)
            }
            res = client.post("/api/v1/notes/create", json=payload, headers=s["headers"])
            assert res.status_code == 200, f"Note creation failed: {res.text}"
            note_obj = res.json()
            assert note_obj["title"] == payload["title"]
            assert note_obj["timestamp_sec"] == payload["timestamp_sec"]
            s["notes"].append(note_obj)

    print(f"Created 3 notes for each of the {num_students} students (total {num_students * 3} notes).")

    # Verify Strict Read Isolation: Student i can ONLY see their own 3 notes
    for s in students:
        res = client.get("/api/v1/notes/", headers=s["headers"])
        assert res.status_code == 200
        user_notes = res.json()
        user_note_ids = {n["id"] for n in user_notes}
        own_note_ids = {n["id"] for n in s["notes"]}
        
        # All own notes must be present
        for own_id in own_note_ids:
            assert own_id in user_note_ids, f"Student {s['name']} missing note {own_id}"
            
        # None of other students' notes may be present
        for other_s in students:
            if other_s["idx"] == s["idx"]:
                continue
            for other_note in other_s["notes"]:
                assert other_note["id"] not in user_note_ids, (
                    f"CRITICAL ISOLATION BREACH: Student {s['name']} can see note {other_note['id']} "
                    f"belonging to {other_s['name']}!"
                )

    print("Strict Read Isolation passed: Zero cross-tenant note leakage detected.")

    # Cross-Tenant Mutation Attack 1: Student i attempts to PUT (modify) other students' notes
    for s in students:
        for other_s in students:
            if other_s["idx"] == s["idx"]:
                continue
            for target_note in other_s["notes"]:
                tamper_payload = {
                    "title": f"سرقت و تحریف توسط {s['name']}",
                    "content": "محتوای مخرب تزریق‌شده",
                    "timestamp_sec": 999
                }
                put_res = client.put(f"/api/v1/notes/{target_note['id']}", json=tamper_payload, headers=s["headers"])
                # Must return 404 Not Found (or 403) with permission error
                assert put_res.status_code == 404, (
                    f"CRITICAL BREACH: Student {s['name']} modified note {target_note['id']} "
                    f"of {other_s['name']}! Status: {put_res.status_code}"
                )
                assert "یا دسترسی به آن مجاز نیست" in put_res.text or "not found" in put_res.text.lower()

    print("Cross-Tenant Modification Attack passed: 100% blocked with 404/permission errors.")

    # Cross-Tenant Deletion Attack 2: Student i attempts to DELETE other students' notes
    for s in students:
        for other_s in students:
            if other_s["idx"] == s["idx"]:
                continue
            for target_note in other_s["notes"]:
                del_res = client.delete(f"/api/v1/notes/{target_note['id']}", headers=s["headers"])
                assert del_res.status_code == 200
                assert del_res.json().get("success") is False, (
                    f"CRITICAL BREACH: Student {s['name']} successfully deleted note {target_note['id']} "
                    f"of {other_s['name']}!"
                )

    # Verify that ALL other students' notes are STILL 100% intact after the deletion attacks
    for s in students:
        res = client.get("/api/v1/notes/", headers=s["headers"])
        assert res.status_code == 200
        current_ids = {n["id"] for n in res.json()}
        for original_note in s["notes"]:
            assert original_note["id"] in current_ids, f"Note {original_note['id']} was corrupted or lost!"

    print("Cross-Tenant Deletion Attack passed: All target notes remained intact with success=False.")

    # Legit CRUD: Each student modifies and deletes one of their own notes
    for s in students:
        note_to_edit = s["notes"][0]
        update_res = client.put(f"/api/v1/notes/{note_to_edit['id']}", json={
            "title": "عنوان منقح‌شده جدید",
            "timestamp_sec": 777
        }, headers=s["headers"])
        assert update_res.status_code == 200
        assert update_res.json()["title"] == "عنوان منقح‌شده جدید"
        assert update_res.json()["timestamp_sec"] == 777

        # Delete own note
        del_res = client.delete(f"/api/v1/notes/{note_to_edit['id']}", headers=s["headers"])
        assert del_res.status_code == 200
        assert del_res.json()["success"] is True

        # Confirm note is deleted
        check_res = client.get("/api/v1/notes/", headers=s["headers"])
        remaining_ids = {n["id"] for n in check_res.json()}
        assert note_to_edit["id"] not in remaining_ids
        assert len(remaining_ids) == 2

    print("Legitimate CRUD Lifecycle passed: Updates and deletions for own notes function perfectly.")


def test_qa_lifecycle_and_rbac_boundaries():
    print("\n--- [CHALLENGER 2] STRESS TEST 2: Q&A Lifecycle & RBAC Security Boundaries ---")
    
    # 1. Unauthenticated requests
    anon_list = client.get("/api/v1/qa/")
    assert anon_list.status_code == 200, "Anonymous read should be allowed"
    
    anon_ask = client.post("/api/v1/qa/ask", json={
        "course_id": "course-ishraq",
        "title": "سوال ناشناس",
        "question_text": "متن سوال ناشناس"
    })
    assert anon_ask.status_code == 401, f"Expected 401 for anonymous ask, got {anon_ask.status_code}"

    anon_ans = client.post("/api/v1/qa/qa-101/answer", json={"answer_text": "پاسخ ناشناس"})
    assert anon_ans.status_code == 401, f"Expected 401 for anonymous answer, got {anon_ans.status_code}"

    # 2. Get Student & Admin tokens
    student_phone = f"0914{uuid.uuid4().int % 10000000:07d}"
    student_token = get_token(student_phone, "دانشجوی پژوهشگر")
    student_headers = {"Authorization": f"Bearer {student_token}"}

    admin_login = client.post("/api/v1/auth/login", json={"phone": "09120000000", "password": "admin_secret_2026"})
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 3. Student creates 3 questions across different courses
    courses = ["course-ishraq", "course-asfar", "course-fusus"]
    created_qas = []
    for c_id in courses:
        res = client.post("/api/v1/qa/ask", json={
            "course_id": c_id,
            "title": f"پرسش تخصصی در باب {c_id}",
            "question_text": f"توضیحات تکمیلی پرسش فلسفی درباره مفاهیم عمیق {c_id}"
        }, headers=student_headers)
        assert res.status_code == 200, f"QA ask failed: {res.text}"
        q_obj = res.json()
        assert q_obj["course_id"] == c_id
        assert q_obj["is_resolved"] is False
        assert q_obj["answer_text"] is None
        created_qas.append(q_obj)

    print(f"Student created {len(created_qas)} questions. All initially unresolved.")

    # 4. Course filtering test
    for c_id in courses:
        c_list = client.get(f"/api/v1/qa/?course_id={c_id}")
        assert c_list.status_code == 200
        c_items = c_list.json()
        c_item_ids = {item["id"] for item in c_items}
        for q in created_qas:
            if q["course_id"] == c_id:
                assert q["id"] in c_item_ids

    print("Q&A Course filtering passed accurately.")

    # 5. Student attempts to answer ANY of the questions -> MUST RETURN 403 FORBIDDEN
    for q in created_qas:
        ans_res = client.post(f"/api/v1/qa/{q['id']}/answer", json={
            "answer_text": "پاسخ غیرمجاز توسط دانشجو"
        }, headers=student_headers)
        assert ans_res.status_code == 403, (
            f"CRITICAL RBAC BREACH: Student was allowed to answer question {q['id']}! "
            f"Status: {ans_res.status_code}"
        )
        assert "منحصراً در اختیار مدیر" in ans_res.text

    print("Student Answer Block passed: All student attempts rejected with 403 Forbidden.")

    # 6. Admin answers non-existent question -> MUST RETURN 404
    non_existent_id = f"qa-{uuid.uuid4().hex}"
    fake_ans = client.post(f"/api/v1/qa/{non_existent_id}/answer", json={
        "answer_text": "پاسخ به سوال فرضی"
    }, headers=admin_headers)
    assert fake_ans.status_code == 404, f"Expected 404 for nonexistent question, got {fake_ans.status_code}"

    # 7. Admin answers each question legitimately -> 200 OK, is_resolved=True
    for q in created_qas:
        official_ans = f"پاسخ تفصیلی و مستند استاد برای پرسش {q['id']}"
        ans_res = client.post(f"/api/v1/qa/{q['id']}/answer", json={
            "answer_text": official_ans
        }, headers=admin_headers)
        assert ans_res.status_code == 200
        ans_obj = ans_res.json()
        assert ans_obj["id"] == q["id"]
        assert ans_obj["is_resolved"] is True
        assert ans_obj["answer_text"] == official_ans

    # 8. Verify public list shows resolved questions
    pub_list = client.get("/api/v1/qa/").json()
    for q in created_qas:
        matched = next((item for item in pub_list if item["id"] == q["id"]), None)
        assert matched is not None
        assert matched["is_resolved"] is True
        assert matched["answer_text"] == f"پاسخ تفصیلی و مستند استاد برای پرسش {q['id']}"

    print("Admin Official Answer Resolution passed: All questions marked resolved with official answers.")


def test_concurrent_multi_user_notes_and_qa():
    print("\n--- [CHALLENGER 2] STRESS TEST 3: Concurrent Multi-User Execution Stress ---")
    num_threads = 8
    
    def user_lifecycle_task(thread_id: int):
        phone = f"0915{uuid.uuid4().int % 10000000:07d}"
        token = get_token(phone, f"کاربر موازی {thread_id}")
        headers = {"Authorization": f"Bearer {token}"}
        
        # 1. Create 2 notes
        note_ids = []
        for i in range(2):
            create_res = client.post("/api/v1/notes/create", json={
                "course_id": "course-ishraq",
                "chapter_id": 1,
                "title": f"یادداشت موازی ترید {thread_id}-{i}",
                "content": f"محتوای موازی {thread_id}",
                "timestamp_sec": thread_id * 10 + i
            }, headers=headers)
            assert create_res.status_code == 200
            note_ids.append(create_res.json()["id"])
            
        # 2. Read notes
        my_notes = client.get("/api/v1/notes/", headers=headers).json()
        my_ids = {n["id"] for n in my_notes}
        for nid in note_ids:
            assert nid in my_ids
            
        # 3. Ask a Q&A question
        qa_res = client.post("/api/v1/qa/ask", json={
            "course_id": "course-ishraq",
            "title": f"پرسش موازی {thread_id}",
            "question_text": f"متن سوال موازی {thread_id}"
        }, headers=headers)
        assert qa_res.status_code == 200
        
        # 4. Clean up 1 note
        del_res = client.delete(f"/api/v1/notes/{note_ids[0]}", headers=headers)
        assert del_res.status_code == 200
        assert del_res.json()["success"] is True
        
        return thread_id, True

    with concurrent.futures.ThreadPoolExecutor(max_workers=num_threads) as executor:
        futures = [executor.submit(user_lifecycle_task, i) for i in range(num_threads)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
    assert len(results) == num_threads
    assert all(r[1] for r in results)
    print(f"Concurrent stress test passed with {num_threads} simultaneous threads executing lifecycles.")


if __name__ == "__main__":
    print("=====================================================================")
    print("STARTING EMPIRICAL CHALLENGER 2 SUITE (NOTES & QA ISOLATION & RBAC)")
    print("=====================================================================")
    test_notes_multi_tenant_isolation_and_cross_attack()
    test_qa_lifecycle_and_rbac_boundaries()
    test_concurrent_multi_user_notes_and_qa()
    print("\n🎉 ALL EMPIRICAL CHALLENGER 2 TESTS PASSED 100% WITH ZERO VULNERABILITIES!")
