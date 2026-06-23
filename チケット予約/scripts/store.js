(function () {
  "use strict";

  const STORAGE_KEY = "cinego.booking.demo.v1";
  const SESSION_KEY = "cinego.session.v1";

  window.CineGoStore = {
    load: load,
    save: save,
    reset: reset,
    sessionId: sessionId
  };

  function sessionId() {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = "SES-" + makeId(8);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  function load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return freshState();
    try {
      const parsed = JSON.parse(saved);
      return Object.assign(freshState(), parsed, {
        locks: Array.isArray(parsed.locks) ? parsed.locks : [],
        bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
        tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [],
        payments: Array.isArray(parsed.payments) ? parsed.payments : [],
        users: Array.isArray(parsed.users) ? parsed.users : [],
        currentUserEmail: parsed.currentUserEmail || ""
      });
    } catch (error) {
      return freshState();
    }
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    return freshState();
  }

  function freshState() {
    return {
      locks: [],
      bookings: [],
      tickets: [],
      payments: [],
      users: [],
      currentUserEmail: ""
    };
  }

  function makeId(length) {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let id = "";
    for (let index = 0; index < length; index += 1) {
      id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return id;
  }
})();
