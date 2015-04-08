/*
 * Copyright (C) 2014 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package nl.b3p.viewer.features;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.ClientAnchor;
import org.apache.poi.ss.usermodel.Comment;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.Drawing;
import org.apache.poi.ss.usermodel.Font;
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
 */
public class ExcelDownloader extends FeatureDownloader{

    private Workbook wb;
    private Sheet sheet;
    private int currentRow = -1;
    private Map<String, CellStyle> styles;

    public ExcelDownloader(List<ConfiguredAttribute> attributes, SimpleFeatureSource fs, Map<String, AttributeDescriptor> featureTypeAttributes, Map<String, String> attributeAliases) {
        super(attributes, fs, featureTypeAttributes,attributeAliases);
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
        ClientAnchor anchor = factory.createClientAnchor();
        for (ConfiguredAttribute configuredAttribute : attributes) {
            if(configuredAttribute.isVisible()){
                Cell cell = headerRow.createCell(colNum);
                String alias = attributeAliases.get(configuredAttribute.getAttributeName());
                cell.setCellValue(alias);
                if(!alias.equals(configuredAttribute.getAttributeName())){
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

        //freeze the first row
        sheet.createFreezePane(0, 1);
        currentRow = 1;
    }

    @Override
    public void processFeature(SimpleFeature oldFeature) {
        Row row = sheet.createRow(currentRow);
        Cell cell;

        int colNum = 0;
        for (ConfiguredAttribute configuredAttribute : attributes) {
            if(configuredAttribute.isVisible()){
                Object attribute = oldFeature.getAttribute(configuredAttribute.getAttributeName());
                String value = null;
                if(attribute != null){
                    value = attribute.toString();
                }
                cell = row.createCell(colNum);
                String styleName = "cell_normal";
                cell.setCellValue(value);
                cell.setCellStyle(styles.get(styleName));
                colNum++;
            }
        }
        currentRow++;
    }

    @Override
    public File write() throws IOException {
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
        Map<String, CellStyle> styles = new HashMap<String, CellStyle>();
        DataFormat df = wb.createDataFormat();

        CellStyle style;
        Font headerFont = wb.createFont();
        headerFont.setBoldweight(Font.BOLDWEIGHT_BOLD);
        style = createBorderedStyle(wb);
        style.setAlignment(CellStyle.ALIGN_CENTER);
        style.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        style.setFillPattern(CellStyle.SOLID_FOREGROUND);
        style.setFont(headerFont);
        styles.put("header", style);

        style = createBorderedStyle(wb);
        style.setAlignment(CellStyle.ALIGN_LEFT);
        style.setWrapText(true);
        styles.put("cell_normal", style);

        return styles;
    }

    private static CellStyle createBorderedStyle(Workbook wb){
        CellStyle style = wb.createCellStyle();
        style.setBorderRight(CellStyle.BORDER_THIN);
        style.setRightBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderBottom(CellStyle.BORDER_THIN);
        style.setBottomBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderLeft(CellStyle.BORDER_THIN);
        style.setLeftBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderTop(CellStyle.BORDER_THIN);
        style.setTopBorderColor(IndexedColors.BLACK.getIndex());
        return style;
    }
}
