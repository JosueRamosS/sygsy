import pandas as pd
import random

# Configuration
NUM_COURSES = 5
CAREERS_CONFIG = [
    {"filename": "syllabus_derecho.xlsx", "career": "Derecho", "faculty": "DERECHO"},
    {"filename": "syllabus_arquitectura.xlsx", "career": "Arquitectura y Urbanismo", "faculty": "INGENIERÍA"},
    {"filename": "syllabus_industrial.xlsx", "career": "Ingeniería Industrial", "faculty": "INGENIERÍA"}
]

# Professor to assign (MUST EXIST IN DB AS PROFESSOR ROLE)
PROFESSOR_EMAIL = "profesor@ulasalle.edu.pe"

# Data Lists
TRAINING_AREAS = ["ESPECIALIDAD", "GENERAL", "INVESTIGACIÓN"]
COURSE_TYPES = ["OBLIGATORIO", "ELECTIVO"]

def generate_course_code(prefix, i):
    return f"{prefix}{100+i}"

def generate_course_name(career, i):
    return f"Curso {career} {i+1}"

for config in CAREERS_CONFIG:
    data = []
    career_name = config["career"]
    filename = config["filename"]
    faculty = config["faculty"]
    prefix = career_name[:3].upper()

    print(f"Generating {filename} for {career_name}...")

    for i in range(NUM_COURSES):
        row = {
            "FACULTAD": faculty,
            "CARRERA PROFESIONAL": career_name,
            "PERIODO ACADÉMICO": "2025-I",
            "SEMESTRE": f"{random.randint(1,10)}",
            "CRÉDITOS": random.randint(3, 5),
            "HORAS TOTALES": random.randint(48, 80),
            "HORAS TEORÍA": random.randint(2, 4),
            "HORAS PRÁCTICA": random.randint(2, 4),
            "ÁREA DE FORMACIÓN": random.choice(TRAINING_AREAS),
            "CÓDIGO": generate_course_code(prefix, i),
            "ASIGNATURA": generate_course_name(career_name, i),
            "TIPO DE CURSO": random.choice(COURSE_TYPES),
            "PRE-REQUISITOS": "Ninguno",
            "EMAIL DOCENTE": PROFESSOR_EMAIL
        }
        data.append(row)

    df = pd.DataFrame(data)
    df.to_excel(filename, index=False)
    print(f"✅ Saved {filename}")

print("\n⚠️ IMPORTANT: Ensure user 'profesor@ulasalle.edu.pe' exists with role PROFESSOR.")
