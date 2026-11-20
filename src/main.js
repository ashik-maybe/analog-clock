/** Clock behavior: theme, dial furniture, quartz tick, time text, PWA registration. */
            (() => {
                const $ = (id) => document.getElementById(id);
                const root = document.documentElement;
                const hSec = $("hSec"),
                    hMin = $("hMin"),
                    hHour = $("hHour"),
                    metaTheme = $("metaTheme"),
                    a11yTime = $("a11yTime");

                const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;

                /* ================= theme ================= */
                const mq = matchMedia("(prefers-color-scheme: dark)");
                const store = (k, v) => {
                    try {
                        localStorage.setItem(k, v);
                    } catch {}
                };
                const read = (k) => {
                    try {
                        return localStorage.getItem(k);
                    } catch {
                        return null;
                    }
                };

                function setTheme(t, save) {
                    root.dataset.theme = t;
                    if (save) store("clock-theme", t);
                    metaTheme.content = t === "dark" ? "#0a0b0d" : "#e4e7ec";
                    $("themeBtn").setAttribute("aria-pressed", String(t === "dark"));
                }
                function toggleTheme() {
                    setTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
                }
                setTheme(root.dataset.theme || "light", false); // sync meta tag
                $("themeBtn").addEventListener("click", toggleTheme);
                document.addEventListener("keydown", (e) => {
                    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
                    const target = e.target;
                    const tag = target && target.tagName;
                    if (
                        tag === "INPUT" ||
                        tag === "TEXTAREA" ||
                        tag === "SELECT" ||
                        (target && target.isContentEditable)
                    )
                        return;
                    if (e.key === "t" || e.key === "T") {
                        e.preventDefault();
                        toggleTheme();
                    }
                });
                mq.addEventListener("change", (e) => {
                    // follow device until user chooses
                    if (!read("clock-theme")) setTheme(e.matches ? "dark" : "light", false);
                });

                /* ================= dial furniture ================= */
                const ticks = $("ticks");
                for (let i = 0; i < 60; i++) {
                    const major = i % 5 === 0;
                    const len = major ? 3 : 2.6,
                        w = major ? 3.2 : 0.8,
                        rout = 43;
                    const t = document.createElement("div");
                    t.className = "tick " + (major ? "major" : "minor");
                    t.style.height = len + "cqw";
                    if (major) t.style.width = w + "cqw";
                    t.style.transform = `translate(-50%,-50%) rotate(${i * 6}deg) translateY(-${(rout - len / 2).toFixed(2)}cqw)`;
                    ticks.appendChild(t);
                }
                const nums = $("numerals");
                for (let i = 1; i <= 12; i++) {
                    const a = (i * 30 * Math.PI) / 180;
                    const n = document.createElement("div");
                    n.className = "numeral";
                    n.textContent = i;
                    n.style.transform = `translate(calc(-50% + ${(Math.sin(a) * 33.5).toFixed(2)}cqw), calc(-50% + ${(-Math.cos(a) * 33.5).toFixed(2)}cqw))`;
                    nums.appendChild(n);
                }

                /* ================= movement: quartz step (1Hz) ================= */
                let booting = !RM;
                function setHands(now) {
                    const s = now.getSeconds();
                    const m = now.getMinutes() + s / 60;
                    const h = (now.getHours() % 12) + m / 60;
                    hHour.style.transform = `rotate(${(h * 30).toFixed(3)}deg)`;
                    hMin.style.transform = `rotate(${(m * 6).toFixed(3)}deg)`;
                    hSec.style.transform = `rotate(${(s * 6).toFixed(2)}deg)`;
                }

                /* ================= formatters ================= */
                const fTime = new Intl.DateTimeFormat(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                });
                const fWd = new Intl.DateTimeFormat(undefined, { weekday: "short" });
                const fMd = new Intl.DateTimeFormat(undefined, {
                    month: "short",
                    day: "numeric",
                });

                /* ================= time text (cached per minute) ================= */
                let lastMinuteKey = "";
                function updateTimeText(now) {
                    const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
                    if (key === lastMinuteKey) return;
                    lastMinuteKey = key;
                    const text = `${fWd.format(now)} · ${fMd.format(now)} · ${fTime.format(now)}`;
                    document.title = text;
                    a11yTime.textContent = text;
                    a11yTime.dateTime = now.toISOString();
                }

                function sync() {
                    const now = new Date();
                    if (!booting) setHands(now);
                    updateTimeText(now);
                }

                if (booting) {
                    [hHour, hMin, hSec].forEach((el) => el.classList.add("boot"));
                    requestAnimationFrame(() => requestAnimationFrame(() => setHands(new Date())));
                    setTimeout(() => {
                        booting = false;
                        [hHour, hMin, hSec].forEach((el) => el.classList.remove("boot"));
                        sync();
                    }, 1250);
                }

                /* ================= heartbeat ================= */
                function tick() {
                    sync();
                    scheduleTick();
                }
                function scheduleTick() {
                    setTimeout(tick, 1000 - (Date.now() % 1000) + 20);
                }

                document.addEventListener("visibilitychange", () => {
                    if (!document.hidden) sync();
                });

                sync();
                scheduleTick();
            })();

            if (import.meta.env.PROD && "serviceWorker" in navigator) {
                window.addEventListener("load", () =>
                    navigator.serviceWorker
                        .register(`${import.meta.env.BASE_URL}sw.js`)
                        .catch(() => {})
                );
            } else if (import.meta.env.DEV && "serviceWorker" in navigator) {
                navigator.serviceWorker
                    .getRegistrations()
                    .then((rs) => rs.forEach((r) => r.unregister()));
                if (window.caches) caches.keys().then((keys) => keys.forEach((k) => k.startsWith("cache-clock-") && caches.delete(k)));
            }
