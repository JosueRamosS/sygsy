import openpyxl
from openpyxl import Workbook

wb = Workbook()
ws = wb.active
ws.title = "Syllabus Data"

# Headers
headers = [
    "Facultad", "Carrera", "Periodo", "Semestre", "Créditos", "Horas Totales", 
    "Horas Teoría", "Horas Práctica", "Área", "Código", "Nombre Curso", 
    "Tipo", "Prerrequisitos", "Email Profesor"
]
ws.append(headers)

# Complete Data Row with realistic values
data = [
    "Facultad de Ingeniería",                    # 0: Faculty
    "Ingeniería de Sistemas",                    # 1: Career
    "2025-I",                                    # 2: Period
    "V",                                         # 3: Semester
    4,                                           # 4: Credits
    64,                                          # 5: TotalHours
    32,                                          # 6: TheoryHours
    32,                                          # 7: PracticeHours
    "Formación Especializada",                   # 8: Area
    "SIS501",                                    # 9: Code
    "Arquitectura de Software",                  # 10: Name
    "Obligatorio",                               # 11: Type
    "Ingeniería de Software I",                  # 12: Prerequisites
    "profesor@sygsy.com"                         # 13: ProfessorEmail
]
ws.append(data)

# Save
wb.save("test_silabo.xlsx")
print("test_silabo.xlsx created successfully with complete data.")
