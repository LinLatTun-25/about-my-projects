(function () {
  "use strict";

  const data = window.CineGoData;
  const store = window.CineGoStore;
  const view = window.CineGoRender;
  const LOCK_MS = 120000;
  const TICKET_PRICE = 14.5;

  let state = store.load();
  let ui = {
    page: "home",
    search: "",
    location: "Tokyo, JP",
    mapOpen: false,
    calendarMonthOffset: 0,
    authMode: "login",
    authName: "",
    authEmail: "",
    authPassword: "",
    selectedMovieId: data.movies.find(function (movie) { return movie.status === "now"; }).id,
    selectedShowtimeId: "",
    selectedDay: 0,
    customerName: "Guest",
    customerEmail: "guest@cinego.test",
    paymentProvider: "Card",
    promoCode: ""
  };

  function init() {
    syncLoggedInUser();
    const first = showtimes().find(function (showtime) {
      return showtime.movieId === ui.selectedMovieId && showtime.day === ui.selectedDay;
    });
    ui.selectedShowtimeId = first ? first.id : "";
    cleanupLocks();
    render();
    setInterval(tick, 1000);
  }

  function render() {
    cleanupLocks();
    view.render(model());
    bindEvents();
  }

  function model() {
    const allShowtimes = showtimes();
    const selectedMovie = data.movies.find(function (movie) {
      return movie.id === ui.selectedMovieId;
    }) || data.movies[0];
    const selectedShowtime = allShowtimes.find(function (showtime) {
      return showtime.id === ui.selectedShowtimeId;
    }) || null;
    const selectedSeats = locksForCurrentSession()
      .filter(function (lock) { return lock.showtimeId === ui.selectedShowtimeId; })
      .map(function (lock) { return lock.seat; })
      .sort(sortSeats);
    const discount = discountFor(selectedSeats.length * TICKET_PRICE);

    return {
      data: data,
      state: state,
      ui: ui,
      currentUser: currentUser(),
      days: days(),
      nowMovies: data.movies,
      comingMovies: data.movies.filter(function (movie) { return movie.status === "coming"; }),
      homeMovies: data.movies.filter(function (movie) { return movie.status === "at-home"; }),
      showtimes: allShowtimes,
      selectedMovie: selectedMovie,
      selectedShowtime: selectedShowtime,
      selectedSeats: selectedSeats,
      seatMap: seatMap(ui.selectedShowtimeId),
      ticketPrice: TICKET_PRICE,
      discount: discount
    };
  }

  function days() {
    const today = startOfDay(new Date());
    return Array.from({ length: 30 }, function (_, index) {
      const date = new Date(today.getTime() + index * 86400000);
      return {
        date: date,
        key: dateKey(date),
        short: index === 0 ? "Today" : date.toLocaleDateString(undefined, { weekday: "short" }),
        label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        long: date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
      };
    });
  }

  function showtimes() {
    const times = ["10:40 AM", "12:30 PM", "2:45 PM", "5:20 PM", "7:55 PM", "10:15 PM"];
    const formats = ["Standard", "IMAX", "Dolby", "3D", "Reserved", "Premium"];
    const availableDays = days().length;
    const result = [];

    data.movies
      .filter(function (movie) { return movie.status !== "at-home"; })
      .forEach(function (movie, movieIndex) {
        data.theaters.forEach(function (theater, theaterIndex) {
          for (let day = 0; day < availableDays; day += 1) {
            [0, 2, 4].forEach(function (slot, slotIndex) {
              const time = times[(movieIndex + theaterIndex + day + slot) % times.length];
              const format = formats[(movieIndex + slotIndex + theaterIndex) % formats.length];
              result.push({
                id: [movie.id, theater.id, day, slot].join("-"),
                movieId: movie.id,
                theaterId: theater.id,
                theaterName: theater.name,
                day: day,
                time: time,
                format: format
              });
            });
          }
        });
      });

    return result;
  }

  function bindEvents() {
    document.querySelectorAll("[data-page]").forEach(function (element) {
      element.addEventListener("click", function () {
        ui.page = element.dataset.page;
        if (ui.page === "theaters") ui.mapOpen = true;
        render();
      });
    });

    document.querySelectorAll("[data-movie]").forEach(function (element) {
      element.addEventListener("click", function () {
        selectMovie(element.dataset.movie);
      });
    });

    document.querySelectorAll("[data-showtime]").forEach(function (element) {
      element.addEventListener("click", function () {
        selectShowtime(element.dataset.showtime);
      });
    });

    document.querySelectorAll("[data-theater-pin]").forEach(function (element) {
      element.addEventListener("click", function () {
        const showtime = showtimes().find(function (item) {
          return item.theaterId === element.dataset.theaterPin && item.day === ui.selectedDay;
        });
        if (showtime) {
          selectShowtime(showtime.id);
          ui.page = "home";
          toast("Theater selected", showtime.theaterName + " showtimes are ready.");
        }
      });
    });

    document.querySelectorAll("[data-day]").forEach(function (element) {
      element.addEventListener("click", function () {
        ui.selectedDay = Number(element.dataset.day);
        ui.calendarMonthOffset = monthOffsetForDay(ui.selectedDay);
        const first = showtimes().find(function (showtime) {
          return showtime.movieId === ui.selectedMovieId && showtime.day === ui.selectedDay;
        });
        ui.selectedShowtimeId = first ? first.id : "";
        releaseCurrentLocks();
        render();
      });
    });

    document.querySelectorAll("[data-calendar-shift]").forEach(function (element) {
      element.addEventListener("click", function () {
        ui.calendarMonthOffset += Number(element.dataset.calendarShift);
        render();
      });
    });

    document.querySelectorAll("[data-seat]").forEach(function (element) {
      element.addEventListener("click", function () {
        toggleSeat(element.dataset.seat);
      });
    });

    document.querySelectorAll("[data-promo]").forEach(function (element) {
      element.addEventListener("click", function () {
        ui.promoCode = element.dataset.promo;
        toast("Offer applied", element.dataset.promo + " is ready at checkout.");
        render();
      });
    });

    document.querySelectorAll("[data-action]").forEach(function (element) {
      element.addEventListener("click", function () {
        const action = element.dataset.action;
        if (action === "search") search();
        if (action === "open-map") {
          ui.page = "theaters";
          ui.mapOpen = true;
          toast("Map opened", "Showing theaters near " + ui.location + ".");
          render();
        }
        if (action === "close-map") {
          ui.mapOpen = false;
          render();
        }
        if (action === "apply-promo") applyPromo();
        if (action === "checkout") checkout();
        if (action === "gift-card") {
          ui.promoCode = "MOVIE5";
          toast("Gift card selected", "Demo gift card selected. MOVIE5 was added to checkout.");
          ui.page = "home";
          render();
        }
        if (action === "save-account") {
          saveAccount();
        }
        if (action === "login") {
          login();
        }
        if (action === "signup") {
          signup();
        }
        if (action === "logout") {
          logout();
        }
        if (action === "show-login") {
          ui.authMode = "login";
          render();
        }
        if (action === "show-signup") {
          ui.authMode = "signup";
          render();
        }
        if (action === "reset-demo") {
          state = store.reset();
          toast("Demo cleared", "Bookings and tickets were removed.");
          render();
        }
      });
    });

    document.querySelectorAll("[data-download]").forEach(function (element) {
      element.addEventListener("click", function () {
        downloadTicket(element.dataset.download);
      });
    });

    document.querySelectorAll("[data-scan]").forEach(function (element) {
      element.addEventListener("click", function () {
        scanTicket(element.dataset.scan);
      });
    });

    document.querySelectorAll("[data-refund]").forEach(function (element) {
      element.addEventListener("click", function () {
        refundTicket(element.dataset.refund);
      });
    });

    const searchInput = document.querySelector("#search-input");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        ui.search = searchInput.value;
      });
    }

    const locationInput = document.querySelector("#location-input");
    if (locationInput) {
      locationInput.addEventListener("input", function () {
        ui.location = locationInput.value;
      });
    }

    const customerName = document.querySelector("#customer-name");
    if (customerName) {
      customerName.addEventListener("input", function () {
        ui.customerName = customerName.value;
      });
    }

    const customerEmail = document.querySelector("#customer-email");
    if (customerEmail) {
      customerEmail.addEventListener("input", function () {
        ui.customerEmail = customerEmail.value;
      });
    }

    const provider = document.querySelector("#payment-provider");
    if (provider) {
      provider.addEventListener("change", function () {
        ui.paymentProvider = provider.value;
      });
    }

    const promoCode = document.querySelector("#promo-code");
    if (promoCode) {
      promoCode.addEventListener("input", function () {
        ui.promoCode = promoCode.value.toUpperCase();
      });
    }

    const authName = document.querySelector("#auth-name");
    if (authName) {
      authName.addEventListener("input", function () {
        ui.authName = authName.value;
      });
    }

    const authEmail = document.querySelector("#auth-email");
    if (authEmail) {
      authEmail.addEventListener("input", function () {
        ui.authEmail = authEmail.value;
      });
    }

    const authPassword = document.querySelector("#auth-password");
    if (authPassword) {
      authPassword.addEventListener("input", function () {
        ui.authPassword = authPassword.value;
      });
    }
  }

  function selectMovie(movieId) {
    ui.selectedMovieId = movieId;
    ui.page = "home";
    const first = showtimes().find(function (showtime) {
      return showtime.movieId === movieId && showtime.day === ui.selectedDay;
    });
    ui.selectedShowtimeId = first ? first.id : "";
    releaseCurrentLocks();
    render();
    setTimeout(function () {
      const booking = document.querySelector("#booking");
      if (booking) booking.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function selectShowtime(showtimeId) {
    const showtime = showtimes().find(function (item) {
      return item.id === showtimeId;
    });
    if (!showtime) return;
    ui.selectedMovieId = showtime.movieId;
    ui.selectedShowtimeId = showtime.id;
    ui.selectedDay = showtime.day;
    releaseCurrentLocks();
    render();
  }

  function toggleSeat(seat) {
    if (!ui.selectedShowtimeId) return;
    cleanupLocks();
    const existing = state.locks.find(function (lock) {
      return lock.showtimeId === ui.selectedShowtimeId && lock.seat === seat && lock.sessionId === store.sessionId();
    });
    if (existing) {
      state.locks = state.locks.filter(function (lock) {
        return lock.id !== existing.id;
      });
      store.save(state);
      render();
      return;
    }
    const map = seatMap(ui.selectedShowtimeId);
    if (map[seat] === "booked" || map[seat] === "held") {
      toast("Seat unavailable", seat + " is already taken.");
      return;
    }
    if (locksForCurrentSession().filter(function (lock) { return lock.showtimeId === ui.selectedShowtimeId; }).length >= 8) {
      toast("Seat limit", "You can choose up to 8 seats.");
      return;
    }
    state.locks.push({
      id: "LOCK-" + makeId(8),
      sessionId: store.sessionId(),
      showtimeId: ui.selectedShowtimeId,
      seat: seat,
      expiresAt: Date.now() + LOCK_MS
    });
    store.save(state);
    render();
  }

  function checkout() {
    const current = model();
    const seats = current.selectedSeats;
    if (!seats.length) {
      toast("Choose seats", "Select at least one seat.");
      return;
    }
    if (!ui.customerName.trim() || !ui.customerEmail.trim()) {
      toast("Customer details needed", "Enter a name and email.");
      return;
    }
    const unavailable = seats.some(function (seat) {
      return seatMap(ui.selectedShowtimeId)[seat] !== "selected";
    });
    if (unavailable) {
      toast("Seat lock expired", "Please choose your seats again.");
      render();
      return;
    }

    const showtime = current.selectedShowtime;
    const movie = current.selectedMovie;
    const subtotal = seats.length * TICKET_PRICE;
    const total = Math.max(0, subtotal - current.discount);
    const payment = {
      id: "PAY-" + makeId(8),
      provider: ui.paymentProvider,
      total: total,
      status: "success",
      createdAt: Date.now()
    };
    const booking = {
      id: "BKG-" + makeId(8),
      movieId: movie.id,
      showtimeId: showtime.id,
      theaterName: showtime.theaterName,
      time: showtime.time,
      seats: seats,
      customerName: ui.customerName.trim(),
      customerEmail: ui.customerEmail.trim(),
      total: total,
      paymentId: payment.id,
      createdAt: Date.now(),
      status: "confirmed"
    };
    const tickets = seats.map(function (seat) {
      const id = "TKT-" + makeId(9);
      return {
        id: id,
        bookingId: booking.id,
        movieId: movie.id,
        showtimeId: showtime.id,
        theaterName: showtime.theaterName,
        time: showtime.time,
        seat: seat,
        qr: sign([id, booking.id, seat, showtime.id].join("|")),
        status: "valid",
        scanCount: 0,
        createdAt: Date.now()
      };
    });

    state.payments.push(payment);
    state.bookings.push(booking);
    state.tickets = state.tickets.concat(tickets);
    state.locks = state.locks.filter(function (lock) {
      return !(lock.showtimeId === ui.selectedShowtimeId && lock.sessionId === store.sessionId());
    });
    store.save(state);
    ui.page = "tickets";
    toast("Tickets ready", tickets.length + " QR ticket(s) issued.");
    render();
  }

  function signup() {
    const name = (ui.authName || ui.customerName).trim();
    const email = normalizeEmail(ui.authEmail || ui.customerEmail);
    const password = ui.authPassword;
    if (!name || !email || !password) {
      toast("Signup needs details", "Enter name, email, and password.");
      return;
    }
    if (!email.includes("@")) {
      toast("Email looks wrong", "Please enter a valid email address.");
      return;
    }
    if (password.length < 4) {
      toast("Password too short", "Use at least 4 characters for this demo.");
      return;
    }
    if (state.users.some(function (user) { return normalizeEmail(user.email) === email; })) {
      toast("Account exists", "Use Login for this email.");
      ui.authMode = "login";
      render();
      return;
    }
    state.users.push({
      id: "USR-" + makeId(8),
      name: name,
      email: email,
      password: password,
      createdAt: Date.now()
    });
    state.currentUserEmail = email;
    ui.customerName = name;
    ui.customerEmail = email;
    ui.authPassword = "";
    store.save(state);
    toast("Signup complete", "Welcome, " + name + ".");
    render();
  }

  function login() {
    const email = normalizeEmail(ui.authEmail || ui.customerEmail);
    const password = ui.authPassword;
    const user = state.users.find(function (item) {
      return normalizeEmail(item.email) === email && item.password === password;
    });
    if (!user) {
      toast("Login failed", "Email or password does not match.");
      return;
    }
    state.currentUserEmail = user.email;
    ui.customerName = user.name;
    ui.customerEmail = user.email;
    ui.authPassword = "";
    store.save(state);
    toast("Logged in", "Welcome back, " + user.name + ".");
    render();
  }

  function logout() {
    const user = currentUser();
    state.currentUserEmail = "";
    ui.authPassword = "";
    store.save(state);
    toast("Logged out", user ? "Goodbye, " + user.name + "." : "You are logged out.");
    render();
  }

  function saveAccount() {
    const user = currentUser();
    if (!user) {
      toast("Login first", "Signup or login before saving account details.");
      ui.authMode = "signup";
      ui.page = "signin";
      render();
      return;
    }
    user.name = ui.customerName.trim() || user.name;
    user.email = normalizeEmail(ui.customerEmail) || user.email;
    state.currentUserEmail = user.email;
    store.save(state);
    toast("Account saved", "Your demo profile is ready.");
    render();
  }

  function syncLoggedInUser() {
    const user = currentUser();
    if (!user) return;
    ui.customerName = user.name;
    ui.customerEmail = user.email;
    ui.authName = user.name;
    ui.authEmail = user.email;
  }

  function currentUser() {
    const email = normalizeEmail(state.currentUserEmail);
    if (!email) return null;
    return state.users.find(function (user) {
      return normalizeEmail(user.email) === email;
    }) || null;
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function search() {
    ui.page = "home";
    const query = normalizeText(ui.search);
    if (query) {
      const match = data.movies.find(function (movie) {
        return movieMatches(movie, query);
      });
      if (match) {
        ui.selectedMovieId = match.id;
        const first = showtimes().find(function (showtime) {
          return showtime.movieId === match.id && showtime.day === ui.selectedDay;
        });
        ui.selectedShowtimeId = first ? first.id : "";
        toast("Movie search updated", "Showing results for \"" + ui.search + "\".");
      } else {
        toast("No movie found", "No movies match \"" + ui.search + "\".");
      }
    } else {
      toast("Location updated", "Showing theaters near " + ui.location + ".");
    }
    render();
  }

  function movieMatches(movie, normalizedQuery) {
    return normalizeText(movie.title).includes(normalizedQuery) ||
      normalizeText(movie.genres.join(" ")).includes(normalizedQuery) ||
      normalizeText(movie.summary).includes(normalizedQuery);
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function applyPromo() {
    const code = ui.promoCode.trim().toUpperCase();
    if (!data.promoCodes[code]) {
      toast("Promo not found", "Try MOVIE5, POPCORN, or FAMILY10.");
      return;
    }
    ui.promoCode = code;
    toast("Promo applied", code + " discount is active.");
    render();
  }

  function refundTicket(ticketId) {
    const ticket = state.tickets.find(function (item) {
      return item.id === ticketId;
    });
    if (!ticket || ticket.status !== "valid") return;
    ticket.status = "refunded";
    const booking = state.bookings.find(function (item) {
      return item.id === ticket.bookingId;
    });
    if (booking) {
      booking.status = booking.seats.every(function (seat) {
        return state.tickets.some(function (item) {
          return item.bookingId === booking.id && item.seat === seat && item.status === "refunded";
        });
      }) ? "refunded" : "partially refunded";
    }
    store.save(state);
    toast("Refund complete", "Seat " + ticket.seat + " was refunded.");
    render();
  }

  function scanTicket(ticketId) {
    const ticket = state.tickets.find(function (item) {
      return item.id === ticketId;
    });
    if (!ticket || ticket.status !== "valid") {
      toast("Ticket rejected", "This ticket is not valid.");
      return;
    }
    ticket.scanCount += 1;
    ticket.lastScanAt = Date.now();
    store.save(state);
    toast("Ticket accepted", ticket.id + " scanned successfully.");
    render();
  }

  function downloadTicket(ticketId) {
    const ticket = state.tickets.find(function (item) {
      return item.id === ticketId;
    });
    if (!ticket) return;
    const movie = data.movies.find(function (item) {
      return item.id === ticket.movieId;
    });
    const text = [
      "CineGo Ticket",
      "Ticket: " + ticket.id,
      "Movie: " + movie.title,
      "Theater: " + ticket.theaterName,
      "Time: " + ticket.time,
      "Seat: " + ticket.seat,
      "QR: " + ticket.qr
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = ticket.id + ".txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function seatMap(showtimeId) {
    const map = {};
    data.rows.forEach(function (row) {
      data.cols.forEach(function (col) {
        map[row + col] = "available";
      });
    });
    if (!showtimeId) return map;

    state.tickets.forEach(function (ticket) {
      if (ticket.showtimeId === showtimeId && ticket.status === "valid") {
        map[ticket.seat] = "booked";
      }
    });

    state.locks.forEach(function (lock) {
      if (lock.showtimeId !== showtimeId || lock.expiresAt <= Date.now()) return;
      if (map[lock.seat] === "booked") return;
      map[lock.seat] = lock.sessionId === store.sessionId() ? "selected" : "held";
    });

    return map;
  }

  function locksForCurrentSession() {
    cleanupLocks();
    return state.locks.filter(function (lock) {
      return lock.sessionId === store.sessionId() && lock.expiresAt > Date.now();
    });
  }

  function releaseCurrentLocks() {
    state.locks = state.locks.filter(function (lock) {
      return lock.sessionId !== store.sessionId();
    });
    store.save(state);
  }

  function cleanupLocks() {
    const before = state.locks.length;
    state.locks = state.locks.filter(function (lock) {
      return lock.expiresAt > Date.now();
    });
    if (state.locks.length !== before) store.save(state);
  }

  function tick() {
    const before = state.locks.length;
    cleanupLocks();
    if (before !== state.locks.length || locksForCurrentSession().length) render();
  }

  function discountFor(subtotal) {
    const code = ui.promoCode.trim().toUpperCase();
    const discount = data.promoCodes[code] || 0;
    return Math.min(subtotal, discount);
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function dateKey(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
  }

  function monthOffsetForDay(dayIndex) {
    const today = startOfDay(new Date());
    const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayIndex);
    return (target.getFullYear() - today.getFullYear()) * 12 + target.getMonth() - today.getMonth();
  }

  function makeId(length) {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let id = "";
    for (let index = 0; index < length; index += 1) {
      id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return id;
  }

  function sign(value) {
    return "QR-" + Math.abs(hash(value + "|cinego-secret")).toString(36).toUpperCase();
  }

  function hash(value) {
    let result = 0;
    String(value).split("").forEach(function (char) {
      result = ((result << 5) - result + char.charCodeAt(0)) | 0;
    });
    return result;
  }

  function sortSeats(a, b) {
    return a.localeCompare(b, undefined, { numeric: true });
  }

  function toast(title, message) {
    const stack = document.querySelector("#toast");
    const item = document.createElement("div");
    item.className = "toast";
    item.innerHTML = '<strong>' + escapeHtml(title) + '</strong><span>' + escapeHtml(message) + '</span>';
    stack.appendChild(item);
    setTimeout(function () {
      item.classList.add("hide");
      setTimeout(function () { item.remove(); }, 250);
    }, 3000);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.CineGoTest = {
    model: model,
    setSearch: function (value) {
      ui.search = value;
      search();
    },
    goTo: function (page) {
      ui.page = page;
      if (page === "theaters") ui.mapOpen = true;
      render();
    },
    selectMovie: selectMovie,
    selectShowtime: selectShowtime,
    toggleSeat: toggleSeat,
    checkout: checkout,
    reset: function () {
      state = store.reset();
      render();
    }
  };

  init();
})();
