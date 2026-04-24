import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import path from "path";
import { getAllProducts } from "../services/skinCareProductsService.js";
import { getAllUsersProcess } from "../services/adminUserServices.js";
import { getAllAnalysis } from "../services/analysisServices.js";
import { getUserByIdProcess } from "../services/adminUserServices.js";
import { getAnalysisByUserId } from "../services/analysisServices.js";
import { getUserReportData } from  "../services/adminUserServices.js";
import { getSkinProfileByUserId } from "../services/skinTypeFetchServices.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(
  __dirname,
  "../../../../Admin/src/assets/DermaScanLogo.png",
);

function drawHeader(doc, title) {
  try {
    doc.image(logoPath, 40, 30, { width: 60 });
  } catch (err) {
    console.log("Logo failed:", logoPath);
  }

  doc.fontSize(20).font("Helvetica-Bold").text("DermaScan+", 110, 40);
  doc.fontSize(10).font("Helvetica").text("Official Report", 110, 60);

  if (title) {
    doc.moveDown(2);
    doc.fontSize(14).font("Helvetica-Bold").text(title, { align: "center" });
  }
  doc.font("Helvetica").fontSize(10);

  const generatedDate = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  doc.moveDown(0.5);
  doc.fontSize(9).font("Helvetica").fillColor("gray")
    .text(`Date Generated: ${generatedDate}`, { align: "center" });
  doc.fillColor("black");

  doc.moveDown(1.5);
}

function formatIngredients(text, limit = 6) {
  if (!text) return "N/A";
  if (Array.isArray(text)) {
    return text.length > limit
      ? text.slice(0, limit).join(", ") + ", ..."
      : text.join(", ");
  }
  const words = text.split(",").map((i) => i.trim()).filter(Boolean);
  return words.length > limit
    ? words.slice(0, limit).join(", ") + ", ..."
    : words.join(", ");
}

function getLineCount(doc, text, width) {
  const lineHeight = 12;
  return doc.heightOfString(String(text || ""), { width }) / lineHeight;
}

// ─── Table Header Drawers ─────────────────────────────────────────────────────

function drawProductTableHeader(doc, col, widths, y, startX) {
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("Product",      col.name,       y, { width: widths.name });
  doc.text("Brand",        col.brand,      y, { width: widths.brand });
  doc.text("Type",         col.type,       y, { width: widths.type });
  doc.text("Ingredient",   col.ingredient, y, { width: widths.ingredient });
  doc.text("Skin Type",    col.skinType,   y, { width: widths.skinType });
  doc.text("Derma Tested", col.derma,      y, { width: widths.derma });
  doc.text("Routine",      col.routine,    y, { width: widths.routine });
  doc.text("Freq.",        col.freq,       y, { width: widths.freq });
  doc.text("Date Added",   col.date,       y, { width: widths.date });
  doc.font("Helvetica").fontSize(10);
  const lineY = y + 20;
  doc.moveTo(startX, lineY).lineTo(555, lineY).stroke();
  return lineY;
}

function drawUserTableHeader(doc, col, widths, y, startX) {
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("ID",         col.id,      y);
  doc.text("Name",       col.name,    y);
  doc.text("Email",      col.email,   y);
  doc.text("Role",       col.role,    y);
  doc.text("Created At", col.created, y);
  doc.font("Helvetica").fontSize(10);
  const lineY = y + 20;
  doc.moveTo(startX, lineY).lineTo(555, lineY).stroke();
  return lineY;
}

function drawAnalysisTableHeader(doc, col, rowHeight, startX, y) {
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("Email",       col.name,      y, { width: 145 });
  doc.text("Condition",   col.condition, y, { width: 110 });
  doc.text("Status",      col.status,    y, { width: 60 });
  doc.text("Score",       col.score,     y, { width: 60 });
  doc.text("Recommended", col.recommend, y, { width: 60 });
  doc.text("Created At",  col.created,   y, { width: 80 });
  doc.font("Helvetica").fontSize(10);
  const lineY = y + rowHeight;
  doc.moveTo(startX, lineY).lineTo(565, lineY).stroke();
  return lineY;
}

// ─── Product Report ───────────────────────────────────────────────────────────

