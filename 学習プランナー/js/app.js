"use strict";

const DATA_URL = "data/study-data.json";
const STORAGE_KEY = "focusTrailState";

const fallbackData = {
    subjects: ["JavaScript", "HTML/CSS", "資格試験", "英語", "数学"],
    tasks: [
        {
            id: "task-001",
            title: "配列メソッドの復習",
            subject: "JavaScript",
            due: "2026-06-19",
            minutes: 25,
            priority: "high",
            description: "filter、map、reduceを使った小問を3つ解く。"
        },
        {
            id: "task-002",
            title: "レスポンシブ確認",
            subject: "HTML/CSS",
            due: "2026-06-19",
            minutes: 20,
            priority: "medium",
            description: "スマホ幅で文字がはみ出していないか確認する。"
        },
        {
            id: "task-003",
            title: "レスポンシブ確認",
            subject: "HTML/CSS",
            due: "2026-06-19",
            minutes: 20,
            priority: "medium",
            description: "スマホ幅で文字がはみ出していないか確認する。"
        },
        {
            id: "task-004",
            title: "タブレット表示の確認",
            subject: "HTML/CSS",
            due: "2026-06-19",
            minutes: 20,
            priority: "medium",
            description: "カードやボタンが横幅に合わせて自然に並ぶか確認する。"
        },
        {
            id: "task-005",
            title: "フォーム入力チェック",
            subject: "JavaScript",
            due: "2026-06-20",
            minutes: 25,
            priority: "high",
            description: "空欄や短すぎる入力を防ぐ処理が動くか確認する。"
        },
        {
            id: "task-006",
            title: "JSON読み込み確認",
            subject: "JavaScript",
            due: "2026-06-20",
            minutes: 20,
            priority: "high",
            description: "fetchで読み込んだデータが画面に正しく表示されるか確認する。"
        },
        {
            id: "task-007",
            title: "例外処理のメモ作成",
            subject: "JavaScript",
            due: "2026-06-20",
            minutes: 30,
            priority: "high",
            description: "try...catchの使いどころを自分の言葉でまとめる。"
        },
        {
            id: "task-008",
            title: "確認テスト",
            subject: "資格試験",
            due: "2026-06-21",
            minutes: 45,
            priority: "medium",
            description: "間違えた問題をチェックして、次の復習タスクに追加する。"
        },
        {
            id: "task-009",
            title: "単語カード",
            subject: "英語",
            due: "2026-06-22",
            minutes: 15,
            priority: "low",
            description: "覚えにくい単語を10個だけ短時間で見直す。"
        },
        {
            id: "task-010",
            title: "計算問題の反復",
            subject: "数学",
            due: "2026-06-22",
            minutes: 35,
            priority: "medium",
            description: "解き方を声に出しながら、類題を5問解く。"
        }
    ],
    quotes: [
        { text: "小さく始めて、確実に終わらせる。", author: "Focus Trail" },
        { text: "集中は準備から作れる。", author: "Study Note" }
    ]
};

const elements = {
    alert: document.querySelector("#alert"),
    currentDate: document.querySelector("#currentDate"),
    taskCount: document.querySelector("#taskCount"),
    completedCount: document.querySelector("#completedCount"),
    minutesCount: document.querySelector("#minutesCount"),
    progressBar: document.querySelector("#progressBar"),
    progressLabel: document.querySelector("#progressLabel"),
    goalLabel: document.querySelector("#goalLabel"),
    dailyGoalText: document.querySelector("#dailyGoalText"),
    focusQuote: document.querySelector("#focusQuote"),
    focusQuoteAuthor: document.querySelector("#focusQuoteAuthor"),
    searchInput: document.querySelector("#searchInput"),
    subjectFilter: document.querySelector("#subjectFilter"),
    sortSelect: document.querySelector("#sortSelect"),
    modeButtons: document.querySelectorAll(".mode-button"),
    taskList: document.querySelector("#taskList"),
    emptyState: document.querySelector("#emptyState"),
    customTaskForm: document.querySelector("#customTaskForm"),
    customTitle: document.querySelector("#customTitle"),
    customSubject: document.querySelector("#customSubject"),
    customMinutes: document.querySelector("#customMinutes"),
    customPriority: document.querySelector("#customPriority"),
    focusForm: document.querySelector("#focusForm"),
    goalLabelInput: document.querySelector("#goalLabelInput"),
    goalTextInput: document.querySelector("#goalTextInput"),
    quoteInput: document.querySelector("#quoteInput"),
    quoteAuthorInput: document.querySelector("#quoteAuthorInput"),
    resetFocusText: document.querySelector("#resetFocusText"),
    timerTaskName: document.querySelector("#timerTaskName"),
    timerTaskMeta: document.querySelector("#timerTaskMeta"),
    timerDisplay: document.querySelector("#timerDisplay"),
    timerProgress: document.querySelector("#timerProgress"),
    startTimer: document.querySelector("#startTimer"),
    pauseTimer: document.querySelector("#pauseTimer"),
    resetTimer: document.querySelector("#resetTimer"),
    noteInput: document.querySelector("#noteInput"),
    saveNote: document.querySelector("#saveNote"),
    noteStatus: document.querySelector("#noteStatus"),
    toast: document.querySelector("#toast")
};

