import io







import re



import random



import uuid



import random



import uuid







ASSESSMENT_SESSIONS = {}



ASSESSMENT_SIZE = 12



from typing import Any, Dict, List, Union, Optional















from assessment import ASSESSMENT_QUESTIONS







from job_roles import JOB_ROLES















from fastapi import FastAPI, UploadFile, File, HTTPException







from fastapi.middleware.cors import CORSMiddleware















from pypdf import PdfReader







from docx import Document







from pydantic import BaseModel, Field















from skills import SKILL_ALIASES























# ============================================================







# FASTAPI APPLICATION







# ============================================================















app = FastAPI(







    title="Career Readiness & Skill Development System",







    version="1.0.0"







)























# ============================================================







# CORS CONFIGURATION







# ============================================================















app.add_middleware(







    CORSMiddleware,















    allow_origins=[







        "http://localhost:5173",







        "http://127.0.0.1:5173",















        "http://localhost:3000",







        "http://127.0.0.1:3000",















        "http://localhost:3001",







        "http://127.0.0.1:3001"







    ],















    allow_credentials=True,















    allow_methods=["*"],















    allow_headers=["*"]







)























# ============================================================







# REQUEST MODEL FOR ASSESSMENT







# ============================================================















class AssessmentSubmission(BaseModel):



    skill: Optional[str] = None



    answers: Union[List[Any], Dict[str, Any]]



    assessment_id: Optional[str] = Field(default=None, alias="assessmentId")



    question_ids: List[str] = Field(default_factory=list)







    class Config:



        populate_by_name = True



# ============================================================







# SKILL EXTRACTION







# ============================================================















def extract_skills(text: str):















    """







    Extract skills from resume text using







    aliases defined in skills.py.







    """















    text_lower = text.lower()















    found_skills = set()















    for alias, skill_name in SKILL_ALIASES.items():















        pattern = r"\b" + re.escape(







            alias.lower()







        ) + r"\b"















        if re.search(pattern, text_lower):















            found_skills.add(skill_name)















    return sorted(found_skills)























# ============================================================







# FIND MATCHING SKILL







# ============================================================















def find_matching_skill(skill: str):















    """







    Find the actual skill name stored inside







    ASSESSMENT_QUESTIONS.















    Matching is case-insensitive.







    """















    if not skill:















        return None















    for available_skill in ASSESSMENT_QUESTIONS:















        if available_skill.lower() == skill.lower():















            return available_skill















    return None























# ============================================================







# FIND MATCHING JOB ROLE







# ============================================================















def find_matching_role(role: str):















    """







    Find the actual job role stored inside







    JOB_ROLES.















    Matching is case-insensitive.







    """















    if not role:















        return None















    for available_role in JOB_ROLES:















        if available_role.lower() == role.lower():















            return available_role















    return None























# ============================================================







# NORMALIZE USER ANSWERS







# ============================================================















def normalize_answers(







    answers: Union[List[Any], Dict[str, Any]]







):















    """







    Converts list or dictionary answers into







    one common dictionary format.







    """















    if isinstance(answers, list):















        return {







            str(index): value







            for index, value in enumerate(answers)







        }















    if isinstance(answers, dict):















        return {







            str(key): value







            for key, value in answers.items()







        }















    return {}























# ============================================================







# COMPARE USER ANSWER WITH CORRECT ANSWER







# ============================================================















def is_answer_correct(







    question: dict,







    user_answer: Any







):















    """







    Supports:















    1. Option index







       2















    2. Answer text







       "def"







    """















    if user_answer is None:















        return False















    correct_answer = question["answer"]















    options = question.get(







        "options",







        []







    )























    # --------------------------------------------------------







    # User selected option using index







    # --------------------------------------------------------















    if isinstance(user_answer, int):















        if (







            0 <= user_answer < len(options)







            and options[user_answer] == correct_answer







        ):















            return True















        return False























    # --------------------------------------------------------







    # User submitted answer text







    # --------------------------------------------------------















    if isinstance(user_answer, str):















        return (







            user_answer.strip().lower()







            ==







            str(correct_answer).strip().lower()







        )























    return False























# ============================================================







# ROOT ENDPOINT







# ============================================================















@app.get("/")







def root():















    return {















        "message": (







            "Career Readiness Backend is running"







        ),















        "status": "online"















    }























# ============================================================







# HEALTH CHECK







# ============================================================















@app.get("/api/health")







def health():















    return {















        "status": "healthy",















        "service": (







            "Career Readiness Backend"







        )















    }























# ============================================================

# GENERATE RANDOMIZED ASSESSMENT

# ============================================================



@app.post("/api/assessment/generate")

async def generate_assessment(data: dict):

    role_value = data.get("role") or data.get("role_id") or data.get("roleId")

    focus_skills = data.get("focusSkills") or data.get("focus_skills") or data.get("skills") or []



    if not isinstance(focus_skills, list):

        focus_skills = []



    selected_skills = []



    for skill in focus_skills:

        if not skill:

            continue

        matched = find_matching_skill(str(skill))

        if matched and matched not in selected_skills:

            selected_skills.append(matched)



    if not selected_skills and role_value:

        matched_role = find_matching_role(str(role_value))

        if matched_role:

            for skill in JOB_ROLES[matched_role]["skills"]:

                matched = find_matching_skill(skill)

                if matched and matched not in selected_skills:

                    selected_skills.append(matched)



    if not selected_skills:

        selected_skills = list(ASSESSMENT_QUESTIONS.keys())



    question_pool = []

    for skill in selected_skills:

        question_pool.extend(ASSESSMENT_QUESTIONS.get(skill, []))



    if not question_pool:

        raise HTTPException(status_code=404, detail="No assessment questions are available for the selected role or skills.")



    unique_questions = {}

    for question in question_pool:

        unique_questions[str(question["id"])] = question



    question_pool = list(unique_questions.values())

    selected_questions = random.sample(question_pool, min(ASSESSMENT_SIZE, len(question_pool)))

    assessment_id = f"assessment_{uuid.uuid4().hex}"



    ASSESSMENT_SESSIONS[assessment_id] = {

        "question_ids": [str(q["id"]) for q in selected_questions],

        "skills": selected_skills,

        "role": role_value,

    }



    safe_questions = []

    for question in selected_questions:

        safe_questions.append({

            "id": question["id"],

            "type": question.get("type", "mcq"),

            "question": question.get("question", ""),

            "questionText": question.get("question", ""),

            "options": question.get("options", []),

            "code": question.get("code", ""),

        })



    return {

        "success": True,

        "assessmentId": assessment_id,

        "assessment_id": assessment_id,

        "role": role_value,

        "skills": selected_skills,

        "total_questions": len(safe_questions),

        "question_count": len(safe_questions),

        "questions": safe_questions,

    }





