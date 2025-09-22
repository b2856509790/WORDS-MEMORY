// Excel单词文件转换器 - 主要JavaScript文件
class ExcelConverter {
  constructor() {
    this.workbook = null;
    this.worksheet = null;
    this.headers = [];
    this.data = [];
    this.convertedData = [];

    this.init();
  }

  init() {
    this.bindEvents();
    this.showMessage("Excel单词文件转换器已就绪！", "info");
  }

  // 绑定事件监听器
  bindEvents() {
    // 文件上传
    const fileInput = document.getElementById("fileInput");
    const uploadArea = document.getElementById("uploadArea");

    fileInput.addEventListener("change", (e) => {
      this.handleFile(e.target.files[0]);
    });

    // 拖拽上传
    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("dragover");
    });

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("dragover");
    });

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file) {
        this.handleFile(file);
      }
    });

    // 列映射变化
    document
      .getElementById("languageColumn")
      .addEventListener("change", (e) => {
        const defaultInput = document.getElementById("defaultLanguage");
        defaultInput.style.display =
          e.target.value === "default" ? "block" : "none";
      });

    document
      .getElementById("difficultyColumn")
      .addEventListener("change", (e) => {
        const defaultSelect = document.getElementById("defaultDifficulty");
        defaultSelect.style.display =
          e.target.value === "default" ? "block" : "none";
      });

    // 转换按钮
    document.getElementById("convertBtn").addEventListener("click", () => {
      this.convertData();
    });

    // 重置按钮
    document.getElementById("resetBtn").addEventListener("click", () => {
      this.resetConverter();
    });

    // 下载按钮
    document.getElementById("downloadBtn").addEventListener("click", () => {
      this.downloadFile();
    });

    // 复制按钮
    document.getElementById("copyBtn").addEventListener("click", () => {
      this.copyToClipboard();
    });

    // 新转换按钮
    document.getElementById("newConvertBtn").addEventListener("click", () => {
      this.resetConverter();
    });
  }

  // 处理文件上传
  handleFile(file) {
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];

    if (
      !validTypes.includes(file.type) &&
      !file.name.match(/\.(xlsx|xls|csv)$/i)
    ) {
      this.showMessage("请选择有效的Excel文件 (.xlsx, .xls, .csv)", "error");
      return;
    }

    this.showMessage("正在解析文件...", "info");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        this.parseFile(e.target.result, file.name);
      } catch (error) {
        this.showMessage("文件解析失败: " + error.message, "error");
        console.error("Parse error:", error);
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsArrayBuffer(file);
    }
  }

  // 解析文件
  parseFile(data, filename) {
    try {
      if (filename.endsWith(".csv")) {
        this.parseCSV(data);
      } else {
        this.parseExcel(data);
      }

      this.setupColumnMapping();
      this.showConfigSection();
      this.showMessage("文件解析成功！请配置列映射", "success");
    } catch (error) {
      this.showMessage("文件解析失败: " + error.message, "error");
      console.error("Parse error:", error);
    }
  }

  // 解析Excel文件
  parseExcel(data) {
    this.workbook = XLSX.read(data, { type: "array" });
    const sheetName = this.workbook.SheetNames[0];
    this.worksheet = this.workbook.Sheets[sheetName];

    // 转换为JSON格式
    const jsonData = XLSX.utils.sheet_to_json(this.worksheet, { header: 1 });

    if (jsonData.length === 0) {
      throw new Error("Excel文件为空");
    }

    this.headers = jsonData[0] || [];
    this.data = jsonData.slice(1);

    // 清理数据
    this.data = this.data.filter((row) =>
      row.some((cell) => cell !== undefined && cell !== null && cell !== "")
    );
  }

  // 解析CSV文件
  parseCSV(data) {
    const lines = data.split("\n");
    if (lines.length === 0) {
      throw new Error("CSV文件为空");
    }

    // 检测分隔符
    const delimiter = this.detectDelimiter(lines[0]);

    this.headers = this.parseCSVLine(lines[0], delimiter);
    this.data = lines
      .slice(1)
      .map((line) => this.parseCSVLine(line, delimiter))
      .filter((row) =>
        row.some((cell) => cell !== undefined && cell !== null && cell !== "")
      );
  }

  // 检测CSV分隔符
  detectDelimiter(line) {
    const delimiters = [",", ";", "\t", "|"];
    let maxCount = 0;
    let detectedDelimiter = ",";

    for (const delimiter of delimiters) {
      const count = (line.match(new RegExp("\\" + delimiter, "g")) || [])
        .length;
      if (count > maxCount) {
        maxCount = count;
        detectedDelimiter = delimiter;
      }
    }

    return detectedDelimiter;
  }

  // 解析CSV行
  parseCSVLine(line, delimiter) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  // 设置列映射
  setupColumnMapping() {
    const selects = [
      "wordColumn",
      "translationColumn",
      "languageColumn",
      "difficultyColumn",
      "exampleColumn",
      "notesColumn",
    ];

    selects.forEach((selectId) => {
      const select = document.getElementById(selectId);
      select.innerHTML = '<option value="">请选择列</option>';

      this.headers.forEach((header, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = header || `列 ${index + 1}`;
        select.appendChild(option);
      });

      // 为非必选列添加特殊选项
      if (selectId === "languageColumn" || selectId === "difficultyColumn") {
        const defaultOption = document.createElement("option");
        defaultOption.value = "default";
        defaultOption.textContent = "使用默认值";
        select.appendChild(defaultOption);
      }

      if (selectId === "exampleColumn" || selectId === "notesColumn") {
        const noneOption = document.createElement("option");
        noneOption.value = "none";
        noneOption.textContent = "无";
        select.appendChild(noneOption);
      }
    });

    this.updatePreview();
  }

  // 更新预览表格
  updatePreview() {
    const headerRow = document.getElementById("previewHeader");
    const bodyRows = document.getElementById("previewBody");

    // 清空现有内容
    headerRow.innerHTML = "";
    bodyRows.innerHTML = "";

    // 创建表头
    const headerTr = document.createElement("tr");
    this.headers.forEach((header, index) => {
      const th = document.createElement("th");
      th.textContent = header || `列 ${index + 1}`;
      th.title = `列 ${index + 1}`;
      headerTr.appendChild(th);
    });
    headerRow.appendChild(headerTr);

    // 创建数据行（最多显示5行）
    const previewData = this.data.slice(0, 5);
    previewData.forEach((row) => {
      const tr = document.createElement("tr");
      this.headers.forEach((_, index) => {
        const td = document.createElement("td");
        td.textContent = row[index] || "";
        tr.appendChild(td);
      });
      bodyRows.appendChild(tr);
    });
  }

  // 显示配置区域
  showConfigSection() {
    document.getElementById("configSection").style.display = "block";
    document.getElementById("resultSection").style.display = "none";
  }

  // 转换数据
  convertData() {
    const wordColumn = document.getElementById("wordColumn").value;
    const translationColumn =
      document.getElementById("translationColumn").value;
    const languageColumn = document.getElementById("languageColumn").value;
    const difficultyColumn = document.getElementById("difficultyColumn").value;
    const exampleColumn = document.getElementById("exampleColumn").value;
    const notesColumn = document.getElementById("notesColumn").value;

    // 验证必选字段
    if (wordColumn === "" || translationColumn === "") {
      this.showMessage("请选择单词列和翻译列！", "error");
      return;
    }

    const skipEmptyRows = document.getElementById("skipEmptyRows").checked;
    const trimWhitespace = document.getElementById("trimWhitespace").checked;
    const defaultLanguage =
      document.getElementById("defaultLanguage").value || "英语";
    const defaultDifficulty =
      document.getElementById("defaultDifficulty").value || "medium";

    this.convertedData = [];

    this.data.forEach((row, index) => {
      const word = row[wordColumn];
      const translation = row[translationColumn];

      // 跳过空行
      if (skipEmptyRows && (!word || !translation)) {
        return;
      }

      // 跳过空单词或翻译
      if (!word || !translation) {
        return;
      }

      const convertedWord = {
        word: trimWhitespace ? word.toString().trim() : word.toString(),
        translation: trimWhitespace
          ? translation.toString().trim()
          : translation.toString(),
        language: this.getColumnValue(row, languageColumn, defaultLanguage),
        difficulty: this.getColumnValue(
          row,
          difficultyColumn,
          defaultDifficulty
        ),
        example: this.getColumnValue(row, exampleColumn, ""),
        notes: this.getColumnValue(row, notesColumn, ""),
        id: Date.now() + Math.random(),
        createdAt: new Date().toISOString(),
        studyCount: 0,
        correctCount: 0,
      };

      // 清理空值
      if (!convertedWord.example) delete convertedWord.example;
      if (!convertedWord.notes) delete convertedWord.notes;

      this.convertedData.push(convertedWord);
    });

    if (this.convertedData.length === 0) {
      this.showMessage("没有有效的数据可以转换！", "error");
      return;
    }

    this.showResult();
    this.showMessage(
      `成功转换 ${this.convertedData.length} 个单词！`,
      "success"
    );
  }

  // 获取列值
  getColumnValue(row, columnIndex, defaultValue) {
    if (columnIndex === "" || columnIndex === "none") {
      return defaultValue;
    }

    if (columnIndex === "default") {
      return defaultValue;
    }

    const value = row[columnIndex];
    return value ? value.toString().trim() : defaultValue;
  }

  // 显示结果
  showResult() {
    const outputFormat = document.getElementById("outputFormat").value;
    let resultText = "";

    switch (outputFormat) {
      case "json":
        resultText = JSON.stringify(this.convertedData, null, 2);
        break;
      case "csv":
        resultText = this.convertToCSV();
        break;
      case "txt":
        resultText = this.convertToTXT();
        break;
    }

    // 更新结果信息
    document.getElementById("convertedCount").textContent =
      this.convertedData.length;
    document.getElementById("fileSize").textContent = this.formatFileSize(
      new Blob([resultText]).size
    );
    document.getElementById("resultPreview").textContent =
      resultText.substring(0, 1000) + (resultText.length > 1000 ? "..." : "");

    // 显示结果区域
    document.getElementById("resultSection").style.display = "block";
    document.getElementById("configSection").style.display = "none";
  }

  // 转换为CSV格式
  convertToCSV() {
    const headers = [
      "word",
      "translation",
      "language",
      "difficulty",
      "example",
      "notes",
    ];
    const csvRows = [headers.join(",")];

    this.convertedData.forEach((word) => {
      const row = headers.map((header) => {
        const value = word[header] || "";
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }

  // 转换为TXT格式
  convertToTXT() {
    return this.convertedData
      .map((word) => {
        return [
          word.word,
          word.translation,
          word.language,
          word.difficulty,
          word.example || "",
          word.notes || "",
        ].join("|");
      })
      .join("\n");
  }

  // 下载文件
  downloadFile() {
    const outputFormat = document.getElementById("outputFormat").value;
    let mimeType, extension;

    switch (outputFormat) {
      case "json":
        mimeType = "application/json";
        extension = "json";
        break;
      case "csv":
        mimeType = "text/csv";
        extension = "csv";
        break;
      case "txt":
        mimeType = "text/plain";
        extension = "txt";
        break;
    }

    let content = "";
    switch (outputFormat) {
      case "json":
        content = JSON.stringify(this.convertedData, null, 2);
        break;
      case "csv":
        content = this.convertToCSV();
        break;
      case "txt":
        content = this.convertToTXT();
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `converted_words_${
      new Date().toISOString().split("T")[0]
    }.${extension}`;
    link.click();

    URL.revokeObjectURL(url);
    this.showMessage("文件下载成功！", "success");
  }

  // 复制到剪贴板
  async copyToClipboard() {
    const outputFormat = document.getElementById("outputFormat").value;
    let content = "";

    switch (outputFormat) {
      case "json":
        content = JSON.stringify(this.convertedData, null, 2);
        break;
      case "csv":
        content = this.convertToCSV();
        break;
      case "txt":
        content = this.convertToTXT();
        break;
    }

    try {
      await navigator.clipboard.writeText(content);
      this.showMessage("已复制到剪贴板！", "success");
    } catch (error) {
      // 降级方案
      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      this.showMessage("已复制到剪贴板！", "success");
    }
  }

  // 重置转换器
  resetConverter() {
    this.workbook = null;
    this.worksheet = null;
    this.headers = [];
    this.data = [];
    this.convertedData = [];

    document.getElementById("fileInput").value = "";
    document.getElementById("configSection").style.display = "none";
    document.getElementById("resultSection").style.display = "none";
    document.getElementById("previewHeader").innerHTML = "";
    document.getElementById("previewBody").innerHTML = "";

    // 重置表单
    document.getElementById("wordForm").reset();
  }

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // 显示消息
  showMessage(message, type = "info") {
    const messageEl = document.getElementById("message");
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.classList.add("show");

    setTimeout(() => {
      messageEl.classList.remove("show");
    }, 3000);
  }
}

// 初始化转换器
const excelConverter = new ExcelConverter();
