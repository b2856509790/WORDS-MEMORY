// 单词背诵系统 - 主要JavaScript文件
class WordMemorySystem {
  constructor() {
    this.words = [];
    this.currentWordIndex = 0;
    this.filteredWords = [];
    this.currentStudyMode = null;
    this.quizScore = { correct: 0, total: 0 };
    this.typingScore = { correct: 0, total: 0 };

    this.init();
  }

  init() {
    this.loadWords();
    this.bindEvents();
    this.updateWordList();
    this.updateLanguageFilter();
    this.showMessage("欢迎使用多语言单词背诵系统！", "info");
  }

  // 绑定事件监听器
  bindEvents() {
    // 表单提交
    document.getElementById("wordForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.addWord();
    });

    // 清空表单
    document.getElementById("clearForm").addEventListener("click", () => {
      this.clearForm();
    });

    // 搜索功能
    document.getElementById("searchInput").addEventListener("input", (e) => {
      this.filterWords();
    });

    // 过滤器
    document.getElementById("languageFilter").addEventListener("change", () => {
      this.filterWords();
    });

    document
      .getElementById("difficultyFilter")
      .addEventListener("change", () => {
        this.filterWords();
      });

    // 导入导出
    document.getElementById("importBtn").addEventListener("click", () => {
      document.getElementById("fileInput").click();
    });

    document.getElementById("fileInput").addEventListener("change", (e) => {
      this.importData(e.target.files[0]);
    });

    document.getElementById("exportBtn").addEventListener("click", () => {
      this.exportData();
    });

    // 学习模式
    document.getElementById("flashcardBtn").addEventListener("click", () => {
      this.startFlashcardMode();
    });

    document.getElementById("quizBtn").addEventListener("click", () => {
      this.startQuizMode();
    });

    document.getElementById("typingBtn").addEventListener("click", () => {
      this.startTypingMode();
    });

    // 闪卡控制
    document.getElementById("flipCard").addEventListener("click", () => {
      this.flipCard();
    });

    document.getElementById("nextCard").addEventListener("click", () => {
      this.nextCard();
    });

    document.getElementById("closeFlashcard").addEventListener("click", () => {
      this.closeStudyMode();
    });

    // 测试控制
    document.getElementById("nextQuiz").addEventListener("click", () => {
      this.nextQuiz();
    });

    document.getElementById("closeQuiz").addEventListener("click", () => {
      this.closeStudyMode();
    });

    // 打字练习控制
    document.getElementById("checkTyping").addEventListener("click", () => {
      this.checkTyping();
    });

    document.getElementById("nextTyping").addEventListener("click", () => {
      this.nextTyping();
    });

    document.getElementById("closeTyping").addEventListener("click", () => {
      this.closeStudyMode();
    });