const applicationState = {
    subjects: [],
    tasks: [],
    customTasks: [],
    completedTaskIds: new Set(),
    deletedTaskIds: new Set(),
    selectedTaskId: "",
    searchWord: "",
    subjectFilter: "all",
    sortMode: "priority",
    viewMode: "all",
    timerIntervalId: null,
    timerSecondsLeft: 25 * 60,
    timerSecondsTotal: 25 * 60,
    notes: "",
    customGoalLabel: "",
    customGoalText: "",
    customQuoteText: "",
    customQuoteAuthor: "",
    quotes: []
};

document.addEventListener("DOMContentLoaded", initializeApplication);

async function initializeApplication() {
    elements.currentDate.textContent = formatLongDate(new Date());
    loadSavedState();

    // AJAXで外部JSONを読み込み、失敗時は予備データで画面を維持します。
    const studyData = await loadStudyData();
    applicationState.subjects = studyData.subjects;
    applicationState.tasks = studyData.tasks;
    applicationState.quotes = studyData.quotes;

    bindEvents();
    renderSubjectOptions();
    renderAll();
}

async function loadStudyData() {
    try {
        const response = await fetch(DATA_URL, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        validateStudyData(data);
        return data;
    } catch (error) {
        if (window.location.protocol !== "file:") {
            showAlert("JSONを読み込めなかったため、予備データで起動しています。");
        }

        console.warn("Study data loading failed:", error);
        return fallbackData;
    }
}

function validateStudyData(data) {
    const isValid = Array.isArray(data.subjects) && Array.isArray(data.tasks) && Array.isArray(data.quotes);

    if (!isValid) {
        throw new Error("JSONの形式が正しくありません。");
    }
}

function bindEvents() {
    elements.searchInput.addEventListener("input", () => {
        applicationState.searchWord = elements.searchInput.value.trim().toLowerCase();
        renderTasks();
    });

    elements.subjectFilter.addEventListener("change", () => {
        applicationState.subjectFilter = elements.subjectFilter.value;
        renderTasks();
    });

    elements.sortSelect.addEventListener("change", () => {
        applicationState.sortMode = elements.sortSelect.value;
        renderTasks();
    });

    elements.modeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            applicationState.viewMode = button.dataset.mode;
            elements.modeButtons.forEach((modeButton) => modeButton.classList.remove("is-active"));
            button.classList.add("is-active");
            renderTasks();
        });
    });

    elements.taskList.addEventListener("click", handleTaskAction);
    elements.customTaskForm.addEventListener("submit", handleCustomTaskSubmit);
    elements.focusForm.addEventListener("submit", handleFocusFormSubmit);
    elements.resetFocusText.addEventListener("click", resetFocusText);
    elements.startTimer.addEventListener("click", startTimer);
    elements.pauseTimer.addEventListener("click", pauseTimer);
    elements.resetTimer.addEventListener("click", resetTimer);
    elements.saveNote.addEventListener("click", saveNote);
}

function renderAll() {
    elements.noteInput.value = applicationState.notes;
    renderFocusInputs();
    renderSummary();
    renderQuote();
    renderTimer();
    renderTasks();
}

function renderSubjectOptions() {
    const allOption = new Option("すべて", "all");
    elements.subjectFilter.replaceChildren(allOption);

    applicationState.subjects.forEach((subject) => {
        elements.subjectFilter.append(new Option(subject, subject));
        elements.customSubject.append(new Option(subject, subject));
    });
}