# ============================================================







# GET AVAILABLE ASSESSMENT SKILLS







# ============================================================















@app.get("/api/assessment/skills")







def get_assessment_skills():















    return {















        "success": True,















        "skills": list(







            ASSESSMENT_QUESTIONS.keys()







        ),















        "skill_count": len(







            ASSESSMENT_QUESTIONS







        )















    }























# ============================================================







# GET ASSESSMENT QUESTIONS







# ============================================================















@app.get(







    "/api/assessment/questions/{skill}"







)







def get_assessment_questions(







    skill: str







):















    matched_skill = find_matching_skill(







        skill







    )























    if not matched_skill:















        raise HTTPException(







            status_code=404,







            detail=(







                f"No assessment available "







                f"for {skill}"







            )







        )























    questions = random.sample(



        ASSESSMENT_QUESTIONS[matched_skill],



        min(ASSESSMENT_SIZE, len(ASSESSMENT_QUESTIONS[matched_skill]))



    )























    # --------------------------------------------------------







    # Remove correct answers before sending







    # questions to frontend







    # --------------------------------------------------------















    safe_questions = []























    for question in questions:















        safe_questions.append({















            "id": question["id"],



            "type": question.get("type", "mcq"),



            "question": question["question"],



            "questionText": question["question"],



            "options": question.get("options", []),



            "code": question.get("code", "")















        })























    return {















        "success": True,















        "skill": matched_skill,















        "question_count": len(







            safe_questions







        ),















        "questions": safe_questions















    }























# ============================================================







# SUBMIT ASSESSMENT







# ============================================================















@app.post(







    "/api/assessment/submit"







)







async def submit_assessment(







    data: AssessmentSubmission







):















    # --------------------------------------------------------







    # Validate skill







    # --------------------------------------------------------















    skill = (data.skill or "").strip()



    matched_skill = find_matching_skill(skill) if skill else None







    # A valid assessment session is enough because it stores the exact randomized questions.



    if not matched_skill and not (data.assessment_id and data.assessment_id in ASSESSMENT_SESSIONS):



        raise HTTPException(status_code=400, detail="Skill or valid assessment session is required.")























    # --------------------------------------------------------







    # Get questions







    # --------------------------------------------------------















    if data.assessment_id and data.assessment_id in ASSESSMENT_SESSIONS:



        question_ids = set(ASSESSMENT_SESSIONS[data.assessment_id]["question_ids"])



        questions = [q for bank in ASSESSMENT_QUESTIONS.values() for q in bank if str(q["id"]) in question_ids]



    elif data.question_ids:



        ids = set(data.question_ids)



        questions = [q for q in ASSESSMENT_QUESTIONS.get(matched_skill, []) if str(q["id"]) in ids]



    else:



        questions = ASSESSMENT_QUESTIONS[matched_skill]



























    # --------------------------------------------------------







    # Normalize answers







    # --------------------------------------------------------















    answers = normalize_answers(







        data.answers







    )























    # --------------------------------------------------------







    # Calculate score







    # --------------------------------------------------------















    correct_count = 0















    answered_count = 0























    for index, question in enumerate(







        questions







    ):















        question_id = str(







            question["id"]







        )























        # ----------------------------------------------------







        # Try question ID first







        # ----------------------------------------------------















        if question_id in answers:















            user_answer = answers[







                question_id







            ]























        # ----------------------------------------------------







        # Otherwise try question position







        # ----------------------------------------------------















        elif str(index) in answers:















            user_answer = answers[







                str(index)







            ]























        else:















            user_answer = None























        # ----------------------------------------------------







        # Check answered







        # ----------------------------------------------------















        if user_answer is not None:















            answered_count += 1























        # ----------------------------------------------------







        # Check correctness







        # ----------------------------------------------------















        if is_answer_correct(







            question,







            user_answer







        ):















            correct_count += 1























    # --------------------------------------------------------







    # Total questions







    # --------------------------------------------------------















    total_questions = len(







        questions







    )























    # --------------------------------------------------------







    # Score







    # --------------------------------------------------------















    if total_questions > 0:















        score = round(







            (







                correct_count







                /







                total_questions







            )







            * 100







        )















    else:















        score = 0























    # ========================================================







    # PROFICIENCY







    # ========================================================















    if score < 40:















        proficiency = "Beginner"















    elif score < 70:















        proficiency = "Intermediate"















    else:















        proficiency = "Advanced"























    # ========================================================







    # READINESS







    # ========================================================















    if score < 40:















        readiness = "Needs Improvement"















    elif score < 70:















        readiness = "Developing"















    elif score < 85:















        readiness = "Nearly Ready"















    else:















        readiness = "Ready"























    # ========================================================







    # RESPONSE







    # ========================================================















    return {















        "success": True,















        "skill": matched_skill,















        "total_questions": total_questions,















        "answered_questions": answered_count,















        "correct_answers": correct_count,















        "score": score,















        "proficiency": proficiency,















        "readiness": readiness















    }























# ============================================================







# GET ALL JOB ROLES







# ============================================================















@app.get("/api/job-roles")







def get_job_roles():















    roles = []























    for role_name, role_data in JOB_ROLES.items():















        roles.append({















            "role": role_name,















            "description": role_data[







                "description"







            ],















            "required_skills": role_data[







                "skills"







            ],















            "skill_count": len(







                role_data["skills"]







            )















        })























    return {















        "success": True,















        "job_roles": roles,















        "role_count": len(roles)















    }