export async function generateProductReport(req, res) {
  try {
    const products = await getAllProducts();

    let statsMap = {};
    try {
      const statsRes = await fetch("http://localhost:3000/api/admin/products/getProductRecommendationStats");
      const statsJson = await statsRes.json();
      (statsJson.data || []).forEach((s) => {
        statsMap[s.productId] = {
          count: s.recommendationCount ?? 0,
          selected: s.selected ?? false,
        };
      });
    } catch (e) {
      console.warn("Could not fetch recommendation stats:", e.message);
    }

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=products.pdf");

    doc.pipe(res);

    drawHeader(doc, "Products Report");

    const startX = 40;

    const col = {
      name: 40,
      brand: 120,
      type: 180,
      ingredient: 238,
      skinType: 325,
      derma: 373,
      routine: 413,
      freq: 460,
      date: 490,
    };

    const widths = {
      name: 75,
      brand: 55,
      type: 53,
      ingredient: 82,
      skinType: 43,
      derma: 35,
      routine: 42,
      freq: 25,
      date: 60,
    };

    let y = drawProductTableHeader(doc, col, widths, doc.y + 10, startX);

    products.forEach((p) => {
      const product = p.productName || "N/A";
      const brand = p.productBrand || "N/A";
      const type = p.productType || "N/A";
      const ingredient = formatIngredients(p.ingredient, 6);
      const skinTypes = p.skinType ? p.skinType.split(",").map(t => t.trim()).join("\n") : "N/A";
      const derma = p.dermaTested ? "Yes" : "No";
      const routine = p.timeRoutine || "N/A";
      const dateAdded = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A";

      const stat = statsMap[p.productId] || statsMap[p.id];
      const freq = stat?.selected ? String(stat.count) : "-";

      const dynamicRowHeight =
        Math.max(
          getLineCount(doc, product, widths.name),
          getLineCount(doc, brand, widths.brand),
          getLineCount(doc, type, widths.type),
          getLineCount(doc, ingredient, widths.ingredient),
          getLineCount(doc, skinTypes, widths.skinType),
          getLineCount(doc, derma, widths.derma),
          getLineCount(doc, routine, widths.routine),
          getLineCount(doc, freq, widths.freq),
          getLineCount(doc, dateAdded, widths.date)
        ) * 12 + 18;

      if (y + dynamicRowHeight > 770) {
        doc.addPage();
        drawHeader(doc, "Products Report");
        y = drawProductTableHeader(doc, col, widths, doc.y + 10, startX);
      }

      const rowY = y + 8;

      doc.text(product, col.name, rowY, { width: widths.name });
      doc.text(brand, col.brand, rowY, { width: widths.brand });
      doc.text(type, col.type, rowY, { width: widths.type });
      doc.text(ingredient, col.ingredient, rowY, { width: widths.ingredient });
      doc.text(skinTypes, col.skinType, rowY, { width: widths.skinType });
      doc.text(derma, col.derma, rowY, { width: widths.derma });
      doc.text(routine, col.routine, rowY, { width: widths.routine });
      doc.text(freq, col.freq, rowY, { width: widths.freq });
      doc.text(dateAdded, col.date, rowY, { width: widths.date });

      y = rowY + dynamicRowHeight;
      doc.moveTo(startX, y).lineTo(555, y).stroke();
    });

    y += 15;

    if (y + 30 > 770) {
      doc.addPage();
      y = 40;
    }

    doc.font("Helvetica-Bold").fontSize(10)
      .text(`Total Products: ${products.length}`, startX, y);

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}

// ─── User Report ──────────────────────────────────────────────────────────────

export const generateUserReport = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const { user, analysis, skinProfile } = await getUserReportData(userId);

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=user-${userId}-report.pdf`);
    doc.pipe(res);

    drawHeader(doc, "User Report");

    // ─── USER INFO SECTION ───────────────────────────────────────
    doc.font("Helvetica-Bold").fontSize(12).text("User Information", { underline: true });
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10);
    doc.text(`Name       : ${user.firstName ?? "N/A"} ${user.lastName ?? "N/A"}`);
    doc.text(`Email      : ${user.email ?? "N/A"}`);
    doc.text(`Skin Type  : ${skinProfile?.skinType ?? "N/A"}`);
doc.text(`Sensitivity: ${skinProfile?.skinSensitivity ?? "N/A"}`);
    doc.moveDown(1.5);
    
    // ─── ANALYSIS SUMMARY ────────────────────────────────────────
    const successList = analysis.filter((a) => a.status === "success");
    const failedList  = analysis.filter((a) => a.status !== "success");

    doc.font("Helvetica-Bold").fontSize(11)
      .text(`Total Scans  : ${analysis.length}`);
    doc.font("Helvetica").fontSize(10)
      .text(`✓ Successful : ${successList.length}`)
      .text(`✗ Failed     : ${failedList.length}`);
    doc.moveDown(1.5);

    // ─── TABLE HELPER ────────────────────────────────────────────
    const drawAnalysisTable = (doc, title, items, startY) => {
      let y = startY;

      doc.font("Helvetica-Bold").fontSize(11).text(title, 40, y);
      y += 20;

      // Table header
      doc.font("Helvetica-Bold").fontSize(9);
      doc.text("Date",       40,  y, { width: 90 });
      doc.text("Condition",  140, y, { width: 130 });
      doc.text("Score",      280, y, { width: 70 });
      doc.text("Recommended",360, y, { width: 90 });
      doc.text("Status",     455, y, { width: 60 });
      y += 16;
      doc.moveTo(40, y).lineTo(555, y).stroke();

      doc.font("Helvetica").fontSize(9);

      if (items.length === 0) {
        y += 10;
        doc.text("No records found.", 40, y);
        y += 20;
        return y;
      }

      items.forEach((a) => {
        if (y + 20 > 770) {
          doc.addPage();
          drawHeader(doc, "User Report");
          y = doc.y;
        }

        y += 6;
        doc.text(
          a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "N/A",
          40, y, { width: 90 }
        );
        doc.text(a.conditionName || "N/A", 140, y, { width: 130 });
        doc.text(
          a.confidenceScores != null
            ? Number(a.confidenceScores).toFixed(4)
            : "N/A",
          280, y, { width: 70 }
        );
        doc.text(a.canRecommend === "Yes" ? "Yes" : "No", 360, y, { width: 90 });
        doc.text(a.status || "N/A", 455, y, { width: 60 });

        y += 18;
        doc.moveTo(40, y).lineTo(555, y).stroke();
      });

      return y + 15;
    };

    // ─── SUCCESS TABLE ────────────────────────────────────────────
    let y = doc.y;
    y = drawAnalysisTable(doc, "✓ Successful Scans", successList, y);

    // ─── FAILED TABLE ─────────────────────────────────────────────
    if (y + 60 > 770) {
      doc.addPage();
      drawHeader(doc, "User Report");
      y = doc.y;
    } else {
      y += 10;
    }

    y = drawAnalysisTable(doc, "✗ Failed Scans", failedList, y);

    doc.end();
  } catch (err) {
    console.error("User report error:", err.message, err.stack);

    if (err.message === "INVALID_USER_ID") {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(500).json({ error: "Failed to generate user report" });
  }
};

// ─── Analysis Report ──────────────────────────────────────────────────────────

export async function generateAnalysisReport(req, res) {
  try {
    const analysisData = await getAllAnalysis();

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=analysis.pdf");

    doc.pipe(res);

    drawHeader(doc, "Analysis Report");

    const startX = 40;
    const rowHeight = 22;

    const col = {
      name: startX,
      condition: startX + 155,
      status: startX + 275,
      score: startX + 340,
      recommend: startX + 405,
      created: startX + 470,
    };

    let y = drawAnalysisTableHeader(doc, col, rowHeight, startX, doc.y + 10);

    analysisData.forEach((item) => {
      if (y + rowHeight > 750) {
        doc.addPage();
        drawHeader(doc, "Analysis Report");
        y = drawAnalysisTableHeader(doc, col, rowHeight, startX, doc.y + 10);
      }

      y += 6;

      const recommended = item.canRecommend === "Yes" ? "Yes" : "No";

      doc.text(item.email || "N/A", col.name, y, { width: 145, ellipsis: true });
      doc.text(item.conditionName || "N/A", col.condition, y, { width: 110, ellipsis: true });
      doc.text(item.status || "N/A", col.status, y, { width: 60 });
      doc.text(
        item.confidenceScores != null ? Number(item.confidenceScores).toFixed(4) : "N/A",
        col.score,
        y,
        { width: 60 }
      );
      doc.text(recommended, col.recommend, y, { width: 60 });
      doc.text(
        item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A",
        col.created,
        y,
        { width: 80 }
      );

      y += rowHeight;
      doc.moveTo(startX, y).lineTo(565, y).stroke();
    });

    y += 15;

    if (y + 30 > 770) {
      doc.addPage();
      y = 40;
    }

    doc.font("Helvetica-Bold")
      .fontSize(10)
      .text(`Total Scans: ${analysisData.length}`, startX, y);

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate analysis PDF" });
  }
}