function renderSummary() {
    const tasks = getAllTasks();
    // 配列メソッドで完了数と合計時間を集計します。
    const completedTasks = tasks.filter((task) => isCompleted(task.id));
    const completedMinutes = completedTasks.reduce((total, task) => total + task.minutes, 0);
    const percentage = tasks.length === 0 ? 0 : Math.round((completedTasks.length / tasks.length) * 100);
    const todayTasks = tasks.filter((task) => isToday(task.due));
    const todayCompletedTasks = todayTasks.filter((task) => isCompleted(task.id));

    elements.taskCount.textContent = tasks.length;
    elements.completedCount.textContent = completedTasks.length;
    elements.minutesCount.textContent = completedMinutes;
    elements.progressBar.style.width = `${percentage}%`;
    elements.progressLabel.textContent = `${percentage}%`;
    elements.goalLabel.textContent = applicationState.customGoalLabel || "今日の目標";
    elements.dailyGoalText.textContent = applicationState.customGoalText || `${todayCompletedTasks.length} / ${todayTasks.length} 完了`;
}

function renderQuote() {
    if (applicationState.customQuoteText !== "") {
        elements.focusQuote.textContent = applicationState.customQuoteText;
        elements.focusQuoteAuthor.textContent = applicationState.customQuoteAuthor;
        return;
    }

    if (applicationState.quotes.length === 0) {
        elements.focusQuote.textContent = "";
        elements.focusQuoteAuthor.textContent = "";
        return;
    }

    const quoteIndex = new Date().getDate() % applicationState.quotes.length;
    const quote = applicationState.quotes[quoteIndex];
    elements.focusQuote.textContent = quote.text;
    elements.focusQuoteAuthor.textContent = quote.author;
}

function renderFocusInputs() {
    elements.goalLabelInput.value = applicationState.customGoalLabel;
    elements.goalTextInput.value = applicationState.customGoalText;
    elements.quoteInput.value = applicationState.customQuoteText;
    elements.quoteAuthorInput.value = applicationState.customQuoteAuthor;
}

function renderTasks() {
    const filteredTasks = getFilteredTasks();
    elements.taskList.replaceChildren();
    elements.emptyState.hidden = filteredTasks.length !== 0;

    filteredTasks.forEach((task) => {
        elements.taskList.append(createTaskCard(task));
    });

    renderSummary();
}

function createTaskCard(task) {
    const completed = isCompleted(task.id);
    const card = document.createElement("article");
    card.className = `task-card priority-${task.priority}${completed ? " is-completed" : ""}`;
    card.dataset.taskId = task.id;

    const titleRow = document.createElement("div");
    titleRow.className = "task-title-row";

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title;

    const checkmark = document.createElement("span");
    checkmark.className = "checkmark";
    checkmark.textContent = completed ? "✓" : "";
    checkmark.setAttribute("aria-hidden", "true");

    titleRow.append(title, checkmark);

    const description = document.createElement("p");
    description.className = "task-description";
    description.textContent = task.description;

    const meta = document.createElement("div");
    meta.className = "task-meta";
    [task.subject, formatShortDate(task.due), `${task.minutes}分`, getPriorityLabel(task.priority)].forEach((item) => {
        const tag = document.createElement("span");
        tag.textContent = item;
        meta.append(tag);
    });

    const actions = document.createElement("div");
    actions.className = "task-actions";
    actions.append(
        createTaskButton(completed ? "未完了" : "完了", "toggle", completed ? "" : "primary"),
        createTaskButton("選択", "select", ""),
        createTaskButton("削除", "delete", "danger")
    );

    card.append(titleRow, description, meta, actions);
    return card;
}

function createTaskButton(label, action, className) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `task-button ${className}`.trim();
    button.dataset.action = action;
    button.textContent = label;
    return button;
}

function getFilteredTasks() {
    const priorityRank = { high: 1, medium: 2, low: 3 };
    const searchWord = applicationState.searchWord;

    // 検索、科目、表示モード、並び替えをまとめて処理します。
    return getAllTasks()
        .filter((task) => {
            const text = `${task.title} ${task.subject} ${task.description}`.toLowerCase();
            const matchesSearch = searchWord === "" || text.includes(searchWord);
            const matchesSubject = applicationState.subjectFilter === "all" || task.subject === applicationState.subjectFilter;
            const matchesMode = isMatchingViewMode(task);
            return matchesSearch && matchesSubject && matchesMode;
        })
        .sort((firstTask, secondTask) => {
            if (applicationState.sortMode === "due") {
                return firstTask.due.localeCompare(secondTask.due);
            }

            if (applicationState.sortMode === "minutes") {
                return firstTask.minutes - secondTask.minutes;
            }

            return priorityRank[firstTask.priority] - priorityRank[secondTask.priority] || firstTask.due.localeCompare(secondTask.due);
        });
}