# ============================================================







# GET SKILLS REQUIRED FOR A JOB ROLE







# ============================================================















@app.get(







    "/api/job-roles/{role}/skills"







)







def get_role_skills(







    role: str







):















    matched_role = find_matching_role(







        role







    )























    if not matched_role:















        raise HTTPException(







            status_code=404,







            detail=(







                f"Job role not found: {role}"







            )







        )























    required_skills = JOB_ROLES[







        matched_role







    ]["skills"]























    return {















        "success": True,















        "role": matched_role,















        "required_skills": required_skills,















        "skill_count": len(







            required_skills







        )















    }























# ============================================================







# SKILL GAP ANALYSIS







# ============================================================















@app.post("/api/skill-gap")







async def skill_gap_analysis(







    data: dict







):















    role = data.get(







        "role"







    )























    user_skills = data.get(







        "skills",







        []







    )























    # --------------------------------------------------------







    # Validate role







    # --------------------------------------------------------















    if not role:















        raise HTTPException(







            status_code=400,







            detail="Job role is required."







        )























    # --------------------------------------------------------







    # Validate skills







    # --------------------------------------------------------















    if not isinstance(







        user_skills,







        list







    ):















        raise HTTPException(







            status_code=400,







            detail=(







                "Skills must be provided "







                "as a list."







            )







        )























    # --------------------------------------------------------







    # Find role







    # --------------------------------------------------------















    matched_role = find_matching_role(







        role







    )























    if not matched_role:















        raise HTTPException(







            status_code=404,







            detail=(







                f"Job role not found: {role}"







            )







        )























    # --------------------------------------------------------







    # Required skills







    # --------------------------------------------------------















    required_skills = JOB_ROLES[







        matched_role







    ]["skills"]























    # --------------------------------------------------------







    # Normalize user skills







    # --------------------------------------------------------















    normalized_user_skills = {















        str(skill)







        .strip()







        .lower()















        for skill in user_skills















    }























    # --------------------------------------------------------







    # Match skills







    # --------------------------------------------------------















    matched_skills = []















    missing_skills = []























    for required_skill in required_skills:















        normalized_required = (







            required_skill







            .strip()







            .lower()







        )























        if normalized_required in (







            normalized_user_skills







        ):















            matched_skills.append(







                required_skill







            )















        else:















            missing_skills.append(







                required_skill







            )























    # --------------------------------------------------------







    # Calculate percentage







    # --------------------------------------------------------















    total_required = len(







        required_skills







    )















    matched_count = len(







        matched_skills







    )















    missing_count = len(







        missing_skills







    )























    if total_required > 0:















        match_percentage = round(







            (







                matched_count







                /







                total_required







            )







            * 100







        )















    else:















        match_percentage = 0























    # --------------------------------------------------------







    # Response







    # --------------------------------------------------------















    return {















        "success": True,















        "role": matched_role,















        "user_skills": user_skills,















        "required_skills": required_skills,















        "matched_skills": matched_skills,















        "missing_skills": missing_skills,















        "matched_count": matched_count,















        "missing_count": missing_count,















        "total_required_skills": (







            total_required







        ),















        "match_percentage": (







            match_percentage







        )















    }























# ============================================================







# PERFORMANCE REPORT







# ============================================================















@app.post("/api/performance-report")







async def performance_report(







    data: dict







):















    # --------------------------------------------------------







    # Get input







    # --------------------------------------------------------















    role = data.get(







        "role"







    )















    user_skills = data.get(







        "skills",







        []







    )















    assessments = data.get(







        "assessments",







        []







    )























    # --------------------------------------------------------







    # Validate role







    # --------------------------------------------------------















    if not role:















        raise HTTPException(







            status_code=400,







            detail="Job role is required."







        )























    # --------------------------------------------------------







    # Validate skills







    # --------------------------------------------------------















    if not isinstance(







        user_skills,







        list







    ):















        raise HTTPException(







            status_code=400,







            detail="Skills must be a list."







        )























    # --------------------------------------------------------







    # Validate assessments







    # --------------------------------------------------------















    if not isinstance(







        assessments,







        list







    ):















        raise HTTPException(







            status_code=400,







            detail="Assessments must be a list."







        )























    # --------------------------------------------------------







    # Find role







    # --------------------------------------------------------















    matched_role = find_matching_role(







        role







    )























    if not matched_role:















        raise HTTPException(







            status_code=404,







            detail=(







                f"Job role not found: {role}"







            )







        )























    # --------------------------------------------------------







    # Required skills







    # --------------------------------------------------------















    required_skills = JOB_ROLES[







        matched_role







    ]["skills"]























    # --------------------------------------------------------







    # Normalize user skills







    # --------------------------------------------------------















    normalized_user_skills = {















        str(skill)







        .strip()







        .lower()















        for skill in user_skills















    }























    # --------------------------------------------------------







    # Find matched and missing skills







    # --------------------------------------------------------















    matched_skills = []















    missing_skills = []























    for required_skill in required_skills:















        normalized_required = (







            required_skill







            .strip()







            .lower()







        )























        if normalized_required in (







            normalized_user_skills







        ):















            matched_skills.append(







                required_skill







            )















        else:















            missing_skills.append(







                required_skill







            )























    # --------------------------------------------------------







    # Skill match percentage







    # --------------------------------------------------------















    total_required = len(







        required_skills







    )















    matched_count = len(







        matched_skills







    )























    if total_required > 0:















        skill_match_percentage = round(







            (







                matched_count







                /







                total_required







            )







            * 100







        )















    else:















        skill_match_percentage = 0























    # --------------------------------------------------------







    # Assessment analysis







    # --------------------------------------------------------















    assessment_results = []















    strong_skills = []















    weak_skills = []















    total_score = 0















    assessment_count = 0























    for assessment in assessments:















        if not isinstance(







            assessment,







            dict







        ):















            continue























        skill = assessment.get(







            "skill"







        )















        score = assessment.get(







            "score"







        )























        if not skill or score is None:















            continue























        try:















            score = float(







                score







            )















        except (







            TypeError,







            ValueError







        ):















            continue























        # ----------------------------------------------------







        # Keep score within valid range







        # ----------------------------------------------------















        score = max(







            0,







            min(







                100,







                score







            )







        )























        assessment_count += 1















        total_score += score























        # ----------------------------------------------------







        # Determine proficiency







        # ----------------------------------------------------















        if score < 40:















            proficiency = "Beginner"















            weak_skills.append(







                skill







            )















        elif score < 70:















            proficiency = "Intermediate"















            weak_skills.append(







                skill







            )















        else:















            proficiency = "Advanced"















            strong_skills.append(







                skill







            )























        assessment_results.append({















            "skill": skill,















            "score": round(







                score







            ),















            "proficiency": proficiency















        })























    # --------------------------------------------------------







    # Overall assessment score







    # --------------------------------------------------------















    if assessment_count > 0:















        overall_assessment_score = round(







            total_score







            /







            assessment_count







        )















    else:















        overall_assessment_score = 0























    # --------------------------------------------------------







    # Overall readiness







    # --------------------------------------------------------















    if assessment_count == 0:















        overall_readiness = (







            "Assessment Required"







        )















    elif overall_assessment_score < 40:















        overall_readiness = (







            "Needs Improvement"







        )















    elif overall_assessment_score < 70:















        overall_readiness = (







            "Developing"







        )















    elif overall_assessment_score < 85:















        overall_readiness = (







            "Nearly Ready"







        )















    else:















        overall_readiness = "Ready"























    # --------------------------------------------------------







    # Final performance report







    # --------------------------------------------------------















    return {















        "success": True,















        "report": {















            "job_role": matched_role,















            "user_skills": user_skills,















            "required_skills": required_skills,















            "matched_skills": matched_skills,















            "missing_skills": missing_skills,















            "skill_match_percentage": (







                skill_match_percentage







            ),















            "assessment_results": (







                assessment_results







            ),















            "strong_skills": strong_skills,















            "weak_skills": weak_skills,















            "overall_assessment_score": (







                overall_assessment_score







            ),















            "overall_readiness": (







                overall_readiness







            )















        }















    }



























