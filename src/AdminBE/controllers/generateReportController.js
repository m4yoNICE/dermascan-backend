import PDFDocument from "pdfkit";
import { getAllProducts } from "../services/skinCareProductsService.js";
import { getAllUsersProcess } from "../services/adminUserServices.js";
import { getAllAnalysis } from "../services/analysisServices.js";

export async function generateProductReport(req, res) {
    try {
    const products = await getAllProducts();

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=products.pdf");

    doc.pipe(res);

    doc.fontSize(18).text("DermaScan+", { align: "center" });
    doc.moveDown(2);

    const startX = 40;
    let y = doc.y + 20;
    const rowHeight = 20;

    const col = {
      name: startX,
      type: startX + 120,
      ingredient: startX + 200,
      skinType: startX + 290,
      derma: startX + 370,
      routine: startX + 440,
    };

    doc.font("Helvetica-Bold").fontSize(10).lineGap(4);

    doc.text("Product", col.name, y);
    doc.text("Type", col.type, y);
    doc.text("Ingredient", col.ingredient, y);
    doc.text("Skin Type", col.skinType, y);
    doc.text("Derma Tested", col.derma, y);
    doc.text("Routine", col.routine, y);

    y += rowHeight;

    doc.moveTo(startX, y).lineTo(555, y).stroke();
    doc.font("Helvetica");

    products.forEach((p) => {
      const skinTypes = p.skinType
        ? p.skinType.split(",").map((t) => t.trim()).join("\n")
        : "N/A";

      const skinHeight = doc.heightOfString(skinTypes, { width: 80 });
      const dynamicRowHeight = Math.max(rowHeight, skinHeight + 6);

      y += 8;

      doc.text(p.productName || "N/A", col.name, y, { width: 110 });
      doc.text(p.productType || "N/A", col.type, y, { width: 70 });
      doc.text(p.ingredient || "N/A", col.ingredient, y, { width: 80 });

      doc.text(skinTypes, col.skinType, y, { width: 80 });

      doc.text(p.dermaTested ? "Yes" : "No", col.derma, y, { width: 60 });
      doc.text(p.timeRoutine || "N/A", col.routine, y, { width: 60 });

      y += dynamicRowHeight;

      doc.moveTo(startX, y).lineTo(555, y).stroke();

      if (y > 770) {
        doc.addPage();
        y = 50;
      }
    });

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}

export async function generateUserReport (req, res) {
  try {
    const users = await getAllUsersProcess();

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=users.pdf");

    doc.pipe(res);

    doc.fontSize(18).text("DermaScan+ Users", { align: "center" });
    doc.moveDown(2);

    const startX = 40;
    let y = doc.y + 20;
    const rowHeight = 20;

    const col = {
      id: startX,
      name: startX + 40,
      email: startX + 170,
      role: startX + 350,
      created: startX + 430,
    };

    doc.font("Helvetica-Bold").fontSize(10).lineGap(4);

    doc.text("ID", col.id, y);
    doc.text("Name", col.name, y);
    doc.text("Email", col.email, y);
    doc.text("Role", col.role, y);
    doc.text("Created At", col.created, y);

    y += rowHeight;

    doc.moveTo(startX, y).lineTo(555, y).stroke();
    doc.font("Helvetica");

    users.forEach((u) => {
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`;
      const roleName = u.role?.roleName || "N/A";
      const createdDate = new Date(u.createdAt).toLocaleDateString();

      const emailHeight = doc.heightOfString(u.email || "N/A", { width: 160 });

      const dynamicRowHeight = Math.max(rowHeight, emailHeight + 6);

      y += 8;

      doc.text(u.id || "N/A", col.id, y, { width: 30 });
      doc.text(fullName, col.name, y, { width: 120 });
      doc.text(u.email || "N/A", col.email, y, { width: 160 });
      doc.text(roleName, col.role, y, { width: 70 });
      doc.text(createdDate, col.created, y, { width: 90 });

      y += dynamicRowHeight;

      
      doc.moveTo(startX, y).lineTo(555, y).stroke();

      if (y > 770) {
        doc.addPage();
        y = 50;
      }
    });

    doc.end();
  } catch (error) {
    
  }
}

export async function generateAnalysisReport(req, res) {
  try {
  const analysisData = await getAllAnalysis();

    const doc = new PDFDocument({ margin: 40, size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=analysis.pdf");

      doc.pipe(res);

      doc.fontSize(18).text("DermaScan+ Analysis Report", { align: "center" });
      doc.moveDown(1.5);

      const startX = 40;
      let y = doc.y + 20;
      const rowHeight = 16;
      const col = {
        name: startX,
        condition: startX + 90, 
        status: startX + 230,
        score: startX + 310,
        recommend: startX + 380,
        created: startX + 450,
      };

    doc.font("Helvetica-Bold").fontSize(10).lineGap(4);
    doc.text("Email", col.name, y);
    doc.text("Condition", col.condition, y);
    doc.text("Status", col.status, y);
    doc.text("Score", col.score, y);
    doc.text("Recommend", col.recommend, y);
    doc.text("Created At", col.created, y);

      y += rowHeight;
      doc.moveTo(startX, y).lineTo(565, y).stroke();
      doc.font("Helvetica");

      
      analysisData.forEach((item) => {
        y += 4;

        doc.text(item.email || "N/A", col.name, y, { width: 90 });
        doc.text(item.conditionName || "N/A", col.condition, y, { width: 90 });
        doc.text(item.status || "N/A", col.status, y, { width: 70 });
        doc.text(String(item.confidenceScores ?? "N/A"), col.score, y, { width: 50 });
        doc.text(item.canRecommend ? "Yes" : "No", col.recommend, y, { width: 50 });

        const createdDate = item.createdAt
          ? new Date(item.createdAt).toLocaleDateString()
          : "N/A";
        doc.text(createdDate, col.created, y, { width: 70 });

        y += rowHeight - 2;

        doc.moveTo(startX, y).lineTo(565, y).stroke();

        if (y > 770) {
          doc.addPage();
          y = 50;
        }
      });

      doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate analysis PDF" });
  }
}