function isMatchingViewMode(task) {
    if (applicationState.viewMode === "today") {
        return isToday(task.due);
    }

    if (applicationState.viewMode === "high") {
        return task.priority === "high";
    }

    if (applicationState.viewMode === "completed") {
        return isCompleted(task.id);
    }

    return true;
}

function getAllTasks() {
    return [...applicationState.tasks, ...applicationState.customTasks].filter((task) => {
        return !applicationState.deletedTaskIds.has(task.id);
    });
}

function handleTaskAction(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const taskId = button.closest(".task-card").dataset.taskId;
    const task = getAllTasks().find((candidateTask) => candidateTask.id === taskId);

    if (!task) {
        showToast("タスクが見つかりません。");
        return;
    }

    if (button.dataset.action === "toggle") {
        toggleTaskCompletion(task.id);
        return;
    }

    if (button.dataset.action === "select") {
        selectTimerTask(task);
        return;
    }

    if (button.dataset.action === "delete") {
        deleteTask(task.id);
    }
}

function toggleTaskCompletion(taskId) {
    if (applicationState.completedTaskIds.has(taskId)) {
        applicationState.completedTaskIds.delete(taskId);
    } else {
        applicationState.completedTaskIds.add(taskId);
    }

    saveState();
    renderTasks();
}

function handleCustomTaskSubmit(event) {
    event.preventDefault();

    const title = elements.customTitle.value.trim();
    const minutes = Number(elements.customMinutes.value);

    if (title === "" || Number.isNaN(minutes) || minutes < 5) {
        showToast("タイトルと時間を確認してください。");
        return;
    }

    const customTask = {
        id: `custom-${Date.now()}`,
        title,
        subject: elements.customSubject.value,
        due: formatDateKey(new Date()),
        minutes,
        priority: elements.customPriority.value,
        description: "自分で追加した学習タスクです。",
        custom: true
    };

    applicationState.customTasks.push(customTask);
    elements.customTaskForm.reset();
    elements.customMinutes.value = 25;
    elements.customPriority.value = "medium";
    saveState();
    renderTasks();
    showToast("タスクを追加しました。");
}

function handleFocusFormSubmit(event) {
    event.preventDefault();
    applicationState.customGoalLabel = elements.goalLabelInput.value.trim();
    applicationState.customGoalText = elements.goalTextInput.value.trim();
    applicationState.customQuoteText = elements.quoteInput.value.trim();
    applicationState.customQuoteAuthor = elements.quoteAuthorInput.value.trim();

    saveState();
    renderSummary();
    renderQuote();
    showToast("表示を変更しました。");
}

function resetFocusText() {
    applicationState.customGoalLabel = "";
    applicationState.customGoalText = "";
    applicationState.customQuoteText = "";
    applicationState.customQuoteAuthor = "";

    saveState();
    renderFocusInputs();
    renderSummary();
    renderQuote();
    showToast("自動表示に戻しました。");
}

function deleteTask(taskId) {
    const task = getAllTasks().find((candidateTask) => candidateTask.id === taskId);

    if (!task) {
        showToast("タスクが見つかりません。");
        return;
    }

    if (task.custom) {
        applicationState.customTasks = applicationState.customTasks.filter((customTask) => customTask.id !== taskId);
    } else {
        applicationState.deletedTaskIds.add(taskId);
    }

    applicationState.completedTaskIds.delete(taskId);

    if (applicationState.selectedTaskId === taskId) {
        applicationState.selectedTaskId = "";
        applicationState.timerSecondsTotal = 25 * 60;
        resetTimer();
    }

    saveState();
    renderTasks();
    showToast("タスクを削除しました。");
}

function selectTimerTask(task) {
    applicationState.selectedTaskId = task.id;
    applicationState.timerSecondsTotal = task.minutes * 60;
    applicationState.timerSecondsLeft = applicationState.timerSecondsTotal;
    pauseTimer();
    renderTimer();
    saveState();
}

function startTimer() {
    if (applicationState.timerIntervalId !== null) {
        return;
    }

    applicationState.timerIntervalId = window.setInterval(() => {
        applicationState.timerSecondsLeft -= 1;
        renderTimer();

        if (applicationState.timerSecondsLeft <= 0) {
            finishTimer();
        }
    }, 1000);
}