# ============================================================



# PERSONALIZED LEARNING ROADMAP



# ============================================================







LEARNING_FOCUS = {



    "Python": [



        "Python syntax and control flow",



        "Functions and modules",



        "Object-oriented programming",



        "File handling and error handling",



        "Problem solving with Python"



    ],



    "Java": [



        "Java syntax and control flow",



        "Classes and objects",



        "OOP concepts",



        "Collections and exception handling",



        "Problem solving with Java"



    ],



    "JavaScript": [



        "JavaScript fundamentals",



        "Functions and ES6 concepts",



        "DOM manipulation",



        "Events and asynchronous JavaScript",



        "Modern JavaScript development"



    ],



    "SQL": [



        "SELECT and filtering",



        "JOINs and aggregations",



        "Subqueries",



        "Constraints and normalization",



        "Query optimization basics"



    ],



    "Data Structures": [



        "Arrays and strings",



        "Linked lists, stacks and queues",



        "Trees and heaps",



        "Hashing",



        "Graphs and traversal"



    ],



    "Algorithms": [



        "Asymptotic analysis",



        "Searching and sorting",



        "Greedy algorithms",



        "Divide and conquer",



        "Dynamic programming basics"



    ],



    "OOP": [



        "Classes and objects",



        "Encapsulation",



        "Inheritance",



        "Polymorphism",



        "Abstraction and design principles"



    ],



    "Git": [



        "Repositories and commits",



        "Branches and merging",



        "Remote repositories",



        "Pull requests",



        "Conflict resolution"



    ],



    "HTML": [



        "HTML structure",



        "Semantic elements",



        "Forms and inputs",



        "Tables and media",



        "Accessible HTML"



    ],



    "CSS": [



        "Selectors and box model",



        "Flexbox",



        "Grid",



        "Responsive design",



        "Layouts and reusable styles"



    ],



    "React": [



        "Components and JSX",



        "Props and state",



        "Hooks",



        "Forms and events",



        "API integration"



    ],



    "Node.js": [



        "Node.js fundamentals",



        "Modules and npm",



        "HTTP and server basics",



        "REST API development",



        "Error handling"



    ],



    "REST API": [



        "HTTP methods and status codes",



        "Request and response structure",



        "REST resource design",



        "Authentication basics",



        "API testing"



    ],



    "Machine Learning": [



        "ML fundamentals",



        "Data preprocessing",



        "Supervised learning",



        "Model evaluation",



        "Feature engineering"



    ],



    "Statistics": [



        "Descriptive statistics",



        "Probability basics",



        "Distributions",



        "Hypothesis testing",



        "Correlation and regression basics"



    ],



    "NumPy": [



        "Arrays and indexing",



        "Vectorized operations",



        "Broadcasting",



        "Linear algebra basics",



        "Numerical data processing"



    ],



    "Pandas": [



        "Series and DataFrames",



        "Data selection and filtering",



        "Missing data handling",



        "Grouping and aggregation",



        "Data cleaning"



    ],



    "Scikit-learn": [



        "Dataset preparation",



        "Train/test splitting",



        "Model training",



        "Evaluation metrics",



        "Pipelines and preprocessing"



    ],



    "Deep Learning": [



        "Neural network fundamentals",



        "Activation and loss functions",



        "Backpropagation",



        "CNN/RNN fundamentals",



        "Model training and evaluation"



    ],



    "Data Visualization": [



        "Choosing suitable charts",



        "Matplotlib basics",



        "Interactive visualization concepts",



        "Dashboard design principles",



        "Communicating insights"



    ],



    "Excel": [



        "Formulas and functions",



        "Sorting and filtering",



        "Pivot tables",



        "Charts",



        "Data analysis workflows"



    ],



    "Power BI": [



        "Data import and cleaning",



        "Data modeling",



        "DAX basics",



        "Visualizations",



        "Dashboard creation"



    ]



}











