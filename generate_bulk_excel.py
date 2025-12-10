import pandas as pd
import random

# Configuration
NUM_COURSES = 7
FILENAME = "lista_cursos_masiva.xlsx"

# Data Lists
FACULTIES = ["INGENIERÍA", "CIENCIAS EMPRESARIALES", "HUMANIDADES"]
CAREERS = ["INGENIERÍA DE SOFTWARE", "INGENIERÍA DE SISTEMAS", "ADMINISTRACIÓN", "DERECHO"]
SEMESTERS = ["2025-I", "2025-II"]
TRAINING_AREAS = ["ESPECIALIDAD", "GENERAL", "INVESTIGACIÓN"]
COURSE_TYPES = ["OBLIGATORIO", "ELECTIVO"]

# Professors (Must match existing users in DB for import to work)
PROFESSORS = ["jcrdev", "profesor1", "profesor2"] 

def generate_course_code(i):
    return f"ISO{100+i}"

def generate_course_name(i):
    names = ["Algoritmos Avanzados", "Bases de Datos II", "Arquitectura de Software", 
             "Inteligencia Artificial", "Desarrollo Web", "Gestión de Proyectos", "Ética Profesional"]
    return names[i % len(names)] + f" {i+1}"

# Generate Data
data = []
for i in range(NUM_COURSES):
    row = {
        "FACULTAD": random.choice(FACULTIES),                 # 0
        "CARRERA PROFESIONAL": random.choice(CAREERS),        # 1
        "PERIODO ACADÉMICO": "2025-I",                        # 2 (Ignored by parser usually, but good to have)
        "SEMESTRE": f"{random.randint(1,10)}",                # 3
        "CRÉDITOS": random.randint(3, 5),                     # 4
        "HORAS TOTALES": random.randint(48, 80),              # 5
        "HORAS TEORÍA": random.randint(2, 4),                 # 6
        "HORAS PRÁCTICA": random.randint(2, 4),               # 7
        "ÁREA DE FORMACIÓN": random.choice(TRAINING_AREAS),   # 8
        "CÓDIGO": generate_course_code(i),                    # 9
        "ASIGNATURA": generate_course_name(i),                # 10
        "TIPO DE CURSO": random.choice(COURSE_TYPES),         # 11
        "PRE-REQUISITOS": "Ninguno",                          # 12
        "EMAIL DOCENTE": "jcrdev@ulasalle.edu.pe" # Hardcoded for testing to ensure it matches 'jcrdev' user
    }
    data.append(row)

# Create DataFrame
df = pd.DataFrame(data)

# Create Excel
# Need to ensure header row is 0 and data starts at 1
df.to_excel(FILENAME, index=False)

print(f"✅ Generated {FILENAME} with {NUM_COURSES} courses.")
print(f"ℹ️  'EMAIL DOCENTE' set to 'jcrdev@ulasalle.edu.pe' for all rows to ensure successful testing.")