    // 打字输入框回车事件
    document.getElementById("typingInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.checkTyping();
      }
    });
  }

  // 添加单词
  addWord() {
    const word = document.getElementById("word").value.trim();
    const translation = document.getElementById("translation").value.trim();
    const language = document.getElementById("language").value;
    const difficulty = document.getElementById("difficulty").value;
    const example = document.getElementById("example").value.trim();
    const notes = document.getElementById("notes").value.trim();

    if (!word || !translation) {
      this.showMessage("请填写单词和翻译！", "error");
      return;
    }

    // 检查是否已存在相同单词
    const existingWord = this.words.find(
      (w) =>
        w.word.toLowerCase() === word.toLowerCase() && w.language === language
    );

    if (existingWord) {
      this.showMessage("该单词已存在！", "error");
      return;
    }

    const newWord = {
      id: Date.now(),
      word,
      translation,
      language,
      difficulty,
      example,
      notes,
      createdAt: new Date().toISOString(),
      studyCount: 0,
      correctCount: 0,
    };

    this.words.push(newWord);
    this.saveWords();
    this.updateWordList();
    this.clearForm();
    this.showMessage("单词添加成功！", "success");
  }

  // 清空表单
  clearForm() {
    document.getElementById("wordForm").reset();
  }

  // 编辑单词
  editWord(wordId) {
    const word = this.words.find((w) => w.id === wordId);
    if (!word) return;

    document.getElementById("word").value = word.word;
    document.getElementById("translation").value = word.translation;
    document.getElementById("language").value = word.language;
    document.getElementById("difficulty").value = word.difficulty;
    document.getElementById("example").value = word.example || "";
    document.getElementById("notes").value = word.notes || "";

    // 滚动到表单
    document.querySelector(".word-form-section").scrollIntoView({
      behavior: "smooth",
    });
  }

  // 删除单词
  deleteWord(wordId) {
    if (confirm("确定要删除这个单词吗？")) {
      this.words = this.words.filter((w) => w.id !== wordId);
      this.saveWords();
      this.updateWordList();
      this.showMessage("单词删除成功！", "success");
    }
  }

  // 过滤单词
  filterWords() {
    const searchTerm = document
      .getElementById("searchInput")
      .value.toLowerCase();
    const languageFilter = document.getElementById("languageFilter").value;
    const difficultyFilter = document.getElementById("difficultyFilter").value;

    this.filteredWords = this.words.filter((word) => {
      const matchesSearch =
        word.word.toLowerCase().includes(searchTerm) ||
        word.translation.toLowerCase().includes(searchTerm) ||
        (word.example && word.example.toLowerCase().includes(searchTerm));
      const matchesLanguage =
        !languageFilter || word.language === languageFilter;
      const matchesDifficulty =
        !difficultyFilter || word.difficulty === difficultyFilter;

      return matchesSearch && matchesLanguage && matchesDifficulty;
    });

    this.updateWordList();
  }

  // 更新单词列表显示
  updateWordList() {
    const wordList = document.getElementById("wordList");
    const wordCount = document.getElementById("wordCount");

    wordCount.textContent = `${this.filteredWords.length} 个单词`;

    if (this.filteredWords.length === 0) {
      wordList.innerHTML =
        '<p style="text-align: center; color: #a0aec0; padding: 20px;">暂无单词</p>';
      return;
    }

    wordList.innerHTML = this.filteredWords
      .map(
        (word) => `
            <div class="word-item" data-id="${word.id}">
                <h4>${word.word}</h4>
                <p><strong>翻译:</strong> ${word.translation}</p>
                <p><strong>语言:</strong> ${word.language}</p>
                <p><strong>难度:</strong> ${this.getDifficultyText(
                  word.difficulty
                )}</p>
                ${
                  word.example
                    ? `<p><strong>例句:</strong> ${word.example}</p>`
                    : ""
                }
                <div class="word-actions">
                    <button onclick="wordSystem.editWord(${
                      word.id
                    })" class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button onclick="wordSystem.deleteWord(${
                      word.id
                    })" class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
        `
      )
      .join("");
  }

  // 更新语言过滤器选项
  updateLanguageFilter() {
    const languageFilter = document.getElementById("languageFilter");
    const languages = [...new Set(this.words.map((w) => w.language))].sort();

    languageFilter.innerHTML =
      '<option value="">所有语言</option>' +
      languages
        .map((lang) => `<option value="${lang}">${lang}</option>`)
        .join("");
  }

  // 获取难度文本
  getDifficultyText(difficulty) {
    const difficultyMap = {
      easy: "简单",
      medium: "中等",
      hard: "困难",
    };
    return difficultyMap[difficulty] || difficulty;
  }

  // 导入数据
  importData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        let importedWords = [];

        if (file.name.endsWith(".json")) {
          importedWords = JSON.parse(content);
        } else if (file.name.endsWith(".csv")) {
          importedWords = this.parseCSV(content);
        } else if (file.name.endsWith(".txt")) {
          importedWords = this.parseTXT(content);
        }

        if (Array.isArray(importedWords)) {
          // 为导入的单词添加ID和时间戳
          importedWords = importedWords.map((word) => ({
            ...word,
            id: Date.now() + Math.random(),
            createdAt: new Date().toISOString(),
            studyCount: 0,
            correctCount: 0,
          }));

          this.words.push(...importedWords);
          this.saveWords();
          this.updateWordList();
          this.updateLanguageFilter();
          this.showMessage(
            `成功导入 ${importedWords.length} 个单词！`,
            "success"
          );
        } else {
          this.showMessage("文件格式不正确！", "error");
        }
      } catch (error) {
        this.showMessage("文件解析失败！", "error");
        console.error("Import error:", error);
      }
    };

    reader.readAsText(file);
  }

  // 解析CSV文件
  parseCSV(content) {
    const lines = content.split("\n");
    const words = [];
    const headers = [
      "word",
      "translation",
      "language",
      "difficulty",
      "example",
      "notes",
    ];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      if (values.length >= 2) {
        const word = {};
        headers.forEach((header, index) => {
          word[header] = values[index] || "";
        });
        words.push(word);
      }
    }

    return words;
  }

  // 解析TXT文件（每行格式：单词|翻译|语言|难度）
  parseTXT(content) {
    const lines = content.split("\n");
    const words = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const parts = trimmedLine.split("|");
      if (parts.length >= 2) {
        words.push({
          word: parts[0].trim(),
          translation: parts[1].trim(),
          language: parts[2] ? parts[2].trim() : "英语",
          difficulty: parts[3] ? parts[3].trim() : "medium",
          example: parts[4] ? parts[4].trim() : "",
          notes: parts[5] ? parts[5].trim() : "",
        });
      }
    }

    return words;
  }

  // 导出数据
  exportData() {
    if (this.words.length === 0) {
      this.showMessage("没有数据可导出！", "error");
      return;
    }

    const dataStr = JSON.stringify(this.words, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `words_${new Date().toISOString().split("T")[0]}.json`;
    link.click();

    this.showMessage("数据导出成功！", "success");
  }

  // 开始闪卡模式
  startFlashcardMode() {
    if (this.filteredWords.length === 0) {
      this.showMessage("请先添加一些单词！", "error");
      return;
    }

    this.currentStudyMode = "flashcard";
    this.currentWordIndex = 0;
    this.showStudyMode("flashcard");
    this.showCard();
  }

  // 开始测试模式
  startQuizMode() {
    if (this.filteredWords.length === 0) {
      this.showMessage("请先添加一些单词！", "error");
      return;
    }

    this.currentStudyMode = "quiz";
    this.currentWordIndex = 0;
    this.quizScore = { correct: 0, total: 0 };
    this.showStudyMode("quiz");
    this.showQuiz();
  }

  // 开始打字练习
  startTypingMode() {
    if (this.filteredWords.length === 0) {
      this.showMessage("请先添加一些单词！", "error");
      return;
    }

    this.currentStudyMode = "typing";
    this.currentWordIndex = 0;
    this.typingScore = { correct: 0, total: 0 };
    this.showStudyMode("typing");
    this.showTyping();
  }

  // 显示学习模式
  showStudyMode(mode) {
    // 隐藏所有学习区域
    document.getElementById("flashcardArea").style.display = "none";
    document.getElementById("quizArea").style.display = "none";
    document.getElementById("typingArea").style.display = "none";

    // 显示选中的学习区域
    if (mode === "flashcard") {
      document.getElementById("flashcardArea").style.display = "block";
    } else if (mode === "quiz") {
      document.getElementById("quizArea").style.display = "block";
    } else if (mode === "typing") {
      document.getElementById("typingArea").style.display = "block";
    }
  }

  // 关闭学习模式
  closeStudyMode() {
    document.getElementById("flashcardArea").style.display = "none";
    document.getElementById("quizArea").style.display = "none";
    document.getElementById("typingArea").style.display = "none";
    this.currentStudyMode = null;
  }

  // 显示闪卡
  showCard() {
    const word = this.filteredWords[this.currentWordIndex];
    if (!word) return;

    document.getElementById("cardWord").textContent = word.word;
    document.getElementById("cardLanguage").textContent = word.language;
    document.getElementById("cardTranslation").textContent = word.translation;
    document.getElementById("cardExample").textContent =
      word.example || "暂无例句";
    document.getElementById("cardNotes").textContent = word.notes || "暂无备注";

    // 重置卡片状态
    document.querySelector(".card-front").style.display = "block";
    document.querySelector(".card-back").style.display = "none";
  }

  // 翻转卡片
  flipCard() {
    const front = document.querySelector(".card-front");
    const back = document.querySelector(".card-back");

    if (front.style.display !== "none") {
      front.style.display = "none";
      back.style.display = "block";
    } else {
      front.style.display = "block";
      back.style.display = "none";
    }
  }

  // 下一张卡片
  nextCard() {
    this.currentWordIndex =
      (this.currentWordIndex + 1) % this.filteredWords.length;
    this.showCard();
  }

  // 显示测试题
  showQuiz() {
    const word = this.filteredWords[this.currentWordIndex];
    if (!word) return;

    // 随机选择显示单词还是翻译
    const showWord = Math.random() < 0.5;

    if (showWord) {
      document.getElementById(
        "quizQuestion"
      ).textContent = `"${word.word}" 的翻译是什么？`;
      this.generateQuizOptions(word.translation, "translation");
    } else {
      document.getElementById(
        "quizQuestion"
      ).textContent = `"${word.translation}" 对应的单词是什么？`;
      this.generateQuizOptions(word.word, "word");
    }

    this.updateQuizScore();
  }

  // 生成测试选项
  generateQuizOptions(correctAnswer, type) {
    const options = [correctAnswer];

    // 添加3个错误选项
    while (options.length < 4) {
      const randomWord =
        this.filteredWords[
          Math.floor(Math.random() * this.filteredWords.length)
        ];
      const option =
        type === "translation" ? randomWord.translation : randomWord.word;

      if (!options.includes(option)) {
        options.push(option);
      }
    }

    // 打乱选项顺序
    options.sort(() => Math.random() - 0.5);

    const optionsContainer = document.getElementById("quizOptions");
    optionsContainer.innerHTML = options
      .map(
        (option) => `
            <div class="quiz-option" data-answer="${option}">${option}</div>
        `
      )
      .join("");

    // 添加点击事件
    optionsContainer.querySelectorAll(".quiz-option").forEach((option) => {
      option.addEventListener("click", () =>
        this.selectQuizOption(option, correctAnswer)
      );
    });
  }

  // 选择测试选项
  selectQuizOption(selectedOption, correctAnswer) {
    const options = document.querySelectorAll(".quiz-option");
    options.forEach((option) => {
      option.style.pointerEvents = "none";
      if (option.dataset.answer === correctAnswer) {
        option.classList.add("correct");
      } else if (option === selectedOption) {
        option.classList.add("incorrect");
      }
    });

    this.quizScore.total++;
    if (selectedOption.dataset.answer === correctAnswer) {
      this.quizScore.correct++;
      this.showMessage("回答正确！", "success");
    } else {
      this.showMessage("回答错误！", "error");
    }

    this.updateQuizScore();
  }

  // 下一题
  nextQuiz() {
    this.currentWordIndex =
      (this.currentWordIndex + 1) % this.filteredWords.length;
    this.showQuiz();
  }

  // 更新测试分数
  updateQuizScore() {
    document.getElementById(
      "quizScore"
    ).textContent = `得分: ${this.quizScore.correct}/${this.quizScore.total}`;
  }

  // 显示打字练习
  showTyping() {
    const word = this.filteredWords[this.currentWordIndex];
    if (!word) return;

    // 随机选择输入单词还是翻译
    const inputTranslation = Math.random() < 0.5;

    if (inputTranslation) {
      document.getElementById(
        "typingQuestion"
      ).textContent = `请输入 "${word.word}" 的翻译：`;
      this.currentTypingAnswer = word.translation;
    } else {
      document.getElementById(
        "typingQuestion"
      ).textContent = `请输入 "${word.translation}" 对应的单词：`;
      this.currentTypingAnswer = word.word;
    }

    document.getElementById("typingInput").value = "";
    document.getElementById("typingInput").focus();
    this.updateTypingScore();
  }

  // 检查打字答案
  checkTyping() {
    const userAnswer = document.getElementById("typingInput").value.trim();
    const correctAnswer = this.currentTypingAnswer;

    this.typingScore.total++;

    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      this.typingScore.correct++;
      this.showMessage("回答正确！", "success");
      document.getElementById("typingInput").style.borderColor = "#48bb78";
    } else {
      this.showMessage(`回答错误！正确答案是：${correctAnswer}`, "error");
      document.getElementById("typingInput").style.borderColor = "#f56565";
    }

    this.updateTypingScore();
  }

  // 下一个打字练习
  nextTyping() {
    this.currentWordIndex =
      (this.currentWordIndex + 1) % this.filteredWords.length;
    document.getElementById("typingInput").style.borderColor = "#e2e8f0";
    this.showTyping();
  }

  // 更新打字分数
  updateTypingScore() {
    document.getElementById(
      "typingScore"
    ).textContent = `得分: ${this.typingScore.correct}/${this.typingScore.total}`;
  }

  // 保存单词到本地存储
  saveWords() {
    localStorage.setItem("wordMemoryWords", JSON.stringify(this.words));
  }

  // 从本地存储加载单词
  loadWords() {
    const saved = localStorage.getItem("wordMemoryWords");
    if (saved) {
      try {
        this.words = JSON.parse(saved);
      } catch (error) {
        console.error("Error loading words:", error);
        this.words = [];
      }
    }
    this.filteredWords = [...this.words];
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

// 初始化系统
const wordSystem = new WordMemorySystem();