def get_learning_focus(skill: str) -> List[str]:



    """Return learning topics for a skill, with a generic fallback."""



    for known_skill, topics in LEARNING_FOCUS.items():



        if known_skill.lower() == skill.strip().lower():



            return topics







    return [



        f"Understand {skill} fundamentals",



        f"Learn core concepts of {skill}",



        f"Practice {skill} with examples",



        f"Solve practical problems using {skill}",



        f"Build a small project using {skill}"



    ]











@app.post("/api/learning-roadmap")



async def learning_roadmap(data: dict):



    """



    Generate a personalized learning roadmap from a target role,



    missing skills, weak skills, and assessment scores.



    """







    role = data.get("role")



    missing_skills = data.get("missing_skills", [])



    weak_skills = data.get("weak_skills", [])



    assessments = data.get("assessments", [])







    if not role:



        raise HTTPException(



            status_code=400,



            detail="Job role is required."



        )







    if not isinstance(missing_skills, list):



        raise HTTPException(



            status_code=400,



            detail="missing_skills must be provided as a list."



        )







    if not isinstance(weak_skills, list):



        raise HTTPException(



            status_code=400,



            detail="weak_skills must be provided as a list."



        )







    if not isinstance(assessments, list):



        raise HTTPException(



            status_code=400,



            detail="assessments must be provided as a list."



        )







    matched_role = find_matching_role(role)







    if not matched_role:



        raise HTTPException(



            status_code=404,



            detail=f"Job role not found: {role}"



        )







    required_skills = JOB_ROLES[matched_role]["skills"]







    score_map = {}







    for assessment in assessments:



        if not isinstance(assessment, dict):



            continue







        skill = assessment.get("skill")



        score = assessment.get("score")







        if not skill or score is None:



            continue







        try:



            score = float(score)



        except (TypeError, ValueError):



            continue







        score_map[str(skill).strip().lower()] = max(



            0,



            min(100, score)



        )







    normalized_missing = []



    seen_missing = set()







    for skill in missing_skills:



        skill_text = str(skill).strip()







        if not skill_text:



            continue







        key = skill_text.lower()







        if key not in seen_missing:



            seen_missing.add(key)



            normalized_missing.append(skill_text)







    normalized_weak = []



    seen_weak = set()







    for skill in weak_skills:



        skill_text = str(skill).strip()







        if not skill_text:



            continue







        key = skill_text.lower()







        if key not in seen_weak:



            seen_weak.add(key)



            normalized_weak.append(skill_text)







    # Derive weak skills from assessment scores when they are not supplied.



    if not normalized_weak:



        for required_skill in required_skills:



            score = score_map.get(required_skill.lower())







            if score is not None and score < 70:



                normalized_weak.append(required_skill)







    # Derive missing skills when they are not supplied.



    if not normalized_missing:



        user_skills = data.get("skills", [])







        if not isinstance(user_skills, list):



            raise HTTPException(



                status_code=400,



                detail="skills must be provided as a list."



            )







        normalized_user = {



            str(skill).strip().lower()



            for skill in user_skills



            if str(skill).strip()



        }







        for required_skill in required_skills:



            if required_skill.lower() not in normalized_user:



                normalized_missing.append(required_skill)







    # Priority:



    # 1. Very weak assessed skills (<40)



    # 2. Missing skills



    # 3. Other weak assessed skills (40-69)



    roadmap_skills = []



    seen = set()







    very_weak = []







    for skill_name in normalized_weak:



        score = score_map.get(skill_name.lower())







        if score is not None and score < 40:



            very_weak.append(skill_name)







    for skill_name in very_weak + normalized_missing + normalized_weak:



        key = skill_name.lower()







        if key not in seen:



            seen.add(key)



            roadmap_skills.append(skill_name)







    # If there are no gaps, provide a maintenance plan.



    if not roadmap_skills:



        roadmap_skills = [



            "Review and Practice",



            "Projects and Problem Solving",



            "Interview Preparation"



        ]







    roadmap = []







    for index, skill in enumerate(roadmap_skills, start=1):



        score = score_map.get(skill.lower())







        if score is None:



            priority = "High"



            reason = "Skill is missing for the selected role."



        elif score < 40:



            priority = "High"



            reason = "Assessment score indicates a significant skill gap."



        elif score < 70:



            priority = "Medium"



            reason = "Assessment score indicates the skill needs improvement."



        else:



            priority = "Low"



            reason = "Skill is assessed as strong; continue practicing."







        roadmap.append({



            "week": index,



            "skill": skill,



            "priority": priority,



            "reason": reason,



            "current_score": (



                round(score) if score is not None else None



            ),



            "learning_focus": get_learning_focus(skill),



            "recommended_activity": (



                f"Study the core concepts of {skill}, "



                f"practice problems, and complete a small practical task."



            )



        })







    return {



        "success": True,



        "roadmap": {



            "job_role": matched_role,



            "total_weeks": len(roadmap),



            "skills_to_develop": roadmap_skills,



            "plan": roadmap



        }



    }



















# ============================================================







# RESUME UPLOAD







# ============================================================















@app.post("/api/resume/upload")







