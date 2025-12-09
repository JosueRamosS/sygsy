package com.sygsy.backend.service;

import com.sygsy.backend.domain.Syllabus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class ExcelService {

    private static final Logger log = LoggerFactory.getLogger(ExcelService.class);

    public List<Syllabus> parseAllSyllabi(MultipartFile file) {
        List<Syllabus> syllabi = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            int rowNumber = 0;
            while (rows.hasNext()) {
                Row currentRow = rows.next();

                // Skip header
                if (rowNumber == 0) {
                    rowNumber++;
                    continue;
                }

                try {
                    // Check if row is empty (first cell is empty)
                    if (currentRow.getCell(0) == null || getStringValue(currentRow, 0).trim().isEmpty()) {
                        continue;
                    }

                    Syllabus syllabus = new Syllabus();
                    // Assuming specific column order based on "I. DATOS GENERALES"
                    // 0: Faculty, 1: Career, 2: Period (ignored here), 3: Semester, 4: Credits, ...
                    
                    syllabus.setFaculty(getStringValue(currentRow, 0));
                    syllabus.setCareer(getStringValue(currentRow, 1));
                    // Skip column 2 (Period)
                    syllabus.setSemester(getStringValue(currentRow, 3));
                    syllabus.setCredits(getNumericValue(currentRow, 4).intValue());
                    syllabus.setTotalHours(getNumericValue(currentRow, 5).intValue());
                    syllabus.setTheoryHours(getNumericValue(currentRow, 6).intValue());
                    syllabus.setPracticeHours(getNumericValue(currentRow, 7).intValue());
                    syllabus.setTrainingArea(getStringValue(currentRow, 8));
                    syllabus.setCourseCode(getStringValue(currentRow, 9));
                    syllabus.setCourseName(getStringValue(currentRow, 10));
                    syllabus.setCourseType(getStringValue(currentRow, 11));
                    syllabus.setPrerequisites(getStringValue(currentRow, 12));
                    syllabus.setProfessorEmail(getStringValue(currentRow, 13));

                    // Default workflow status
                    syllabus.setWorkflowStatus(Syllabus.SyllabusStatus.CREATED);

                    syllabi.add(syllabus);
                    rowNumber++;
                } catch (Exception e) {
                    log.error("Error parsing row " + rowNumber, e);
                    // Continue to next row or throw? For bulk, maybe log and continue is better, 
                    // but for strictness let's catch and log, maybe tracking errors.
                }
            }
            
            if (syllabi.isEmpty()) {
                throw new RuntimeException("The Excel file contains no valid data rows.");
            }
            
            return syllabi;
        } catch (IOException e) {
            throw new RuntimeException("Fail to parse Excel file: " + e.getMessage());
        }
    }

    private final DataFormatter dataFormatter = new DataFormatter();

    private String getStringValue(Row row, int index) {
        Cell cell = row.getCell(index);
        return dataFormatter.formatCellValue(cell);
    }

    private Double getNumericValue(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) return 0.0;
        
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return cell.getNumericCellValue();
            } else {
                String val = dataFormatter.formatCellValue(cell);
                return val.isEmpty() ? 0.0 : Double.parseDouble(val);
            }
        } catch (Exception e) {
            return 0.0;
        }
    }
}
