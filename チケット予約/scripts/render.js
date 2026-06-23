(function () {
  "use strict";

  window.CineGoRender = {
    render: render
  };

  function render(model) {
    document.querySelector("#app").innerHTML = shell(model);
  }

  function shell(model) {
    return [
      '<header class="site-header">',
      '<div class="utility-bar"><div class="wrap utility-inner"><button class="utility-link" data-page="giftcards">Gift Cards</button><button class="utility-link" data-page="offers">Offers</button><button class="utility-link" data-page="fanclub">FanClub</button><button class="utility-link" data-page="help">Help</button></div></div>',
      '<div class="wrap nav-row">',
      '<button class="logo" data-page="home"><span class="logo-mark">CG</span><span>CineGo</span></button>',
      '<nav class="nav-links">',
      navButton(model, "home", "Movies"),
      navButton(model, "theaters", "Theaters"),
      navButton(model, "offers", "Offers"),
      navButton(model, "tickets", "My Tickets"),
      '</nav>',
      '<button class="signin" data-page="signin">' + (model.currentUser ? 'Hi, ' + esc(firstName(model.currentUser.name)) : "Sign In / Join") + '</button>',
      '</div>',
      searchBar(model),
      '</header>',
      main(model),
      '<footer class="footer"><div class="wrap footer-grid"><div><strong>CineGo</strong><span>Movie tickets, showtimes, QR tickets, and refunds demo.</span></div><div>Movies in Theaters</div><div>Theaters Near You</div><div>Offers</div><div>Refunds & Exchanges</div></div></footer>'
    ].join("");
  }

  function navButton(model, page, label) {
    return '<button class="nav-link' + (model.ui.page === page ? " active" : "") + '" data-page="' + page + '">' + label + '</button>';
  }

  function searchBar(model) {
    return [
      '<div class="search-band">',
      '<div class="wrap search-panel">',
      '<div class="search-field"><span>Movie</span><input id="search-input" value="' + esc(model.ui.search) + '" placeholder="Search movies, cast, genre"></div>',
      '<div class="search-field"><span>Location</span><input id="location-input" value="' + esc(model.ui.location) + '" placeholder="City, state, or ZIP"></div>',
      '<button class="search-button" data-action="search">Search</button>',
      '</div>',
      '</div>'
    ].join("");
  }

  function main(model) {
    if (model.ui.page === "allmovies") return '<main class="page">' + allMoviesPage(model) + '</main>';
    if (model.ui.page === "tickets") return '<main class="page">' + ticketsPage(model) + '</main>';
    if (model.ui.page === "theaters") return '<main class="page">' + theatersPage(model) + '</main>';
    if (model.ui.page === "offers") return '<main class="page">' + offersPage(model) + '</main>';
    if (model.ui.page === "giftcards") return '<main class="page">' + giftCardsPage(model) + '</main>';
    if (model.ui.page === "fanclub") return '<main class="page">' + fanClubPage(model) + '</main>';
    if (model.ui.page === "help") return '<main class="page">' + helpPage(model) + '</main>';
    if (model.ui.page === "signin") return '<main class="page">' + signInPage(model) + '</main>';
    return '<main>' + homePage(model) + '</main>';
  }

  function homePage(model) {
    const movie = model.selectedMovie;
    return [
      hero(model, movie),
      '<div class="wrap page-stack">',
      offersRail(model),
      movieRail(model, "Movies in Theaters", model.nowMovies),
      selectedMoviePanel(model),
      theatersPreview(model),
      movieRail(model, "Coming Soon To Theaters", model.comingMovies),
      movieRail(model, "Watch At Home", model.homeMovies),
      '</div>'
    ].join("");
  }

  function hero(model, movie) {
    return [
      '<section class="hero">',
      img(movie.backdrop, "", "hero-bg"),
      '<div class="wrap hero-inner">',
      '<div class="hero-copy">',
      '<span class="eyebrow">Movie Tickets and Times</span>',
      '<h1>Find tickets for ' + esc(movie.title) + '</h1>',
      '<p>' + esc(movie.summary) + '</p>',
      '<div class="hero-actions"><button class="button primary" data-movie="' + movie.id + '">Buy Tickets</button><button class="button light" data-page="theaters">Find Theaters</button></div>',
      '<div class="hero-meta"><span>' + movie.rating + '</span><span>' + movie.runtime + ' min</span><span>' + movie.genres.map(esc).join(" / ") + '</span></div>',
      '</div>',
      img(movie.poster, movie.title, "hero-poster"),
      '</div>',
      '</section>'
    ].join("");
  }

  function offersRail(model) {
    return [
      '<section class="offer-rail">',
      model.data.offers.map(function (offer) {
        return '<button class="offer-card" data-promo="' + offer.cta.split(" ").pop() + '"><span>Special Offer</span><strong>' + esc(offer.title) + '</strong><em>' + esc(offer.body) + '</em><b>' + esc(offer.cta) + '</b></button>';
      }).join(""),
      '</section>'
    ].join("");
  }

  function movieRail(model, title, movies) {
    const visible = filterMovies(model, movies);
    return [
      '<section class="content-section">',
      '<div class="section-heading"><div><h2>' + esc(title) + '</h2><p>' + visible.length + ' movies available</p></div><button class="plain-link" data-page="allmovies">See All Movies</button></div>',
      '<div class="movie-rail">',
      visible.map(function (movie) {
        return [
          '<article class="movie-card' + (movie.id === model.ui.selectedMovieId ? " active" : "") + '">',
          '<button class="poster-button" data-movie="' + movie.id + '">' + img(movie.poster, movie.title, "poster") + '</button>',
          '<h3>' + esc(movie.title) + '</h3>',
          '<p>' + movie.rating + ' / ' + movie.runtime + ' min</p>',
          '<button class="ticket-button" data-movie="' + movie.id + '">Get Tickets</button>',
          '</article>'
        ].join("");
      }).join("") || '<div class="empty">No movies match your search.</div>',
      '</div>',
      '</section>'
    ].join("");
  }

  function selectedMoviePanel(model) {
    const movie = model.selectedMovie;
    const showtimes = model.showtimes.filter(function (showtime) {
      return showtime.movieId === movie.id;
    });
    return [
      '<section class="booking-shell" id="booking">',
      '<div class="movie-detail">',
      img(movie.poster, movie.title, "detail-poster"),
      '<div><span class="eyebrow dark">Selected Movie</span><h2>' + esc(movie.title) + '</h2><p>' + esc(movie.summary) + '</p><div class="pill-row"><span>' + movie.year + '</span><span>' + movie.rating + '</span><span>' + movie.genres.map(esc).join(" / ") + '</span></div></div>',
      '</div>',
      '<div class="booking-grid">',
      '<div class="booking-main">',
      calendarPicker(model),
      showtimeGroups(model, showtimes),
      seatPicker(model),
      '</div>',
      checkout(model),
      '</div>',
      '</section>'
    ].join("");
  }

  function calendarPicker(model) {
    const today = startOfDay(new Date());
    const monthDate = new Date(today.getFullYear(), today.getMonth() + model.ui.calendarMonthOffset, 1);
    const selected = model.days[model.ui.selectedDay] || model.days[0];
    const availableByKey = {};
    model.days.forEach(function (day, index) {
      availableByKey[day.key] = {
        day: day,
        index: index
      };
    });

    return [
      '<section class="calendar-picker panel">',
      '<div class="calendar-top">',
      '<div><span class="eyebrow dark">Select Date</span><h3>' + esc(selected.long) + '</h3></div>',
      '<div class="calendar-controls">',
      '<button class="calendar-nav" data-calendar-shift="-1" ' + (model.ui.calendarMonthOffset <= 0 ? "disabled" : "") + ' aria-label="Previous month">&lsaquo;</button>',
      '<strong>' + esc(monthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })) + '</strong>',
      '<button class="calendar-nav" data-calendar-shift="1" ' + (model.ui.calendarMonthOffset >= 1 ? "disabled" : "") + ' aria-label="Next month">&rsaquo;</button>',
      '</div>',
      '</div>',
      '<div class="calendar-weekdays">' + weekdayLabels().map(function (label) {
        return '<span>' + esc(label) + '</span>';
      }).join("") + '</div>',
      '<div class="calendar-grid">' + calendarCells(monthDate).map(function (date) {
        const info = availableByKey[dateKey(date)];
        const isCurrentMonth = date.getMonth() === monthDate.getMonth();
        const isSelected = info && info.index === model.ui.selectedDay;
        const isToday = dateKey(date) === dateKey(today);
        return [
          '<button class="calendar-day' +
          (isSelected ? " selected" : "") +
          (isToday ? " today" : "") +
          (!isCurrentMonth ? " outside" : "") +
          (!info ? " disabled" : "") +
          '" ' + (info ? 'data-day="' + info.index + '"' : "disabled") + '>',
          '<span>' + date.getDate() + '</span>',
          isToday ? '<em>Today</em>' : "",
          '</button>'
        ].join("");
      }).join("") + '</div>',
      '</section>'
    ].join("");
  }

  function weekdayLabels() {
    const sunday = new Date(2026, 0, 4);
    return Array.from({ length: 7 }, function (_, index) {
      const date = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + index);
      return date.toLocaleDateString(undefined, { weekday: "short" });
    });
  }

  function calendarCells(monthDate) {
    const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const start = new Date(first.getFullYear(), first.getMonth(), first.getDate() - first.getDay());
    return Array.from({ length: 42 }, function (_, index) {
      return new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    });
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function dateKey(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
  }

  function showtimeGroups(model, showtimes) {
    const todays = showtimes.filter(function (showtime) {
      return showtime.day === model.ui.selectedDay;
    });
    return [
      '<section class="panel"><div class="panel-heading"><h3>Movie Times</h3><span>Select a showtime to unlock the seat map</span></div>',
      model.data.theaters.map(function (theater) {
        const theaterTimes = todays.filter(function (showtime) {
          return showtime.theaterId === theater.id;
        });
        if (!theaterTimes.length) return "";
        return [
          '<div class="theater-times">',
          '<div><h4>' + esc(theater.name) + '</h4><p>' + esc(theater.distance) + ' / ' + esc(theater.address) + '</p></div>',
          '<div class="time-grid">',
          theaterTimes.map(function (showtime) {
            return '<button class="time-button' + (model.ui.selectedShowtimeId === showtime.id ? " active" : "") + '" data-showtime="' + showtime.id + '"><strong>' + showtime.time + '</strong><span>' + showtime.format + '</span></button>';
          }).join(""),
          '</div>',
          '</div>'
        ].join("");
      }).join(""),
      '</section>'
    ].join("");
  }

  function seatPicker(model) {
    const showtime = model.selectedShowtime;
    const seats = model.seatMap;
    if (!showtime) return '<section class="panel empty">Choose a showtime first.</section>';
    return [
      '<section class="panel seat-panel">',
      '<div class="panel-heading"><h3>Choose Seats</h3><span>' + esc(showtime.theaterName) + ' / ' + showtime.time + ' / locks expire in 2 minutes</span></div>',
      '<div class="screen">Screen</div>',
      '<div class="seat-map">',
      model.data.rows.map(function (row) {
        return '<div class="seat-row"><span>' + row + '</span>' + model.data.cols.map(function (col) {
          const id = row + col;
          const status = seats[id] || "available";
          return '<button class="seat ' + status + '" data-seat="' + id + '" ' + (status === "booked" || status === "held" ? "disabled" : "") + '>' + col + '</button>';
        }).join("") + '</div>';
      }).join(""),
      '</div>',
      '<div class="legend"><span><i class="available"></i>Available</span><span><i class="selected"></i>Your seats</span><span><i class="held"></i>Held</span><span><i class="booked"></i>Booked</span></div>',
      '</section>'
    ].join("");
  }

  function checkout(model) {
    const seats = model.selectedSeats;
    const subtotal = seats.length * model.ticketPrice;
    const total = Math.max(0, subtotal - model.discount);
    return [
      '<aside class="checkout panel">',
      '<div class="panel-heading"><h3>Order Summary</h3><span>' + esc(model.selectedShowtime ? model.selectedShowtime.time : "Choose time") + '</span></div>',
      '<div class="summary-row"><span>Seats</span><strong>' + (seats.length ? seats.join(", ") : "None") + '</strong></div>',
      '<div class="summary-row"><span>Ticket price</span><strong>' + money(model.ticketPrice) + '</strong></div>',
      '<div class="summary-row"><span>Discount</span><strong>-' + money(model.discount) + '</strong></div>',
      '<div class="summary-row total"><span>Total</span><strong>' + money(total) + '</strong></div>',
      '<label>Name<input id="customer-name" value="' + esc(model.ui.customerName) + '"></label>',
      '<label>Email<input id="customer-email" value="' + esc(model.ui.customerEmail) + '"></label>',
      '<label>Promo code<div class="promo-row"><input id="promo-code" value="' + esc(model.ui.promoCode) + '" placeholder="MOVIE5"><button class="button small" data-action="apply-promo">Apply</button></div></label>',
      '<label>Payment<select id="payment-provider">' + model.data.providers.map(function (provider) {
        return '<option ' + (model.ui.paymentProvider === provider ? "selected" : "") + '>' + provider + '</option>';
      }).join("") + '</select></label>',
      '<button class="button primary full" data-action="checkout" ' + (!seats.length ? "disabled" : "") + '>Buy Tickets</button>',
      '</aside>'
    ].join("");
  }

  function theatersPreview(model) {
    return '<section class="content-section">' + theatersList(model, true) + '</section>';
  }

  function theatersPage(model) {
    return '<div class="wrap page-stack"><section class="content-section"><div class="section-heading"><div><h1>Theaters Near You</h1><p>Enter city, state, or ZIP above to update this list.</p></div><button class="button primary" data-action="open-map">Open Map</button></div>' + (model.ui.mapOpen ? theaterMap(model) : "") + theatersList(model, false) + '</section></div>';
  }

  function theatersList(model, compact) {
    return [
      '<div class="section-heading"><div><h2>Theaters Near You</h2><p>' + esc(model.ui.location) + '</p></div><button class="plain-link" data-action="open-map">See more theaters</button></div>',
      '<div class="theater-list">',
      model.data.theaters.map(function (theater) {
        const times = model.showtimes.filter(function (showtime) {
          return showtime.theaterId === theater.id && showtime.day === model.ui.selectedDay;
        }).slice(0, compact ? 3 : 8);
        return [
          '<article class="theater-card">',
          '<div><h3>' + esc(theater.name) + '</h3><p>' + esc(theater.distance) + ' / ' + esc(theater.address) + '</p><div class="amenities">' + theater.amenities.map(function (item) { return '<span>' + esc(item) + '</span>'; }).join("") + '</div></div>',
          '<div class="time-grid small-times">' + times.map(function (showtime) {
            return '<button class="time-button" data-movie="' + showtime.movieId + '" data-showtime="' + showtime.id + '">' + showtime.time + '</button>';
          }).join("") + '</div>',
          '</article>'
        ].join("");
      }).join(""),
      '</div>'
    ].join("");
  }

  function theaterMap(model) {
    return [
      '<section class="map-panel">',
      '<div class="map-toolbar"><div><strong>Theater Map</strong><span>' + esc(model.ui.location) + '</span></div><button class="plain-link" data-action="close-map">Close map</button></div>',
      '<div class="fake-map">',
      '<div class="map-road road-one"></div>',
      '<div class="map-road road-two"></div>',
      '<div class="map-road road-three"></div>',
      model.data.theaters.map(function (theater, index) {
        const positions = [
          'left:22%;top:34%',
          'left:58%;top:42%',
          'left:42%;top:68%'
        ];
        return '<button class="map-pin pin-' + index + '" style="' + positions[index] + '" data-theater-pin="' + theater.id + '" title="' + esc(theater.name) + '"><span>' + (index + 1) + '</span><strong>' + esc(theater.name) + '</strong><em>' + esc(theater.distance) + '</em></button>';
      }).join(""),
      '</div>',
      '</section>'
    ].join("");
  }

  function offersPage(model) {
    return '<div class="wrap page-stack"><section class="content-section"><div class="section-heading"><div><h1>Offers</h1><p>Promotions you can apply at checkout.</p></div></div>' + offersRail(model) + '</section></div>';
  }

  function allMoviesPage(model) {
    const visible = filterMovies(model, model.data.movies);
    return [
      '<div class="wrap page-stack">',
      '<section class="content-section all-movies-page">',
      '<div class="section-heading"><div><h1>All Movies</h1><p>' + visible.length + ' movies available</p></div><button class="plain-link" data-page="home">Back to home</button></div>',
      '<div class="all-movie-grid">',
      visible.map(function (movie) {
        return [
          '<article class="movie-card all-movie-card' + (movie.id === model.ui.selectedMovieId ? " active" : "") + '">',
          '<button class="poster-button" data-movie="' + movie.id + '">' + img(movie.poster, movie.title, "poster") + '</button>',
          '<h3>' + esc(movie.title) + '</h3>',
          '<p>' + movie.rating + ' / ' + movie.runtime + ' min / ' + movie.genres.map(esc).join(" / ") + '</p>',
          '<button class="ticket-button" data-movie="' + movie.id + '">Get Tickets</button>',
          '</article>'
        ].join("");
      }).join("") || '<div class="empty">No movies match your search.</div>',
      '</div>',
      '</section>',
      '</div>'
    ].join("");
  }

  function giftCardsPage() {
    return [
      '<div class="wrap page-stack">',
      '<section class="content-section feature-page">',
      '<div class="feature-copy"><span class="eyebrow dark">Gift Cards</span><h1>Give the gift of movie night</h1><p>Choose a demo gift card amount and use it toward any CineGo ticket order.</p></div>',
      '<div class="gift-grid">',
      giftCard("$25"),
      giftCard("$50"),
      giftCard("$100"),
      '</div>',
      '</section>',
      '</div>'
    ].join("");
  }

  function giftCard(amount) {
    return '<button class="gift-card" data-action="gift-card"><span>CineGo Gift Card</span><strong>' + amount + '</strong><em>Demo card</em></button>';
  }

  function fanClubPage() {
    return [
      '<div class="wrap page-stack">',
      '<section class="content-section feature-page">',
      '<div class="feature-copy"><span class="eyebrow dark">FanClub</span><h1>Join for faster movie nights</h1><p>FanClub saves your demo profile, highlights offers, and keeps your QR tickets easy to find.</p></div>',
      '<div class="benefit-grid">',
      '<div><strong>1</strong><span>Early offer access</span></div>',
      '<div><strong>2</strong><span>Saved checkout details</span></div>',
      '<div><strong>3</strong><span>Ticket history</span></div>',
      '</div>',
      '<button class="button primary" data-page="signin">Join FanClub</button>',
      '</section>',
      '</div>'
    ].join("");
  }

  function helpPage() {
    return [
      '<div class="wrap page-stack">',
      '<section class="content-section feature-page">',
      '<div class="feature-copy"><span class="eyebrow dark">Help</span><h1>How can we help?</h1><p>This demo supports ticket buying, QR scanning, ticket downloads, and refunds from My Tickets.</p></div>',
      '<div class="help-list">',
      '<button data-page="home">Buy movie tickets</button>',
      '<button data-page="tickets">Find my tickets</button>',
      '<button data-page="offers">Use an offer code</button>',
      '<button data-page="theaters">Find theaters nearby</button>',
      '</div>',
      '</section>',
      '</div>'
    ].join("");
  }

  function signInPage(model) {
    const user = model.currentUser;
    if (user) return accountPage(model, user);
    return [
      '<div class="wrap page-stack">',
      '<section class="content-section auth-card">',
      '<div><span class="eyebrow dark">Account</span><h1>Login or signup</h1><p>Create a demo account to save checkout details and tickets in this browser.</p></div>',
      '<div class="auth-tabs">',
      '<button class="' + (model.ui.authMode === "login" ? "active" : "") + '" data-action="show-login">Login</button>',
      '<button class="' + (model.ui.authMode === "signup" ? "active" : "") + '" data-action="show-signup">Signup</button>',
      '</div>',
      model.ui.authMode === "signup" ? signupForm(model) : loginForm(model),
      '</section>',
      '</div>'
    ].join("");
  }

  function loginForm(model) {
    return [
      '<div class="auth-form">',
      '<label>Email<input id="auth-email" type="email" value="' + esc(model.ui.authEmail || model.ui.customerEmail) + '" autocomplete="email"></label>',
      '<label>Password<input id="auth-password" type="password" value="' + esc(model.ui.authPassword) + '" autocomplete="current-password"></label>',
      '<button class="button primary full" data-action="login">Login</button>',
      '<button class="plain-link auth-switch" data-action="show-signup">Need an account? Signup</button>',
      '</div>'
    ].join("");
  }

  function signupForm(model) {
    return [
      '<div class="auth-form">',
      '<label>Name<input id="auth-name" value="' + esc(model.ui.authName || model.ui.customerName) + '" autocomplete="name"></label>',
      '<label>Email<input id="auth-email" type="email" value="' + esc(model.ui.authEmail || model.ui.customerEmail) + '" autocomplete="email"></label>',
      '<label>Password<input id="auth-password" type="password" value="' + esc(model.ui.authPassword) + '" autocomplete="new-password"></label>',
      '<button class="button primary full" data-action="signup">Signup</button>',
      '<button class="plain-link auth-switch" data-action="show-login">Already have an account? Login</button>',
      '</div>'
    ].join("");
  }

  function accountPage(model, user) {
    return [
      '<div class="wrap page-stack">',
      '<section class="content-section auth-card">',
      '<div class="account-hero">',
      '<div class="account-avatar">' + esc(initials(user.name)) + '</div>',
      '<div><span class="eyebrow dark">Account</span><h1>' + esc(user.name) + '</h1><p>' + esc(user.email) + '</p></div>',
      '</div>',
      '<div class="account-actions">',
      '<button class="button primary" data-page="tickets">My Tickets</button>',
      '<button class="button light-dark" data-page="home">Buy Tickets</button>',
      '<button class="button danger" data-action="logout">Logout</button>',
      '</div>',
      '<div class="auth-form">',
      '<label>Name<input id="customer-name" value="' + esc(model.ui.customerName) + '"></label>',
      '<label>Email<input id="customer-email" type="email" value="' + esc(model.ui.customerEmail) + '"></label>',
      '<button class="button primary full" data-action="save-account">Save Account Details</button>',
      '</div>',
      '</section>',
      '</div>'
    ].join("");
  }

  function ticketsPage(model) {
    const tickets = model.state.tickets.slice().reverse();
    return [
      '<div class="wrap page-stack">',
      '<section class="content-section">',
      '<div class="section-heading"><div><h1>My Tickets</h1><p>Download, scan, or refund your demo tickets.</p></div><button class="plain-link" data-action="reset-demo">Clear Demo Data</button></div>',
      tickets.length ? '<div class="ticket-list">' + tickets.map(function (ticket) {
        const booking = model.state.bookings.find(function (item) { return item.id === ticket.bookingId; });
        const movie = model.data.movies.find(function (item) { return item.id === ticket.movieId; });
        return [
          '<article class="ticket-card">',
          qr(ticket.qr),
          '<div><h3>' + esc(movie.title) + '</h3><p>' + esc(ticket.theaterName) + ' / ' + esc(ticket.time) + ' / Seat ' + esc(ticket.seat) + '</p><p>' + esc(ticket.id) + ' / ' + esc(ticket.status) + '</p>',
          '<div class="card-actions"><button class="button small" data-download="' + ticket.id + '">Download</button><button class="button small light-dark" data-scan="' + ticket.id + '">Scan</button><button class="button small danger" data-refund="' + ticket.id + '" ' + (ticket.status !== "valid" ? "disabled" : "") + '>Refund</button></div>',
          booking ? '<p class="fine">Booking ' + esc(booking.id) + ' / ' + money(booking.total) + '</p>' : "",
          '</div>',
          '</article>'
        ].join("");
      }).join("") + '</div>' : '<div class="empty">No tickets yet. Choose a movie and buy tickets.</div>',
      '</section>',
      '</div>'
    ].join("");
  }

  function filterMovies(model, movies) {
    const query = normalizeSearch(model.ui.search);
    if (!query) return movies;
    return movies.filter(function (movie) {
      return normalizeSearch(movie.title).includes(query) ||
        normalizeSearch(movie.genres.join(" ")).includes(query) ||
        normalizeSearch(movie.summary).includes(query);
    });
  }

  function normalizeSearch(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function img(src, alt, className) {
    return '<img class="' + className + '" src="' + src + '" alt="' + esc(alt) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + fallbackImage(alt, className) + '\'">';
  }

  function fallbackImage(title, className) {
    const wide = String(className || "").indexOf("hero-bg") >= 0;
    const width = wide ? 1280 : 500;
    const height = wide ? 720 : 750;
    const safeTitle = esc(title || "CineGo").replace(/#/g, "%23");
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">',
      '<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="%23061e37"/><stop offset="1" stop-color="%23f26b21"/></linearGradient></defs>',
      '<rect width="100%" height="100%" fill="url(%23g)"/>',
      '<circle cx="' + Math.round(width * 0.78) + '" cy="' + Math.round(height * 0.18) + '" r="' + Math.round(Math.min(width, height) * 0.18) + '" fill="rgba(255,255,255,0.12)"/>',
      '<text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="' + (wide ? 58 : 38) + '" font-weight="800">CineGo</text>',
      '<text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="' + (wide ? 36 : 25) + '" font-weight="700">' + safeTitle + '</text>',
      '</svg>'
    ].join("");
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  function qr(value) {
    let html = '<div class="qr">';
    for (let index = 0; index < 121; index += 1) {
      html += '<span class="' + (((hash(value) + index * 13) % 4) < 2 ? "on" : "") + '"></span>';
    }
    return html + '</div>';
  }

  function hash(value) {
    let result = 0;
    String(value).split("").forEach(function (char) {
      result = ((result << 5) - result + char.charCodeAt(0)) | 0;
    });
    return Math.abs(result);
  }

  function money(value) {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value || 0);
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function firstName(value) {
    return String(value || "Guest").trim().split(/\s+/)[0] || "Guest";
  }

  function initials(value) {
    const parts = String(value || "Guest").trim().split(/\s+/).slice(0, 2);
    return parts.map(function (part) { return part.charAt(0).toUpperCase(); }).join("") || "G";
  }
})();