async def upload_resume(







    file: UploadFile = File(...)







):















    # --------------------------------------------------------







    # Check filename







    # --------------------------------------------------------















    if not file.filename:















        raise HTTPException(







            status_code=400,







            detail="No file selected."







        )























    filename = file.filename.lower()























    # --------------------------------------------------------







    # Check file type







    # --------------------------------------------------------















    if not filename.endswith(







        (







            ".pdf",







            ".docx",







            ".txt"







        )







    ):















        raise HTTPException(







            status_code=400,







            detail=(







                "Only PDF, DOCX, and TXT "







                "files are supported."







            )







        )























    # --------------------------------------------------------







    # Read file







    # --------------------------------------------------------















    file_bytes = await file.read()























    # --------------------------------------------------------







    # Check empty file







    # --------------------------------------------------------















    if not file_bytes:















        raise HTTPException(







            status_code=400,







            detail="The uploaded file is empty."







        )























    try:















        text = ""























        # ====================================================







        # PDF







        # ====================================================















        if filename.endswith(".pdf"):















            reader = PdfReader(







                io.BytesIO(file_bytes)







            )























            for page in reader.pages:















                page_text = page.extract_text()























                if page_text:















                    text += (







                        page_text







                        + "\n"







                    )























        # ====================================================







        # DOCX







        # ====================================================















        elif filename.endswith(".docx"):















            document = Document(







                io.BytesIO(file_bytes)







            )























            text = "\n".join(















                paragraph.text















                for paragraph







                in document.paragraphs















            )























        # ====================================================







        # TXT







        # ====================================================















        elif filename.endswith(".txt"):















            text = file_bytes.decode(







                "utf-8",







                errors="ignore"







            )























        # ====================================================







        # CLEAN TEXT







        # ====================================================















        text = text.strip()























        if not text:















            raise HTTPException(







                status_code=400,







                detail=(







                    "Could not extract text "







                    "from the resume."







                )







            )























        # ====================================================







        # EXTRACT SKILLS







        # ====================================================















        skills = extract_skills(







            text







        )























        # ====================================================







        # RESPONSE







        # ====================================================















        return {















            "success": True,















            "filename": file.filename,















            "text": text,















            "character_count": len(







                text







            ),















            "skills": skills,















            "skill_count": len(







                skills







            )















        }























    # ========================================================







    # KNOWN HTTP ERROR







    # ========================================================















    except HTTPException:















        raise























    # ========================================================







    # UNEXPECTED ERROR







    # ========================================================















    except Exception as e:















        raise HTTPException(















            status_code=500,















            detail=(







                "Resume processing failed: "







                f"{str(e)}"







            )















        )

# ============================================================
# AI MOCK INTERVIEW SERVICE
# ============================================================
# This is a backend interview service that works without an
# external AI API. It provides role-specific questions, keeps
# interview sessions, evaluates answers using simple heuristics,
# and returns structured feedback to the frontend.
# ============================================================

INTERVIEW_SESSIONS = {}
INTERVIEW_QUESTION_COUNT = 6

INTERVIEW_QUESTIONS = {
    "Software Developer": {
        "Problem Solving": [
            {
                "id": "sd_ps_1",
                "question": "How would you find the first non-repeating character in a string? Explain your approach.",
                "expected_topics": ["hash map", "frequency", "dictionary", "count", "traversal"]
            },
            {
                "id": "sd_ps_2",
                "question": "What is the difference between an array and a linked list, and when would you use each?",
                "expected_topics": ["array", "linked list", "memory", "access", "insertion"]
            },
            {
                "id": "sd_ps_3",
                "question": "Explain how you would debug a program that is producing incorrect output.",
                "expected_topics": ["debug", "test", "error", "logs", "reproduce", "breakpoint"]
            }
        ],
        "Behavioral & Leadership": [
            {
                "id": "sd_bl_1",
                "question": "Tell me about a technical problem you solved in a project. What was your approach?",
                "expected_topics": ["problem", "approach", "solution", "result", "project"]
            },
            {
                "id": "sd_bl_2",
                "question": "How do you handle a disagreement with a teammate about a technical decision?",
                "expected_topics": ["discuss", "communication", "evidence", "team", "decision"]
            },
            {
                "id": "sd_bl_3",
                "question": "Describe a time when you had to learn a new technology quickly.",
                "expected_topics": ["learn", "practice", "documentation", "project", "result"]
            }
        ]
    },
    "Data Analyst": {
        "Problem Solving": [
            {
                "id": "da_ps_1",
                "question": "How would you handle missing values in a dataset?",
                "expected_topics": ["missing", "null", "drop", "impute", "mean", "median"]
            },
            {
                "id": "da_ps_2",
                "question": "How would you identify an unusual value or outlier in a dataset?",
                "expected_topics": ["outlier", "iqr", "z-score", "visualization", "boxplot"]
            },
            {
                "id": "da_ps_3",
                "question": "Explain how you would investigate a sudden change in a business metric.",
                "expected_topics": ["data", "trend", "compare", "segment", "cause", "visualize"]
            }
        ],
        "Behavioral & Leadership": [
            {
                "id": "da_bl_1",
                "question": "Tell me about a time you used data to support a decision.",
                "expected_topics": ["data", "analysis", "insight", "decision", "result"]
            },
            {
                "id": "da_bl_2",
                "question": "How would you explain a complex data finding to a non-technical person?",
                "expected_topics": ["simple", "visual", "explain", "audience", "business"]
            },
            {
                "id": "da_bl_3",
                "question": "Describe a situation where your analysis was challenged by someone else.",
                "expected_topics": ["evidence", "communication", "validate", "data", "feedback"]
            }
        ]
    },
    "AI/ML Engineer": {
        "Problem Solving": [
            {
                "id": "ml_ps_1",
                "question": "What steps would you follow when a machine learning model performs poorly on unseen data?",
                "expected_topics": ["overfitting", "underfitting", "validation", "features", "data", "regularization"]
            },
            {
                "id": "ml_ps_2",
                "question": "Explain the difference between classification and regression with an example.",
                "expected_topics": ["classification", "regression", "class", "continuous", "prediction"]
            },
            {
                "id": "ml_ps_3",
                "question": "How would you choose an evaluation metric for a machine learning model?",
                "expected_topics": ["metric", "accuracy", "precision", "recall", "f1", "mae", "rmse"]
            }
        ],
        "Behavioral & Leadership": [
            {
                "id": "ml_bl_1",
                "question": "Describe an AI or machine learning project you worked on and your contribution.",
                "expected_topics": ["project", "model", "data", "contribution", "result"]
            },
            {
                "id": "ml_bl_2",
                "question": "How do you respond when an experiment does not produce the expected result?",
                "expected_topics": ["analyze", "experiment", "data", "debug", "iterate"]
            },
            {
                "id": "ml_bl_3",
                "question": "How would you communicate model limitations to a project team?",
                "expected_topics": ["limitations", "explain", "risk", "evidence", "communication"]
            }
        ]
    },
    "Data Scientist": {
        "Problem Solving": [
            {
                "id": "ds_ps_1",
                "question": "How would you approach a dataset when you do not know which variables are useful for prediction?",
                "expected_topics": ["exploration", "correlation", "features", "importance", "visualization"]
            },
            {
                "id": "ds_ps_2",
                "question": "What is the purpose of splitting data into training and testing sets?",
                "expected_topics": ["training", "testing", "generalization", "unseen", "evaluation"]
            },
            {
                "id": "ds_ps_3",
                "question": "How would you detect overfitting in a machine learning model?",
                "expected_topics": ["training", "validation", "test", "overfitting", "generalization"]
            }
        ],
        "Behavioral & Leadership": [
            {
                "id": "ds_bl_1",
                "question": "Tell me about a data project where you had to make an important analytical decision.",
                "expected_topics": ["data", "analysis", "decision", "reason", "result"]
            },
            {
                "id": "ds_bl_2",
                "question": "How do you handle feedback on an analysis you have completed?",
                "expected_topics": ["feedback", "review", "improve", "validate", "communication"]
            },
            {
                "id": "ds_bl_3",
                "question": "Describe how you would work with a team when requirements are unclear.",
                "expected_topics": ["clarify", "questions", "communication", "requirements", "team"]
            }
        ]
    },
    "Full Stack Developer": {
        "Problem Solving": [
            {
                "id": "fs_ps_1",
                "question": "How would you debug a web application where the frontend is not receiving data from the backend?",
                "expected_topics": ["network", "api", "request", "response", "console", "status"]
            },
            {
                "id": "fs_ps_2",
                "question": "Explain how a REST API request flows from a frontend application to a backend service.",
                "expected_topics": ["http", "request", "endpoint", "backend", "response", "json"]
            },
            {
                "id": "fs_ps_3",
                "question": "How would you improve the performance of a slow web page?",
                "expected_topics": ["performance", "network", "images", "cache", "bundle", "database"]
            }
        ],
        "Behavioral & Leadership": [
            {
                "id": "fs_bl_1",
                "question": "Tell me about a full-stack project and the part you personally implemented.",
                "expected_topics": ["project", "frontend", "backend", "database", "implementation"]
            },
            {
                "id": "fs_bl_2",
                "question": "How do you coordinate frontend and backend work with another developer?",
                "expected_topics": ["api", "contract", "communication", "team", "testing"]
            },
            {
                "id": "fs_bl_3",
                "question": "Describe a bug that took time to solve and how you finally fixed it.",
                "expected_topics": ["bug", "debug", "test", "cause", "fix", "result"]
            }
        ]
    }
}


