(() => {
  "use strict";

  const root = document.documentElement;
  const safeStore = {
    get(key, fallback = null) {
      try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch { /* private mode / blocked */ }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch { /* private mode / blocked */ }
    }
  };

  // Theme
  const themeToggle = document.querySelector("#themeToggle");
  const savedTheme = safeStore.get("bilaos-theme");
  const preferredTheme = window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  root.dataset.theme = savedTheme || preferredTheme;

  const updateThemeLabel = () => {
    const isDark = root.dataset.theme === "dark";
    themeToggle?.setAttribute("aria-label", isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
    themeToggle?.setAttribute("title", isDark ? "Bật giao diện sáng" : "Bật giao diện tối");
  };
  updateThemeLabel();

  themeToggle?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    safeStore.set("bilaos-theme", root.dataset.theme);
    updateThemeLabel();
  });

  // Course search
  const searchPanel = document.querySelector("#searchPanel");
  const searchInput = document.querySelector("#courseSearch");
  const searchResult = document.querySelector("#searchResult");
  const lessons = [...document.querySelectorAll(".lesson")];

  const openSearch = () => {
    if (!searchPanel) return;
    searchPanel.hidden = false;
    window.setTimeout(() => searchInput?.focus(), 0);
  };
  const closeSearch = () => {
    if (!searchPanel) return;
    searchPanel.hidden = true;
    lessons.forEach((lesson) => lesson.classList.remove("filtered-out", "search-hit"));
    if (searchInput) searchInput.value = "";
  };

  document.querySelector("#searchToggle")?.addEventListener("click", openSearch);
  document.querySelector("#closeSearch")?.addEventListener("click", closeSearch);
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
    if (event.key === "Escape" && searchPanel && !searchPanel.hidden) closeSearch();
  });

  const normalize = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  searchInput?.addEventListener("input", () => {
    const query = normalize(searchInput.value.trim());
    if (!query) {
      lessons.forEach((lesson) => lesson.classList.remove("filtered-out", "search-hit"));
      if (searchResult) searchResult.textContent = "Nhập từ khóa để lọc nội dung.";
      return;
    }

    let matches = 0;
    lessons.forEach((lesson) => {
      const haystack = normalize(`${lesson.dataset.title || ""} ${lesson.textContent || ""}`);
      const hit = haystack.includes(query);
      lesson.classList.toggle("filtered-out", !hit);
      lesson.classList.toggle("search-hit", hit);
      if (hit) matches += 1;
    });
    if (searchResult) searchResult.textContent = `Tìm thấy ${matches} bài học phù hợp.`;
  });

  // Lesson progress
  const progressKey = "bilaos-course-progress-v1";
  let progress = {};
  try { progress = JSON.parse(safeStore.get(progressKey, "{}")) || {}; } catch { progress = {}; }

  const checkboxes = [...document.querySelectorAll(".lesson-check")];
  const progressBar = document.querySelector("#progressBar");
  const progressText = document.querySelector("#progressText");

  const renderProgress = () => {
    let completed = 0;
    checkboxes.forEach((checkbox) => {
      const isDone = Boolean(progress[checkbox.dataset.lesson]);
      checkbox.checked = isDone;
      checkbox.closest(".lesson")?.classList.toggle("is-complete", isDone);
      if (isDone) completed += 1;
    });
    const percentage = checkboxes.length ? Math.round((completed / checkboxes.length) * 100) : 0;
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${completed}/${checkboxes.length} bài`;
  };

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      progress[checkbox.dataset.lesson] = checkbox.checked;
      safeStore.set(progressKey, JSON.stringify(progress));
      renderProgress();
    });
  });

  document.querySelector("#resetProgress")?.addEventListener("click", () => {
    progress = {};
    safeStore.remove(progressKey);
    renderProgress();
  });
  renderProgress();

  // Build profile selector
  const profileData = {
    mini: [
      ["Mục tiêu", "Đế hai bánh trong nhà"],
      ["Điện áp", "Ưu tiên ≤ 12 V"],
      ["Điều khiển", "iPhone → BLE MCU"],
      ["Mốc đầu tiên", "Manual drive + watchdog"]
    ],
    robart: [
      ["Mục tiêu", "Đế tải trọng lớn"],
      ["Điện áp", "Năng lượng cao—chuyên gia"],
      ["Điều khiển", "ARKit + BLE + teleop"],
      ["Mốc đầu tiên", "Chứng minh trên Mini trước"]
    ],
    arm: [
      ["Mục tiêu", "Gắp / đặt vật thể"],
      ["Không gian", "Joint + end-effector"],
      ["Điều khiển", "Pose iPhone → IK"],
      ["Mốc đầu tiên", "Teleop + 20–50 episode"]
    ]
  };
  const profileOutput = document.querySelector("#profileOutput");
  document.querySelectorAll(".profile").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".profile").forEach((item) => {
        item.classList.toggle("active", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });
      const selected = profileData[button.dataset.profile];
      if (!profileOutput || !selected) return;
      profileOutput.replaceChildren(...selected.map(([label, value]) => {
        const cell = document.createElement("div");
        const name = document.createElement("span");
        const content = document.createElement("b");
        name.textContent = label;
        content.textContent = value;
        cell.append(name, content);
        return cell;
      }));
    });
  });

  // Research source atlas filters.
  const sourceCards = [...document.querySelectorAll(".source-grid [data-category]")];
  document.querySelectorAll("[data-source-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.sourceFilter;
      document.querySelectorAll("[data-source-filter]").forEach((item) => {
        const selected = item === button;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      sourceCards.forEach((card) => {
        card.classList.toggle("source-hidden", filter !== "all" && card.dataset.category !== filter);
      });
    });
  });

  // Copy buttons, with a fallback for non-secure localhost contexts.
  const copyText = async (text) => {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  };

  document.querySelectorAll(".copy-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.closest(".code-window")?.querySelector("code")?.textContent || "";
      const original = button.textContent;
      try {
        await copyText(code.trim());
        button.textContent = "Đã chép ✓";
      } catch {
        button.textContent = "Không thể chép";
      }
      window.setTimeout(() => { button.textContent = original; }, 1600);
    });
  });

  // Teleoperation E-stop demonstration.
  const estopButton = document.querySelector("#estopDemo");
  const systemStatus = document.querySelector("#systemStatus");
  estopButton?.addEventListener("click", () => {
    const stopped = systemStatus?.classList.toggle("stopped");
    if (systemStatus) {
      systemStatus.querySelector("span").textContent = stopped
        ? "Demo: E-stop đã chốt · motor = 0"
        : "Demo: hệ thống sẵn sàng";
    }
    estopButton.textContent = stopped ? "RESET" : "STOP";
  });

  // Active lesson in the sticky table of contents.
  if ("IntersectionObserver" in window) {
    const navLinks = new Map([...document.querySelectorAll(".course-nav a")].map((link) => [link.hash.slice(1), link]));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link, id) => link.classList.toggle("active", id === visible.target.id));
    }, { rootMargin: "-20% 0px -65%", threshold: [0, .15, .4] });
    lessons.forEach((lesson) => observer.observe(lesson));
  }

  // Quiz
  const quizForm = document.querySelector("#quizForm");
  quizForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const questions = [...quizForm.querySelectorAll("fieldset")];
    let score = 0;
    let answered = 0;
    questions.forEach((question) => {
      const selected = question.querySelector("input:checked")?.value;
      const correct = selected === question.dataset.answer;
      question.classList.toggle("correct", correct);
      question.classList.toggle("wrong", Boolean(selected) && !correct);
      if (selected) answered += 1;
      if (correct) score += 1;
    });
    const scoreNode = document.querySelector("#quizScore b");
    const feedback = document.querySelector("#quizFeedback");
    if (scoreNode) scoreNode.textContent = String(score);
    if (feedback) {
      feedback.textContent = answered < questions.length
        ? `Bạn còn ${questions.length - answered} câu chưa trả lời.`
        : score === questions.length
          ? "Đạt 5/5. Hãy vẫn hoàn thành toàn bộ checklist phần cứng trước khi đặt robot xuống sàn."
          : `Đạt ${score}/5. Xem lại các bài có khung màu đỏ rồi thử lại.`;
    }
  });
})();
