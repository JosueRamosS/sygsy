package com.sygsy.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.sygsy.backend.domain.Evaluation;
import com.sygsy.backend.domain.Syllabus;
import com.sygsy.backend.domain.SyllabusUnit;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Service
public class PdfService {

    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
    private static final Font HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
    private static final Font BODY_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10);
    private static final Font BOLD_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
    private static final Font TABLE_FONT = FontFactory.getFont(FontFactory.HELVETICA, 8); // Smaller font for tables

    public byte[] generateSyllabusPdf(Syllabus syllabus) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);

            document.open();

            // Header
            addHeader(document, syllabus);

            // I. Datos Generales
            addGeneralData(document, syllabus);

            // II-V. Competences & Sumilla (Use standard body font)
            addTextSection(document, "II. COMPETENCIA DEL CURSO", syllabus.getCourseCompetence());
            addTextSection(document, "III. COMPETENCIA DEL PERFIL DE EGRESO", syllabus.getProfileCompetence());
            addTextSection(document, "IV. COMPETENCIAS PREVIAS", syllabus.getPreviousCompetence());
            addTextSection(document, "V. SUMILLA", syllabus.getSumilla());

            // VI. Unidades de Aprendizaje
            addUnitsSection(document, syllabus.getUnits());

            // VII. Bibliografía
            addTextSection(document, "VII. BIBLIOGRAFÍA", syllabus.getBibliography());

            // VIII. Actividades
            addTextSection(document, "VIII. ACTIVIDADES", syllabus.getActivities());

            // IX. Evaluación
            addEvaluationSection(document, syllabus.getEvaluations());

            document.close();
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private void addHeader(Document document, Syllabus syllabus) throws DocumentException {
        Paragraph university = new Paragraph("UNIVERSIDAD LA SALLE", TITLE_FONT);
        university.setAlignment(Element.ALIGN_CENTER);
        document.add(university);
        
        String facultyName = syllabus.getFaculty() != null ? syllabus.getFaculty().toUpperCase() : "FACULTAD NO REGISTRADA";
        Paragraph faculty = new Paragraph(facultyName, BOLD_FONT);
        faculty.setAlignment(Element.ALIGN_CENTER);
        document.add(faculty);

        String careerName = syllabus.getCareer() != null ? syllabus.getCareer().toUpperCase() : "CARRERA NO REGISTRADA";
        Paragraph program = new Paragraph("PROGRAMA PROFESIONAL DE " + careerName, BOLD_FONT);
        program.setAlignment(Element.ALIGN_CENTER);
        document.add(program);

        String periodName = syllabus.getAcademicPeriod() != null ? syllabus.getAcademicPeriod().getName() : "PERIODO DESCONOCIDO";
        Paragraph title = new Paragraph("\nSÍLABO " + periodName, HEADER_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        
        document.add(new Paragraph("\n"));
    }

    private void addGeneralData(Document document, Syllabus syllabus) throws DocumentException {
        document.add(new Paragraph("I. DATOS GENERALES", HEADER_FONT));
        document.add(new Paragraph("\n"));

        // 9 Columns to handle the complex layout with "Teoría/Práctica" split and "Docente" span
        // Final optimization for text wrapping:
        // 1: Fac L (13%) - Increased for "CARRERA PROFESIONAL"
        // 2: Fac V (12%) - Reduced slightly
        // 3: Sem L (10.5%) - Increased for "SEMESTRE"
        // 4: Horas L (7%)
        // 5: Horas V (4.5%) - Increased for "32"
        // 6: Area L (11%) - Increased for "ÁREA DE FORMACIÓN"
        // 7: Area V (11%) - Reduced (had extra space)
        // 8: Tipo L / Pre (11%) 
        // 9: Tipo V / Doc (20%) - Kept for "Ingeniería de Software I"
        float[] widths = {13f, 12f, 10.5f, 7f, 4.5f, 11f, 11f, 11f, 20f};
        PdfPTable table = new PdfPTable(9);
        table.setWidthPercentage(100);
        table.setWidths(widths);

        // --- ROW 1 ---
        // 1. Fac L
        addHeaderCell(table, "FACULTAD");
        // 2. Fac V
        addCell(table, syllabus.getFaculty(), 1, 1);
        
        // 3. Sem L
        addHeaderCell(table, "SEMESTRE");
        // 4+5. Sem V (Span 2 to cover Teo/Val cols below)
        addCell(table, syllabus.getSemester(), 2, 1);
        
        // 6. Area L (Span 1, 2 rows)
        addHeaderCell(table, "ÁREA DE FORMACIÓN", 1, 2);
        // 7. Area V (Span 1, 2 rows)
        addCell(table, syllabus.getTrainingArea(), 1, 2);
        
        // 8. Tipo L
        addHeaderCell(table, "TIPO DE CURSO");
        // 9. Tipo V
        addCell(table, syllabus.getCourseType(), 1, 1);

        // --- ROW 2 ---
        // 1. Car L
        addHeaderCell(table, "CARRERA PROFESIONAL");
        // 2. Car V
        addCell(table, syllabus.getCareer(), 1, 1);
        
        // 3. Cred L
        addHeaderCell(table, "NRO. DE CRÉDITOS");
        // 4+5. Cred V (Span 2)
        addCell(table, String.valueOf(syllabus.getCredits()), 2, 1);
        
        // (6, 7 Covered by Area)
        
        // 8. Pre L
        addHeaderCell(table, "PRE REQUISITO (s)");
        // 9. Pre V
        addCell(table, syllabus.getPrerequisites(), 1, 1);

        // --- ROW 3 ---
        // 1. Per L (Span 1, 2 rows)
        addHeaderCell(table, "PERIODO LECTIVO", 1, 2);
        // 2. Per V (Span 1, 2 rows)
        String period = syllabus.getAcademicPeriod() != null ? syllabus.getAcademicPeriod().getName() : "";
        addCell(table, period, 1, 2);
        
        // 3. Horas L (Span 1, 2 rows)
        addHeaderCell(table, "NRO. DE HORAS", 1, 2);
        
        // 4. Teoria L
        addCell(table, "Teoría", 1, 1);
        // 5. Teoria V
        addCell(table, String.valueOf(syllabus.getTheoryHours()), 1, 1);
        
        // 6. Codigo L (Span 1, 2 rows)
        addHeaderCell(table, "CÓDIGO DEL CURSO", 1, 2);
        // 7. Codigo V (Span 1, 2 rows)
        addCell(table, syllabus.getCourseCode(), 1, 2);
        
        // 8+9. Docente (Span 2 cols, 2 rows)
        String professorName = syllabus.getProfessor() != null ? syllabus.getProfessor().getFullName() : "No asignado";
        String professorEmail = syllabus.getProfessorEmail() != null ? syllabus.getProfessorEmail() : (syllabus.getProfessor() != null ? syllabus.getProfessor().getEmail() : "");
        
        Phrase docentePhrase = new Phrase();
        docentePhrase.add(new Chunk("DOCENTE: ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8)));
        docentePhrase.add(new Chunk(professorName + "\n\n", TABLE_FONT));
        docentePhrase.add(new Chunk("CORREO:\n", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8)));
        docentePhrase.add(new Chunk(professorEmail, TABLE_FONT));

        PdfPCell docenteCell = new PdfPCell(docentePhrase);
        docenteCell.setColspan(2);
        docenteCell.setRowspan(2);
        docenteCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        // Make sure background matches the "Value" cells (usually white? or Light Gray as per user image? 
        // User image shows Docente block is Light Gray like headers? "DOCENTE: Victor..." background seems gray in first image?)
        // Let's look at uploaded_image_0.png again. The "Periodo Lectivo" (Label) is Gray. "2025-I" (Val) is White.
        // "Docente:..." is Gray background.
        docenteCell.setBackgroundColor(new java.awt.Color(220, 220, 220)); 
        table.addCell(docenteCell);

        // --- ROW 4 ---
        // (1, 2 Covered Per)
        // (3 Covered Horas)
        
        // 4. Practica L
        addCell(table, "Práctica", 1, 1);
        // 5. Practica V
        addCell(table, String.valueOf(syllabus.getPracticeHours()), 1, 1);

        // (6, 7 Covered Codigo)
        // (8, 9 Covered Docente)

        document.add(table);
        document.add(new Paragraph("\n"));
    }

    private void addHeaderCell(PdfPTable table, String text) {
        addHeaderCell(table, text, 1, 1);
    }

    private void addHeaderCell(PdfPTable table, String text, int colspan, int rowspan) {
        // Use FontFactory.HELVETICA_BOLD with size 8 for Headers to save space
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8)));
        cell.setBackgroundColor(new java.awt.Color(220, 220, 220)); 
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setColspan(colspan);
        cell.setRowspan(rowspan);
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text, int colspan, int rowspan) {
        // Use TABLE_FONT (Size 8) for content
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", TABLE_FONT));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setColspan(colspan);
        cell.setRowspan(rowspan);
        table.addCell(cell);
    }

    private void addTextSection(Document document, String title, String content) throws DocumentException {
        document.add(new Paragraph(title, HEADER_FONT));
        document.add(new Paragraph(" ")); // Spacer

        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        
        PdfPCell cell = new PdfPCell(new Phrase(content != null ? content : "No registrado", BODY_FONT));
        cell.setPadding(10f);
        cell.setBorder(Rectangle.BOX);
        table.addCell(cell);

        document.add(table);
        document.add(new Paragraph("\n"));
    }

    private void addUnitsSection(Document document, List<SyllabusUnit> units) throws DocumentException {
        document.add(new Paragraph("VI. UNIDADES DE APRENDIZAJE", HEADER_FONT));
        document.add(new Paragraph("\n"));

        if (units == null || units.isEmpty()) {
            document.add(new Paragraph("No hay unidades registradas.", BODY_FONT));
            document.add(new Paragraph("\n"));
            return;
        }
        
        units.sort(Comparator.comparingInt(s -> s.getUnitNumber() != null ? s.getUnitNumber() : 0));

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("d/M/yyyy");

        for (SyllabusUnit unit : units) {
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            // Cols: Unit/Date (15%), Content(25%), Week(10%), Specific Content(50%)
            // "SEMANA" needs more space
            table.setWidths(new float[]{1.5f, 2.5f, 1.0f, 5.0f});
            table.setSpacingBefore(5f);
            table.setSpacingAfter(10f);

            // Headers
            addHeaderCell(table, "UNIDAD " + toRoman(unit.getUnitNumber() != null ? unit.getUnitNumber() : 0));
            addHeaderCell(table, "CONTENIDO");
            addHeaderCell(table, "SEMANA");
            addHeaderCell(table, "CONTENIDOS ESPECÍFICOS");

            int rowspan = 4;
            
            // Unit Info
            String dateRange = "Del\n" + 
                               (unit.getStartDate() != null ? unit.getStartDate().format(dateFormatter) : "TBD") + 
                               "\nal\n" + 
                               (unit.getEndDate() != null ? unit.getEndDate().format(dateFormatter) : "TBD");
            PdfPCell unitCell = new PdfPCell(new Phrase(dateRange, TABLE_FONT));
            unitCell.setRowspan(rowspan);
            unitCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            unitCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(unitCell);

            // Content
            PdfPCell contentCell = new PdfPCell(new Phrase(unit.getContent() != null ? unit.getContent() : "", TABLE_FONT));
            contentCell.setRowspan(rowspan);
            contentCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            table.addCell(contentCell);

            // Weeks
            addCenteredCell(table, "1");
            table.addCell(new Phrase(unit.getWeek1Content(), TABLE_FONT));

            addCenteredCell(table, "2");
            table.addCell(new Phrase(unit.getWeek2Content(), TABLE_FONT));

            addCenteredCell(table, "3");
            table.addCell(new Phrase(unit.getWeek3Content(), TABLE_FONT));

            addCenteredCell(table, "4");
            table.addCell(new Phrase(unit.getWeek4Content(), TABLE_FONT));

            // Methodology
            addHeaderCell(table, "ESTRATEGIAS METODOLÓGICAS", 4, 1);
            
            String methodologyText = (unit.getMethodology() != null && !unit.getMethodology().isEmpty()) 
                                    ? unit.getMethodology() 
                                    : "No se han registrado estrategias metodológicas.";
            
            PdfPCell methodologyCell = new PdfPCell(new Phrase(methodologyText, TABLE_FONT));
            methodologyCell.setColspan(4);
            methodologyCell.setPadding(5f);
            table.addCell(methodologyCell);

            document.add(table);
        }
    }
    
    private void addEvaluationSection(Document document, List<Evaluation> evaluations) throws DocumentException {
        document.add(new Paragraph("IX. CRITERIOS DE EVALUACIÓN", HEADER_FONT));
        document.add(new Paragraph("\n"));
        
        if (evaluations == null || evaluations.isEmpty()) {
            document.add(new Paragraph("No hay evaluaciones registradas.", BODY_FONT));
            return;
        }

        PdfPTable table = new PdfPTable(4); // 4 Columns
        table.setWidthPercentage(100);
        // EVALUACIÓN (20%), PESO (10%), FECHA (20%), DESCRIPCIÓN (50%)
        table.setWidths(new float[]{2f, 1f, 2f, 5f});
        
        addHeaderCell(table, "EVALUACIÓN");
        addHeaderCell(table, "PESO");
        addHeaderCell(table, "FECHA DE CONSOLIDACIÓN");
        addHeaderCell(table, "DESCRIPCIÓN DE LA EVALUACIÓN");

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("d/M/yyyy");

        for (Evaluation eval : evaluations) {
            // Name
            PdfPCell nameCell = new PdfPCell(new Phrase(eval.getName(), BODY_FONT));
            nameCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            nameCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(nameCell);

            // Weight
            String weightStr = eval.getWeight() != null ? String.format("%.0f%%", eval.getWeight() * 100) : "0%";
            PdfPCell weightCell = new PdfPCell(new Phrase(weightStr, BOLD_FONT));
            weightCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            weightCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(weightCell);

            // Date
            String dateStr = "";
            if (eval.getConsolidationDate() != null) {
                dateStr = "Ingreso de notas hasta las 9h00\ndel " + eval.getConsolidationDate().format(dateFormatter);
            }
            PdfPCell dateCell = new PdfPCell(new Phrase(dateStr, BODY_FONT));
            dateCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            dateCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(dateCell);

            // Description
            PdfPCell descCell = new PdfPCell(new Phrase(eval.getDescription(), BODY_FONT));
            descCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            table.addCell(descCell);
        }
        document.add(table);
    }

    private void addCenteredCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, BODY_FONT));
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private String toRoman(int number) {
        switch (number) {
            case 1: return "I";
            case 2: return "II";
            case 3: return "III";
            case 4: return "IV";
            default: return String.valueOf(number);
        }
    }
    

    
    private void addRow(PdfPTable table, String col1, String col2) {
        table.addCell(new Phrase(col1, BODY_FONT));
        table.addCell(new Phrase(col2 != null ? col2 : "", BODY_FONT));
    }
}
