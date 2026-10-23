import os

files = [
    r"frontend/src/app/courses/[id]/page.tsx",
    r"frontend/src/components/course/CourseDetailHero.tsx",
    r"frontend/src/components/course/CourseSyllabusList.tsx",
    r"frontend/src/components/course/CourseEnrollmentCard.tsx",
    r"frontend/src/components/course/useCourseEnrollment.ts",
    r"frontend/src/components/course/CoursePlaylistSidebar.tsx",
    r"frontend/src/components/course/index.ts",
    r"frontend/src/app/courses/[id]/learn/page.tsx",
    r"frontend/src/components/CartModal.tsx",
    r"frontend/src/context/AuthContext.tsx",
    r"frontend/src/services/apiClient.ts",
    r"frontend/src/types/index.ts"
]

print("=== LINE COUNT VERIFICATION ===")
for f in files:
    if os.path.exists(f):
        with open(f, "r", encoding="utf-8") as fp:
            lines = len(fp.readlines())
        status = "PASS (<200)" if lines <= 200 else ("NOTE (>200)" if f in ["frontend/src/services/apiClient.ts"] else "FAIL (>200)")
        print(f"{f} : {lines} lines [{status}]")
    else:
        print(f"{f} : NOT FOUND")
