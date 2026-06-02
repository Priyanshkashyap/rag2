import fs from "fs";
import path from "path";
import pdf from "pdf-parse";

export async function loadPdf() {

  const dataPath = path.join(
    process.cwd(),
    "doc"
  );

  const files =
    fs.readdirSync(dataPath);

  const allTexts: string[] = [];

  for (const file of files) {

    if (!file.endsWith(".pdf")) {
      continue;
    }

    console.log(
      `Processing ${file}`
    );

    const fullPath = path.join(
      dataPath,
      file
    );

    const pdfBuffer =
      fs.readFileSync(fullPath);

    const result =
      await pdf(pdfBuffer);

    allTexts.push(result.text);
  }

  return allTexts;
}