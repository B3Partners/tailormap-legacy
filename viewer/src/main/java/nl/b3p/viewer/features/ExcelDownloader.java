/*
 * Copyright (C) 2014-2016 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package nl.b3p.viewer.features;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.ClientAnchor;
import org.apache.poi.ss.usermodel.Comment;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.Drawing;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.PrintSetup;
import org.apache.poi.ss.usermodel.RichTextString;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.WorkbookUtil;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.geotools.data.simple.SimpleFeatureSource;
import org.opengis.feature.simple.SimpleFeature;

/**
 * An implementation to export the features as an excel file
 * @author Meine Toonen
 * @author mprins
 */
public class ExcelDownloader extends FeatureDownloader{

    private Workbook wb;
    private Sheet sheet;
    private int currentRow = -1;
    private Map<String, CellStyle> styles;

    public ExcelDownloader(List<ConfiguredAttribute> attributes, SimpleFeatureSource fs, Map<String, AttributeDescriptor> featureTypeAttributes, Map<String, String> attributeAliases, String params) {
        super(attributes, fs, featureTypeAttributes,attributeAliases, params);
    }

    @Override
    public void init() throws IOException {
        wb =  new XSSFWorkbook();

        styles = createStyles(wb);

        sheet = wb.createSheet(WorkbookUtil.createSafeSheetName(fs.getName().toString()));

        //turn off gridlines
        sheet.setDisplayGridlines(false);
        sheet.setPrintGridlines(false);
        sheet.setFitToPage(true);
        sheet.setHorizontallyCenter(true);
        PrintSetup printSetup = sheet.getPrintSetup();
        printSetup.setLandscape(true);

        //the following three statements are required only for HSSF
        sheet.setAutobreaks(true);
        printSetup.setFitHeight((short)1);
        printSetup.setFitWidth((short)1);

        //the header row: centered text in 48pt font
        Row headerRow = sheet.createRow(0);
        headerRow.setHeightInPoints(15f);
        int colNum = 0;
        Drawing drawing = sheet.createDrawingPatriarch();

        CreationHelper factory = wb.getCreationHelper();
        // When the comment box is visible, have it show in a 1x3 space
        for (ConfiguredAttribute configuredAttribute : attributes) {
            if(configuredAttribute.isVisible()){
                String alias = attributeAliases.get(configuredAttribute.getAttributeName());
                if(alias != null){
                    Cell cell = headerRow.createCell(colNum);
                    cell.setCellValue(alias);
                    if(!alias.equals(configuredAttribute.getAttributeName())){
                        ClientAnchor anchor = factory.createClientAnchor();
                        anchor.setCol1(cell.getColumnIndex());
                        anchor.setCol2(cell.getColumnIndex()+1);
                        anchor.setRow1(headerRow.getRowNum());
                        anchor.setRow2(headerRow.getRowNum()+3);
                        Comment comment = drawing.createCellComment(anchor);
                        RichTextString str = factory.createRichTextString(configuredAttribute.getAttributeName());
                        comment.setString(str);
                        cell.setCellComment(comment);
                    }
                    cell.setCellStyle(styles.get("header"));
                    sheet.autoSizeColumn(colNum);
                    colNum++;
                }
            }
        }

        //freeze the first row
        sheet.createFreezePane(0, 1);
        currentRow = 1;
    }

    @Override
    public void processFeature(SimpleFeature oldFeature) {
        Row row = sheet.createRow(currentRow);

        String rowHeight = parameterMap.get("rowHeight");
        if(rowHeight != null) {
            try {
                row.setHeight(Short.parseShort(rowHeight));
            } catch(NumberFormatException nfe) {
            }
        }
        Cell cell;

        int colNum = 0;
        for (ConfiguredAttribute configuredAttribute : attributes) {
            if(configuredAttribute.isVisible() && attributeAliases.get(configuredAttribute.getAttributeName()) != null){
                Object attribute = oldFeature.getAttribute(configuredAttribute.getAttributeName());
                String value = null;
                cell = row.createCell(colNum);
                cell.setCellType(CellType.NUMERIC);
                cell.setCellStyle(styles.get("cell_normal"));

                if (attribute == null) {
                    cell.setCellValue(value);
                    cell.setCellType(CellType.BLANK);
                } else if (attribute instanceof Boolean) {
                    cell.setCellValue((Boolean) attribute);
                    cell.setCellType(CellType.BOOLEAN);
                } else if (attribute instanceof Number) {
                    cell.setCellValue(((Number) attribute).doubleValue());
                } else if (attribute instanceof Date) {
                    cell.setCellValue((Date) attribute);
                    cell.setCellStyle(styles.get("cell_normal_date"));
                } else if (attribute instanceof Calendar) {
                    cell.setCellValue((Calendar) attribute);
                    cell.setCellStyle(styles.get("cell_normal_date"));
                } else {
                    value = attribute.toString();
                    cell.setCellValue(value);                    
                    cell.setCellType(CellType.STRING);
                }
                colNum++;
            }
        }
        currentRow++;
    }

    @Override
    public File write() throws IOException {

        int i = 0;
        String autoSize = parameterMap.get("autoSize");
        String rowWidths = parameterMap.get("rowWidths");
        if(autoSize != null || rowWidths != null) {
            Set autoSizeAttributes = autoSize == null ? Collections.emptySet() : new HashSet(Arrays.asList(autoSize.split("\\|")));
            Map<String,Integer> attributeWidths = new HashMap();
            if(rowWidths != null) {
                for(String w: rowWidths.split("\\|")) {
                    String[] p = w.split("@", 2);
                    if(p.length == 2) {
                        try {
                            attributeWidths.put(p[0], Integer.parseInt(p[1]));
                        } catch(NumberFormatException e) {
                        }
                    }
                }
            }

            for (ConfiguredAttribute configuredAttribute : attributes) {
                if(configuredAttribute.isVisible()) {
                    if(autoSizeAttributes.contains(configuredAttribute.getAttributeName())) {
                        sheet.autoSizeColumn(i);
                    }
                    if(attributeWidths.containsKey(configuredAttribute.getAttributeName())) {
                        sheet.setColumnWidth(i, attributeWidths.get(configuredAttribute.getAttributeName()));
                    }
                    i++;
                }
            }
        }

         // Write the output to a file
        File file = File.createTempFile("downloadExcel", ".xlsx");
        FileOutputStream out = new FileOutputStream(file);
        wb.write(out);
        out.close();
        return file;
    }

    /**
     * create a library of cell styles
     */
    private static Map<String, CellStyle> createStyles(Workbook wb){
        Map<String, CellStyle> styles = new HashMap<>();
        DataFormat df = wb.createDataFormat();

        CellStyle style;
        Font headerFont = wb.createFont();
        headerFont.setBold(true);
        style = createBorderedStyle(wb);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setFont(headerFont);
        styles.put("header", style);

        style = createBorderedStyle(wb);
        style.setWrapText(true);
        styles.put("cell_normal", style);

        style = createBorderedStyle(wb);
        style.setWrapText(true);
        style.setDataFormat(df.getFormat("d-mmm-yyyy"));
        styles.put("cell_normal_date", style);

        return styles;
    }

    private static CellStyle createBorderedStyle(Workbook wb){
        CellStyle style = wb.createCellStyle();
        style.setBorderRight(BorderStyle.THIN);
        style.setRightBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderBottom(BorderStyle.THIN);
        style.setBottomBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderLeft(BorderStyle.THIN);
        style.setLeftBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderTop(BorderStyle.THIN);
        style.setTopBorderColor(IndexedColors.BLACK.getIndex());
        return style;
    }
}
