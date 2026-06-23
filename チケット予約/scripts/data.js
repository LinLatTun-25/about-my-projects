(function () {
  "use strict";

  function poster(seed) {
    return generatedPoster(seed, 500, 750);
  }

  function backdrop(seed) {
    return generatedPoster(seed, 1280, 720);
  }

  function realPoster(path) {
    return "https://image.tmdb.org/t/p/w500/" + path;
  }

  function realBackdrop(path) {
    return "https://image.tmdb.org/t/p/w1280/" + path;
  }

  function slug(value) {
    return String(value || "movie").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function generatedPoster(title, width, height) {
    const safeTitle = String(title || "Movie")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    const colors = palette(slug(title));
    const isWide = width > height;
    const fontSize = isWide ? 58 : 38;
    const subSize = isWide ? 22 : 17;
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">',
      '<defs>',
      '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + colors[0] + '"/><stop offset="1" stop-color="' + colors[1] + '"/></linearGradient>',
      '<radialGradient id="spot" cx="70%" cy="20%" r="55%"><stop offset="0" stop-color="rgba(255,255,255,0.32)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient>',
      '</defs>',
      '<rect width="100%" height="100%" fill="url(#bg)"/>',
      '<rect width="100%" height="100%" fill="url(#spot)"/>',
      '<circle cx="' + Math.round(width * 0.82) + '" cy="' + Math.round(height * 0.18) + '" r="' + Math.round(Math.min(width, height) * 0.16) + '" fill="rgba(255,255,255,0.16)"/>',
      '<rect x="' + Math.round(width * 0.08) + '" y="' + Math.round(height * 0.08) + '" width="' + Math.round(width * 0.84) + '" height="' + Math.round(height * 0.84) + '" rx="18" fill="none" stroke="rgba(255,255,255,0.34)" stroke-width="4"/>',
      '<text x="50%" y="' + Math.round(height * 0.43) + '" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="' + fontSize + '" font-weight="900">',
      wrapSvgText(safeTitle, isWide ? 28 : 14, width, fontSize),
      '</text>',
      '<text x="50%" y="' + Math.round(height * 0.72) + '" text-anchor="middle" fill="rgba(255,255,255,0.82)" font-family="Arial, sans-serif" font-size="' + subSize + '" font-weight="700">CineGo Movie Poster</text>',
      '</svg>'
    ].join("");
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  function wrapSvgText(title, maxChars, width, fontSize) {
    const words = String(title).split(" ");
    const lines = [];
    let line = "";
    words.forEach(function (word) {
      const next = line ? line + " " + word : word;
      if (next.length > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);
    return lines.slice(0, 4).map(function (item, index) {
      return '<tspan x="50%" dy="' + (index === 0 ? 0 : Math.round(fontSize * 1.1)) + '">' + item + '</tspan>';
    }).join("");
  }

  function palette(seed) {
    const palettes = [
      ["#061e37", "#f26b21"],
      ["#14213d", "#e63946"],
      ["#0b132b", "#3a86ff"],
      ["#1b4332", "#f4a261"],
      ["#2b124c", "#ff6b6b"],
      ["#001219", "#ee9b00"],
      ["#1d3557", "#a8dadc"],
      ["#3d0c11", "#ff6700"]
    ];
    let total = 0;
    String(seed).split("").forEach(function (char) {
      total += char.charCodeAt(0);
    });
    return palettes[total % palettes.length];
  }

  window.CineGoData = {
    rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
    cols: Array.from({ length: 12 }, function (_, index) {
      return index + 1;
    }),
    providers: ["Card", "PayPal", "Wallet"],
    promoCodes: {
      MOVIE5: 5,
      POPCORN: 3,
      FAMILY10: 10
    },
    movies: [
      {
        id: "dune-part-two",
        title: "Dune: Part Two",
        year: 2024,
        rating: "PG-13",
        runtime: 166,
        genres: ["Sci-Fi", "Adventure"],
        status: "now",
        poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        summary: "Paul Atreides joins Chani and the Fremen while seeking revenge against the conspirators who destroyed his family."
      },
      {
        id: "inside-out-2",
        title: "Inside Out 2",
        year: 2024,
        rating: "PG",
        runtime: 96,
        genres: ["Animation", "Family"],
        status: "now",
        poster: "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/p5ozvmdgsmbWe0H8Xk7Rc8SCwAB.jpg",
        summary: "Riley enters her teenage years as a new group of emotions arrives in headquarters."
      },
      {
        id: "oppenheimer",
        title: "Oppenheimer",
        year: 2023,
        rating: "R",
        runtime: 181,
        genres: ["Drama", "History"],
        status: "now",
        poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
        summary: "The story of J. Robert Oppenheimer and the creation of the atomic bomb during the Manhattan Project."
      },
      {
        id: "godzilla-minus-one",
        title: "Godzilla Minus One",
        year: 2023,
        rating: "PG-13",
        runtime: 125,
        genres: ["Action", "Drama"],
        status: "now",
        poster: "https://image.tmdb.org/t/p/w500/hkxxMIGaiCTmrEArK7J56JTKUlB.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/fY3lD0jM5AoHJMunjGWqJ0hRteI.jpg",
        summary: "Postwar Japan faces a new crisis when Godzilla rises from the sea."
      },
      {
        id: "barbie",
        title: "Barbie",
        year: 2023,
        rating: "PG-13",
        runtime: 114,
        genres: ["Comedy", "Fantasy"],
        status: "now",
        poster: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/nHf61UzkfFno5X1ofIhugCPus2R.jpg",
        summary: "Barbie and Ken leave Barbie Land and discover the bright, complicated real world."
      },
      {
        id: "spider-verse",
        title: "Spider-Man: Across the Spider-Verse",
        year: 2023,
        rating: "PG",
        runtime: 140,
        genres: ["Animation", "Action"],
        status: "now",
        poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
        summary: "Miles Morales launches across the Multiverse and meets a team of Spider-People."
      },
      {
        id: "top-gun-maverick",
        title: "Top Gun: Maverick",
        year: 2022,
        rating: "PG-13",
        runtime: 131,
        genres: ["Action", "Drama"],
        status: "at-home",
        poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg",
        summary: "Maverick trains a new generation of pilots for a dangerous mission."
      },
      {
        id: "avatar-way-of-water",
        title: "Avatar: The Way of Water",
        year: 2022,
        rating: "PG-13",
        runtime: 192,
        genres: ["Sci-Fi", "Adventure"],
        status: "at-home",
        poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
        summary: "Jake Sully and Neytiri protect their family as danger returns to Pandora."
      },
      {
        id: "mission-impossible",
        title: "Mission: Impossible - Dead Reckoning",
        year: 2023,
        rating: "PG-13",
        runtime: 164,
        genres: ["Action", "Thriller"],
        status: "coming",
        poster: "https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/628Dep6AxEtDxjZoGP78TsOxYbK.jpg",
        summary: "Ethan Hunt and his team race to track down a powerful new weapon."
      },
      {
        id: "the-batman",
        title: "The Batman",
        year: 2022,
        rating: "PG-13",
        runtime: 177,
        genres: ["Crime", "Action"],
        status: "coming",
        poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
        summary: "Batman investigates corruption in Gotham as the Riddler targets powerful citizens."
      },
      {
        id: "interstellar",
        title: "Interstellar",
        year: 2014,
        rating: "PG-13",
        runtime: 169,
        genres: ["Sci-Fi", "Drama"],
        status: "now",
        poster: realPoster("gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"),
        backdrop: realBackdrop("xJHokMbljvjADYdit5fK5VQsXEG.jpg"),
        summary: "A team of explorers travels through a wormhole to secure humanity's future."
      },
      {
        id: "inception",
        title: "Inception",
        year: 2010,
        rating: "PG-13",
        runtime: 148,
        genres: ["Sci-Fi", "Thriller"],
        status: "now",
        poster: realPoster("9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"),
        backdrop: realBackdrop("s3TBrRGB1iav7gFOCNx3H31MoES.jpg"),
        summary: "A skilled thief enters dreams to steal secrets and faces one final impossible job."
      },
      {
        id: "the-dark-knight",
        title: "The Dark Knight",
        year: 2008,
        rating: "PG-13",
        runtime: 152,
        genres: ["Action", "Crime"],
        status: "now",
        poster: realPoster("qJ2tW6WMUDux911r6m7haRef0WH.jpg"),
        backdrop: realBackdrop("nMKdUUepR0i5zn0y1T4CsSB5chy.jpg"),
        summary: "Batman faces a criminal mastermind who pushes Gotham into chaos."
      },
      {
        id: "avengers-endgame",
        title: "Avengers: Endgame",
        year: 2019,
        rating: "PG-13",
        runtime: 181,
        genres: ["Action", "Adventure"],
        status: "now",
        poster: realPoster("or06FN3Dka5tukK1e9sl16pB3iy.jpg"),
        backdrop: realBackdrop("7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg"),
        summary: "The Avengers assemble for one last attempt to reverse a devastating defeat."
      },
      {
        id: "black-panther",
        title: "Black Panther",
        year: 2018,
        rating: "PG-13",
        runtime: 134,
        genres: ["Action", "Adventure"],
        status: "now",
        poster: realPoster("uxzzxijgPIY7slzFvMotPv8wjKA.jpg"),
        backdrop: realBackdrop("b6ZJZHUdMEFECvGiDpJjlfUWela.jpg"),
        summary: "T'Challa returns home to Wakanda and faces a challenge to the throne."
      },
      {
        id: "joker",
        title: "Joker",
        year: 2019,
        rating: "R",
        runtime: 122,
        genres: ["Drama", "Crime"],
        status: "now",
        poster: realPoster("udDclJoHjfjb8Ekgsd4FDteOkCU.jpg"),
        backdrop: realBackdrop("n6bUvigpRFqSwmPp1m2YADdbRBc.jpg"),
        summary: "A troubled performer descends into a dark transformation in Gotham."
      },
      {
        id: "parasite",
        title: "Parasite",
        year: 2019,
        rating: "R",
        runtime: 132,
        genres: ["Thriller", "Drama"],
        status: "now",
        poster: realPoster("7IiTTgloJzvGI1TAYymCfbfl3vT.jpg"),
        backdrop: realBackdrop("TU9NIjwzjoKPwQHoHshkFcQUCG.jpg"),
        summary: "Two families become entangled in a sharp social thriller."
      },
      {
        id: "everything-everywhere",
        title: "Everything Everywhere All at Once",
        year: 2022,
        rating: "R",
        runtime: 139,
        genres: ["Sci-Fi", "Comedy"],
        status: "now",
        poster: realPoster("w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg"),
        backdrop: realBackdrop("ss0Os3uWJfQAENILHZUdX8Tt1OC.jpg"),
        summary: "A laundromat owner is pulled into a wild multiverse adventure."
      },
      {
        id: "john-wick-4",
        title: "John Wick: Chapter 4",
        year: 2023,
        rating: "R",
        runtime: 169,
        genres: ["Action", "Thriller"],
        status: "now",
        poster: realPoster("vZloFAK7NmvMGKE7VkF5UHaz0I.jpg"),
        backdrop: realBackdrop("h8gHn0OzBoaefsYseUByqsmEDMY.jpg"),
        summary: "John Wick uncovers a path to defeating the High Table."
      },
      {
        id: "guardians-3",
        title: "Guardians of the Galaxy Vol. 3",
        year: 2023,
        rating: "PG-13",
        runtime: 150,
        genres: ["Action", "Comedy"],
        status: "now",
        poster: realPoster("r2J02Z2OpNTctfOSN1Ydgii51I3.jpg"),
        backdrop: realBackdrop("5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg"),
        summary: "The Guardians face one more mission that could change the team forever."
      },
      {
        id: "no-way-home",
        title: "Spider-Man: No Way Home",
        year: 2021,
        rating: "PG-13",
        runtime: 148,
        genres: ["Action", "Adventure"],
        status: "now",
        poster: realPoster("1g0dhYtq4irTY1GPXvft6k4YLjm.jpg"),
        backdrop: realBackdrop("14QbnygCuTO0vl7CAFmPf1fgZfV.jpg"),
        summary: "Peter Parker's identity crisis opens the door to multiverse trouble."
      },
      {
        id: "civil-war",
        title: "Civil War",
        year: 2024,
        rating: "R",
        runtime: 109,
        genres: ["Action", "Drama"],
        status: "now",
        poster: realPoster("sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg"),
        backdrop: realBackdrop("z121dSTR7PY9KxKuvwiIFSYW8cf.jpg"),
        summary: "Journalists travel across a fractured America during a violent conflict."
      },
      {
        id: "furiosa",
        title: "Furiosa: A Mad Max Saga",
        year: 2024,
        rating: "R",
        runtime: 148,
        genres: ["Action", "Adventure"],
        status: "now",
        poster: realPoster("iADOJ8Zymht2JPMoy3R7xceZprc.jpg"),
        backdrop: realBackdrop("wNAhuOZ3Zf84jCIlrcI6JhgmY5q.jpg"),
        summary: "Young Furiosa fights to find her way home through the wasteland."
      },
      {
        id: "fall-guy",
        title: "The Fall Guy",
        year: 2024,
        rating: "PG-13",
        runtime: 126,
        genres: ["Action", "Comedy"],
        status: "now",
        poster: realPoster("tSz1qsmSJon0rqjHBxXZmrotuse.jpg"),
        backdrop: realBackdrop("H5HjE7Xb9N09rbWn1zBfxgI8uz.jpg"),
        summary: "A stunt performer gets pulled into a real-life mystery on a film set."
      },
      {
        id: "kingdom-apes",
        title: "Kingdom of the Planet of the Apes",
        year: 2024,
        rating: "PG-13",
        runtime: 145,
        genres: ["Action", "Sci-Fi"],
        status: "now",
        poster: realPoster("gKkl37BQuKTanygYQG1pyYgLVgf.jpg"),
        backdrop: realBackdrop("fqv8v6AycXKsivp1T5yKtLbGXce.jpg"),
        summary: "A young ape questions the future of his world generations after Caesar."
      },
      {
        id: "quiet-place-day-one",
        title: "A Quiet Place: Day One",
        year: 2024,
        rating: "PG-13",
        runtime: 99,
        genres: ["Horror", "Sci-Fi"],
        status: "now",
        poster: realPoster("yrpPYKijwdMHyTGIOd1iK1h0Xno.jpg"),
        backdrop: realBackdrop("pD1m4zD8xXH7RL8JIqRUlv9T7gI.jpg"),
        summary: "The first day of the invasion reveals new survivors and new fears."
      },
      {
        id: "bad-boys-ride-or-die",
        title: "Bad Boys: Ride or Die",
        year: 2024,
        rating: "R",
        runtime: 115,
        genres: ["Action", "Comedy"],
        status: "now",
        poster: realPoster("oGythE98MYleE6mZlGs5oBGkux1.jpg"),
        backdrop: realBackdrop("gRApXuxWmO2forYTuTmcz5RaNUV.jpg"),
        summary: "Miami detectives go on the run to clear a dangerous conspiracy."
      },
      {
        id: "twisters",
        title: "Twisters",
        year: 2024,
        rating: "PG-13",
        runtime: 122,
        genres: ["Action", "Adventure"],
        status: "now",
        poster: realPoster("pjnD08FlMAIXsfOLKQbvmO0f0MD.jpg"),
        backdrop: realBackdrop("58D6ZAvOKxlHjyX9S8qNKSBE9Y.jpg"),
        summary: "Storm chasers face a new generation of extreme tornadoes."
      },
      {
        id: "deadpool-wolverine",
        title: "Deadpool & Wolverine",
        year: 2024,
        rating: "R",
        runtime: 128,
        genres: ["Action", "Comedy"],
        status: "now",
        poster: realPoster("8cdWjvZQUExUUTzyp4t6EDMubfO.jpg"),
        backdrop: realBackdrop("by8z9Fe8y7p4jo2YlW2SZDnptyT.jpg"),
        summary: "Deadpool drags Wolverine into a chaotic mission across worlds."
      },
      {
        id: "wicked",
        title: "Wicked",
        year: 2024,
        rating: "PG",
        runtime: 160,
        genres: ["Musical", "Fantasy"],
        status: "coming",
        poster: realPoster("c5Tqxeo1UpBvnAc3csUm7j3hlQl.jpg"),
        backdrop: realBackdrop("uKb22E0nlzr914bA9KyA5CVCOlV.jpg"),
        summary: "The untold story of the witches of Oz begins before Dorothy arrives."
      },
      {
        id: "gladiator-2",
        title: "Gladiator II",
        year: 2024,
        rating: "R",
        runtime: 148,
        genres: ["Action", "Drama"],
        status: "coming",
        poster: realPoster("2cxhvwyEwRlysAmRH4iodkvo0z5.jpg"),
        backdrop: realBackdrop("euYIwmwkmz95mnXvufEmbL6ovhZ.jpg"),
        summary: "A new warrior enters the arena in the shadow of Rome's legacy."
      },
      {
        id: "moana-2",
        title: "Moana 2",
        year: 2024,
        rating: "PG",
        runtime: 100,
        genres: ["Animation", "Family"],
        status: "coming",
        poster: realPoster("aLVkiINlIeCkcZIzb7XHzPYgO6L.jpg"),
        backdrop: realBackdrop("zo8CIjJ2nfNOevqNajwMRO6Hwka.jpg"),
        summary: "Moana sets sail again for a new voyage across far seas."
      },
      {
        id: "mufasa",
        title: "Mufasa: The Lion King",
        year: 2024,
        rating: "PG",
        runtime: 118,
        genres: ["Adventure", "Family"],
        status: "coming",
        poster: realPoster("lurEK87kukWNaHd0zYnsi3yzJrs.jpg"),
        backdrop: realBackdrop("oHPoF0Gzu8xwK4CtdXDaWdcuZxZ.jpg"),
        summary: "The rise of Mufasa is told through a new journey across the Pride Lands."
      },
      {
        id: "sonic-3",
        title: "Sonic the Hedgehog 3",
        year: 2024,
        rating: "PG",
        runtime: 110,
        genres: ["Action", "Family"],
        status: "coming",
        poster: realPoster("d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg"),
        backdrop: realBackdrop("zOpe0eHsq0A2NvNyBbtT6sj53qV.jpg"),
        summary: "Sonic and friends race into another high-speed adventure."
      },
      {
        id: "beetlejuice-2",
        title: "Beetlejuice Beetlejuice",
        year: 2024,
        rating: "PG-13",
        runtime: 104,
        genres: ["Comedy", "Fantasy"],
        status: "coming",
        poster: realPoster("kKgQzkUCnQmeTPkyIwHly2t6ZFI.jpg"),
        backdrop: realBackdrop("xi1VSt3DtkevUmzCx2mNlCoDe74.jpg"),
        summary: "The strange spirit returns for more supernatural trouble."
      },
      {
        id: "alien-romulus",
        title: "Alien: Romulus",
        year: 2024,
        rating: "R",
        runtime: 119,
        genres: ["Horror", "Sci-Fi"],
        status: "coming",
        poster: realPoster("b33nnKl1GSFbao4l3fZDDqsMx0F.jpg"),
        backdrop: realBackdrop("9SSEUrSqhljBMzRe4aBTh17rUaC.jpg"),
        summary: "A group of young explorers encounters terror in deep space."
      },
      {
        id: "transformers-one",
        title: "Transformers One",
        year: 2024,
        rating: "PG",
        runtime: 104,
        genres: ["Animation", "Action"],
        status: "coming",
        poster: realPoster("qbkAqmmEIZfrCO8ZQAuIuVMlWoV.jpg"),
        backdrop: realBackdrop("tElnmtQ6yz1PjN1kePNl8yMSb59.jpg"),
        summary: "The origin story of Optimus Prime and Megatron begins on Cybertron."
      },
      {
        id: "blade-runner-2049",
        title: "Blade Runner 2049",
        year: 2017,
        rating: "R",
        runtime: 164,
        genres: ["Sci-Fi", "Drama"],
        status: "at-home",
        poster: realPoster("gajva2L0rPYkEWjzgFlBXCAVBE5.jpg"),
        backdrop: realBackdrop("sAtoMqDVhNDQBc3QJL3RF6hlhGq.jpg"),
        summary: "A young blade runner uncovers a secret that could change society."
      },
      {
        id: "la-la-land",
        title: "La La Land",
        year: 2016,
        rating: "PG-13",
        runtime: 128,
        genres: ["Musical", "Romance"],
        status: "at-home",
        poster: realPoster("uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg"),
        backdrop: realBackdrop("nlPCdZlHtRNcF6C9hzUH4ebmV1w.jpg"),
        summary: "A pianist and an aspiring actor chase dreams and love in Los Angeles."
      },
      {
        id: "mad-max-fury-road",
        title: "Mad Max: Fury Road",
        year: 2015,
        rating: "R",
        runtime: 120,
        genres: ["Action", "Adventure"],
        status: "at-home",
        poster: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6e/Mad_Max_Fury_Road.jpg/500px-Mad_Max_Fury_Road.jpg",
        backdrop: realBackdrop("phszHPFVhPHhMZgo0fWTKBDQsJA.jpg"),
        summary: "A road warrior and a rebel driver flee across the wasteland."
      },
      {
        id: "get-out",
        title: "Get Out",
        year: 2017,
        rating: "R",
        runtime: 104,
        genres: ["Horror", "Thriller"],
        status: "at-home",
        poster: realPoster("tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg"),
        backdrop: realBackdrop("3L5Q6Hw6FGq63VvEbVa0EvOe0CO.jpg"),
        summary: "A weekend visit turns into a chilling psychological nightmare."
      },
      {
        id: "knives-out",
        title: "Knives Out",
        year: 2019,
        rating: "PG-13",
        runtime: 130,
        genres: ["Mystery", "Comedy"],
        status: "at-home",
        poster: realPoster("pThyQovXQrw2m0s9x82twj48Jq4.jpg"),
        backdrop: realBackdrop("4HWAQu28e2yaWrtupFPGFkdNU7V.jpg"),
        summary: "A detective investigates a wealthy family's tangled murder mystery."
      },
      {
        id: "glass-onion",
        title: "Glass Onion",
        year: 2022,
        rating: "PG-13",
        runtime: 139,
        genres: ["Mystery", "Comedy"],
        status: "at-home",
        poster: realPoster("vDGr1YdrlfbU9wxTOdpf3zChmv9.jpg"),
        backdrop: realBackdrop("dKqa850uvbNSCaQCV4Im1XlzEtQ.jpg"),
        summary: "Detective Benoit Blanc travels to a private island full of suspects."
      },
      {
        id: "coco",
        title: "Coco",
        year: 2017,
        rating: "PG",
        runtime: 105,
        genres: ["Animation", "Family"],
        status: "at-home",
        poster: realPoster("gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg"),
        backdrop: realBackdrop("askg3SMvhqEl4OL52YuvdtY40Yb.jpg"),
        summary: "A young musician journeys into the Land of the Dead."
      },
      {
        id: "toy-story-4",
        title: "Toy Story 4",
        year: 2019,
        rating: "G",
        runtime: 100,
        genres: ["Animation", "Family"],
        status: "at-home",
        poster: realPoster("w9kR8qbmQ01HwnvK4alvnQ2ca0L.jpg"),
        backdrop: realBackdrop("m67smI1IIMmYzCl9axvKNULVKLr.jpg"),
        summary: "Woody and friends discover new adventures with Forky and Bo Peep."
      },
      {
        id: "finding-nemo",
        title: "Finding Nemo",
        year: 2003,
        rating: "G",
        runtime: 100,
        genres: ["Animation", "Adventure"],
        status: "at-home",
        poster: realPoster("eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg"),
        backdrop: realBackdrop("2l5UHZBcp9cx1PwKLdisJ0gV9jB.jpg"),
        summary: "A clownfish crosses the ocean to find his missing son."
      },
      {
        id: "frozen-2",
        title: "Frozen II",
        year: 2019,
        rating: "PG",
        runtime: 103,
        genres: ["Animation", "Musical"],
        status: "at-home",
        poster: realPoster("mINJaa34MtknCYl5AjtNJzWj8cD.jpg"),
        backdrop: realBackdrop("xJWPZIYOEFIjZpBL7SVBGnzRYXp.jpg"),
        summary: "Elsa and Anna journey beyond Arendelle to discover an ancient truth."
      },
      {
        id: "harry-potter-stone",
        title: "Harry Potter and the Sorcerer's Stone",
        year: 2001,
        rating: "PG",
        runtime: 152,
        genres: ["Fantasy", "Adventure"],
        status: "at-home",
        poster: realPoster("wuMc08IPKEatf9rnMNXvIDxqP4W.jpg"),
        backdrop: realBackdrop("hziiv14OpD73u9gAak4XDDfBKa2.jpg"),
        summary: "A young wizard discovers his magical heritage and begins school at Hogwarts."
      },
      {
        id: "lord-rings-fellowship",
        title: "The Lord of the Rings: The Fellowship of the Ring",
        year: 2001,
        rating: "PG-13",
        runtime: 178,
        genres: ["Fantasy", "Adventure"],
        status: "at-home",
        poster: realPoster("6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg"),
        backdrop: realBackdrop("x2RS3uTcsJJ9IfjNPcgDmukoEcQ.jpg"),
        summary: "A fellowship forms to carry the One Ring toward Mount Doom."
      },
      {
        id: "star-wars-force",
        title: "Star Wars: The Force Awakens",
        year: 2015,
        rating: "PG-13",
        runtime: 138,
        genres: ["Sci-Fi", "Adventure"],
        status: "at-home",
        poster: realPoster("wqnLdwVXoBjKibFRR5U3y0aDUhs.jpg"),
        backdrop: realBackdrop("8BTsTfln4jlQrLXUBquXJ0ASQy9.jpg"),
        summary: "A new generation joins the fight as an old legend returns."
      },
      {
        id: "matrix",
        title: "The Matrix",
        year: 1999,
        rating: "R",
        runtime: 136,
        genres: ["Sci-Fi", "Action"],
        status: "at-home",
        poster: realPoster("f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"),
        backdrop: realBackdrop("icmmSD4vTTDKOq2vvdulafOGw93.jpg"),
        summary: "A hacker discovers the hidden truth behind his simulated reality."
      },
      {
        id: "jurassic-world",
        title: "Jurassic World",
        year: 2015,
        rating: "PG-13",
        runtime: 124,
        genres: ["Adventure", "Action"],
        status: "at-home",
        poster: realPoster("rhr4y79GpxQF9IsfJItRXVaoGs4.jpg"),
        backdrop: realBackdrop("dF6FjTZzRTENfB4R17HDN20jLT2.jpg"),
        summary: "A dinosaur theme park falls into danger when a new creature escapes."
      },
      {
        id: "minions-rise-gru",
        title: "Minions: The Rise of Gru",
        year: 2022,
        rating: "PG",
        runtime: 87,
        genres: ["Animation", "Comedy"],
        status: "at-home",
        poster: realPoster("wKiOkZTN9lUUUNZLmtnwubZYONg.jpg"),
        backdrop: realBackdrop("nmGWzTLMXy9x7mKd8NKPLmHtWGa.jpg"),
        summary: "Young Gru and the Minions chase villainous dreams."
      },
      {
        id: "puss-in-boots-last-wish",
        title: "Puss in Boots: The Last Wish",
        year: 2022,
        rating: "PG",
        runtime: 102,
        genres: ["Animation", "Adventure"],
        status: "at-home",
        poster: realPoster("kuf6dutpsT0vSVehic3EZIqkOBt.jpg"),
        backdrop: realBackdrop("b1Y8SUb12gPHCSSSNlbX4nB3IKy.jpg"),
        summary: "Puss sets out to restore his lost lives before time runs out."
      },
      {
        id: "bullet-train",
        title: "Bullet Train",
        year: 2022,
        rating: "R",
        runtime: 127,
        genres: ["Action", "Comedy"],
        status: "at-home",
        poster: realPoster("tVxDe01Zy3kZqaZRNiXFGDICdZk.jpg"),
        backdrop: realBackdrop("AaV1YIdWKnjAIAOe8UUKBFm327v.jpg"),
        summary: "Assassins with connected missions collide aboard a high-speed train."
      },
      {
        id: "creed-3",
        title: "Creed III",
        year: 2023,
        rating: "PG-13",
        runtime: 116,
        genres: ["Drama", "Sport"],
        status: "at-home",
        poster: realPoster("cvsXj3I9Q2iyyIo95AecSd1tad7.jpg"),
        backdrop: realBackdrop("5i6SjyDbDWqyun8klUuCxrlFbyw.jpg"),
        summary: "Adonis Creed faces a former friend and a new personal challenge."
      },
      {
        id: "scream-6",
        title: "Scream VI",
        year: 2023,
        rating: "R",
        runtime: 122,
        genres: ["Horror", "Mystery"],
        status: "at-home",
        poster: realPoster("wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg"),
        backdrop: realBackdrop("70Rm9ItxKuEKN8iu6rNjfwAYUCJ.jpg"),
        summary: "Ghostface follows survivors into New York City."
      },
      {
        id: "elemental",
        title: "Elemental",
        year: 2023,
        rating: "PG",
        runtime: 101,
        genres: ["Animation", "Family"],
        status: "at-home",
        poster: realPoster("4Y1WNkd88JXmGfhtWR7dmDAo1T2.jpg"),
        backdrop: realBackdrop("4fLZUr1e65hKPPVw0R3PmKFKxj1.jpg"),
        summary: "Fire and water discover a surprising connection in Element City."
      },
      {
        id: "wonka",
        title: "Wonka",
        year: 2023,
        rating: "PG",
        runtime: 116,
        genres: ["Musical", "Family"],
        status: "at-home",
        poster: realPoster("qhb1qOilapbapxWQn9jtRCMwXJF.jpg"),
        backdrop: realBackdrop("yOm993lsJyPmBodlYjgpPwBjXP9.jpg"),
        summary: "A young chocolatier follows his dream of opening a magical shop."
      },
      {
        id: "napoleon",
        title: "Napoleon",
        year: 2023,
        rating: "R",
        runtime: 158,
        genres: ["Drama", "History"],
        status: "at-home",
        poster: realPoster("jE5o7y9K6pZtWNNMEw3IdpHuncR.jpg"),
        backdrop: realBackdrop("f1AQhx6ZfGhPZFTVKgxG91PhEYc.jpg"),
        summary: "The rise and ambition of Napoleon Bonaparte unfold across battlefields."
      },
      {
        id: "the-marvels",
        title: "The Marvels",
        year: 2023,
        rating: "PG-13",
        runtime: 105,
        genres: ["Action", "Sci-Fi"],
        status: "at-home",
        poster: realPoster("9GBhzXMFjgcZ3FdR9w3bUMMTps5.jpg"),
        backdrop: realBackdrop("feSiISwgEpVzR1v3zv2n2AU4ANJ.jpg"),
        summary: "Three heroes swap places and team up for a cosmic mission."
      }
    ],
    theaters: [
      {
        id: "central",
        name: "CineGo Central",
        address: "1-1-1 Shibuya, Tokyo",
        distance: "0.8 mi",
        amenities: ["Reserved Seating", "IMAX", "Mobile Tickets"]
      },
      {
        id: "river",
        name: "Riverside Screens",
        address: "2-4-9 Meguro, Tokyo",
        distance: "1.6 mi",
        amenities: ["Dolby Atmos", "Recliners", "Accessible"]
      },
      {
        id: "skyline",
        name: "Skyline Cinema",
        address: "5-2-11 Shinjuku, Tokyo",
        distance: "2.2 mi",
        amenities: ["Premium Large Format", "3D", "Cafe"]
      }
    ],
    offers: [
      {
        title: "Summer Movie Deal",
        body: "Use code MOVIE5 and save $5 on your next ticket order.",
        cta: "Apply MOVIE5"
      },
      {
        title: "Popcorn Night",
        body: "Use code POPCORN for a small concession discount at checkout.",
        cta: "Apply POPCORN"
      },
      {
        title: "Family Weekend",
        body: "Use code FAMILY10 for $10 off larger family orders.",
        cta: "Apply FAMILY10"
      }
    ]
  };
})();
