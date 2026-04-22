import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import path from "path";
import { getAllProducts } from "../services/skinCareProductsService.js";
import { getAllUsersProcess } from "../services/adminUserServices.js";
import { getAllAnalysis } from "../services/analysisServices.js";

const __filename = fileURLToPath(import.meta.url); // ✅ Fixed typo: fileUrlToPath → fileURLToPath
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

  doc.moveDown(2);
}

function formatIngredients(text, limit = 6) {
  if (!text) return "N/A";
  const str = Array.isArray(text) ? text.join(", ") : text;
  const words = str.split(", ").map((i) => i.trim());
  return words.length > limit
    ? words.slice(0, limit).join(", ") + ", ..."
    : str;
}

function getLineCount(doc, text, width) {
  const lineHeight = 12;
  return doc.heightOfString(text, { width }) / lineHeight;
}

export async function generateProductReport(req, res) {
  try {
    const products = await getAllProducts();

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=products.pdf");

    doc.pipe(res);

    drawHeader(doc, "Products Report");

    const startX = 40;
    let y = doc.y + 10;

    const col = {
      name: 40,
      brand: 140,
      type: 210,
      ingredient: 280,
      skinType: 380,
      derma: 440,
      routine: 490,
    };

    const widths = {
      name: 95,
      brand: 65,
      type: 65,
      ingredient: 95,
      skinType: 55,
      derma: 45,
      routine: 55,
    };

    doc.font("Helvetica-Bold").fontSize(10);

    doc.text("Product", col.name, y, { width: widths.name });
    doc.text("Brand", col.brand, y, { width: widths.brand });
    doc.text("Type", col.type, y, { width: widths.type });
    doc.text("Ingredient", col.ingredient, y, { width: widths.ingredient });
    doc.text("Skin Type", col.skinType, y, { width: widths.skinType });
    doc.text("Derma Tested", col.derma, y, { width: widths.derma });
    doc.text("Routine", col.routine, y, { width: widths.routine });

    y += 20;

    doc.moveTo(startX, y).lineTo(555, y).stroke();

    doc.font("Helvetica");

    products.forEach((p) => {
      const product = p.productName || "N/A";
      const brand = p.productBrand || "N/A";
      const type = p.productType || "N/A";
      const ingredient = formatIngredients(p.ingredient, 6);

      const skinTypes = p.skinType
        ? p.skinType
            .split(",")
            .map((t) => t.trim())
            .join("\n")
        : "N/A";

      const derma = p.dermaTested ? "Yes" : "No";
      const routine = p.timeRoutine || "N/A";

      const dynamicRowHeight =
        Math.max(
          getLineCount(doc, product, widths.name),
          getLineCount(doc, brand, widths.brand),
          getLineCount(doc, type, widths.type),
          getLineCount(doc, ingredient, widths.ingredient),
          getLineCount(doc, skinTypes, widths.skinType),
          getLineCount(doc, derma, widths.derma),
          getLineCount(doc, routine, widths.routine),
        ) *
          12 +
        10;

      y += 8;
      const rowY = y;

      doc.text(product, col.name, rowY, { width: widths.name });
      doc.text(brand, col.brand, rowY, { width: widths.brand });
      doc.text(type, col.type, rowY, { width: widths.type });
      doc.text(ingredient, col.ingredient, rowY, { width: widths.ingredient });
      doc.text(skinTypes, col.skinType, rowY, { width: widths.skinType });
      doc.text(derma, col.derma, rowY, { width: widths.derma });
      doc.text(routine, col.routine, rowY, { width: widths.routine });

      y += dynamicRowHeight;

      doc.moveTo(startX, y).lineTo(555, y).stroke();

      if (y > 770) {
        doc.addPage();
        drawHeader(doc, "Products Report");
        y = doc.y + 10;
      }
    });

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}

export async function generateUserReport(req, res) {
  try {
    const users = await getAllUsersProcess();

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=users.pdf");

    doc.pipe(res);

    drawHeader(doc, "Users Report");

    const startX = 40;
    let y = doc.y + 10;

    const col = {
      id: 40,
      name: 80,
      email: 240,
      role: 410,
      created: 480,
    };

    const widths = {
      id: 30,
      name: 150,
      email: 170,
      role: 60,
      created: 80,
    };

    const LINE_HEIGHT = 12;

    const getLineCount = (doc, text, width) => {
      return doc.heightOfString(text || "N/A", { width }) / LINE_HEIGHT;
    };

    doc.font("Helvetica-Bold").fontSize(10);

    doc.text("ID", col.id, y);
    doc.text("Name", col.name, y);
    doc.text("Email", col.email, y);
    doc.text("Role", col.role, y);
    doc.text("Created At", col.created, y);

    y += 20;

    doc.moveTo(startX, y).lineTo(555, y).stroke();

    doc.font("Helvetica");

    users.forEach((u) => {
      const fullName =
        `${u.firstName || ""} ${u.lastName || ""}`.trim() || "N/A";
      const email = u.email || "N/A";
      const roleName = u.role?.roleName || "N/A";
      const createdDate = new Date(u.createdAt).toLocaleDateString();

      const rowHeight =
        Math.max(
          getLineCount(doc, u.id, widths.id),
          getLineCount(doc, fullName, widths.name),
          getLineCount(doc, email, widths.email),
          getLineCount(doc, roleName, widths.role),
          getLineCount(doc, createdDate, widths.created),
        ) *
          LINE_HEIGHT +
        10;

      const rowY = y + 8;

      doc.text(u.id || "N/A", col.id, rowY, { width: widths.id });
      doc.text(fullName, col.name, rowY, { width: widths.name });
      doc.text(email, col.email, rowY, { width: widths.email });
      doc.text(roleName, col.role, rowY, { width: widths.role });
      doc.text(createdDate, col.created, rowY, { width: widths.created });

      y += rowHeight;

      doc.moveTo(startX, y).lineTo(555, y).stroke();

      if (y > 750) {
        doc.addPage();
        drawHeader(doc, "Users Report");
        y = doc.y + 10;
      }
    });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate user report" });
  }
}

export async function generateAnalysisReport(req, res) {
  try {
    const analysisData = await getAllAnalysis();

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=analysis.pdf");

    doc.pipe(res);

    drawHeader(doc, "Analysis Report");

    const startX = 40;
    let y = doc.y + 10;

    const rowHeight = 22;

    const col = {
      name: startX,
      condition: startX + 170,
      status: startX + 290,
      score: startX + 350,
      recommend: startX + 400,
      created: startX + 480,
    };

    doc.font("Helvetica-Bold").fontSize(10);

    doc.text("Email", col.name, y, { width: 150 });
    doc.text("Condition", col.condition, y, { width: 110 });
    doc.text("Status", col.status, y, { width: 60 });
    doc.text("Score", col.score, y, { width: 50 });
    doc.text("Recommended", col.recommend, y, { width: 90, lineBreak: false });
    doc.text("Created At", col.created, y, { width: 80 });

    y += rowHeight;

    doc.moveTo(startX, y).lineTo(565, y).stroke();

    doc.font("Helvetica");

    analysisData.forEach((item) => {
      y += 6;

      doc.text(item.email || "N/A", col.name, y, {
        width: 150,
        ellipsis: true,
      });

      doc.text(item.conditionName || "N/A", col.condition, y, {
        width: 110,
        ellipsis: true,
      });

      doc.text(item.status || "N/A", col.status, y, { width: 60 });

      doc.text(String(item.confidenceScores ?? "N/A"), col.score, y, {
        width: 50,
      });

      doc.text(item.canRecommend ? "Yes" : "No", col.recommend, y, {
        width: 90,
      });

      const createdDate = item.createdAt
        ? new Date(item.createdAt).toLocaleDateString()
        : "N/A";

      doc.text(createdDate, col.created, y, { width: 80 });

      y += rowHeight;

      doc.moveTo(startX, y).lineTo(565, y).stroke();

      if (y > 750) {
        doc.addPage();
        drawHeader(doc, "Analysis Report");
        y = doc.y + 10;
      }
    });

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate analysis PDF" });
  }
}