function pauseTimer() {
    window.clearInterval(applicationState.timerIntervalId);
    applicationState.timerIntervalId = null;
}

function resetTimer() {
    pauseTimer();
    applicationState.timerSecondsLeft = applicationState.timerSecondsTotal;
    renderTimer();
}

function finishTimer() {
    const selectedTask = getSelectedTask();
    pauseTimer();
    applicationState.timerSecondsLeft = 0;

    if (selectedTask) {
        applicationState.completedTaskIds.add(selectedTask.id);
        saveState();
        showToast("集中タイマーが完了しました。");
    }

    renderAll();
}

function renderTimer() {
    const selectedTask = getSelectedTask();

    if (selectedTask) {
        elements.timerTaskName.textContent = selectedTask.title;
        elements.timerTaskMeta.textContent = `${selectedTask.subject} / ${selectedTask.minutes}分`;
    } else {
        elements.timerTaskName.textContent = "タスクを選択";
        elements.timerTaskMeta.textContent = "カードの「選択」から開始できます。";
    }

    const minutes = Math.floor(applicationState.timerSecondsLeft / 60);
    const seconds = applicationState.timerSecondsLeft % 60;
    const elapsed = applicationState.timerSecondsTotal - applicationState.timerSecondsLeft;
    const percentage = applicationState.timerSecondsTotal === 0 ? 0 : Math.round((elapsed / applicationState.timerSecondsTotal) * 100);

    elements.timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    elements.timerProgress.style.width = `${percentage}%`;
}

function getSelectedTask() {
    return getAllTasks().find((task) => task.id === applicationState.selectedTaskId);
}

function saveNote() {
    applicationState.notes = elements.noteInput.value;
    saveState();
    elements.noteStatus.textContent = "保存しました。";
    window.setTimeout(() => {
        elements.noteStatus.textContent = "";
    }, 1800);
}

function loadSavedState() {
    try {
        const savedText = localStorage.getItem(STORAGE_KEY);

        if (!savedText) {
            return;
        }

        const savedState = JSON.parse(savedText);
        applicationState.customTasks = Array.isArray(savedState.customTasks) ? savedState.customTasks : [];
        applicationState.completedTaskIds = new Set(Array.isArray(savedState.completedTaskIds) ? savedState.completedTaskIds : []);
        applicationState.deletedTaskIds = new Set(Array.isArray(savedState.deletedTaskIds) ? savedState.deletedTaskIds : []);
        applicationState.selectedTaskId = savedState.selectedTaskId || "";
        applicationState.notes = savedState.notes || "";
        applicationState.customGoalLabel = savedState.customGoalLabel || "";
        applicationState.customGoalText = savedState.customGoalText || "";
        applicationState.customQuoteText = savedState.customQuoteText || "";
        applicationState.customQuoteAuthor = savedState.customQuoteAuthor || "";
    } catch (error) {
        console.warn("Saved state loading failed:", error);
        showToast("保存データを初期化しました。");
    }
}

function saveState() {
    try {
        // Setはそのまま保存できないため、配列に変換してlocalStorageへ保存します。
        const savedState = {
            customTasks: applicationState.customTasks,
            completedTaskIds: [...applicationState.completedTaskIds],
            deletedTaskIds: [...applicationState.deletedTaskIds],
            selectedTaskId: applicationState.selectedTaskId,
            notes: applicationState.notes,
            customGoalLabel: applicationState.customGoalLabel,
            customGoalText: applicationState.customGoalText,
            customQuoteText: applicationState.customQuoteText,
            customQuoteAuthor: applicationState.customQuoteAuthor
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
    } catch (error) {
        console.warn("Saved state writing failed:", error);
        showToast("保存に失敗しました。");
    }
}

function isCompleted(taskId) {
    return applicationState.completedTaskIds.has(taskId);
}

function isToday(dateKey) {
    return dateKey === formatDateKey(new Date());
}

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatShortDate(dateKey) {
    const date = new Date(`${dateKey}T00:00:00`);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatLongDate(date) {
    return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short"
    }).format(date);
}

function getPriorityLabel(priority) {
    const labels = {
        high: "優先度: 高",
        medium: "優先度: 中",
        low: "優先度: 低"
    };

    return labels[priority] || "優先度: 未設定";
}

function showAlert(message) {
    elements.alert.textContent = message;
    elements.alert.hidden = false;
}

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.hidden = false;

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
        elements.toast.hidden = true;
    }, 2200);
}