def find_interview_role(role: str) -> str:
    """Return the configured interview role using case-insensitive matching."""
    if not role:
        return "Software Developer"
    for available_role in INTERVIEW_QUESTIONS:
        if available_role.lower() == str(role).strip().lower():
            return available_role
    # Also accept roles already present in JOB_ROLES but without a custom bank.
    matched = find_matching_role(str(role))
    return matched or "Software Developer"


def get_interview_question(role: str, category: str, index: int):
    role_questions = INTERVIEW_QUESTIONS.get(role, INTERVIEW_QUESTIONS["Software Developer"])
    category_questions = role_questions.get(category) or role_questions["Problem Solving"]
    return category_questions[index % len(category_questions)]


def evaluate_interview_answer(answer: Any, expected_topics: List[str]) -> Dict[str, Any]:
    """Provide lightweight deterministic interview feedback without an external AI key."""
    answer_text = str(answer or "").strip()
    if not answer_text:
        return {
            "score": 0,
            "level": "No Answer",
            "feedback": "No answer was provided. Explain your approach and include a concrete example where possible.",
            "strengths": [],
            "improvements": ["Provide a complete answer", "Explain your reasoning", "Give an example or result"],
            "matched_topics": []
        }

    normalized = answer_text.lower()
    matched_topics = [topic for topic in expected_topics if topic.lower() in normalized]
    length_score = min(35, max(5, len(answer_text.split()) // 2))
    topic_score = min(50, len(matched_topics) * 10)
    structure_bonus = 15 if any(word in normalized for word in ["because", "therefore", "first", "then", "finally", "result", "example"]) else 0
    score = min(100, length_score + topic_score + structure_bonus)

    if score >= 75:
        level = "Strong"
        feedback = "Good response. It addresses the topic with useful technical or practical details."
    elif score >= 50:
        level = "Developing"
        feedback = "Reasonable response, but add more specific reasoning, examples, and measurable results."
    else:
        level = "Needs Improvement"
        feedback = "The answer needs more detail. Explain your approach step by step and support it with an example."

    strengths = []
    if matched_topics:
        strengths.append("Covered: " + ", ".join(matched_topics[:4]))
    if len(answer_text.split()) >= 30:
        strengths.append("Provided a reasonably detailed response")

    improvements = []
    if len(answer_text.split()) < 30:
        improvements.append("Add more detail and context")
    if len(matched_topics) < 2:
        improvements.append("Mention relevant technical concepts or concrete actions")
    if not any(word in normalized for word in ["example", "result", "project"]):
        improvements.append("Include a practical example or result")
    if not improvements:
        improvements.append("Keep the answer structured and concise")

    return {
        "score": score,
        "level": level,
        "feedback": feedback,
        "strengths": strengths,
        "improvements": improvements,
        "matched_topics": matched_topics
    }


@app.get("/api/interview/health")
@app.get("/api/ai-interview/health")
def interview_health():
    """Health/status endpoint used by the AI Interview frontend."""
    return {
        "success": True,
        "status": "available",
        "service": "AI Interview Service",
        "message": "AI interview service is available",
        "question_banks": len(INTERVIEW_QUESTIONS)
    }


@app.post("/api/interview/start")
@app.post("/api/ai-interview/start")
async def start_interview(data: dict):
    """Start a role-specific mock interview session."""
    role_value = data.get("role") or data.get("role_id") or data.get("roleId") or "Software Developer"
    role = find_interview_role(str(role_value))

    category = str(
        data.get("category")
        or data.get("interviewType")
        or data.get("interview_type")
        or "Problem Solving"
    ).strip()

    if category.lower() in {"behavioral", "behavioral and leadership", "behavioral & leadership", "leadership"}:
        category = "Behavioral & Leadership"
    else:
        category = "Problem Solving"

    question_count = data.get("questionCount") or data.get("question_count") or INTERVIEW_QUESTION_COUNT
    try:
        question_count = max(1, min(10, int(question_count)))
    except (TypeError, ValueError):
        question_count = INTERVIEW_QUESTION_COUNT

    session_id = f"interview_{uuid.uuid4().hex}"
    question_bank = INTERVIEW_QUESTIONS.get(role, INTERVIEW_QUESTIONS["Software Developer"])[category]
    selected_questions = random.sample(question_bank, min(question_count, len(question_bank)))

    INTERVIEW_SESSIONS[session_id] = {
        "role": role,
        "category": category,
        "questions": selected_questions,
        "current_index": 0,
        "answers": [],
        "started": True
    }

    first_question = selected_questions[0]
    return {
        "success": True,
        "sessionId": session_id,
        "session_id": session_id,
        "role": role,
        "category": category,
        "totalQuestions": len(selected_questions),
        "total_questions": len(selected_questions),
        "questionIndex": 0,
        "question_index": 0,
        "questionId": first_question["id"],
        "question_id": first_question["id"],
        "question": first_question["question"],
        "questionText": first_question["question"],
        "status": "in_progress"
    }


@app.post("/api/interview/answer")
@app.post("/api/ai-interview/answer")
async def answer_interview(data: dict):
    """Evaluate the current answer and return the next interview question."""
    session_id = data.get("sessionId") or data.get("session_id") or data.get("interviewId")
    answer = data.get("answer")
    if answer is None:
        answer = data.get("response") or data.get("text") or ""

    if not session_id or session_id not in INTERVIEW_SESSIONS:
        raise HTTPException(status_code=404, detail="Interview session not found or expired.")

    session = INTERVIEW_SESSIONS[session_id]
    questions = session["questions"]
    current_index = session["current_index"]

    if current_index >= len(questions):
        raise HTTPException(status_code=400, detail="Interview has already been completed.")

    current_question = questions[current_index]
    evaluation = evaluate_interview_answer(answer, current_question.get("expected_topics", []))
    session["answers"].append({
        "question_id": current_question["id"],
        "question": current_question["question"],
        "answer": str(answer or ""),
        "evaluation": evaluation
    })

    session["current_index"] += 1
    next_index = session["current_index"]
    completed = next_index >= len(questions)

    response = {
        "success": True,
        "sessionId": session_id,
        "session_id": session_id,
        "evaluation": evaluation,
        "feedback": evaluation["feedback"],
        "score": evaluation["score"],
        "completed": completed,
        "questionIndex": next_index,
        "question_index": next_index,
        "totalQuestions": len(questions),
        "total_questions": len(questions)
    }

    if not completed:
        next_question = questions[next_index]
        response.update({
            "questionId": next_question["id"],
            "question_id": next_question["id"],
            "question": next_question["question"],
            "questionText": next_question["question"],
            "status": "in_progress"
        })
    else:
        response["status"] = "completed"

    return response


@app.post("/api/interview/submit")
@app.post("/api/ai-interview/submit")
async def submit_interview(data: dict):
    """Finish an interview and return a structured performance report."""
    session_id = data.get("sessionId") or data.get("session_id") or data.get("interviewId")
    if not session_id or session_id not in INTERVIEW_SESSIONS:
        raise HTTPException(status_code=404, detail="Interview session not found or expired.")

    session = INTERVIEW_SESSIONS[session_id]
    answers = session.get("answers", [])
    scores = [item["evaluation"]["score"] for item in answers]
    average_score = round(sum(scores) / len(scores)) if scores else 0

    if average_score >= 75:
        readiness = "Strong Interview Readiness"
    elif average_score >= 50:
        readiness = "Developing Interview Readiness"
    else:
        readiness = "Needs Interview Practice"

    strengths = []
    improvements = []
    for item in answers:
        strengths.extend(item["evaluation"].get("strengths", []))
        improvements.extend(item["evaluation"].get("improvements", []))

    # Preserve order while removing duplicates.
    strengths = list(dict.fromkeys(strengths))[:6]
    improvements = list(dict.fromkeys(improvements))[:6]

    report = {
        "session_id": session_id,
        "role": session["role"],
        "category": session["category"],
        "questions_answered": len(answers),
        "total_questions": len(session["questions"]),
        "average_score": average_score,
        "readiness": readiness,
        "strengths": strengths,
        "improvements": improvements,
        "answers": answers
    }

    session["report"] = report
    session["completed"] = True

    return {
        "success": True,
        "status": "completed",
        "report": report,
        "sessionId": session_id,
        "session_id": session_id
    }


@app.get("/api/interview/session/{session_id}")
@app.get("/api/ai-interview/session/{session_id}")
def get_interview_session(session_id: str):
    """Return the current interview session state for the frontend."""
    if session_id not in INTERVIEW_SESSIONS:
        raise HTTPException(status_code=404, detail="Interview session not found or expired.")

    session = INTERVIEW_SESSIONS[session_id]
    current_index = session.get("current_index", 0)
    questions = session.get("questions", [])
    current_question = questions[current_index] if current_index < len(questions) else None

    return {
        "success": True,
        "sessionId": session_id,
        "session_id": session_id,
        "role": session.get("role"),
        "category": session.get("category"),
        "status": "completed" if session.get("completed") else "in_progress",
        "questionIndex": current_index,
        "question_index": current_index,
        "totalQuestions": len(questions),
        "total_questions": len(questions),
        "question": current_question["question"] if current_question else None,
        "questionText": current_question["question"] if current_question else None,
        "questionId": current_question["id"] if current_question else None,
        "question_id": current_question["id"] if current_question else None,
        "report": session.get("report")
    }

