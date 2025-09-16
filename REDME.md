# CodeScript
> **Repository overview**

This repository implements an online test platform for students that supports both **MCQ** and **coding** questions (with an integrated compiler/execution engine via **Judge0**). The project contains **3 codebases** in the same repository:

* `frontend/` — React (responsive UI using Tailwind)
* `backend-js/` — Node.js (JavaScript) — main backend for general app logic (tests, users, MCQs, orchestration)
* `backend-ts/` — Node.js (TypeScript) — coding backend (Judge0 integration, compile/run orchestration, submission handling)

---

## Table of contents

1. Project summary
2. Architecture & folders
3. Tech stack
4. Main features (Admin / Educator)
5. Main features (Student)
6. Coding question creation flow (detailed)
7. Test flow (timing / registration / submission)
8. Judge0 & compiler interaction
9. Data storage responsibilities
10. Authentication & roles
11. CSV results export


---

## 1. Project summary

An online testing platform that allows educators (admins) to create and publish tests containing multiple-choice questions (MCQs) and coding problems. Students register and take tests in the browser. Coding problems are executed using Judge0; each language has a default boilerplate and autosave for student code to avoid data loss.

Key goals:

* Full support for MCQ and coding questions in a single test
* Educator-controlled visibility of results
* Real-time test timer and automatic submission when time ends
* Multiple languages supported for coding problems (Judge0)
* Store large files (markdown, code, boilerplates, testcases) in S3
* Small-scale metadata in MongoDB

---

## 2. Architecture & folders

This repository is split into three main parts. Keep each part in the named folder at repo root.

```
/ (root)
├─ frontend/        # React + Tailwind (student + admin UI)
├─ backend-js/      # Node.js (JavaScript) main backend
└─ backend-ts/      # Node.js (TypeScript) coding backend (Judge0 orchestration)
```

Describe responsibilities briefly:

* `frontend/` — UI for educators and students: test listing (previous / running / upcoming), test attempt UI (MCQ + coding), registration, login, result view, CSV download trigger for admins.
* `backend-js/` — CRUD for tests, users, MCQs, scheduling logic, permissions, publishing tests to students, endpoints for CSV generation and test metadata.
* `backend-ts/` — Responsible for code execution: judge0 requests, language boilerplates, run/submit endpoints, autosave endpoints, and submission history management.

---

## 3. Tech stack

* Frontend: **React** + **Tailwind CSS** (responsive UI)
* Backend: **Node.js** (two services: JavaScript and TypeScript)

  * Coding backend implemented in **TypeScript**
  * Other backend functionality implemented in **JavaScript**
* Authentication: **JWT** (students + educators)
* Database: **MongoDB** (small-scale metadata: username, email, questionId, testId, etc.)
* Object storage: **AWS S3** (or compatible S3) for markdown, code, boilerplates and test cases
* Code execution: **Judge0** (remote judge service)

---

## 4. Main features (Admin / Educator)

Educator (admin) capabilities:

* **Create tests** that include:

  * test timing (start time, duration)
  * date of test
  * MCQs with correct answers and **weight/marks** per question
  * coding questions (see step-by-step flow below)
* **Publish / show tests** to students (control visibility)
* **Download results** as a CSV file
* **Create coding problems** with:

  * question name
  * title, description and constraints written in **Markdown** (stored in S3)
  * upload the correct solution code for the problem
  * create **sample** test cases (visible to students) and **hidden** test cases (used on final submission)

Admin UI requirements (as implemented in the repo):

* Create & edit test metadata (timing, date)
* Add MCQs with weight/marks
* Create coding problems via a form (markdown editor for description) and upload solution code
* Manage sample and hidden test cases
* Trigger/download CSV export of results

---

## 5. Main features (Student)

Student capabilities and UX:

* **Signup / Login** (JWT-based authentication)
* Home/dashboard shows all tests in three categories: **previous**, **running**, **upcoming**
* **Register** for a test before it starts / before it becomes running
* **Real-time timer** in the test UI (visible to the student)
* **Automatic submission** when the timer reaches the test end
* **Manual submit** option available while test is running
* During a running test:

  * Answer MCQs (answers weighted according to the educator’s configuration)
  * Solve coding questions (editor with language selection and default boilerplate for each language)
  * **Autosave** student code to prevent loss
  * Run the provided **sample** test cases in the UI
  * On final submission, the system runs **hidden** test cases (for full validation)
* Students can **view submission history** for coding problems
* Students receive clear compiler/execution responses to allow debugging: **Accepted**, **Wrong on hidden**, **Runtime error**, **Compilation error**, etc.
* Students can **see their result** only if the educator has allowed result visibility for that test

---

## 6. Coding question creation flow (exact process)

1. Admin creates a **coding question name**.
2. Admin enters **title**, **description**, and **constraints** in **Markdown** (these Markdown files are stored on S3).
3. Admin **uploads the correct solution code** for the problem .
4. Admin **creates sample test cases** (visible to students while solving).
5. Admin **creates hidden test cases** (used only during final submission to validate correctness).

This exact sequence is followed by the admin UI for problem creation in the repository.

---

## 7. Test flow (timing / registration / submission)

* **Before test**: Students see the test as `upcoming` and must register.
* **At start**: When the test status becomes `running`, the real-time timer starts on the student UI.
* **During test**: Students answer MCQs and solve coding problems (run sample tests locally in the UI).
* **Autosave**: Student code is periodically auto-saved to avoid data loss.
* **End of test**: When the timer expires, the system performs an **automatic submission** of the student’s answers and code.
* **Manual submission**: A student may submit earlier via the UI; on submit the platform runs hidden tests for coding problems and records submission history.

---

## 8. Judge0 & compiler interaction

* The coding backend (`backend-ts`) integrates with **Judge0** to compile and run code for all supported languages.
* Each language has a **default boilerplate** that is loaded into the student editor when they choose a language.
* Student can **run sample test cases** using Judge0 while solving; these runs are intended for debugging and feedback.
* On **final submit**, hidden test cases are executed against the student’s code (Judge0 calls) and verdicts are collected.
* The UI displays trusted, developer-provided verdicts back to the student to enable debugging: **Accepted**, **Wrong answer (hidden)**, **Runtime error**, **Compilation error**, etc.
* Submission results and any output/metadata required are persisted as part of the submission record (and may be stored on S3 when the implementation requires storing code + result blobs).

---

## 9. Data storage responsibilities

* **MongoDB**: store small-scale metadata such as users (username, email), tests (testId), questions (questionId), test registrations, submission metadata (timestamps, verdicts), and pointers/URLs to S3 where large blobs are stored.
* **S3**: store large files and content that do not fit well in the DB:

  * Markdown files (question descriptions, constraints)
  * Solution / uploaded code files
  * Language boilerplates
  * Sample and hidden test case files
  * (Optional) code + result blobs for submissions if you choose to keep full artifacts

---

## 10. Authentication & roles

* Authentication uses **JWT** for both **students** and **educators** (admin role).
* Role-based checks should be enforced in the backend to ensure that only educators can create tests, upload official solutions, create hidden testcases, and download CSV results.

---

## 11. CSV results export

Educators can download test results in **CSV** format. CSV must contain at least:

* Test name
* Total marks
* A list of users who took the test with: `name` and `score`

(Implement the CSV generation endpoint in `backend-js`; the educator UI triggers the export and downloads the CSV.)

---

## 12. Notes / scope

* The repository contains three parts (two backends and one frontend) — keep each service logically separated.
* Use JWT-based auth for both student and educator flows.
* Use MongoDB for metadata; S3 for markdown/code/testcases storage.
* Judge0 is used for compile/run functionality; coding backend is implemented in TypeScript.
* The README strictly documents the features described by the project requirements. It does not add new features beyond the requested scope.

---

